import { useEffect, useRef, useState, useCallback } from "react";
import { useSocket } from "../../hooks/useSocket";
import { Socket } from "socket.io-client";

type DrawSegment = {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  color: string;
  width: number;
  boardId: string;
  userId: string;
};

interface WhiteboardProps {
  socket: Socket;
  boardId: string;
  userId: string;
}

export default function Whiteboard({ socket, boardId, userId }: WhiteboardProps) {
  // const socket = useSocket();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [color, setColor] = useState("#111827"); // gray-900
  const [width, setWidth] = useState(3);
  const drawingRef = useRef(false);
  const lastNormRef = useRef<{ x: number, y: number } | null>(null);

  // Resize canvas full màn hình
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const cssW = window.innerWidth;
    const cssH = window.innerHeight;

    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;

    const ctx = canvas.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas]);

  const getCtx = () => canvasRef.current!.getContext("2d")!;

  const drawSegmentCss = useCallback((seg: DrawSegment) => {
    const canvas = canvasRef.current!;
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;

    const ctx = getCtx();
    ctx.strokeStyle = seg.color;
    ctx.lineWidth = seg.width;
    ctx.beginPath();
    ctx.moveTo(seg.x0 * cssW, seg.y0 * cssH);
    ctx.lineTo(seg.x1 * cssW, seg.y1 * cssH);
    ctx.stroke();
    console.log(cssW, cssH)
  }, []);

  // Nhận vẽ từ socket
  useEffect(() => {
    if (!socket) return;
    const handler = (seg: DrawSegment) => {
      if (seg.boardId === boardId) drawSegmentCss(seg);
    }
    socket.on("draw", handler);
    return () => { socket.off("draw", handler); };
  }, [socket, boardId, drawSegmentCss]);

  // Lấy vị trí chuẩn hóa
  const pointerPosNorm = (e: React.PointerEvent) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drawingRef.current = true;
    lastNormRef.current = pointerPosNorm(e);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drawingRef.current || !lastNormRef.current) return;
    const { x, y } = pointerPosNorm(e);

    const seg: DrawSegment = {
      x0: lastNormRef.current.x,
      y0: lastNormRef.current.y,
      x1: x,
      y1: y,
      color,
      width,
      boardId,
      userId,
    };

    drawSegmentCss(seg);
    socket?.emit("draw", seg);
    lastNormRef.current = { x: x, y: y };
  };

  const onPointerUp = (e: React.PointerEvent) => {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    drawingRef.current = false;
    lastNormRef.current = null;
  };

  const clearBoard = () => {
    if (!confirm("Bạn có chắc muốn xóa toàn bộ bảng?")) return;
    const canvas = canvasRef.current!;
    const ctx = getCtx();
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    socket?.emit("clear");
  };

  useEffect(() => {
    if (!socket) return;
    const handler = () => {
      const canvas = canvasRef.current!;
      getCtx().clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    };
    socket.on("clear", handler);
    return () => { socket.off("clear", handler); };
  }, [socket]);

  return (
    <div className="w-screen h-screen relative bg-gradient-to-br from-zinc-50 to-zinc-200">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block w-full h-full cursor-crosshair"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Floating toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl shadow-md border border-zinc-200">
        <div className="flex items-center gap-2">
          <label className="text-sm text-zinc-600">Màu</label>
          <input title="color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-7 w-7 border rounded cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-zinc-600">Nét</label>
          <input title="range"
            type="range"
            min={1}
            max={16}
            value={width}
            onChange={(e) => setWidth(+e.target.value)}
            className="accent-zinc-600"
          />
          <span className="text-xs text-zinc-500 w-6 text-right">{width}</span>
        </div>

        <button
          onClick={clearBoard}
          className="ml-auto rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm hover:bg-zinc-50"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
