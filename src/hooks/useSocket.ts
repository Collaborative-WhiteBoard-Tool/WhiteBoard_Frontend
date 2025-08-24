import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
export function useSocket() {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const url = import.meta.env.VITE_API_URL || "http://localhost:5000";

        // ✅ chỉ tạo 1 socket sau khi mount
        const socket = io(url);
        socketRef.current = socket;
    console.log("socke1",socketRef.current!)

        socket.on("connect", () => {
            console.log("✅ Connected:", socket.id);
        })
        socket.on("disconnect", () => {
            console.log("❌ Disconnected");
        });
        socket.on("connect_error", (err) => {
            console.error("⚠️ Connection error:", err.message);
        });


        // ✅ cleanup: ngắt kết nối khi component unmount
        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, []);
    console.log("socke2",socketRef.current!)
    return socketRef.current!;
}
