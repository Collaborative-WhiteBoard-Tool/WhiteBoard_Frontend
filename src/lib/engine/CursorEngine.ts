// src/lib/CursorEngine.ts
import { Cursor } from '@/types/canvas.type';

export class CursorEngine {
    private cursorImage: HTMLImageElement;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    // Cursor state (NOT React state)
    private cursors: Map<string, Cursor> = new Map();

    // Transform (sync with DrawingEngine)
    private scale: number = 1;
    private offset: { x: number; y: number } = { x: 0, y: 0 };

    // Animation loop
    private rafId: number | null = null;
    private isDirty: boolean = false;

    // Cleanup
    private cleanupInterval: number | null = null;
    private maxAge: number = 2000; // 2 seconds

    constructor(canvas: HTMLCanvasElement) {
        this.cursorImage = new Image();
        this.cursorImage.src = '/path-to-your-cursor-icon.svg';
        this.canvas = canvas;
        const ctx = canvas.getContext('2d', {
            alpha: true,
            desynchronized: true
        });
        if (!ctx) throw new Error('Failed to get 2D context');
        this.ctx = ctx;

        // Set canvas size
        this.resizeCanvas();
    }

    // ========== Public API ==========

    start() {
        if (!this.rafId) {
            this.rafId = requestAnimationFrame(this.renderLoop);
        }

        if (!this.cleanupInterval) {
            this.cleanupInterval = window.setInterval(() => this.cleanup(), 1000);
        }
    }

    destroy() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }

        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }

    resizeCanvas() {
        const canvas = this.canvas;
        const parent = canvas.parentElement;
        if (!parent) return;

        const { width, height } = parent.getBoundingClientRect();
        if (width < 1 || height < 1) return;

        const dpr = window.devicePixelRatio || 1;
        const newWidth = Math.floor(width * dpr);
        const newHeight = Math.floor(height * dpr);

        if (canvas.width === newWidth && canvas.height === newHeight) {
            return;
        }

        canvas.width = newWidth;
        canvas.height = newHeight;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(dpr, dpr);
    }

    updateCursor(cursor: Cursor) {
        this.cursors.set(cursor.userId, cursor);
        this.isDirty = true;
    }

    removeCursor(userId: string) {
        this.cursors.delete(userId);
        this.isDirty = true;
    }

    setTransform(scale: number, offset: { x: number; y: number }) {
        this.scale = scale;
        this.offset = offset;
        this.isDirty = true;
    }

    // ========== Internal Methods ==========

    private cleanup() {
        const now = Date.now();
        let changed = false;

        for (const [userId, cursor] of this.cursors) {
            if (now - cursor.timestamp > this.maxAge) {
                this.cursors.delete(userId);
                changed = true;
            }
        }

        if (changed) {
            this.isDirty = true;
        }
    }

    private renderLoop = () => {
        if (this.isDirty) {
            this.render();
            this.isDirty = false;
        }
        this.rafId = requestAnimationFrame(this.renderLoop);
    }

    private render() {
        const { ctx, canvas, scale, offset } = this;
        const rect = canvas.getBoundingClientRect();

        // Clear canvas
        ctx.clearRect(0, 0, rect.width, rect.height);

        // Apply transform
        ctx.save();
        ctx.translate(offset.x, offset.y);
        ctx.scale(scale, scale);

        // Render cursors
        for (const cursor of this.cursors.values()) {
            this.renderCursor(cursor);
        }

        ctx.restore();
    }

    private renderCursor(cursor: Cursor) {
        const { ctx } = this;
        const { x, y, color, username, displayname } = cursor;

        ctx.save();

        // 1. Cấu hình đổ bóng (Shadow) để con trỏ nổi bật trên mọi nền
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // 2. Vẽ hình mũi tên (Arrow Shape)
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x, y);                          // Đỉnh mũi tên
        ctx.lineTo(x, y + 17);                     // Cạnh trái
        ctx.lineTo(x + 4.5, y + 12.5);             // Khía dưới trái
        ctx.lineTo(x + 7.5, y + 11.5);             // Khía dưới phải
        ctx.lineTo(x + 13, y + 11.5);              // Cạnh phải
        ctx.closePath();
        ctx.fill();

        // 3. Vẽ viền trắng để dễ nhìn trên các stroke cùng màu
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 4. Vẽ Username
        // Tắt shadow cho chữ để tránh bị nhòe
        ctx.shadowColor = 'transparent';

        // Vẽ background nhỏ cho tên (tùy chọn - giúp dễ đọc hơn)
        const textMetrics = ctx.measureText(displayname ?? username ?? "");
        const padding = 4;
        ctx.globalAlpha = 0.8;
        // ctx.fillStyle = color;
        ctx.roundRect(x + 14, y + 14, (textMetrics.width + 13) + padding * 2, 20, 4);
        ctx.fill();

        // Vẽ text
        ctx.globalAlpha = 1;
        ctx.fillStyle = 'white'; // Chữ trắng trên nền màu
        ctx.font = 'bold 12px sans-serif';
        ctx.textBaseline = 'middle';
        ctx.fillText(displayname || username || "", x + 14 + padding, y + 14 + 10);

        ctx.restore();
    }
}