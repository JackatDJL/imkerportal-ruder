// boden.tsx
import { themeColors } from "../hive-stack";

const BodenSVG = ({
  height = 30, // Main visual height, actual might be slightly more with landing board
  fill = themeColors.Boden,
  isHovered = false,
}) => {
  const mainBoxHeight = height - 8; // Adjusted for a distinct landing board
  const landingBoardHeight = 6;
  const landingBoardY = mainBoxHeight - 2; // Slightly overlapping for a connected look
  const feetHeight = 5;

  return (
    <g>
      {/* Main Body */}
      <rect
        x="10"
        y="0"
        width="130"
        height={mainBoxHeight}
        fill={fill}
        rx="3" // Rounded corners
      />
      {/* Landing Board */}
      <rect
        x="5"
        y={landingBoardY}
        width="140"
        height={landingBoardHeight + 2} // Making it a bit thicker
        fill={themeColors.DetailDark} // Darker accent for landing board
        rx="2"
      />
      {/* Simplified Entrance */}
      <rect
        x="55"
        y={mainBoxHeight - 10} // Positioned on the main body, above landing board
        width="40"
        height="6"
        fill={themeColors.DetailDark} // Darker slot
        rx="1"
      />
      {/* Simplified Feet */}
      <rect
        x="15"
        y={mainBoxHeight}
        width="10"
        height={feetHeight}
        fill={fill}
        rx="1"
      />
      <rect
        x="125"
        y={mainBoxHeight}
        width="10"
        height={feetHeight}
        fill={fill}
        rx="1"
      />

      {isHovered && (
        <rect
          x="3" // Adjusted to encompass the entire new design
          y="-2"
          width="144"
          height={height + 7} // Adjusted for new proportions
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

export default BodenSVG;
