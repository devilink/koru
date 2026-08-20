import gsap from 'gsap';
import { FaceState } from '../state/FaceState';

export const playBlink = (state: FaceState, baseState: FaceState, onUpdate: () => void, onComplete?: () => void) => {
  const tl = gsap.timeline({
    onUpdate,
    onComplete,
    defaults: { ease: 'power2.inOut' }
  });

  const duration = 0.05; // Fast blink progression

  // 1. Partially closed
  tl.to([state.leftEye, state.rightEye], {
    height: 0.6,
    duration: duration
  })
  // 2. Almost closed
  .to([state.leftEye, state.rightEye], {
    height: 0.2,
    duration: duration * 0.8
  })
  // 3. Closed
  .to([state.leftEye, state.rightEye], {
    height: 0.05, // Use 0.05 instead of 0 to avoid SVG scaling artifacts
    duration: duration * 0.5
  })
  // 4. Open back up to base state
  .to(state.leftEye, {
    height: baseState.leftEye.height,
    duration: duration * 2,
    ease: 'power1.out'
  }, 'open')
  .to(state.rightEye, {
    height: baseState.rightEye.height,
    duration: duration * 2,
    ease: 'power1.out'
  }, 'open');
};
