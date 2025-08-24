import { useEffect, useRef, useState, useCallback } from "react";
import { useSocket } from "../hooks/useSocket"

type DrawSegment = {
  // normalized by CSS size (clientWidth/clientHeight)
  x0: number; y0: number;
  x1: number; y1: number;
  color: string;
  width: number;
};

export default function Whiteboard() {
  const socket = useSocket();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [color, setColor] = useState("#111827"); // gray-900
  const [width, setWidth] = useState(3);
  const drawingRef = useRef(false);
  const lastNormRef = useRef<{ x: number, y: number } | null>(null);

  // resize canvas to wrapper, handle HiDPI
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current!;
    const wrapper = wrapperRef.current!;
    const dpr = Math.max(1, window.devicePixelRatio || 1);

    const cssW = wrapper.clientWidth;
    const cssH = wrapper.clientHeight;
    console.log("resizeCanvas", wrapper);

    // internal pixel size for crisp lines on HiDPI
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    canvas.style.width = 900 + "px";
    canvas.style.height = 900 + "px";

    const ctx = canvas.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // draw in CSS pixels
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !wrapperRef.current) return;
    const ro = new ResizeObserver(resizeCanvas);
    ro.observe(wrapperRef.current);
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [resizeCanvas]);

  const getCtx = () => canvasRef.current!.getContext("2d")!;

  const drawSegmentCss = useCallback((seg: DrawSegment) => {
    const canvas = canvasRef.current!;
    // IMPORTANT: de-normalize using CSS size (not canvas.width!)
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;

    const x0 = seg.x0 * cssW;
    const y0 = seg.y0 * cssH;
    const x1 = seg.x1 * cssW;
    const y1 = seg.y1 * cssH;

    const ctx = getCtx();
    ctx.strokeStyle = seg.color;
    ctx.lineWidth = seg.width;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  },
    []);

  // receive segments from others
  useEffect(() => {
    const handler = (seg: DrawSegment) => {
      console.log("📩 received draw:", seg); // 👈 thêm log test ở đây
      drawSegmentCss(seg);
    };
    if(!socket) return;
    socket.on("draw", handler);
    return () => { socket.off("draw", handler) };
  }, [socket, drawSegmentCss]);

  const pointerPosNorm = (e: React.PointerEvent) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const xCss = e.clientX - rect.left;
    const yCss = e.clientY - rect.top;
    const nx = xCss / rect.width;
    const ny = yCss / rect.height;
    return { nx, ny };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drawingRef.current = true;
    const { nx, ny } = pointerPosNorm(e);
    lastNormRef.current = { x: nx, y: ny };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drawingRef.current || !lastNormRef.current) return;
    const { nx, ny } = pointerPosNorm(e);
    const seg: DrawSegment = {
      x0: lastNormRef.current.x, y0: lastNormRef.current.y,
      x1: nx, y1: ny,
      color, width,
    };

    // draw locally
    drawSegmentCss(seg);
    // and broadcast
    console.log("👉 emitting draw", seg);
    if(!socket) return;
    socket.emit("draw", seg);

    lastNormRef.current = { x: nx, y: ny };
  };

  const onPointerUp = (e: React.PointerEvent) => {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    drawingRef.current = false;
    lastNormRef.current = null;
  };

  const clearBoard = () => {
    const canvas = canvasRef.current!;
    const ctx = getCtx();
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    if(!socket) return;
    socket.emit("clear");
  };

  useEffect(() => {
    const handler = () => {
      const canvas = canvasRef.current!;
      const ctx = getCtx();
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    };
    if(!socket) return;
    socket.on("clear", handler);
    return () => { socket.off("clear", handler) };
  }, [socket]);

  return (
    <div className="h-[100dvh] w-[100vw] bg-gradient-to-b from-zinc-50 to-zinc-100 flex flex-col">
      {/* Top mini-toolbar (không sidebar, tối giản) */}
      <div className="px-4 py-2 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-zinc-600">Màu</label>
          <input
            title="ok0"
            type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-zinc-600">Nét</label>
          <input  
            title="ok1"
            type="range" min={1} max={16} value={width} onChange={(e) => setWidth(+e.target.value)} />
          <span className="text-xs text-zinc-500 w-6 text-right">{width}</span>
        </div>
        <button
          onClick={clearBoard}
          className="ml-auto rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm hover:bg-zinc-50"
        >
          Clear
        </button>
      </div>

      {/* Canvas wrapper with Miro-like grid */}
      <div ref={wrapperRef} className="flex-1 p-4">
        <div className="w-full h-full rounded-xl shadow-sm overflow-hidden whiteboard-grid">
          <canvas
            ref={canvasRef}
            className="block w-full h-full cursor-crosshair"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>
      </div>
    </div>
  );
}
