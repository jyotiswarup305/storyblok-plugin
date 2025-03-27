import React, { useEffect, useState } from "react";
import StoryblokPluginUpdate from "./StoryblokPluginUpdate";

const App = () => {
  const [story, setStory] = useState(null);

  useEffect(() => {
    // Listen for Storyblok's live preview updates
    if (window.storyblok) {
      window.storyblok.init();
      window.storyblok.on("change", (storyData) => {
        setStory(storyData);
      });
      window.storyblok.on("input", (storyData) => {
        setStory(storyData);
      });
    }
  }, []);

  return (
    <div className="App">
      {story ? <StoryblokPluginUpdate story={story} /> : <p>Loading Story...</p>}
    </div>
  );
};

export default App;
