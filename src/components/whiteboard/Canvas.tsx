import React, { useRef, useEffect, useState, useCallback, memo } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import Konva from 'konva';
import { useCanvasStore } from '@/store/CanvasStore';
import { useWhiteboardSocket } from '@/hooks/use-whiteboardSocket';
import { Stroke } from '@/types/canvas.type';
import CursorLayer from './Cursor';




interface CanvasProps {
    whiteboardId: string;
    width: number;
    height: number;
}


const Canvas = memo<CanvasProps>(({ whiteboardId, width, height }) => {
    console.log('whiteboardid: ', whiteboardId);
    const stageRef = useRef<Konva.Stage>(null);
    const [stageScale, setStageScale] = useState(1);
    const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
    const currentStrokeRef = useRef<Stroke | null>(null);



    const {
        strokes,
        localStrokes,
        tool,
        color,
        width: strokeWidth,
        isDrawing,
        currentStroke,
        setIsDrawing,
        setCurrentStroke,
        addStrokeToBatch,
        addLocalStroke,
        clearLocalStrokes,
    } = useCanvasStore();
    console.log('Canvas render, ID: ', whiteboardId);
    const { sendBatch, sendCursor, isConnected } = useWhiteboardSocket(whiteboardId);

    // Track drawing state
    const isDrawingRef = useRef(false);
    const lastPointRef = useRef<{ x: number; y: number } | null>(null);


    // Handle mouse/touch down
    const handlePointerDown = useCallback((e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
        if (!isConnected || tool === 'select') return;

        const stage = e.target.getStage();
        const point = stage?.getPointerPosition();
        if (!point) return;

        // Transform point based on stage scale/position
        const transformedPoint = {
            x: (point.x - stagePosition.x) / stageScale,
            y: (point.y - stagePosition.y) / stageScale,
        };

        isDrawingRef.current = true;
        setIsDrawing(true);
        lastPointRef.current = transformedPoint;

        const newStroke: Stroke = {
            id: `stroke_${Date.now()}_${Math.random()}`,
            tool,
            type: tool === 'eraser' ? 'eraser' : 'pen',
            points: [transformedPoint.x, transformedPoint.y],
            color: tool === 'eraser' ? '#FFFFFF' : color,
            width: strokeWidth,
            timestamp: Date.now(),
            userId: 'local', // Will be set by server
            username: 'You',
        };

        setCurrentStroke(newStroke);
    }, [isConnected, tool, color, strokeWidth, stageScale, stagePosition, setIsDrawing, setCurrentStroke]);

    // Handle mouse/touch move
    const handlePointerMove = useCallback((e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
        console.log('handlePointerMove')
        const stage = e.target.getStage();
        const point = stage?.getPointerPosition();
        if (!point) return;
        // Transform point
        const transformedPoint = {
            x: (point.x - stagePosition.x) / stageScale,
            y: (point.y - stagePosition.y) / stageScale,
        };
        // Gửi Cursor
        // sendCursor(transformedPoint.x, transformedPoint.y, color);
        // Send cursor position (throttled)
        if (isConnected && tool !== 'eraser') {
            sendCursor(transformedPoint.x, transformedPoint.y, color);
        }
        if (!isDrawingRef.current || !currentStroke) return;
        // Cập nhật State bằng Functional Update (Không cần deps currentStroke)
        setCurrentStroke((prev) => {
            if (!prev) return null;
            const updated = {
                ...prev,
                points: [...prev.points, transformedPoint.x, transformedPoint.y],
            };
            currentStrokeRef.current = updated; // Đồng bộ ngược lại Ref
            return updated;
        });
        lastPointRef.current = transformedPoint;
    }, [isConnected, tool, color, currentStroke, stageScale, stagePosition, sendCursor, setCurrentStroke]);

    // Handle mouse/touch up
    const handlePointerUp = useCallback(() => {
        if (!isDrawingRef.current || !currentStroke) return;

        isDrawingRef.current = false;
        setIsDrawing(false);

        // Only save strokes with at least 2 points
        if (currentStroke.points.length >= 4) { // 4 = 2 points (x,y pairs)
            // Add to local display immediately (optimistic)
            addLocalStroke(currentStroke);

            // Add to batch for sending
            addStrokeToBatch(currentStroke);
        }

        setCurrentStroke(null);
        lastPointRef.current = null;
    }, [currentStroke, setIsDrawing, addLocalStroke, addStrokeToBatch, setCurrentStroke]);

    // Send batch when user stops drawing
    useEffect(() => {
        if (!isDrawing) {
            const timer = setTimeout(() => {
                sendBatch();
                clearLocalStrokes(); // Clear after successful send
            }, 200);

            return () => clearTimeout(timer);
        }
    }, [isDrawing, sendBatch, clearLocalStrokes]);

    // Zoom handling
    const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
        e.evt.preventDefault();

        const stage = e.target.getStage();
        if (!stage) return;

        const oldScale = stageScale;
        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        const mousePointTo = {
            x: (pointer.x - stagePosition.x) / oldScale,
            y: (pointer.y - stagePosition.y) / oldScale,
        };

        const scaleBy = 1.1;
        const direction = e.evt.deltaY > 0 ? -1 : 1;
        const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

        // Limit scale
        const clampedScale = Math.max(0.1, Math.min(5, newScale));

        setStageScale(clampedScale);
        setStagePosition({
            x: pointer.x - mousePointTo.x * clampedScale,
            y: pointer.y - mousePointTo.y * clampedScale,
        });
    }, [stageScale, stagePosition]);

    // Render stroke
    const renderStroke = useCallback((stroke: Stroke, isLocal: boolean = false) => {
        return (
            <Line
                key={stroke.id}
                points={stroke.points}
                stroke={stroke.color}
                strokeWidth={stroke.width}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                opacity={isLocal ? 0.1 : 1}
                globalCompositeOperation={
                    stroke.type === 'eraser' ? 'destination-out' : 'source-over'
                }
                listening={false} // Performance optimization
            />
        );
    }, []);

    return (
        <div className="relative w-full h-full">
            {!isConnected && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white z-10">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                        <p>Connecting to whiteboard...</p>
                    </div>
                </div>
            )}

            <Stage
                ref={stageRef}
                width={width}
                height={height}
                onMouseDown={handlePointerDown}
                onMouseMove={handlePointerMove}
                onMouseUp={handlePointerUp}
                onMouseLeave={handlePointerUp}
                onTouchStart={handlePointerDown}
                onTouchMove={handlePointerMove}
                onTouchEnd={handlePointerUp}
                onWheel={handleWheel}
                scaleX={stageScale}
                scaleY={stageScale}
                x={stagePosition.x}
                y={stagePosition.y}
                className="bg-white border border-gray-300"
            >
                <Layer>
                    {/* 1. Hiện các nét vẽ cũ từ Server */}
                    {strokes.map((stroke) => renderStroke(stroke, false))}

                    {/* 2. Hiện các nét vẽ bạn vừa vẽ xong (Optimistic UI) */}
                    {localStrokes.map((stroke) => renderStroke(stroke, true))}

                    {/* 3. HIỆN NÉT VẼ ĐANG CHẠY THEO CHUỘT CỦA BẠN */}
                    {currentStroke && renderStroke(currentStroke, true)}

                    {/* 4. Hiện chuột của người khác */}
                    {CursorLayer()}
                </Layer>
            </Stage>
        </div>
    );
}, (prevProps, nextProps) => {
    // ✅ Custom comparison để tránh re-render không cần thiết
    return (
        prevProps.whiteboardId === nextProps.whiteboardId &&
        prevProps.width === nextProps.width &&
        prevProps.height === nextProps.height
    );
});

export default Canvas;