// src/lib/DrawingEngine.ts
import { Stroke, DrawTool } from '@/types/canvas.type';

export interface DrawingEngineConfig {
    onStrokeComplete?: (stroke: Stroke) => void;
    onStrokeStart?: () => void;
}

export interface CanvasTransform {
    scale: number;
    x: number;
    y: number;
}

export class DrawingEngine {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    // Drawing state (NOT React state)
    private strokes: Stroke[] = [];
    private currentStroke: Stroke | null = null;
    private localStrokes: Stroke[] = [];

    // Config (set by React)
    private tool: DrawTool = 'pen';
    private color: string = '#f0eee6';
    private width: number = 2;

    // Transform (zoom/pan)
    private scale: number = 1;
    private offset: { x: number; y: number } = { x: 0, y: 0 };

    // Animation loop
    private rafId: number | null = null;
    private isDirty: boolean = true; // Force first render

    // Drawing state
    private isDrawing: boolean = false;

    // Callbacks
    private config: DrawingEngineConfig;


    // ... existing properties
    private showGrid: boolean = true;
    private gridSize: number = 20;

    constructor(canvas: HTMLCanvasElement, config: DrawingEngineConfig = {}) {
        this.canvas = canvas;
        const ctx = canvas.getContext('2d', {
            alpha: false,
            desynchronized: true // Performance hint
        });
        if (!ctx) throw new Error('Failed to get 2D context');
        this.ctx = ctx;
        this.config = config;

        // Set canvas size
        this.resizeCanvas();
    }

    // ========== Public API (called by React) ==========

    start() {
        if (!this.rafId) {
            this.rafId = requestAnimationFrame(this.renderLoop);
        }
    }

