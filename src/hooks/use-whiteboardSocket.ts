// src/hooks/use-whiteboardSocket.ts
import { useEffect, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { useCanvasStore } from '@/store/CanvasStore';
import { initializeSocket } from '@/lib/socket/socket';
import { Stroke, Cursor, UserPresence, BatchStrokes } from '@/types/canvas.type';
import { CursorEngine } from '@/lib/engine/CursorEngine';

export const useWhiteboardSocket = (
    whiteboardId: string | undefined,
    cursorEngineRef: React.RefObject<CursorEngine> | null
) => {
    const socketRef = useRef<Socket | null>(null);
    const lastCursorSendTime = useRef<number>(0);
    const cursorThrottle = 50; // ms
    const hasJoinedRef = useRef(false);

    // Store actions
    const setStrokes = useCanvasStore(state => state.setStrokes);
    const addStroke = useCanvasStore(state => state.addStroke);
    const strokeBatch = useCanvasStore(state => state.strokeBatch);
    const clearBatch = useCanvasStore(state => state.clearBatch);
    const setUsers = useCanvasStore(state => state.setUsers);
    const addUser = useCanvasStore(state => state.addUser);
    const removeUser = useCanvasStore(state => state.removeUser);
    const setIsConnected = useCanvasStore(state => state.setIsConnected);
    const setIsLoading = useCanvasStore(state => state.setIsLoading);
    const reset = useCanvasStore(state => state.reset);

    // Setup socket listeners
    const setupSocketListeners = useCallback((socket: Socket) => {
        // Connection events
        socket.on('connect', () => {
            console.log('✅ Socket connected');
            setIsConnected(true);

            // Timeout fallback: force loading to false after 3s
            setTimeout(() => {
                const currentState = useCanvasStore.getState();
                if (currentState.isLoading) {
                    console.log('⚠️ State timeout, forcing loading to false');
                    setIsLoading(false);
                }
            }, 3000);
        });

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

        // Batch of strokes drawn - OPTIMIZED: single state update
        socket.on('batch_drawn', (batch: BatchStrokes) => {
            console.log('📦 Received batch:', batch.strokes.length, 'strokes');

            // BEFORE: batch.strokes.forEach(stroke => addStroke(stroke)); // Multiple re-renders

            // AFTER: Single state update
            const currentStrokes = useCanvasStore.getState().strokes;
            setStrokes([...currentStrokes, ...batch.strokes]);
        });

        // Cursor moved - OPTIMIZED: forward to engine, no React state
        socket.on('cursor_moved', (cursor: Cursor) => {
            if (cursorEngineRef?.current) {
                // Forward directly to engine (NO state update, NO re-render)
                cursorEngineRef.current.updateCursor(cursor);
            }
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
                cursorEngineRef?.current?.removeCursor(data.userId);
            } else if (data.userIds) {
                data.userIds.forEach((userId) => {
                    removeUser(userId);
                    cursorEngineRef?.current?.removeCursor(userId);
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
    }, [
        addStroke,
        addUser,
        removeUser,
        setIsConnected,
        setIsLoading,
        setStrokes,
        setUsers,
        cursorEngineRef,
    ]);

    // Main effect
    useEffect(() => {
        if (!whiteboardId) return;

        console.log('🔌 Step 1: whiteboardId =', whiteboardId);

        let socket = socketRef.current;
        if (!socket) {
            socket = initializeSocket();
            console.log('🔌 Step 2: socket created =', socket?.id);
            socketRef.current = socket;
        }
        if (!socket) return;
        setupSocketListeners(socket);

        // Set connection status
        if (socket.connected) {
            setIsConnected(true);
        } else {
            setIsConnected(false);
        }

        // Join whiteboard room
        if (socket && !hasJoinedRef.current) {
            socket.emit('join_whiteboard', { whiteboardId });
            hasJoinedRef.current = true;
            console.log('🔌 Step 3: emitted join_whiteboard');
        }

        // Cleanup
        return () => {
            console.log('🔌 Cleaning up socket for whiteboard:', whiteboardId);

            if (socket && hasJoinedRef.current) {
                socket.emit('leave_whiteboard');
                hasJoinedRef.current = false;
            }

            // Remove all listeners
            socket?.off('connect');
            socket?.off('connect_error');
            socket?.off('disconnect');
            socket?.off('whiteboard_state');
            socket?.off('stroke_drawn');
            socket?.off('batch_drawn');
            socket?.off('cursor_moved');
            socket?.off('user_joined');
            socket?.off('user_left');
            socket?.off('snapshot_created');
            socket?.off('error');
            socket?.off('rate_limit_exceeded');

            reset();
        };
    }, [whiteboardId, setupSocketListeners, setIsConnected, reset]);

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

            console.log('📤 Sending batch:', batch.strokes.length, 'strokes');
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

    // Auto-send batch when it fills up
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


