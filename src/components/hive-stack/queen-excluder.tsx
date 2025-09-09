// queen-excluder.tsx
import { themeColors } from "../hive-stack";

const QueenExcluderSVG = ({
  height = 10,
  fill = themeColors.Koeniginnenabspehrgitter, // Color for the frame
  isHovered = false,
}) => (
  <g>
    {/* Frame */}
    <rect
      x="10"
      y="0"
      width="130"
      height={height}
      fill={fill}
      rx="2" // Rounded corners
    />
    {/* Simplified Grid - fewer, slightly thicker lines */}
    {Array.from({ length: 10 }).map(
      (
        _,
        i, // Reduced from 25
      ) => (
        <line
          key={`v${i}`}
          x1={15 + i * 12} // Adjusted spacing
          y1="1"
          x2={15 + i * 12}
          y2={height - 1}
          stroke={themeColors.DetailLight} // Lighter color for grid lines
          strokeWidth="1" // Slightly thicker
        />
      ),
    )}
    <line // Optional: one central horizontal line
      x1="11"
      y1={height / 2}
      x2="139"
      y2={height / 2}
      stroke={themeColors.DetailLight}
      strokeWidth="1"
    />
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

export default QueenExcluderSVG;
