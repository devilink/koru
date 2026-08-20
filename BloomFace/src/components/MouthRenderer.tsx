import React from 'react';
import { FaceState } from '../state/FaceState';
import neutralMouth from '../../assets/mouth/neutral.svg';
import tinySmileMouth from '../../assets/mouth/smile.svg'; // Fallback since tiny-smile.svg is missing
import smileMouth from '../../assets/mouth/smile.svg';
import sadMouth from '../../assets/mouth/sad.svg';
import openMouth from '../../assets/mouth/o.svg';

interface MouthRendererProps {
  mouthState: FaceState['mouth'];
}

const mouthMap = {
  'neutral': neutralMouth,
  'tiny-smile': tinySmileMouth,
  'smile': smileMouth,
  'sad': sadMouth,
  'open': openMouth,
};

export const MouthRenderer: React.FC<MouthRendererProps> = ({ mouthState }) => {
  const src = mouthMap[mouthState.selection];

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: `translate(calc(-50% + ${mouthState.x}px), calc(-50% + ${mouthState.y}px)) 
                    scale(${mouthState.scale})`,
        transformOrigin: 'center center',
      }}
    >
      <img src={src} alt={`mouth ${mouthState.selection}`} style={{ display: 'block' }} />
    </div>
  );
};
