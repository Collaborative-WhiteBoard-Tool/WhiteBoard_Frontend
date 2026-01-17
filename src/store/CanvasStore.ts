import { create } from 'zustand';
import { Stroke, Cursor, UserPresence, DrawTool } from '@/types/canvas.type';

type StrokeUpdater = (prev: Stroke | null) => Stroke | null;
interface CanvasStore {
    // Drawing state
    strokes: Stroke[];
    localStrokes: Stroke[];  // Optimistic local strokes
    cursors: Map<string, Cursor>;
    users: UserPresence[];

    // Tool state
    tool: DrawTool;
    color: string;
    width: number;

    // UI state
    isDrawing: boolean;
    currentStroke: Stroke | null;
    isConnected: boolean;
    isLoading: boolean;

    // Batch management
    strokeBatch: Stroke[];
    batchTimer: NodeJS.Timeout | null;

    // Performance tracking
    fps: number;
    lastFrameTime: number;

    // ... existing state
    showGrid: boolean;
    gridSize: number;

    // ... existing actions
    setShowGrid: (show: boolean) => void;
    setGridSize: (size: number) => void;


    // Actions - State Management
    setStrokes: (strokes: Stroke[]) => void;
    addStroke: (stroke: Stroke) => void;
    addLocalStroke: (stroke: Stroke) => void;
    clearLocalStrokes: () => void;

    // Actions - Batch Management
    addStrokeToBatch: (stroke: Stroke) => void;
    clearBatch: () => void;

    // Actions - Cursor Management
    updateCursor: (cursor: Cursor) => void;
    removeCursor: (userId: string) => void;
    clearOldCursors: () => void;

    // Actions - User Management
    setUsers: (users: UserPresence[]) => void;
    addUser: (user: UserPresence) => void;
    removeUser: (userId: string) => void;

    // Actions - Tool Management
    setTool: (tool: DrawTool) => void;
    setColor: (color: string) => void;
    setWidth: (width: number) => void;

    // Actions - UI State
    setIsDrawing: (isDrawing: boolean) => void;
    setCurrentStroke: (update: Stroke | null | StrokeUpdater) => void;
    setIsConnected: (connected: boolean) => void;
    setIsLoading: (loading: boolean) => void;

    // Actions - Performance
    updateFPS: () => void;

    // Actions - Reset
    reset: () => void;

}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
    // Initial state
    strokes: [],
    localStrokes: [],
    cursors: new Map(),
    users: [],

    tool: 'pen',
    color: '#000000',
    width: 2,

    isDrawing: false,
    currentStroke: null,
    isConnected: false,
    isLoading: true,

    strokeBatch: [],
    batchTimer: null,

    fps: 60,
    lastFrameTime: Date.now(),


    // ... existing state
    showGrid: true,
    gridSize: 20,

    // ... existing actions
    setShowGrid: (showGrid) => set({ showGrid }),
    setGridSize: (gridSize) => set({ gridSize }),


    // State management
    setStrokes: (strokes) => {
        set((state) => {
            if (state.strokes === strokes) return state
            return { strokes, isLoading: false };
        })
        // set({ strokes, isLoading: false });
    },

    addStroke: (stroke) => {
        set((state) => ({
            strokes: [...state.strokes, stroke],
        }));
    },

    addLocalStroke: (stroke) => {
        set((state) => ({
            localStrokes: [...state.localStrokes, stroke],
        }));
    },

    clearLocalStrokes: () => {
        set({ localStrokes: [] });
    },

    // Batch management with auto-flush
    addStrokeToBatch: (stroke) => {
        const { strokeBatch, batchTimer } = get();

        const newBatch = [...strokeBatch, stroke];
        set({ strokeBatch: newBatch });

        // Clear existing timer
        if (batchTimer) {
            clearTimeout(batchTimer);
        }

        // Auto-flush after 100ms of inactivity or when batch reaches 10 strokes
        if (newBatch.length >= 10) {
            // Batch full, will be flushed immediately by useWhiteboardSocket
            set({ batchTimer: null });
        } else {
            // Set timer for auto-flush
            const timer = setTimeout(() => {
                set({ batchTimer: null });
            }, 100);

            set({ batchTimer: timer });
        }
    },

    clearBatch: () => {
        const { batchTimer } = get();
        if (batchTimer) {
            clearTimeout(batchTimer);
        }
        set({ strokeBatch: [], batchTimer: null });
    },

    // Cursor management with auto-cleanup
    updateCursor: (cursor) => {
        set((state) => {
            const newCursors = new Map(state.cursors);
            newCursors.set(cursor.userId, cursor);
            return { cursors: newCursors };
        });
    },

    removeCursor: (userId) => {
        set((state) => {
            const newCursors = new Map(state.cursors);
            newCursors.delete(userId);
            return { cursors: newCursors };
        });
    },

    clearOldCursors: () => {
        const now = Date.now();
        const maxAge = 2000; // 2 seconds

        set((state) => {
            const newCursors = new Map(state.cursors);
            for (const [userId, cursor] of newCursors) {
                if (now - cursor.timestamp > maxAge) {
                    newCursors.delete(userId);
                }
            }
            return { cursors: newCursors };
        });
    },

    // User management
    setUsers: (users) => set({ users }),

    addUser: (user) => {
        set((state) => ({
            users: [...state.users.filter(u => u.userId !== user.userId), user],
        }));
    },

    removeUser: (userId) => {
        set((state) => ({
            users: state.users.filter((u) => u.userId !== userId),
        }));
    },

    // Tool management
    setTool: (tool) => set({ tool }),
    setColor: (color) => set({ color }),
    setWidth: (width) => set({ width }),

    // UI state
    setIsDrawing: (isDrawing) => set({ isDrawing }),
    setCurrentStroke: (update) =>
        set((state) => {
            // Kiểm tra kiểu dữ liệu một cách tường minh để tránh 'never'
            const nextStroke = typeof update === 'function'
                ? (update as StrokeUpdater)(state.currentStroke)
                : update;

            return { currentStroke: nextStroke };
        }),
    setIsConnected: (isConnected) => set({ isConnected }),
    setIsLoading: (isLoading) => set({ isLoading }),

    // Performance tracking
    updateFPS: () => {
        const now = Date.now();
        const { lastFrameTime } = get();
        const delta = now - lastFrameTime;
        const fps = delta > 0 ? Math.round(1000 / delta) : 60;

        set({ fps, lastFrameTime: now });
    },

    // Reset everything
    reset: () => {
        const { batchTimer } = get();
        if (batchTimer) {
            clearTimeout(batchTimer);
        }
        set({
            strokes: [],
            localStrokes: [],
            cursors: new Map(),
            users: [],
            tool: 'pen',
            color: '#000000',
            width: 2,
            isDrawing: false,
            currentStroke: null,
            isConnected: false,
            isLoading: true,
            strokeBatch: [],
            batchTimer: null,
            fps: 60,
            lastFrameTime: Date.now(),
        });
    },


}));
