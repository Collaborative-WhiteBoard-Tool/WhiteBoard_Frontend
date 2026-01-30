import { useCanvasStore } from "@/store/CanvasStore";
import { Layer, Line } from "react-konva";

const ActiveDrawingLayer = () => {
    const currentStroke = useCanvasStore(state => state.currentStroke);
    const localStrokes = useCanvasStore(state => state.localStrokes);

    return (
        <Layer>
            {localStrokes.map(s => <Line key={s.id} {...s} opacity={0.5} />)}
            {currentStroke && <Line {...currentStroke} />}
        </Layer>
    );
};
export default ActiveDrawingLayer