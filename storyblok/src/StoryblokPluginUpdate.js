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
          type: typeof content[attr],
          path: `${currentPath}.${attr}`,
          value: content[attr],
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

const StoryblokPluginUpdate = ({ story }) => {
  const [outOfSchemaData, setOutOfSchemaData] = useState([]);

  useEffect(() => {
    if (story && story.content) {
      const components = story.content.components || [];
      const violations = findOutOfSchemaAttributes(story.content, components);
      setOutOfSchemaData(violations);
    }
  }, [story]);

  return (
    <div className="container">
      <h1 className="header">Storyblok Schema Checker</h1>
      {outOfSchemaData.length > 0 ? (
        <ul>
          {outOfSchemaData.map((violation, index) => (
            <li key={index}>
              <strong>{violation.component}</strong> has an out-of-schema attribute: <strong>{violation.attribute}</strong> at <em>{violation.path}</em>
            </li>
          ))}
        </ul>
      ) : (
        <p>No schema violations detected.</p>
      )}
    </div>
  );
};

export default StoryblokPluginUpdate;
