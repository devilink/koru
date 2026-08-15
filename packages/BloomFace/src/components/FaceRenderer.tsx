"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { AnimationController } from "../animation/AnimationController";
import { FaceState } from "../state/FaceState";
import { EyeRenderer } from "./EyeRenderer";
import { MouthRenderer } from "./MouthRenderer";

gsap.registerPlugin(useGSAP);

interface FaceRendererProps {
  emotion?: string; // Current string-based emotion from WebSocket for backward compatibility
}

export default function FaceRenderer({ emotion = "Neutral" }: FaceRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftEyeRef = useRef<SVGRectElement>(null);
  const rightEyeRef = useRef<SVGRectElement>(null);
  const mouthRef = useRef<SVGEllipseElement>(null);
  
  const controllerRef = useRef<AnimationController | null>(null);

  // Set up the AnimationController once
  useEffect(() => {
    controllerRef.current = new AnimationController();
    return () => {
      controllerRef.current = null;
    };
  }, []);

  // Sync external emotion prop to preset
  useEffect(() => {
    if (controllerRef.current && emotion) {
      // Map old mp4-style emotion strings to our new Presets
      let presetName = "Neutral";
      const e = emotion.toUpperCase();
      if (e === "BLINK") presetName = "Neutral";
      else if (e === "LOVE") presetName = "Cute";
      else if (e === "CRY") presetName = "Sleepy"; // Map Cry to sleepy for now
      else if (e === "SLEEP") presetName = "Sleepy";
      else if (e === "UNCOMFORTABLE") presetName = "Surprised";
      else if (e === "HAPPY") presetName = "Happy";
      else presetName = "Neutral"; // Fallback

      controllerRef.current.setPreset(presetName);
    }
  }, [emotion]);

  // Use GSAP's ticker to run the animation loop
  useGSAP(() => {
    // Create quickSetters for high performance DOM updates without React renders
    const setLeftEyeY = gsap.quickSetter(leftEyeRef.current, "y", "px");
    const setLeftEyeHeight = gsap.quickSetter(leftEyeRef.current, "height", "px");
    const setLeftEyeScale = gsap.quickSetter(leftEyeRef.current, "scale");
    const setLeftEyeX = gsap.quickSetter(leftEyeRef.current, "x", "px");

    const setRightEyeY = gsap.quickSetter(rightEyeRef.current, "y", "px");
    const setRightEyeHeight = gsap.quickSetter(rightEyeRef.current, "height", "px");
    const setRightEyeScale = gsap.quickSetter(rightEyeRef.current, "scale");
    const setRightEyeX = gsap.quickSetter(rightEyeRef.current, "x", "px");

    const setMouthWidth = gsap.quickSetter(mouthRef.current, "rx", "px");
    const setMouthHeight = gsap.quickSetter(mouthRef.current, "ry", "px");
    
    const setContainerRotate = gsap.quickSetter(containerRef.current, "rotation", "deg");

    // Default eye dimensions
    const BASE_EYE_HEIGHT = 60;
    const BASE_EYE_Y = -30; // Centered on 0

    const tick = (time: number, deltaTime: number, frame: number) => {
      if (!controllerRef.current) return;

      // 1. Update controller
      controllerRef.current.update(time * 1000); // GSAP time is in seconds, our controller uses ms

      // We need a way to get the final state synchronously. 
      // Let's modify Controller to expose it, or pass it via callback.
      // Since we want to pull state inside the ticker, we'll temporarily hack it by relying on the callback.
    };

    // To properly get state, we hook the controller's callback
    if (controllerRef.current) {
      controllerRef.current.setUpdateCallback((state: FaceState) => {
        // Left Eye
        const leftH = BASE_EYE_HEIGHT * state.leftEyeOpen;
        setLeftEyeHeight(leftH);
        setLeftEyeY(BASE_EYE_Y + (BASE_EYE_HEIGHT - leftH) / 2); // Keep centered when blinking
        setLeftEyeScale(state.leftEyeScale);
        setLeftEyeX(-60 + state.leftPupilX); // base X is -60

        // Right Eye
        const rightH = BASE_EYE_HEIGHT * state.rightEyeOpen;
        setRightEyeHeight(rightH);
        setRightEyeY(BASE_EYE_Y + (BASE_EYE_HEIGHT - rightH) / 2);
        setRightEyeScale(state.rightEyeScale);
        setRightEyeX(20 + state.rightPupilX); // base X is 20

        // Mouth
        setMouthWidth(state.mouthWidth);
        setMouthHeight(state.mouthHeight);
        
        // Rotation
        setContainerRotate(state.rotation);
      });
    }

    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
    };
  }, { scope: containerRef });

  return (
    <div className="w-full h-full flex items-center justify-center bg-black overflow-hidden relative">
      <div ref={containerRef} className="w-full h-full flex items-center justify-center">
        <svg 
          viewBox="-100 -100 200 200" 
          className="w-full h-full max-w-full max-h-full"
          preserveAspectRatio="xMidYMid meet"
          style={{ overflow: 'visible' }}
        >
          <g id="face-group">
            <EyeRenderer 
              ref={leftEyeRef} 
              id="left-eye" 
              x={-60} y={-30} 
              width={40} height={60} 
            />
            <EyeRenderer 
              ref={rightEyeRef} 
              id="right-eye" 
              x={20} y={-30} 
              width={40} height={60} 
            />
            <MouthRenderer 
              ref={mouthRef} 
              id="mouth" 
              cx={0} cy={40} 
              rx={20} ry={10} 
            />
          </g>
        </svg>
      </div>
    </div>
  );
}
