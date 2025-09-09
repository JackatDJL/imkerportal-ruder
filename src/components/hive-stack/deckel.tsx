// deckel.tsx
import { themeColors } from "../hive-stack";

const DeckelSVG = ({
  height = 25, // This will be the main visible height of the lid top
  fill = themeColors.Deckel,
  isHovered = false,
}) => {
  const lidThickness = 8; // How much the "sides" of the lid show
  return (
    <g>
      {/* Lid Top */}
      <rect
        x="10"
        y="0"
        width="130"
        height={height}
        fill={fill}
        rx="3" // Rounded corners for the top
      />
      {/* Lid Edge/Side - gives a slight 3D feel */}
      <rect
        x="12"
        y={height - lidThickness + 2} // Positioned towards the bottom of the main height
        width="126"
        height={lidThickness}
        fill={fill} // Same color, or could be slightly darker
        // stroke={themeColors.DetailDark}
        // strokeWidth="0.5"
        rx="2"
      />
      {/* Optional: A subtle metallic handle or detail */}
      <rect
        x="65"
        y="2"
        width="20"
        height="4"
        fill={themeColors.DetailLight}
        rx="1"
        opacity="0.7"
      />

      {isHovered && (
        <path // Using a path to closely follow the new simpler shape
          d={`M 8 ${height + 2} L 8 -2 L 142 -2 L 142 ${height + 2} L 132 ${height + 7} L 18 ${height + 7} Z`}
          fill="none"
          stroke="#3B82F6"
          strokeWidth="2"
          className="animate-pulse"
          // rx on path is not standard, so a rect for hover is simpler if complex path not needed
          // For simplicity, using a rect for hover bound if path is complex to trace
        />
      )}
      {/* Fallback simple hover rect if path is an issue */}
      {isHovered && (
        <rect
          x="8"
          y="-2"
          width="134"
          height={height + 9} // Adjusted height
          fill="none"
          stroke="#3B82F6"
          strokeWidth="2"
          rx="4"
          className="animate-pulse"
        />
      )}
    </g>
  );
};

export default DeckelSVG;
