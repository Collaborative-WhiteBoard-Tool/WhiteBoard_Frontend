// src/lib/DrawingEngine.ts
import { Stroke, DrawTool, Selection } from '@/types/canvas.type';

export interface DrawingEngineConfig {
    onStrokeComplete?: (stroke: Stroke) => void;
    onStrokeStart?: () => void;
    onStrokesDeleted?: (strokeIds: string[]) => void;
    onStrokesMoved?: (updates: Array<{ strokeId: string; points: number[] }>) => void;
    onSelectionChange?: (selection: Selection | null) => void;
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

    //Selection state
    private selection: Selection | null = null;
    private isDraggingSelection: boolean = false;
    private dragStartPoint: { x: number; y: number } | null = null;
    private selectionStartPoint: { x: number; y: number } | null = null;

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

    private startPoint: { x: number; y: number } | null = null;

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
        if (tool !== 'select' && this.selection) {
            this.selection = null
            this.config.onSelectionChange?.(null)
            this.isDirty = true
        }
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

    private hoveredStrokeId: string | null = null;

    // Thêm method để set hover từ Canvas
    public setHoveredStroke(x: number, y: number) {
        const stroke = this.findStrokeAtPointInternal(x, y);
        const newHoveredId = stroke?.id || null;

        if (newHoveredId !== this.hoveredStrokeId) {
            this.hoveredStrokeId = newHoveredId;
            this.isDirty = true;
        }
    }

    public clearHover() {
        if (this.hoveredStrokeId) {
            this.hoveredStrokeId = null;
            this.isDirty = true;
        }
    }


    startStroke(x: number, y: number) {
        console.log('🎨 startStroke with tool:', this.tool);
        if (this.tool === 'pan') return;
        if (this.tool === 'select') {
            const clickedStroke = this.findStrokeAtPointInternal(x, y)
            if (clickedStroke) {
                // Selecting existing stroke
                this.selection = {
                    strokeIds: [clickedStroke.id],
                    bounds: this.calculateStrokeBounds(clickedStroke)
                };
                this.isDraggingSelection = true;
                this.dragStartPoint = { x, y };
            } else {
                // Start selection box
                this.selection = null; // Click ra ngoài thì bỏ chọn
                this.isDraggingSelection = false;
                this.dragStartPoint = null
                console.log('📍 Clicked on empty area');
                return;
            }

            this.config.onSelectionChange?.(this.selection);
            this.isDirty = true;
            return;
        }

        if (this.tool === 'eraser') {
            this.isDrawing = true;
            this.startPoint = { x, y };
            // Track which strokes to delete
            this.currentStroke = {
                id: `eraser_${Date.now()}`,
                tool: 'eraser',
                type: 'eraser',
                points: [x, y],
                color: '#FF0000', // Red preview
                width: this.width * 2, // Larger eraser
                timestamp: Date.now(),
                userId: 'local',
                username: 'You',
            };
            this.isDirty = true;
            this.config.onStrokeStart?.();
            return;
        }

        this.isDrawing = true;
        this.startPoint = { x, y };

        let strokeType: Stroke['type'];

        switch (this.tool) {
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
            color: this.color,
            width: this.width,
            timestamp: Date.now(),
            userId: 'local',
            username: 'You',
        };

        this.isDirty = true;
        this.config.onStrokeStart?.();
    }

    addPoint(x: number, y: number) {
        if (this.tool === 'select') {
            if (this.isDraggingSelection && this.selection && this.dragStartPoint) {
                // Move selected strokes
                const dx = x - this.dragStartPoint.x;
                const dy = y - this.dragStartPoint.y;
                this.moveSelectedStrokes(dx, dy);
                this.dragStartPoint = { x, y };
            } else if (this.selectionStartPoint) {
                // Update selection box (will be rendered in render())
                this.isDirty = true;
            }
            return;
        }

        if (!this.isDrawing || !this.currentStroke) return;

        const tool = this.currentStroke.tool;

        // ✅ ERASER: Check intersection with strokes
        if (tool === 'eraser') {
            this.currentStroke.points.push(x, y);
            this.checkEraserCollision(x, y);
            this.isDirty = true;
            return;
        }

        // ✅ PEN: Add all points
        if (tool === 'pen') {
            this.currentStroke.points.push(x, y);
        }
        // ✅ SHAPES: Update end point only (keep start point)
        else if (tool === 'line' || tool === 'circle' || tool === 'rectangle') {
            this.currentStroke.points = [
                this.startPoint!.x,
                this.startPoint!.y,
                x,
                y
            ];
        }

        this.isDirty = true;
    }

