import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "../components/ui/button";
import { Undo2, Redo2, Trash2 } from "lucide-react";
import ColorPicker from "./ColorPicker";
const Toolbar = ({ onUndo, onRedo, onClear, onColorChange }) => {
    return (_jsxs("div", { className: "flex items-center gap-3 p-3 bg-gray-100 shadow-md rounded-2xl", children: [_jsx(ColorPicker, { onChange: onColorChange }), _jsx(Button, { variant: "outline", size: "icon", onClick: onUndo, children: _jsx(Undo2, { className: "w-5 h-5" }) }), _jsx(Button, { variant: "outline", size: "icon", onClick: onRedo, children: _jsx(Redo2, { className: "w-5 h-5" }) }), _jsx(Button, { variant: "destructive", size: "icon", onClick: onClear, children: _jsx(Trash2, { className: "w-5 h-5" }) })] }));
};
export default Toolbar;
