import type { Doc } from "#convex/dataModel";
import { themeColors } from "../hive-stack";

const ZargeSVG = ({
  height = 60,
  fill = themeColors.Zarge,
  type,
  isHovered = false,
}: {
  height?: number;
  fill?: string;
  type?: Doc<"hiveComponents">["type"];
  isHovered?: boolean;
}) => (
  <g>
    <rect
      x="15"
      y="0"
      width="120"
      height={height}
      fill={fill}
      stroke="#B8860B"
      strokeWidth="1"
      rx="2"
    />
    <rect x="12" y="-2" width="6" height={height + 4} fill="#B8860B" rx="1" />
    <rect x="132" y="-2" width="6" height={height + 4} fill="#B8860B" rx="1" />
    {Array.from({ length: type === "Futterraum" ? 11 : 9 }).map((_, i) => (
      <line
        key={i}
        x1={20 + (i * 110) / (type === "Futterraum" ? 10 : 8)}
        y1="5"
        x2={20 + (i * 110) / (type === "Futterraum" ? 10 : 8)}
        y2={height - 5}
        stroke="#B8860B"
        strokeWidth="0.5"
        opacity="0.6"
      />
    ))}
    <rect
      x="5"
      y={height / 2 - 8}
      width="8"
      height="16"
      fill="#8B4513"
      rx="2"
    />
    <rect
      x="137"
      y={height / 2 - 8}
      width="8"
      height="16"
      fill="#8B4513"
      rx="2"
    />
    {/* {type === "honigraum" && <circle cx="75" cy={height / 2} r="3" fill={themeColors.Honigraum} stroke="#FF8C00" strokeWidth="1" />} */}
    {type === "Futterraum" && (
      <rect
        x="72"
        y={height / 2 - 2}
        width="6"
        height="4"
        fill={themeColors.Futterraum}
        stroke="#A04030"
        strokeWidth="1"
      />
    )}
    {isHovered && (
      <rect
        x="13"
        y="-2"
        width="124"
        height={height + 4}
        fill="none"
        stroke="#3B82F6"
        strokeWidth="2"
        rx="4"
        className="animate-pulse"
      />
    )}
  </g>
);

export default ZargeSVG;
