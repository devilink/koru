import React, { useState, useEffect } from 'react';
import { FaceState, initialFaceState } from '../state/FaceState';
import { EyeRenderer } from './EyeRenderer';
import { MouthRenderer } from './MouthRenderer';
import { AnimationController } from '../animation/AnimationController';

interface FaceRendererProps {
  controllerRef: React.MutableRefObject<AnimationController | null>;
}

export const FaceRenderer: React.FC<FaceRendererProps> = ({ controllerRef }) => {
  const [state, setState] = useState<FaceState>(initialFaceState);

  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.getMixer().setOnStateUpdate((newState) => {
        setState(newState);
      });
      setState(controllerRef.current.getMixer().getBaseState());
    }
  }, [controllerRef]);

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