    endStroke() {
        if (this.tool === 'select') {
            this.isDraggingSelection = false;
            this.dragStartPoint = null;
            this.selectionStartPoint = null;
            return;
        }

        if (!this.isDrawing || !this.currentStroke) return;
        this.isDrawing = false;

        // ✅ ERASER: Don't save eraser stroke, just notify deletion
        if (this.currentStroke.tool === 'eraser') {
            this.currentStroke = null;
            this.isDirty = true;
            return;
        }

        // Save valid strokes
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
    deleteStrokes(strokeIds: string[]) {
        this.strokes = this.strokes.filter(s => !strokeIds.includes(s.id));
        this.isDirty = true;
    }

    // ========== Internal Rendering ==========

    public findStrokeAtPoint(x: number, y: number): Stroke | null {
        return this.findStrokeAtPointInternal(x, y);
    }
    private findStrokeAtPointInternal(x: number, y: number): Stroke | null {
        // ✅ Kết hợp cả localStrokes (vừa vẽ xong) và server strokes
        const allStrokes = [...this.strokes, ...this.localStrokes];

        // Check từ trên xuống (stroke mới nhất trước)
        for (let i = allStrokes.length - 1; i >= 0; i--) {
            const stroke = allStrokes[i];
            if (this.isPointNearStroke(x, y, stroke)) {
                return stroke;
            }
        }
        return null;
    }
    public getIsDraggingSelection(): boolean {
        return this.isDraggingSelection;
    }

    private isPointNearStroke(x: number, y: number, stroke: Stroke): boolean {
        const baseThreshold = 25
        const threshold = (stroke.width + baseThreshold) / this.scale;

        for (let i = 0; i < stroke.points.length - 2; i += 2) {
            const x1 = stroke.points[i];
            const y1 = stroke.points[i + 1];
            const x2 = stroke.points[i + 2];
            const y2 = stroke.points[i + 3];

            const dist = this.distanceToSegment(x, y, x1, y1, x2, y2);
            if (dist < threshold) return true;
        }
        return false;
    }

    private distanceToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;

        if (lenSq !== 0) param = dot / lenSq;

        let xx, yy;

        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        const dx = px - xx;
        const dy = py - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }

    private calculateStrokeBounds(stroke: Stroke) {
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        for (let i = 0; i < stroke.points.length; i += 2) {
            minX = Math.min(minX, stroke.points[i]);
            maxX = Math.max(maxX, stroke.points[i]);
            minY = Math.min(minY, stroke.points[i + 1]);
            maxY = Math.max(maxY, stroke.points[i + 1]);
        }

        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }

    private checkEraserCollision(x: number, y: number) {
        // const eraserRadius = this.width;
        const toDelete: string[] = [];

        this.strokes.forEach(stroke => {
            if (this.isPointNearStroke(x, y, stroke)) {
                toDelete.push(stroke.id);
            }
        });

        if (toDelete.length > 0) {
            this.deleteStrokes(toDelete);
            this.config.onStrokesDeleted?.(toDelete);
        }
    }

    private moveSelectedStrokes(dx: number, dy: number) {

        if (!this.selection) return;

        const updates: Array<{ strokeId: string; points: number[] }> = [];

        this.selection.strokeIds.forEach(id => {
            const stroke = this.strokes.find(s => s.id === id);
            if (stroke) {
                const newPoints = [...stroke.points];
                for (let i = 0; i < newPoints.length; i += 2) {
                    newPoints[i] += dx;
                    newPoints[i + 1] += dy;
                }

                // Update local state
                stroke.points = newPoints;

                // Track for server update
                updates.push({
                    strokeId: stroke.id,
                    points: newPoints
                });
            }
        });

        // Update bounds
        this.selection.bounds.x += dx;
        this.selection.bounds.y += dy;

        // Notify parent (will send to server when drag ends)
        if (updates.length > 0) {
            this.config.onStrokesMoved?.(updates);
        }

        this.isDirty = true;
    }

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
        if (this.showGrid) {
            this.renderGrid2()
        }
        // Render strokes from server
        this.strokes.forEach(stroke => {
            const isHovered = stroke.id === this.hoveredStrokeId;
            this.renderStroke(stroke, 1, isHovered);
        });

