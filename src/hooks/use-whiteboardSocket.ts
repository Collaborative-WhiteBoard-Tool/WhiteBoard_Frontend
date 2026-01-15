import { initializeSocket } from "@/lib/socket/socket";
import { useCanvasStore } from "@/store/CanvasStore";
import { BatchStrokes, Cursor, Stroke, UserPresence } from "@/types/canvas.type";
import { useCallback, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { toast } from "sonner";

export const useWhiteboardSocket = (whiteboardId: string | undefined) => {
    const socketRef = useRef<Socket | null>(null);
    const lastCursorSendTime = useRef<number>(0);
    const cursorThrottle = 50; // ms
    const hasJoinedRef = useRef(false);

    const setStrokes = useCanvasStore(state => state.setStrokes);
    const addStroke = useCanvasStore(state => state.addStroke);
    const strokeBatch = useCanvasStore(state => state.strokeBatch);
    const clearBatch = useCanvasStore(state => state.clearBatch);
    const updateCursor = useCanvasStore(state => state.updateCursor);
    const removeCursor = useCanvasStore(state => state.removeCursor);
    const setUsers = useCanvasStore(state => state.setUsers);
    const addUser = useCanvasStore(state => state.addUser);
    const removeUser = useCanvasStore(state => state.removeUser);
    const setIsConnected = useCanvasStore(state => state.setIsConnected);
    const setIsLoading = useCanvasStore(state => state.setIsLoading);
    const reset = useCanvasStore(state => state.reset);


    useEffect(() => {
        if (!whiteboardId) return;

        console.log('🔌 Step 1: whiteboardId =', whiteboardId);
        let socket = socketRef.current;
        if (!socket) {
            socket = initializeSocket()
            console.log('🔌 Step 2: socket created =', socket?.id);
            socketRef.current = socket;

            console.log('🔌 Step 3: listeners setup');
        }
        setupSocketListeners(socket);


        //Nếu đã tạo socket, giữ trạng thái socket : connected 
        if (socket.connected) {
            setIsConnected(true);
        } else {
            setIsConnected(false);
        }

        // ✅ SETUP LISTENERS TRƯỚC KHI JOIN
        // ✅ Chỉ join nếu chưa join
        if (socket && !hasJoinedRef.current) {
            socket.emit('join_whiteboard', { whiteboardId })
            hasJoinedRef.current = true;
            console.log('🔌 Step 5: emitted join_whiteboard');
        }
        // Cleanup
        return () => {
            console.log('🔌 Cleaning up socket for whiteboard:', whiteboardId);
            // ✅ KHÔNG disconnect socket, chỉ leave room
            if (socket && hasJoinedRef.current) {
                socket.emit('leave_whiteboard');
                hasJoinedRef.current = false;
            }

            // Remove all listeners
            socket.off('whiteboard_state');
            socket.off('stroke_drawn');
            socket.off('batch_drawn');
            socket.off('cursor_moved');
            socket.off('user_joined');
            socket.off('user_left');
            socket.off('snapshot_created');
            socket.off('error');
            socket.off('rate_limit_exceeded');
            reset();
        };
    }, [whiteboardId]);


    // Setup all socket event listeners
    const setupSocketListeners = useCallback((socket: Socket) => {
        // Connection events
        socket.on('connect', () => {
            console.log('✅ Socket connected');
            setIsConnected(true);
            // Timeout dự phòng: Nếu sau 3s server không gửi state, vẫn cho người dùng vào bảng trống
            setTimeout(() => {
                const currentState = useCanvasStore.getState();
                if (currentState.isLoading) {
                    console.log('⚠️ State timeout, forcing loading to false');
                    setIsLoading(false);
                }
            }, 3000);
        });

        // listener cho lỗi kết nối để không bị kẹt loading
        socket.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error.message);
            setIsLoading(false);
        });

        socket.on('disconnect', (reason) => {
            console.log('❌ Socket disconnected:', reason);
            setIsConnected(false);
            hasJoinedRef.current = false;
            toast.warning('Connection lost!', {
                description: 'Attempting to reconnect...',
                duration: 3000,
            });
        });

        // Whiteboard state (initial load)
        socket.on('whiteboard_state', (data: { strokes: Stroke[]; users: UserPresence[] }) => {
            console.log('📦 Received whiteboard state:', data.strokes.length, 'strokes');
            setStrokes(data.strokes);
            setUsers(data.users);
            setIsLoading(false);
        });

        // Single stroke drawn
        socket.on('stroke_drawn', (stroke: Stroke) => {
            addStroke(stroke);
        });

        // Batch of strokes drawn
        socket.on('batch_drawn', (batch: BatchStrokes) => {
            console.count(`📥 Received Batch: ${batch.whiteboardId}`);
            console.log('📦 Received batch:', batch.strokes.length, 'strokes');
            batch.strokes.forEach((stroke) => addStroke(stroke));
        });

        // socket.on('batch_confirmed', () => {
        //     // Xóa nét vẽ mờ (localStrokes) vì server đã lưu xong nét thật
        //     clearLocalStrokes();
        //     console.log("batch_confirm")
        // });

        // Cursor moved
        socket.on('cursor_moved', (cursor: Cursor) => {
            updateCursor(cursor);
        });

        // User joined
        socket.on('user_joined', (user: UserPresence) => {
            console.log('👤 User joined:', user.userName);
            addUser(user);

            toast.success(`${user.userName} joined`, {
                description: 'Started collaborating',
                duration: 3000,
            });

        });

        // User left
        socket.on('user_left', (data: { userId?: string; userIds?: string[] }) => {
            if (data.userId) {
                removeUser(data.userId);
                removeCursor(data.userId);
            } else if (data.userIds) {
                data.userIds.forEach((userId) => {
                    removeUser(userId);
                    removeCursor(userId);
                });
            }
        });

        // Snapshot created
        socket.on('snapshot_created', (data: { version: number; timestamp: number }) => {
            console.log('📸 Snapshot created, version:', data.version);
        });

        // Error
        socket.on('error', (error: { message: string }) => {
            console.error('Socket error:', error);
            toast.error('Error!', {
                description: error.message,
                duration: 3000,
            });
        });

        // Rate limit exceeded
        socket.on('rate_limit_exceeded', (data: { message: string }) => {
            toast.warning('Slow down', {
                description: data.message,
                duration: 3000,
            });
        });
    }, [addStroke, addUser, removeCursor, removeUser, setIsConnected, setIsLoading, setStrokes, setUsers, updateCursor]);

    // Send single stroke (fallback)
    const sendStroke = useCallback((stroke: Stroke) => {
        if (socketRef.current?.connected) {
            socketRef.current.emit('draw_stroke', stroke);
        }
    }, []);

    // Send batch (optimized - recommended)
    const sendBatch = useCallback(() => {
        if (socketRef.current?.connected && strokeBatch.length > 0) {
            const batch = {
                strokes: strokeBatch,
                batchId: `batch_${Date.now()}_${Math.random()}`,
                timestamp: Date.now(),
            };

            console.log('📤 Sending batch:', batch);
            socketRef.current.emit('draw_batch', batch);
            clearBatch();
        }
    }, [strokeBatch, clearBatch]);

    // Send cursor position (throttled)
    const sendCursor = useCallback((x: number, y: number, color: string) => {
        const now = Date.now();

        if (now - lastCursorSendTime.current < cursorThrottle) {
            return; // Throttle
        }

        lastCursorSendTime.current = now;

        if (socketRef.current?.connected) {
            socketRef.current.emit('cursor_move', { x, y, color });
        }
    }, []);

    // Auto-send batch when it fills up or after inactivity
    useEffect(() => {
        if (strokeBatch.length >= 10) {
            sendBatch();
        }
    }, [strokeBatch, sendBatch]);

    // Request snapshot (for recovery)
    const requestSnapshot = useCallback(() => {
        if (socketRef.current?.connected) {
            socketRef.current.emit('request_snapshot');
        }
    }, []);

    return {
        sendStroke,
        sendBatch,
        sendCursor,
        requestSnapshot,
        isConnected: socketRef.current?.connected || false,
    };

}


