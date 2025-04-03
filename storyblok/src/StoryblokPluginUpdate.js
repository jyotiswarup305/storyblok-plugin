import React, { useEffect, useState } from "react";
import "./StoryblokPluginUpdate.css";

const findOutOfSchemaAttributes = (content, components) => {
  let outOfSchema = [];

  const checkAttributes = (content, componentName, currentPath) => {
    const component = components.find((c) => c.name === componentName);
    if (!component) return;

    const schemaAttributes = Object.keys(component.schema || {});
    const contentAttributes = Object.keys(content);

    contentAttributes.forEach((attr) => {
      if (attr !== "_uid" && attr !== "component" && !schemaAttributes.includes(attr)) {
        outOfSchema.push({
          component: componentName,
          attribute: attr,
          path: `${currentPath}.${attr}`,
        });
      }
    });

    Object.keys(content).forEach((key) => {
      if (Array.isArray(content[key])) {
        content[key].forEach((block, index) => {
          if (block.component) {
            checkAttributes(block, block.component, `${currentPath}.${key}[${index}]`);
          }
        });
      } else if (typeof content[key] === "object" && content[key] !== null && content[key].component) {
        checkAttributes(content[key], content[key].component, `${currentPath}.${key}`);
      }
    });
  };

  checkAttributes(content, content.component, "root");
  return outOfSchema;
};

const StoryblokPluginUpdate = ({ story, onUpdate }) => {
  useEffect(() => {
    if (story && story.content) {
      const components = story.content.components || [];
      const violations = findOutOfSchemaAttributes(story.content, components);
      onUpdate(violations);
    }
  }, [story, onUpdate]);

  return null;
};

export default StoryblokPluginUpdate;
