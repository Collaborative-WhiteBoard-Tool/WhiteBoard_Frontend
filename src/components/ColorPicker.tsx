import React from "react";

interface ColorPickerProps {
  onChange: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ onChange }) => {
  return (
    <input
    title="pl"
      type="color"
      className="w-10 h-10 rounded-full border-none cursor-pointer"
      onChange={(e) => onChange(e.target.value)}
      defaultValue="#000000"
    />
  );
};

export default ColorPicker;
