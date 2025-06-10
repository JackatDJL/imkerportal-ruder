import { themeColors } from "../hive-stack";

const BodenSVG = ({
  height = 30,
  fill = themeColors.Boden,
  isHovered = false,
}) => (
  <g>
    <rect
      x="10"
      y="0"
      width="130"
      height={height - 5}
      fill={fill}
      stroke="#4A4A4A"
      strokeWidth="1"
      rx="2"
    />
    <rect
      x="5"
      y={height - 8}
      width="140"
      height="6"
      fill="#8B4513"
      stroke="#654321"
      strokeWidth="1"
      rx="1"
    />
    <rect x="60" y={height - 8} width="30" height="4" fill="#2C1810" rx="1" />
    <rect
      x="15"
      y="5"
      width="120"
      height="10"
      fill="#4A4A4A"
      stroke="#2C1810"
      strokeWidth="1"
      rx="1"
    />
    {Array.from({ length: 12 }).map((_, i) => (
      <line
        key={`v${i}`}
        x1={20 + i * 10}
        y1="6"
        x2={20 + i * 10}
        y2="14"
        stroke="#2C1810"
        strokeWidth="0.5"
      />
    ))}
    {Array.from({ length: 4 }).map((_, i) => (
      <line
        key={`h${i}`}
        x1="20"
        y1={7 + i * 2}
        x2="130"
        y2={7 + i * 2}
        stroke="#2C1810"
        strokeWidth="0.5"
      />
    ))}
    <rect x="20" y={height - 3} width="4" height="8" fill="#4A4A4A" />
    <rect x="126" y={height - 3} width="4" height="8" fill="#4A4A4A" />
    {isHovered && (
      <rect
        x="8"
        y="-2"
        width="134"
        height={height + 7}
        fill="none"
        stroke="#3B82F6"
        strokeWidth="2"
        rx="4"
        className="animate-pulse"
      />
    )}
  </g>
);

export default BodenSVG;
