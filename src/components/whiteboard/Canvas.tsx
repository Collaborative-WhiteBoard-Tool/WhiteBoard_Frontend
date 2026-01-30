// src/components/Canvas/Canvas.tsx
import React, { useRef, useEffect, useCallback, memo, useState } from 'react';
import { useCanvasStore } from '@/store/CanvasStore';
import { useWhiteboardSocket } from '@/hooks/use-whiteboardSocket';
import { DrawingEngine } from '@/lib/engine/DrawingEngine';
import { CursorEngine } from '@/lib/engine/CursorEngine';


interface CanvasProps {
    whiteboardId: string;
    width: number;
    height: number;
}
interface CanvasTransform {
    scale: number;
    x: number;
    y: number;
}

const Canvas = memo<CanvasProps>(({ whiteboardId, width, height }) => {
    const [transform, setTransform] = useState<CanvasTransform>({ scale: 1, x: 0, y: 0 });
    console.log('Canvas render, ID:', whiteboardId);

    // Canvas refs
    const containerRef = useRef<HTMLDivElement>(null);
    const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
    const cursorCanvasRef = useRef<HTMLCanvasElement>(null);

    // Engine refs
    const drawingEngineRef = useRef<DrawingEngine | null>(null);
    const cursorEngineRef = useRef<CursorEngine | null>(null);

    // Track if currently drawing
    const isDrawingRef = useRef(false);

    const isPanningRef = useRef(false);
    const lastPanPointRef = useRef<{ x: number; y: number } | null>(null);
    const panStartedOnEmptyRef = useRef(false); //Track nếu pan bắt đầu từ vùng trống 
    // Track pending moves (debounced)
    const pendingMovesRef = useRef<Array<{ strokeId: string; points: number[] }>>([]);



    const strokes = useCanvasStore(state => state.strokes)
    const tool = useCanvasStore(state => state.tool)
    const color = useCanvasStore(state => state.color)
    const strokeWidth = useCanvasStore(state => state.width)
    const showGrid = useCanvasStore(state => state.showGrid)
    const gridSize = useCanvasStore(state => state.gridSize)

    const addLocalStroke = useCanvasStore(state => state.addLocalStroke)
    const addStrokeToBatch = useCanvasStore(state => state.addStrokeToBatch)
    const clearLocalStrokes = useCanvasStore(state => state.clearLocalStrokes)
    const deleteStrokes = useCanvasStore(state => state.deleteStrokes)
    const setSelection = useCanvasStore(state => state.setSelection)

    const { sendBatch, sendCursor, isConnected, sendDelete, sendMove } = useWhiteboardSocket(
        whiteboardId,
        cursorEngineRef as React.RefObject<CursorEngine>
    );

    // ========== Initialize Engines ==========

    useEffect(() => {
        if (!drawingCanvasRef.current || !cursorCanvasRef.current) return;

        console.log('🎨 Initializing engines...');

        // Create drawing engine
        const drawingEngine = new DrawingEngine(drawingCanvasRef.current, {
            onStrokeStart: () => {
                isDrawingRef.current = true;
            },
            onStrokeComplete: (stroke) => {
                isDrawingRef.current = false;
                addLocalStroke(stroke);
                addStrokeToBatch(stroke);
            },
            onStrokesDeleted: (strokeIds) => {
                console.log('🗑️ Strokes deleted:', strokeIds);
                deleteStrokes(strokeIds);
                sendDelete(strokeIds)
                // TODO: Send deletion to server
            },
            onStrokesMoved: (updates) => {
                console.log('🔄 Strokes moved locally:', updates.length);
                // Accumulate moves
                pendingMovesRef.current = updates;
            },
            onSelectionChange: (selection) => {
                console.log('📦 Selection changed:', selection);
                setSelection(selection);
            }
        });

        drawingEngineRef.current = drawingEngine;
        drawingEngine.start();

        // Create cursor engine
        const cursorEngine = new CursorEngine(cursorCanvasRef.current);
        cursorEngineRef.current = cursorEngine;
        cursorEngine.start();

        console.log('✅ Engines initialized');

        return () => {
            console.log('🧹 Cleaning up engines...');
            drawingEngine.destroy();
            cursorEngine.destroy();
        };
    }, [addLocalStroke, addStrokeToBatch, deleteStrokes, setSelection]);

    // ========== Handle Window Resize ==========

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;

                // ✅ Chỉ resize khi thực sự thay đổi (tránh loop)
                if (width > 0 && height > 0) {
                    console.log('📐 Container resized:', { width, height });
                    drawingEngineRef.current?.resizeCanvas();
                    cursorEngineRef.current?.resizeCanvas();
                }
            }
        });

        resizeObserver.observe(container);

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    // ========== Sync Store State to Engine ==========

    useEffect(() => {
        drawingEngineRef.current?.setStrokes(strokes);
    }, [strokes]);

    useEffect(() => {
        drawingEngineRef.current?.setTool(tool);
    }, [tool]);

    useEffect(() => {
        drawingEngineRef.current?.setColor(color);
    }, [color]);

    useEffect(() => {
        drawingEngineRef.current?.setWidth(strokeWidth);
    }, [strokeWidth]);

    useEffect(() => {
        drawingEngineRef.current?.setShowGrid(showGrid);
    }, [showGrid]);

    useEffect(() => {
        drawingEngineRef.current?.setGridSize(gridSize);
    }, [gridSize]);


    const getRelativeCoords = useCallback((e: React.PointerEvent | PointerEvent) => {
        if (!drawingCanvasRef.current) return { x: 0, y: 0 };

        const rect = drawingCanvasRef.current.getBoundingClientRect();

        // 1. Tọa độ chuột so với Canvas (Viewport space)
        const viewX = e.clientX - rect.left;
        const viewY = e.clientY - rect.top;

        // 2. Chuyển đổi sang tọa độ thực trên bảng (World space)
        // Công thức: World = (Viewport - Pan) / Scale
        const worldX = (viewX - transform.x) / transform.scale;
        const worldY = (viewY - transform.y) / transform.scale;

        return { x: worldX, y: worldY };
    }, [transform]);


    // ========== Pointer Handlers (NO setState for drawing) ==========
    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        if (!isConnected) return;

        const { x, y } = getRelativeCoords(e);

        // ✅ SELECT TOOL: Pan nếu click vào vùng trống, hoặc select nếu click vào stroke
        if (tool === 'select') {
            // Kiểm tra xem có click vào stroke không (engine sẽ xử lý trong startStroke)
            const clickedStroke = drawingEngineRef.current?.findStrokeAtPoint?.(x, y);

            if (clickedStroke) {
                // Click vào stroke → Select
                drawingEngineRef.current?.startStroke(x, y);
                panStartedOnEmptyRef.current = false;
            } else {
                // 1. Gọi engine để xóa khung selection hiện tại
                drawingEngineRef.current?.startStroke(x, y);
                // 2. Click vào vùng trống → Pan
                isPanningRef.current = true;
                lastPanPointRef.current = { x: e.clientX, y: e.clientY };
                panStartedOnEmptyRef.current = true;
            }
            return;
        }

        // ✅ Các tool khác: Bắt đầu vẽ
        drawingEngineRef.current?.startStroke(x, y);
    }, [isConnected, tool, getRelativeCoords]);

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        if (!drawingCanvasRef.current) return;

        // Ưu tiên xử lý Pan trước và thoát sớm
        if (isPanningRef.current && lastPanPointRef.current) {
            const dx = e.clientX - lastPanPointRef.current.x;
            const dy = e.clientY - lastPanPointRef.current.y;

            setTransform(prev => ({
                ...prev,
                x: prev.x + dx,
                y: prev.y + dy
            }));

            lastPanPointRef.current = { x: e.clientX, y: e.clientY };
            return; // Quan trọng: Thoát sớm để không gọi drawingEngine
        }

        const { x, y } = getRelativeCoords(e);

        // Nếu không pan, mới xử lý Hover và Vẽ
        if (tool === 'select' && !drawingEngineRef.current?.getIsDraggingSelection()) {
            drawingEngineRef.current?.setHoveredStroke(x, y);
        }

        drawingEngineRef.current?.addPoint(x, y);

        if (isConnected && tool !== 'eraser' && tool !== 'select') {
            sendCursor(x, y, color);
        }
    }, [isConnected, tool, color, sendCursor, getRelativeCoords]);

    const handlePointerUp = useCallback(() => {
        // 1. Tắt panning bất kể tool nào nếu đang pan
        if (isPanningRef.current) {
            isPanningRef.current = false;
            lastPanPointRef.current = null;
            panStartedOnEmptyRef.current = false;
            // Nếu là tool pan thuần túy thì return luôn
            if (tool === 'pan') return;
        }

        // 2. Xử lý kết thúc di chuyển stroke cho tool select
        if (tool === 'select' && pendingMovesRef.current.length > 0) {
            console.log('📤 Sending accumulated moves:', pendingMovesRef.current.length);
            sendMove(pendingMovesRef.current);
            pendingMovesRef.current = [];
        }

        // 3. Kết thúc vẽ cho các tool khác
        drawingEngineRef.current?.endStroke();
    }, [tool, sendMove]);


    const handlePointerLeave = useCallback(() => {
        drawingEngineRef.current?.clearHover();
        handlePointerUp();
    }, [handlePointerUp]);
    // ========== Zoom Handling ==========
    // ========== Xử lý Wheel (Zoom) ==========
    const handleWheel = useCallback((e: WheelEvent) => {
        // Bây giờ preventDefault sẽ hoạt động mà không báo lỗi Passive hay TS
        e.preventDefault();

        if (!drawingCanvasRef.current) return;

        const rect = drawingCanvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const scaleBy = 1.1;
        const direction = e.deltaY > 0 ? -1 : 1;

        setTransform((prev) => {
            const oldScale = prev.scale;
            const mousePointTo = {
                x: (mouseX - prev.x) / oldScale,
                y: (mouseY - prev.y) / oldScale,
            };

            const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
            const clampedScale = Math.max(0.1, Math.min(10, newScale));

            return {
                scale: clampedScale,
                x: mouseX - mousePointTo.x * clampedScale,
                y: mouseY - mousePointTo.y * clampedScale,
            };
        });
    }, []);

    // ========== Gán Event Listener thủ công ==========
    useEffect(() => {
        const canvas = drawingCanvasRef.current;
        if (!canvas) return;

        // Gán trực tiếp vào phần tử DOM để bypass hệ thống Synthetic Event của React
        canvas.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            canvas.removeEventListener('wheel', handleWheel);
        };
    }, [handleWheel]);

    // ========== Đồng bộ hóa với Engines ==========
    useEffect(() => {
        drawingEngineRef.current?.setTransform(transform.scale, { x: transform.x, y: transform.y });
        cursorEngineRef.current?.setTransform(transform.scale, { x: transform.x, y: transform.y });
    }, [transform]);
    // ========== Send Batch When Drawing Stops ==========

    useEffect(() => {
        // Only send batch after drawing stops
        if (!isDrawingRef.current) {
            const timer = setTimeout(() => {
                sendBatch();
                clearLocalStrokes();
                drawingEngineRef.current?.clearLocalStrokes();
            }, 200);

            return () => clearTimeout(timer);
        }
    }, [strokes.length, sendBatch, clearLocalStrokes]); // Use strokes.length as proxy for drawing activity


    const getCursorStyle = (): string => {
        // Đang pan
        if (isPanningRef.current) return 'grabbing';

        // Select tool  
        if (tool === 'select') {
            // Nếu đang kéo selection
            const isDragging = drawingEngineRef.current?.getIsDraggingSelection?.();
            if (isDragging) return 'move';

            // Default: grab (có thể pan)
            return 'grab';
        }
        switch (tool) {
            case 'pen': return 'crosshair';
            case 'eraser': return 'cell';
            case 'line':
            case 'circle':
            case 'rectangle': return 'crosshair';
            default: return 'default';
        }
    };

    // ========== Render ==========

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full"
            style={{ width, height }}
        >
            {!isConnected && (
                <div className="absolute inset-0 flex items-center justify-center  text-white z-10">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                        <p>Connecting to whiteboard...</p>
                    </div>
                </div>
            )}

            {/* Drawing Canvas */}
            <canvas
                ref={drawingCanvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerLeave}
                className="absolute inset-0 "
                style={{
                    touchAction: 'none', // Prevent default touch behaviors
                    cursor: getCursorStyle()
                }}
            />

            {/* Cursor Canvas (overlay) */}
            <canvas
                ref={cursorCanvasRef}
                className="absolute inset-0 pointer-events-none"
            />
        </div>
    );
}, (prevProps, nextProps) => {
    // Custom comparison to prevent re-render
    return (
        prevProps.whiteboardId === nextProps.whiteboardId &&
        prevProps.width === nextProps.width &&
        prevProps.height === nextProps.height
    );
});

Canvas.displayName = 'Canvas';

export default Canvas;