    destroy() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }

    resizeCanvas() {
        const canvas = this.canvas;
        const parent = canvas.parentElement;
        if (!parent) {
            console.warn('Canvas has no parent element');
            return;
        }

        const { width, height } = parent.getBoundingClientRect();

        // ✅ Bỏ qua nếu size quá nhỏ (tránh lỗi)
        if (width < 1 || height < 1) {
            console.warn('Parent size too small:', { width, height });
            return;
        }

        const dpr = window.devicePixelRatio || 1;

        // ✅ CHỈ update nếu thực sự thay đổi
        const newWidth = Math.floor(width * dpr);
        const newHeight = Math.floor(height * dpr);

        if (canvas.width === newWidth && canvas.height === newHeight) {
            console.log('Canvas size unchanged, skipping resize');
            return;
        }

        console.log('🎨 Resizing canvas:', {
            display: { width, height },
            internal: { width: newWidth, height: newHeight },
            dpr
        });

        // Set internal resolution
        canvas.width = newWidth;
        canvas.height = newHeight;

        // Set display size
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        // Reset transform and apply DPR scaling
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(dpr, dpr);

        this.isDirty = true;
    }

    setStrokes(strokes: Stroke[]) {
        this.strokes = strokes;
        this.isDirty = true;
    }

    addStrokes(strokes: Stroke[]) {
        this.strokes.push(...strokes);
        this.isDirty = true;
    }

    setTool(tool: DrawTool) {
        console.log('🔧 DrawingEngine.setTool:', tool);
        this.tool = tool;
    }

    setColor(color: string) {
        this.color = color;
    }

    setWidth(width: number) {
        this.width = width;
    }

    setTransform(scale: number, offset: { x: number; y: number }) {
        this.scale = scale;
        this.offset = offset;
        this.isDirty = true;
    }

    // ========== Drawing API (called by pointer handlers) ==========

    startStroke(x: number, y: number) {
        console.log('🎨 startStroke with tool:', this.tool);
        if (this.tool === 'select') return;

        let strokeType: 'pen' | 'eraser' | 'line' | 'circle' | 'rectangle';

        switch (this.tool) {
            case 'eraser':
                strokeType = 'eraser';
                break;
            case 'line':
                strokeType = 'line';
                break;
            case 'circle':
                strokeType = 'circle';
                break;
            case 'rectangle':
                strokeType = 'rectangle';
                break;
            case 'pen':
            default:
                strokeType = 'pen';
                break;
        }


        this.currentStroke = {
            id: `stroke_${Date.now()}_${Math.random()}`,
            tool: this.tool,
            type: strokeType,
            points: [x, y],
            color: this.tool === 'eraser' ? '#FFFFFF' : this.color,
            width: this.width,
            timestamp: Date.now(),
            userId: 'local',
            username: 'You',
        };

        this.isDrawing = true;
        this.isDirty = true;
        this.config.onStrokeStart?.();
    }

    addPoint(x: number, y: number) {
        if (!this.isDrawing || !this.currentStroke) return;


        this.currentStroke.points.push(x, y);
        this.isDirty = true;
    }

    endStroke() {
        if (!this.isDrawing || !this.currentStroke) return;

        this.isDrawing = false;

        // Only save strokes with at least 2 points
        if (this.currentStroke.points.length >= 4) {
            this.localStrokes.push(this.currentStroke);
            this.config.onStrokeComplete?.(this.currentStroke);
        }

        this.currentStroke = null;
        this.isDirty = true;
    }

    clearLocalStrokes() {
        this.localStrokes = [];
        this.isDirty = true;
    }

    getIsDrawing(): boolean {
        return this.isDrawing;
    }

    // ========== Internal Rendering ==========

    private renderLoop = () => {
        if (this.isDirty) {
            this.render();
            this.isDirty = false;
        }
        this.rafId = requestAnimationFrame(this.renderLoop);
    }

    // DrawingEngine.ts - Thêm method vẽ grid
    private renderGrid2() {
        if (!this.showGrid) return; // ✅ Chỉ vẽ khi bật
        const { ctx, canvas } = this;
        const rect = canvas.getBoundingClientRect();

        const gridSize = 20; // Khoảng cách giữa các chấm
        const dotRadius = 1.5; // Kích thước chấm
        const dotColor = '#d0d0d0';

        ctx.save();
        ctx.fillStyle = dotColor;

        // Tính toán phạm vi
        const startX = Math.floor(-this.offset.x / this.scale / gridSize) * gridSize;
        const startY = Math.floor(-this.offset.y / this.scale / gridSize) * gridSize;
        const endX = startX + Math.ceil(rect.width / this.scale) + gridSize;
        const endY = startY + Math.ceil(rect.height / this.scale) + gridSize;

        // Vẽ dots
        for (let x = startX; x < endX; x += gridSize) {
            for (let y = startY; y < endY; y += gridSize) {
                ctx.beginPath();
                ctx.arc(x, y, dotRadius / this.scale, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.restore();
    }

    setShowGrid(show: boolean) {
        this.showGrid = show;
        this.isDirty = true;
    }

    setGridSize(size: number) {
        this.gridSize = size;
        this.isDirty = true;
    }

    private renderGrid1() {
        if (!this.showGrid) return; // ✅ Chỉ vẽ khi bật

        const { ctx, canvas } = this;
        const rect = canvas.getBoundingClientRect();
        const gridColor = '#e0e0e0';
        const axisColor = '#d0d0d0';

        ctx.save();
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 0.5;

        const startX = Math.floor(-this.offset.x / this.scale / this.gridSize) * this.gridSize;
        const startY = Math.floor(-this.offset.y / this.scale / this.gridSize) * this.gridSize;
        const endX = startX + Math.ceil(rect.width / this.scale) + this.gridSize;
        const endY = startY + Math.ceil(rect.height / this.scale) + this.gridSize;

        // Vertical lines
        for (let x = startX; x < endX; x += this.gridSize) {
            if (x % 100 === 0) {
                ctx.strokeStyle = axisColor;
                ctx.lineWidth = 1;
            } else {
                ctx.strokeStyle = gridColor;
                ctx.lineWidth = 0.5;
            }
            ctx.beginPath();
            ctx.moveTo(x, startY);
            ctx.lineTo(x, endY);
            ctx.stroke();
        }

        // Horizontal lines
        for (let y = startY; y < endY; y += this.gridSize) {
            if (y % 100 === 0) {
                ctx.strokeStyle = axisColor;
                ctx.lineWidth = 1;
            } else {
                ctx.strokeStyle = gridColor;
                ctx.lineWidth = 0.5;
            }
            ctx.beginPath();
            ctx.moveTo(startX, y);
            ctx.lineTo(endX, y);
            ctx.stroke();
        }

        ctx.restore();
    }

    drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number, transform: CanvasTransform) {
        const gridSize = 40 * transform.scale; // Lưới co giãn theo zoom

        ctx.save();

        // Tạo một canvas ảo nhỏ để làm pattern
        const patternCanvas = document.createElement('canvas');
        patternCanvas.width = gridSize;
        patternCanvas.height = gridSize;
        const pCtx = patternCanvas.getContext('2d')!;

        // Vẽ một dấu chấm nhỏ hoặc dấu cộng
        pCtx.fillStyle = '#e5e7eb'; // Màu xám nhạt
        pCtx.fillRect(0, 0, 1, 1); // Vẽ điểm tại góc

        const pattern = ctx.createPattern(patternCanvas, 'repeat');
        if (pattern) {
            // Dịch chuyển lưới theo Pan (x, y)
            const offsetX = transform.x % gridSize;
            const offsetY = transform.y % gridSize;

            ctx.translate(offsetX, offsetY);
            ctx.fillStyle = pattern;
            // Vẽ tràn ra ngoài một chút để không bị hụt khi pan
            ctx.fillRect(-gridSize, -gridSize, width + gridSize * 2, height + gridSize * 2);
        }

        ctx.restore();
    }

    private render() {
        const { ctx, canvas, scale, offset } = this;
        const rect = canvas.getBoundingClientRect();

        // Clear canvas với nền trắng
        ctx.fillStyle = '#f2f2f2';
        ctx.fillRect(0, 0, rect.width, rect.height);


        // Clear canvas
        // ctx.clearRect(0, 0, rect.width, rect.height);

        // Apply transform
        ctx.save();
        ctx.translate(offset.x, offset.y);
        ctx.scale(scale, scale);

        //GRID
        // this.drawGrid(ctx, rect.width, rect.height, { scale, x: offset.x, y: offset.y })
        this.renderGrid2()
        // Render strokes from server
        this.strokes.forEach(stroke => this.renderStroke(stroke, 1));

        // Render local strokes (optimistic UI)
        this.localStrokes.forEach(stroke => this.renderStroke(stroke, 0.7));

        // Render current stroke
        if (this.currentStroke) {
            this.renderStroke(this.currentStroke, 0.5);
        }

        ctx.restore();
    }

    private renderStroke(stroke: Stroke, opacity: number) {
        const { ctx } = this;

        if (stroke.points.length < 2) return;

        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (stroke.type === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
        }

        ctx.beginPath();
        ctx.moveTo(stroke.points[0], stroke.points[1]);

        for (let i = 2; i < stroke.points.length; i += 2) {
            ctx.lineTo(stroke.points[i], stroke.points[i + 1]);
        }

        ctx.stroke();
        ctx.restore();
    }


}