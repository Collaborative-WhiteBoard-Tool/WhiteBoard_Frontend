export type DrawTool =
    | 'pen'
    | 'eraser'
    | 'line'
    | 'rectangle'
    | 'circle'
    | 'select';

export interface Point {
    x: number;
    y: number;
    pressure?: number;
}


export interface Stroke {
    id: string;

    whiteboardId?: string; // optional (server sẽ gắn)
    userId: string;
    username?: string;

    /** Tool dùng để render */
    type: 'pen' | 'eraser';

    /** Tool người dùng chọn */
    tool: DrawTool;

    color: string;
    width: number;

    /**
     * Konva Line format
     * [x1, y1, x2, y2, ...]
     */
    points: number[];

    timestamp: number;
}



export interface Cursor {
    userId: string;
    username?: string;
    color: string;

    x: number;
    y: number;

    timestamp: number;
}


export interface UserPresence {
    userId: string;
    userName?: string;
    color?: string;
    displayName?: string
    online: boolean;
    lastActiveAt: number;
}

export interface BatchStrokes {
    whiteboardId: string;
    userId: string;

    strokes: Stroke[];

    createdAt: number;
}
