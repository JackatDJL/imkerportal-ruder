// src/components/hive-stack/zarge.tsx

import type { Doc } from "#convex/dataModel";
import { themeColors } from "../hive-stack";
import { useMemo } from "react";

// Simple pseudo-random number generator for stable "randomness" per component instance
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ZargeSVG = ({
  height = 60,
  fill = themeColors.Zarge,
  type,
  isHovered = false,
  uniqueKey, // Expect a unique key for stable spot generation
}: {
  height?: number;
  fill?: string;
  type?: Doc<"hiveComponents">["type"];
  isHovered?: boolean;
  uniqueKey?: string | number;
}) => {
  const isFutterraum = type === "Futterraum";

  const seed = useMemo(() => {
    const keyStr = String(uniqueKey ?? type ?? "defaultZargeKeyStatic");
    let hash = 0;
    for (let i = 0; i < keyStr.length; i++) {
      const char = keyStr.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash); // Ensure positive seed
  }, [uniqueKey, type]);

  const random = useMemo(() => mulberry32(seed), [seed]);

  const spots = useMemo(() => {
    if (isFutterraum) return [];
    const numSpots = Math.floor(random() * 3) + 2; // 2 to 4 spots
    const generatedSpots = [];
    for (let i = 0; i < numSpots; i++) {
      const spotType = random() > 0.4 ? "circle" : "path";
      const spotColor = themeColors.ZargeCamouflageSpot;

      if (spotType === "circle") {
        generatedSpots.push({
          type: "circle",
          cx: 20 + random() * 100, // x within 15-115
          cy: 5 + random() * (height - 10), // y within box
          r: 3 + random() * 6, // radius 3-9
          fill: spotColor,
          opacity: 0.5 + random() * 0.2,
        });
      } else {
        const x1 = 20 + random() * 90;
        const y1 = 5 + random() * (height - 15);
        const qx = x1 + (random() - 0.5) * 25;
        const qy = y1 + (random() - 0.5) * 25;
        const x2 = x1 + 5 + random() * 15;
        const y2 = y1 + (random() - 0.5) * 15;
        generatedSpots.push({
          type: "path",
          d: `M ${x1} ${y1} Q ${qx} ${qy} ${x2} ${y2} T ${x1 + random() * 8} ${y1 + random() * 8}`,
          fill: spotColor,
          opacity: 0.4 + random() * 0.2,
        });
      }
    }
    return generatedSpots;
  }, [random, height, isFutterraum]);

  return (
    <g>
      <rect x="15" y="0" width="120" height={height} fill={fill} rx="3" />

      {!isFutterraum &&
        spots.map((spot, index) =>
          spot.type === "circle" ? (
            <circle
              key={`spot-c-${index}-${seed}`}
              cx={spot.cx}
              cy={spot.cy}
              r={spot.r}
              fill={spot.fill}
              opacity={spot.opacity}
            />
          ) : (
            <path
              key={`spot-p-${index}-${seed}`}
              d={spot.d}
              fill={spot.fill}
              opacity={spot.opacity}
            />
          ),
        )}

      {Array.from({ length: type === "Futterraum" ? 6 : 7 }).map((_, i) => (
        <line
          key={i}
          x1={20 + (i * 110) / (type === "Futterraum" ? 5 : 6)}
          y1="5"
          x2={20 + (i * 110) / (type === "Futterraum" ? 5 : 6)}
          y2={height - 5}
          stroke={themeColors.DetailDark}
          strokeWidth="0.5"
          opacity="0.3"
        />
      ))}

      {isFutterraum && (
        <rect
          x="70"
          y={height / 2 - 5}
          width="10"
          height="10"
          fill={themeColors.DetailLight}
          stroke={themeColors.DetailDark}
          strokeWidth="1"
          rx="2"
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
};

export default ZargeSVG;
