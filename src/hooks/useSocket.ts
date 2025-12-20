import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
export function useSocket(boardId : string | null) {
    const [socket, setSocket] = useState<Socket | null> (null);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if(!boardId) return;
        
        const url = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const newSocket = io(url, {
            transports: ["websocket"],
            query: {boardId}
        })
        // ✅ chỉ tạo 1 socket sau khi mount

        socketRef.current = newSocket;
        setSocket(newSocket);

        console.log("socke1",socketRef.current!)
        newSocket.on("connect", () => {
            console.log("✅ Connected:", newSocket.id);
        })
        newSocket.on("disconnect", () => {
            console.log("❌ Disconnected");
        });
        newSocket.on("connect_error", (err) => {
            console.error("⚠️ Connection error:", err.message);
        });


        // ✅ cleanup: ngắt kết nối khi component unmount
        return () => {
            newSocket.disconnect();
            socketRef.current = null;
            setSocket(null);
        };
    }, [boardId]);

    return socket;
}
