// src/components/Canvas/Canvas.tsx
import React, { useRef, useEffect, useCallback, memo, useState } from 'react';
import { useCanvasStore } from '@/store/CanvasStore';
import { useWhiteboardSocket } from '@/hooks/use-whiteboardSocket';
import { DrawingEngine } from '@/lib/engine/DrawingEngine';
import { CursorEngine } from '@/lib/engine/CursorEngine';
import { DrawTool } from '@/types/canvas.type';

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

    // Store
    const {
        strokes,
        tool,
        color,
        width: strokeWidth,
        showGrid,
        gridSize,
        addLocalStroke,
        addStrokeToBatch,
        clearLocalStrokes,
    } = useCanvasStore();

    const { sendBatch, sendCursor, isConnected } = useWhiteboardSocket(
        whiteboardId,
        cursorEngineRef as React.RefObject<CursorEngine>
    );

    // Transform state (still in React for UI controls like zoom buttons)
    // const [stageScale, setStageScale] = useState(1);
    // const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });

    // Track if currently drawing
    const isDrawingRef = useRef(false);

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
    }, [addLocalStroke, addStrokeToBatch]);

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
        if (!isConnected || tool === 'select') return;
        const { x, y } = getRelativeCoords(e);
        drawingEngineRef.current?.startStroke(x, y);

        drawingEngineRef.current?.startStroke(x, y);
    }, [isConnected, tool, getRelativeCoords]);

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        if (!drawingCanvasRef.current) return;

        const { x, y } = getRelativeCoords(e);

        // Vẽ lên engine (Sử dụng tọa độ World đã tính)
        drawingEngineRef.current?.addPoint(x, y);

        // Gửi cursor cho các user khác
        if (isConnected && tool !== 'eraser') {
            sendCursor(x, y, color);
        }
    }, [isConnected, tool, color, sendCursor, getRelativeCoords]);

    const handlePointerUp = useCallback(() => {
        drawingEngineRef.current?.endStroke();
    }, []);

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


    const getCursorStyle = (tool: DrawTool): string => {
        switch (tool) {
            case 'pen':
                return 'crosshair';
            case 'eraser':
                return 'cell';
            case 'line':
            case 'circle':
            case 'rectangle':
                return 'crosshair'; // Hoặc custom cursor
            case 'select':
                return 'default';
            default:
                return 'default';
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
                onPointerLeave={handlePointerUp}
                className="absolute inset-0 "
                style={{
                    touchAction: 'none', // Prevent default touch behaviors
                    cursor: getCursorStyle(tool)
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