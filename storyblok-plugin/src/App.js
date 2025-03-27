import React from "react";
import StoryblokPluginUpdate from "./StoryblokPluginUpdate";

const App = () => {
  const spaceId = "1021485"; // Your actual space ID

  return (
    <div className="App">
      <StoryblokPluginUpdate spaceId={spaceId} />
    </div>
  );
};

export default App;