        this.localStrokes.forEach(stroke => {
            const isHovered = stroke.id === this.hoveredStrokeId;
            this.renderStroke(stroke, 0.7, isHovered);
        });

        // Render current stroke
        if (this.currentStroke) {
            if (this.currentStroke.tool === 'eraser') {
                this.renderEraserPreview(this.currentStroke);
            } else {
                this.renderStroke(this.currentStroke, 0.5);
            }
        }

        if (this.selection) {
            this.renderSelection(this.selection);
        }


        ctx.restore();
    }

    private renderEraserPreview(stroke: Stroke) {
        const { ctx } = this;
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.lineWidth = stroke.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        for (let i = 0; i < stroke.points.length; i += 2) {
            if (i === 0) {
                ctx.moveTo(stroke.points[i], stroke.points[i + 1]);
            } else {
                ctx.lineTo(stroke.points[i], stroke.points[i + 1]);
            }
        }
        ctx.stroke();
        ctx.restore();
    }

    private renderSelection(selection: Selection) {
        const { ctx } = this;
        const { bounds } = selection;

        ctx.save();
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2 / this.scale;
        ctx.setLineDash([5 / this.scale, 5 / this.scale]);
        ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);

        // Draw handles
        const handleSize = 8 / this.scale;
        ctx.fillStyle = '#3b82f6';
        const corners = [
            [bounds.x, bounds.y],
            [bounds.x + bounds.width, bounds.y],
            [bounds.x + bounds.width, bounds.y + bounds.height],
            [bounds.x, bounds.y + bounds.height]
        ];

        corners.forEach(([x, y]) => {
            ctx.fillRect(x - handleSize / 2, y - handleSize / 2, handleSize, handleSize);
        });

        ctx.restore();
    }

    // ✅ Vẽ tự do (pen/eraser)
    private renderFreehand(stroke: Stroke) {
        const { ctx } = this;
        if (stroke.points.length < 4) return;

        ctx.beginPath();
        ctx.moveTo(stroke.points[0], stroke.points[1]);

        for (let i = 2; i < stroke.points.length; i += 2) {
            ctx.lineTo(stroke.points[i], stroke.points[i + 1]);
        }

        ctx.stroke();
    }

    // ✅ Vẽ đường thẳng
    private renderLine(stroke: Stroke) {
        const { ctx } = this;
        if (stroke.points.length < 4) return;

        const [x1, y1, x2, y2] = stroke.points;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    // ✅ Vẽ hình chữ nhật
    private renderRectangle(stroke: Stroke) {
        const { ctx } = this;
        if (stroke.points.length < 4) return;

        const [x1, y1, x2, y2] = stroke.points;
        const width = x2 - x1;
        const height = y2 - y1;

        ctx.beginPath();
        ctx.strokeRect(x1, y1, width, height);
    }

    // ✅ Vẽ hình tròn/ellipse
    private renderCircle(stroke: Stroke) {
        const { ctx } = this;
        if (stroke.points.length < 4) return;

        const [x1, y1, x2, y2] = stroke.points;
        const centerX = (x1 + x2) / 2;
        const centerY = (y1 + y2) / 2;
        const radiusX = Math.abs(x2 - x1) / 2;
        const radiusY = Math.abs(y2 - y1) / 2;

        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
        ctx.stroke();
    }


    private renderStroke(stroke: Stroke, opacity: number, isHovered: boolean = false) {
        const { ctx } = this;
        if (stroke.points.length < 4) return;

        ctx.save();
        if (isHovered && this.tool === 'select') {
            ctx.shadowColor = '#3b82f6';
            ctx.shadowBlur = 10;
        }
        ctx.globalAlpha = opacity;
        ctx.strokeStyle = stroke.color;
        ctx.fillStyle = stroke.color;
        ctx.lineWidth = stroke.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // ✅ Render based on type ONLY
        switch (stroke.type) {
            case 'pen':
                this.renderFreehand(stroke);
                break;
            case 'line':
                this.renderLine(stroke);
                break;
            case 'rectangle':
                this.renderRectangle(stroke);
                break;
            case 'circle':
                this.renderCircle(stroke);
                break;
        }

        ctx.restore();
    }


}