import React from "react";
import  {Button} from "../ui/button";
import { Undo2, Redo2, Trash2 } from "lucide-react";
import ColorPicker from "../ColorPicker";

interface ToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onColorChange: (color: string) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onUndo, onRedo, onClear, onColorChange }) => {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-100 shadow-md rounded-2xl">
      {/* Color Picker */}
      <ColorPicker onChange={onColorChange} />
 {/* Undo Button */}
      <Button variant="outline" size="icon" onClick={onUndo}>
        <Undo2 className="w-5 h-5" />
      </Button>

      {/* Redo Button */}
      <Button variant="outline" size="icon" onClick={onRedo}>
        <Redo2 className="w-5 h-5" />
      </Button>

      {/* Clear Board */}
      <Button variant="destructive" size="icon" onClick={onClear}>
        <Trash2 className="w-5 h-5" />
      </Button>
    </div>
  );
};

export default Toolbar;
