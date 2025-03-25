import React from "react";
import ReactDOM from "react-dom";
import ColorPicker from "./ColorPicker";

window.storyblok.fieldtype({
  plugin: "color-picker",
  init: (el, model, onChange) => {
    ReactDOM.render(
      <ColorPicker model={model} onChange={onChange} />,
      el
    );
  },
});
