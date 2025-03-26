import React, { useState, useEffect } from 'react';
import axios from 'axios';
 
const PUBLIC_TOKEN = 'Rczqct1Nf3RlljXADZu85Qtt';
const MANAGEMENT_API_TOKEN = 'gk09GGED7Vzy4r7I8rTqVQtt-256793-WWo1zBy7CnUDDqxFEBmQ';
 
const fetchStoryContent = async (storyId) => {
  const url = `https://api-us.storyblok.com/v2/cdn/stories/${storyId}?token=${PUBLIC_TOKEN}`;
  const response = await axios.get(url);
  return response.data.story.content;
};
 
const fetchComponentSchema = async (spaceId) => {
  const url = `https://api-us.storyblok.com/v1/spaces/${spaceId}/components`;
  const response = await axios.get(url, {
    headers: {
      Authorization: `${MANAGEMENT_API_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data.components;
};
 
const findOutOfSchemaAttributes = (content, components) => {
  const outOfSchema = [];
 
  const checkAttributes = (content, componentName) => {
    const component = components.find(c => c.name === componentName);
    if (!component) return;
 
    const schemaAttributes = Object.keys(component.schema);
    const contentAttributes = Object.keys(content);
 
    contentAttributes.forEach(attr => {
      if (attr !== '_uid' && attr !== 'component' && !schemaAttributes.includes(attr)) {
        outOfSchema.push({
          component: componentName,
          attribute: attr,
          type: typeof content[attr]
        });
      }
    });
 
    if (content.body && Array.isArray(content.body)) {
      content.body.forEach(block => {
        if (block.component) {
          checkAttributes(block, block.component);
        }
      });
    }
  };
 
  checkAttributes(content, content.component);
  return outOfSchema;
};
 
const StoryblokPlugin = ({ storyId, spaceId }) => {
  const [outOfSchemaAttributes, setOutOfSchemaAttributes] = useState([]);
 
  useEffect(() => {
    const fetchData = async () => {
      const content = await fetchStoryContent(storyId);
      console.log(content);
      const components = await fetchComponentSchema(spaceId);
 
      const outOfSchema = findOutOfSchemaAttributes(content, components);
      setOutOfSchemaAttributes(outOfSchema);
    };
 
    fetchData().catch(console.error);
  }, [storyId, spaceId]);
 
  return (
    <div>
      <h1>Out-of-Schema Attributes</h1>
      <pre>{JSON.stringify(outOfSchemaAttributes, null, 2)}</pre>
    </div>
  );
};
 
export default StoryblokPlugin;