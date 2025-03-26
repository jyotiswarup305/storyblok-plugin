import React from 'react';
import StoryblokPlugin from './StoryblokPlugin';
 
const App = () => {
  const storyId = '22795071'; // Replace with your actual story ID
  const spaceId = '1021485'; // Replace with your actual space ID
 
  return (
    <div className="App">
      <StoryblokPlugin storyId={storyId} spaceId={spaceId} />
      
    </div>
  );
};
 
export default App;