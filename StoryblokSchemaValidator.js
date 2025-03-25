import { useState, useEffect } from "react";
import { StoryblokBridge } from "@storyblok/js";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function SchemaValidatorPlugin() {
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    const bridge = new StoryblokBridge();
    
    bridge.on(["input", "change"], (event) => {
      if (event.story) {
        validateStory(event.story);
      }
    });
  }, []);

  const fetchComponentSchemas = async () => {
    const response = await fetch(
      `https://api.storyblok.com/v2/cdn/stories?token=Rczqct1Nf3RlljXADZu85Qtt&cv=${Date.now()}`
    );
    const data = await response.json();
    const componentSchemas = {};
    data.stories.forEach((story) => {
      componentSchemas[story.name] = story.content;
    });
    return componentSchemas;
  };

  const validateStory = async (story) => {
    const schemas = await fetchComponentSchemas();
    const storyErrors = [];

    const checkComponent = (component, schema, path) => {
      if (!schema) return;
      
      // Check for missing fields
      Object.keys(schema).forEach((key) => {
        if (!component.hasOwnProperty(key)) {
          storyErrors.push({ path, message: `Missing field: ${key}` });
        }
      });
      
      // Check for extra fields
      Object.keys(component).forEach((key) => {
        if (!schema.hasOwnProperty(key)) {
          storyErrors.push({ path, message: `Unexpected field: ${key}` });
        }
      });
    };

    const traverseBlocks = (blocks, path = "") => {
      blocks.forEach((block, index) => {
        const schema = schemas[block.component];
        checkComponent(block, schema, `${path}[${index}]`);
        if (block.body) {
          traverseBlocks(block.body, `${path}[${index}].body`);
        }
      });
    };

    traverseBlocks(story.content.body);
    setErrors(storyErrors);
  };

  return (
    <div className="p-4">
      {errors.length > 0 && (
        <Card className="bg-red-100 border-red-500">
          <CardContent>
            <h3 className="text-red-600 flex items-center">
              <AlertCircle className="mr-2" /> Schema Validation Errors
            </h3>
            <ul className="mt-2">
              {errors.map((error, idx) => (
                <li key={idx} className="text-red-500 text-sm">
                  {error.path}: {error.message}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
    
    