import React, { useEffect, useState } from 'react';
import type { CompanionState } from '../types';
import './CompanionFace.css';

interface CompanionFaceProps {
  state: CompanionState;
}

const getGifForState = (state: CompanionState): string => {
  switch (state) {
    case 'idle': return '/emotions/blank.gif'; // or smile.gif
    case 'curious': return '/emotions/distracted.gif';
    case 'happy': return '/emotions/happy.gif';
    case 'gentle-concern': return '/emotions/shy.gif';
    case 'sleepy': return '/emotions/sleepy.gif';
    case 'plant-thirsty': return '/emotions/rain.gif';
    default: return '/emotions/blank.gif';
  }
};

const CompanionFace: React.FC<CompanionFaceProps> = ({ state }) => {
  const [currentGif, setCurrentGif] = useState(getGifForState(state));
  const [key, setKey] = useState(0); // Force re-render of GIF on state change if needed

  useEffect(() => {
    setCurrentGif(getGifForState(state));
    setKey(prev => prev + 1); // Force image tag to reload the GIF from start
  }, [state]);

  return (
    <div className={`companion-face-container state-${state}`}>
      <img 
        key={key} 
        src={currentGif} 
        alt={`Companion state: ${state}`}
        className="companion-face-gif" 
      />
    </div>
  );
};

export default CompanionFace;
