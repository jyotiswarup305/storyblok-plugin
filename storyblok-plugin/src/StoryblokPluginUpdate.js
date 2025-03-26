import React, { useState, useEffect } from "react";
import axios from "axios";

const PUBLIC_TOKEN = "Rczqct1Nf3RlljXADZu85Qtt";
const MANAGEMENT_API_TOKEN = "gk09GGED7Vzy4r7I8rTqVQtt-256793-WWo1zBy7CnUDDqxFEBmQ";

const fetchStoryContent = async (storyId) => {
  const url = `https://api-us.storyblok.com/v2/cdn/stories/${storyId}?token=${PUBLIC_TOKEN}`;
  const response = await axios.get(url);
  return response.data.story;
};

const fetchComponentSchema = async (spaceId) => {
  const url = `https://api-us.storyblok.com/v1/spaces/${spaceId}/components`;
  const response = await axios.get(url, {
    headers: {
      Authorization: `${MANAGEMENT_API_TOKEN}`,
      "Content-Type": "application/json",
    },
  });
  return response.data.components;
};

const findOutOfSchemaAttributes = (content, components, path = "") => {
  let outOfSchema = [];

  const checkAttributes = (content, componentName, currentPath) => {
    const component = components.find((c) => c.name === componentName);
    if (!component) return;

    const schemaAttributes = Object.keys(component.schema);
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

  checkAttributes(content, content.component, path);
  return outOfSchema;
};

const StoryblokPluginUpdate = ({ storyId, spaceId }) => {
  const [storyName, setStoryName] = useState("");
  const [outOfSchemaAttributes, setOutOfSchemaAttributes] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [selectedAttribute, setSelectedAttribute] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const story = await fetchStoryContent(storyId);
      const components = await fetchComponentSchema(spaceId);

      const outOfSchema = findOutOfSchemaAttributes(story.content, components, "root");
      setOutOfSchemaAttributes(outOfSchema);
      setStoryName(story.name);
    };

    fetchData().catch(console.error);
  }, [storyId, spaceId]);

  return (
    <div>
      <h1>Storyblok Schema Checker</h1>

      {!selectedComponent && !selectedAttribute && (
        <button
          onClick={() => setSelectedComponent("open")}
          style={{
            padding: "10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {storyName || "Loading Story..."}
        </button>
      )}

      {selectedComponent === "open" && !selectedAttribute && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "20px" }}>
          {outOfSchemaAttributes.map((attr, index) => (
            <button
              key={index}
              onClick={() => setSelectedAttribute(attr)}
              style={{
                padding: "10px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              {attr.component} / {attr.attribute}
            </button>
          ))}
          <button
            onClick={() => setSelectedComponent(null)}
            style={{
              padding: "10px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Back
          </button>
        </div>
      )}

      {selectedAttribute && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            padding: "20px",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            borderRadius: "10px",
            zIndex: 1000,
          }}
        >
          <h3>Attribute Details</h3>
          <p><strong>Component:</strong> {selectedAttribute.component}</p>
          <p><strong>Attribute:</strong> {selectedAttribute.attribute}</p>
          <p><strong>Type:</strong> {selectedAttribute.type}</p>
          <p><strong>Path:</strong> {selectedAttribute.path}</p>
          <p><strong>Value:</strong> {JSON.stringify(selectedAttribute.value)}</p>

          <button
            onClick={() => setSelectedAttribute(null)}
            style={{
              marginTop: "10px",
              padding: "10px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
};

export default StoryblokPluginUpdate;
