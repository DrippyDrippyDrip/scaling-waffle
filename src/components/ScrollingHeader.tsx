import React from 'react';

export default function ScrollingHeader() {
  const text = "BLUE SCREEN OF $DEATH · ";
  const repeatedText = text.repeat(30);
  
  return (
    <div className="scrolling-text-container">
      <div className="scrolling-text">
        {repeatedText}
      </div>
    </div>
  );
}