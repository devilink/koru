import { forwardRef } from "react";

interface EyeRendererProps {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const EyeRenderer = forwardRef<SVGRectElement, EyeRendererProps>(({ id, x, y, width, height }, ref) => {
  return (
    <rect 
      ref={ref}
      id={id}
      x={x} 
      y={y} 
      width={width} 
      height={height} 
      rx={width / 2} // Pill shape
      fill="white" 
    />
  );
});

EyeRenderer.displayName = "EyeRenderer";
