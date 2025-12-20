import { Socket } from "socket.io-client";

export const joinBoard = (socket : Socket, boardId : string, userId : string) => {
    if(!socket || !boardId) return;
    socket.emit("joinBoard", { boardId: { boardId }, userId });
    console.log(`📡 Emit joinBoard: boardId=${boardId}, userId=${userId}`);
}