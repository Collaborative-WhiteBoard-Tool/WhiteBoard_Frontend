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
    const listenersSetupRef = useRef(false);



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
    const deleteStrokes = useCanvasStore(state => state.deleteStrokes)
    const setUndoRedoStatus = useCanvasStore(state => state.setUndoRedoStatus)

    const cleanupListeners = useCallback((socket: Socket) => {
        socket.off('connect');
        socket.off('connect_error');
        socket.off('disconnect');
        socket.off('whiteboard_state');
        socket.off('stroke_drawn');
        socket.off('batch_drawn');
        socket.off('batch_confirmed');
        socket.off('strokes_deleted');
        socket.off('strokes_moved');
        socket.off('cursor_moved');
        socket.off('user_joined');
        socket.off('user_left');
        socket.off('undo_completed');
        socket.off('redo_completed');
        socket.off('history_updated');
        socket.off('snapshot_created');
        socket.off('error');
        socket.off('rate_limit_exceeded');
    }, []);

    // Setup socket listeners
    const setupSocketListeners = useCallback((socket: Socket) => {
        cleanupListeners(socket);

        // ✅ Debug: Log số listeners hiện tại
        console.log('🔍 Listeners count BEFORE setup:', {
            user_joined: socket.listeners('user_joined').length,
            whiteboard_state: socket.listeners('whiteboard_state').length,
        });

        if (listenersSetupRef.current) return;
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

        socket.on('batch_confirmed', (data: { batchId: string }) => {
            console.log('✅ Batch confirmed:', data.batchId);
            clearBatch();
        });

        socket.on('strokes_deleted', (data: { strokeIds: string[]; deletedBy: string }) => {
            console.log('🗑️ Strokes deleted:', data.strokeIds.length, 'by', data.deletedBy);
            deleteStrokes(data.strokeIds);
        });


        socket.on('strokes_moved', (data: {
            updates: Array<{ strokeId: string; points: number[] }>;
            movedBy: string
        }) => {
            console.log('🔄 Strokes moved:', data.updates.length, 'by', data.movedBy);

            // Update strokes in store
            const currentStrokes = useCanvasStore.getState().strokes;
            const updatedStrokes = currentStrokes.map(stroke => {
                const update = data.updates.find(u => u.strokeId === stroke.id);
                if (update) {
                    return { ...stroke, points: update.points };
                }
                return stroke;
            });

            setStrokes(updatedStrokes);
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

        // ✅ Undo/Redo Events
        socket.on('undo_completed', (data: { userId: string; operation: string; strokes: Stroke[] }) => {
            console.log('↩️ Undo completed:', data.operation, 'by', data.userId);
            setStrokes(data.strokes);
        });

        socket.on('redo_completed', (data: { userId: string; operation: string; strokes: Stroke[] }) => {
            console.log('↪️ Redo completed:', data.operation, 'by', data.userId);
            setStrokes(data.strokes);
        });

        socket.on('history_updated', (status: { canUndo: boolean; canRedo: boolean; undoCount: number; redoCount: number }) => {
            console.log('📜 History updated:', status);
            setUndoRedoStatus(status);
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
        listenersSetupRef.current = true;
        console.log('🔍 Listeners count AFTER setup:', {
            user_joined: socket.listeners('user_joined').length,
            whiteboard_state: socket.listeners('whiteboard_state').length,
        });
    }, [
        cleanupListeners,
        addStroke,
        addUser,
        removeUser,
        setIsConnected,
        setIsLoading,
        setStrokes,
        setUsers,
        deleteStrokes,
        clearBatch,
        setUndoRedoStatus,
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

        if (!listenersSetupRef.current) {
            setupSocketListeners(socket);
            console.log('🎧 Listeners setup completed');
        }

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
            if (socket) {
                cleanupListeners(socket);
            }
            listenersSetupRef.current = false;
            reset();
        };
    }, [whiteboardId, setupSocketListeners, setIsConnected, reset, cleanupListeners]);

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

    // ✅ Send Delete
    const sendDelete = useCallback((strokeIds: string[]) => {
        const socket = socketRef.current;
        if (!socket || strokeIds.length === 0) return;

        console.log('🗑️ Sending delete:', strokeIds.length, 'strokes');

        socket.emit('delete_strokes', {
            strokeIds,
            timestamp: Date.now(),
        });
    }, []);

    // ✅ Send Move
    const sendMove = useCallback((updates: Array<{ strokeId: string; points: number[] }>) => {
        const socket = socketRef.current;
        if (!socket || updates.length === 0) return;

        console.log('🔄 Sending move:', updates.length, 'strokes');

        socket.emit('move_strokes', {
            updates,
            timestamp: Date.now(),
        });
    }, []);

    // ✅ Send Selection (optional - for collaborative highlighting)
    const sendSelection = useCallback((selection: {
        strokeIds: string[];
        bounds: { x: number; y: number; width: number; height: number }
    } | null) => {
        const socket = socketRef.current;
        if (!socket) return;

        if (selection) {
            socket.emit('selection_changed', {
                strokeIds: selection.strokeIds,
                bounds: selection.bounds,
                timestamp: Date.now(),
            });
        }
    }, []);

    // ✅ Send Undo
    const sendUndo = useCallback(() => {
        const socket = socketRef.current;
        if (!socket) return;

        console.log('↩️ Sending undo');
        socket.emit('undo', {
            timestamp: Date.now(),
        });
    }, []);

    // ✅ Send Redo
    const sendRedo = useCallback(() => {
        const socket = socketRef.current;
        if (!socket) return;

        console.log('↪️ Sending redo');
        socket.emit('redo', {
            timestamp: Date.now(),
        });
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
        sendUndo,
        sendRedo,
        sendDelete,
        sendMove,
        sendSelection,
        requestSnapshot,
        isConnected: socketRef.current?.connected || false,
    };

}


