
export type DrawTool =
    | 'select'
    | 'pen'
    | 'eraser'
    | 'line'
    | 'rectangle'
    | 'circle'
    | 'pan'


export interface Selection {
    strokeIds: string[];
    bounds: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}
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
    type: 'pen' | 'eraser' | 'line' | 'circle' | 'rectangle'
    /** Tool người dùng chọn */
    tool: DrawTool;
    color: string;
    width: number;
    points: number[];
    timestamp: number;
}



export interface Cursor {
    userId: string;
    username?: string;
    displayname?: string | null
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
