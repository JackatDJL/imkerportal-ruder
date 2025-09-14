// one-way-gate.tsx
import { themeColors } from "../hive-stack";

const OneWayGateSVG = ({
  height = 15,
  fill = themeColors.OneWayGate,
  isHovered = false,
}) => (
  <g>
    {/* Main Panel */}
    <rect
      x="10"
      y="0"
      width="130"
      height={height}
      fill={fill}
      rx="2" // Rounded corners
    />
    {/* Simplified Gates/Arrows - made them lighter for contrast */}
    <path d="M 30 4 L 40 7.5 L 30 11 Z" fill={themeColors.DetailLight} />
    <path d="M 70 4 L 80 7.5 L 70 11 Z" fill={themeColors.DetailLight} />
    <path d="M 110 4 L 120 7.5 L 110 11 Z" fill={themeColors.DetailLight} />

    {isHovered && (
      <rect
        x="8"
        y="-2"
        width="134"
        height={height + 4}
        fill="none"
        stroke="#3B82F6"
        strokeWidth="2"
        rx="3"
        className="animate-pulse"
      />
    )}
  </g>
);

export default OneWayGateSVG;
