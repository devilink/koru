import React from 'react';
import leftEyeSrc from '../../assets/eyes/left.svg';
import rightEyeSrc from '../../assets/eyes/right.svg';
import { FaceState } from '../state/FaceState';

interface EyeRendererProps {
  eyeState: FaceState['leftEye'];
  side: 'left' | 'right';
}

export const EyeRenderer: React.FC<EyeRendererProps> = ({ eyeState, side }) => {
  const src = side === 'left' ? leftEyeSrc : rightEyeSrc;

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: `translate(calc(-50% + ${eyeState.x}px), calc(-50% + ${eyeState.y}px)) 
                    scale(${eyeState.width}, ${eyeState.height}) 
                    rotate(${eyeState.rotation}deg)`,
        transformOrigin: 'center center',
      }}
    >
      <img src={src} alt={`${side} eye`} style={{ display: 'block' }} />
    </div>
  );
};
