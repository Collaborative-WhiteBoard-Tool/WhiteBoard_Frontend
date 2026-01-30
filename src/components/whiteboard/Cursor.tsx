import { useCanvasStore } from "@/store/CanvasStore";
import React from "react";
import { Circle, Text } from "react-konva";




const CursorLayer = () => {
    // const cursors = useCanvasStore(state => state.cursors);
    const cursors = useCanvasStore(state => state.cursors);

    return (
        <>
            {Array.from(cursors.values()).map(cursor => (
                <React.Fragment key={cursor.userId}>
                    {/* <Circle x={cursor.x} y={cursor.y} radius={5} fill={cursor.color} /> */}
                    <Circle x={cursor.x} y={cursor.y} radius={6} fill={cursor.color} opacity={0.8} listening={false}
                    />
                    <Text x={cursor.x + 10} y={cursor.y - 10} text={cursor.username} fill={cursor.color} />
                </React.Fragment>
            ))}

        </>
    );
}
export default CursorLayer

// CursorLayer.tsx - CHỈ subscribe cursors
// const CursorLayer = () => {
//     // ✅ Chỉ re-render khi cursors thay đổi
//     const cursors = useCanvasStore(state => state.cursors);

//     return (
//         <>
//             {Array.from(cursors.values()).map(cursor => (
//                 <CursorComponent key={cursor.userId} cursor={cursor} />
//             ))}
//         </>
//     );
// }

// // Memoize từng cursor để tránh re-render không cần thiết
// const CursorComponent = memo<{ cursor: Cursor }>(({ cursor }) => {
//     return (
//         <>
//             <Circle
//                 x={cursor.x}
//                 y={cursor.y}
//                 radius={6}
//                 fill={cursor.color}
//                 opacity={0.8}
//                 listening={false}
//             />
//             <Text
//                 x={cursor.x + 10}
//                 y={cursor.y - 10}
//                 text={cursor.username}
//                 fill={cursor.color}
//             />
//         </>
//     );
// }, (prev, next) => {
//     // ✅ Chỉ re-render nếu position hoặc color thay đổi
//     return (
//         prev.cursor.x === next.cursor.x &&
//         prev.cursor.y === next.cursor.y &&
//         prev.cursor.color === next.cursor.color
//     );
// });
// export default CursorLayer