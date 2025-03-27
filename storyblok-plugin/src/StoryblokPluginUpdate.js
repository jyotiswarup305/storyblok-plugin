import React, { useState, useEffect } from "react";
import axios from "axios";
import "./StoryblokPluginUpdate.css"; // Importing the CSS file

const PUBLIC_TOKEN = "Rczqct1Nf3RlljXADZu85Qtt";
const MANAGEMENT_API_TOKEN = "gk09GGED7Vzy4r7I8rTqVQtt-256793-WWo1zBy7CnUDDqxFEBmQ";

const fetchAllStories = async () => {
  const url = `https://api-us.storyblok.com/v2/cdn/stories?token=${PUBLIC_TOKEN}`;
  const response = await axios.get(url);
  return response.data.stories;
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

const StoryblokPluginUpdate = ({ spaceId }) => {
  const [stories, setStories] = useState([]);
  const [outOfSchemaData, setOutOfSchemaData] = useState({});
  const [selectedStory, setSelectedStory] = useState(null);
  const [selectedAttribute, setSelectedAttribute] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stories = await fetchAllStories();
        const components = await fetchComponentSchema(spaceId);

        let schemaViolations = {};
        for (const story of stories) {
          const violations = findOutOfSchemaAttributes(story.content, components, "root");
          if (violations.length > 0) {
            schemaViolations[story.name] = violations;
          }
        }

        setStories(stories);
        setOutOfSchemaData(schemaViolations);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [spaceId]);

  return (
    <div className="container">
      <h1 className="header">Storyblok Schema Checker</h1>
      {loading ? (
        <p className="loading">Loading stories...</p>
      ) : selectedStory === null ? (
        <div className="story-list">
          {Object.keys(outOfSchemaData).map((storyName, index) => (
            <button key={index} className="story-button" onClick={() => setSelectedStory(storyName)}>
              {storyName}
            </button>
          ))}
        </div>
      ) : selectedAttribute === null ? (
        <div className="violation-list">
          <h2>{selectedStory}</h2>
          {outOfSchemaData[selectedStory].map((violation, index) => (
            <button key={index} className="violation-button" onClick={() => setSelectedAttribute(violation)}>
              {violation.component} / {violation.attribute}
            </button>
          ))}
          <button className="back-button" onClick={() => setSelectedStory(null)}>Back</button>
        </div>
      ) : (
        <div className="attribute-detail">
          <h3>Attribute Details</h3>
          <p><strong>Component:</strong> {selectedAttribute.component}</p>
          <p><strong>Attribute:</strong> {selectedAttribute.attribute}</p>
          <p><strong>Type:</strong> {selectedAttribute.type}</p>
          <p><strong>Path:</strong> {selectedAttribute.path}</p>
          <p><strong>Value:</strong> {JSON.stringify(selectedAttribute.value)}</p>

          <button className="back-button" onClick={() => setSelectedAttribute(null)}>Back</button>
        </div>
      )}
    </div>
  );
};

export default StoryblokPluginUpdate;
