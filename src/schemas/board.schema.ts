import { BoardTypeEnum } from "@/shared/contants/boardType";
import z from "zod";

export const createNewBoardSchema = z.object({
    title: z
        .string()
        .optional()
        .default("Untitled WhiteBoard"),

    type: BoardTypeEnum
        .optional()
        .default("whiteboard")
}).strict()

