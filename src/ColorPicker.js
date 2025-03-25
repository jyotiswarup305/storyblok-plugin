import React, { useState, useEffect } from "react";
import { SketchPicker } from "react-color";

const ColorPicker = ({ model, onChange }) => {
  const [color, setColor] = useState(model.value || "#ff0000");

  useEffect(() => {
    setColor(model.value || "#ff0000");
  }, [model.value]);

  const handleChange = (newColor) => {
    setColor(newColor.hex);
    onChange({ target: { value: newColor.hex } }); // Updates Storyblok field
  };

  return (
    <div style={{ textAlign: "center", padding: "10px" }}>
      <SketchPicker color={color} onChange={handleChange} />
      <p style={{ marginTop: "10px", fontWeight: "bold" }}>Selected Color: {color}</p>
    </div>
  );
};

export default ColorPicker;
