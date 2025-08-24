import { jsx as _jsx } from "react/jsx-runtime";
const ColorPicker = ({ onChange }) => {
    return (_jsx("input", { title: "pl", type: "color", className: "w-10 h-10 rounded-full border-none cursor-pointer", onChange: (e) => onChange(e.target.value), defaultValue: "#000000" }));
};
export default ColorPicker;
