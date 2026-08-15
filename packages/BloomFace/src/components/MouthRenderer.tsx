import { forwardRef } from "react";

interface MouthRendererProps {
  id: string;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

export const MouthRenderer = forwardRef<SVGEllipseElement, MouthRendererProps>(({ id, cx, cy, rx, ry }, ref) => {
  return (
    <ellipse 
      ref={ref}
      id={id}
      cx={cx} 
      cy={cy} 
      rx={rx} 
      ry={ry} 
      fill="white" 
    />
  );
});

MouthRenderer.displayName = "MouthRenderer";
