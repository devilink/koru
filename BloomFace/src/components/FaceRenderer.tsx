import React from 'react';
import { FaceState } from '../state/FaceState';
import { EyeRenderer } from './EyeRenderer';
import { MouthRenderer } from './MouthRenderer';

interface FaceRendererProps {
  state: FaceState;
}

export const FaceRenderer: React.FC<FaceRendererProps> = ({ state }) => {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      backgroundColor: '#000',
      overflow: 'hidden'
    }}>
      <EyeRenderer eyeState={state.leftEye} side="left" />
      <EyeRenderer eyeState={state.rightEye} side="right" />
      <MouthRenderer mouthState={state.mouth} />
    </div>
  );
};
