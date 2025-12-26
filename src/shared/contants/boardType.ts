import z from "zod";

export const BoardTypeEnum = z.enum([
    'whiteboard',
    'diagram',
    'document',
    'table',
])
