import React, { useEffect, useState } from "react";
import StoryblokPluginUpdate from "./StoryblokPluginUpdate";

const App = () => {
  const [story, setStory] = useState(null);
  const [outOfSchema, setOutOfSchema] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    if (window.storyblok) {
      window.storyblok.init();
      window.storyblok.pingEditor(() => {
        window.storyblok.getStory((data) => {
          setStory(data.story);
        });
      });
    }
  }, []);

  // Callback function to update schema violations
  const handleOutOfSchemaUpdate = (violations) => {
    setOutOfSchema(violations);
  };

  return (
    <div className="App">
      <h1>Storyblok Schema Checker Tool</h1>
      {story ? (
        <>
          <StoryblokPluginUpdate story={story} onUpdate={handleOutOfSchemaUpdate} />
          {/* Show (i) button only if there are schema violations */}
          {outOfSchema.length > 0 && (
            <button className="info-button" onClick={() => setShowSidebar(!showSidebar)}>ℹ️</button>
          )}
          {/* Sidebar Panel */}
          {showSidebar && (
            <div className="sidebar">
              <h2>Schema Violations</h2>
              <ul>
                {outOfSchema.map((violation, index) => (
                  <li key={index}>
                    <strong>{violation.component}</strong> - {violation.attribute} at <em>{violation.path}</em>
                  </li>
                ))}
              </ul>
              <button onClick={() => setShowSidebar(false)}>Close</button>
            </div>
          )}
        </>
      ) : (
        <p>Loading story...</p>
      )}
    </div>
  );
};

export default App;
