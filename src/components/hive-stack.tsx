"use client";

import { motion } from "motion/react";
import { useState } from "react";
import Link from "next/link";
import { cn } from "~/lib/utils";
import { type Doc } from "#convex/dataModel";

// --- Types ---

export type StackableDBComponent = Doc<"hiveComponents"> & {
  displayLabel: string;
  colour?: string;
};

export interface VisualHiveStackProps {
  colonyId: string;
  components: StackableDBComponent[];
  highlightedComponentId?: string;
  onComponentClick?: (componentId: string) => void;
  className?: string;
  interactive?: boolean;
}

type VisualType =
  | "deckel"
  | "zarge"
  | "boden"
  | "queen_excluder"
  | "one_way_gate"
  | "futterzarge";

interface InternalHiveStackComponent {
  id: string;
  type: VisualType;
  subtype?: "brutraum" | "honigraum" | "futterzarge";
  label: string;
  colour?: string;
}

// --- Theme Colors ---

const themeColors = {
  deckel: "#8B4513",
  boden: "#654321",
  brutraum: "#FFD700",
  honigraum: "#FFA500",
  futterzarge: "#FF6347",
  queen_excluder: "#A9A9A9",
  one_way_gate: "#778899",
  defaultZarge: "#D2B48C",
};

// --- SVGs ---

const DeckelSVG = ({ height = 25, fill = themeColors.deckel, isHovered = false }) => (
  <g>
    <path d={`M 10 ${height} L 75 5 L 140 ${height} L 130 ${height + 5} L 75 10 L 20 ${height + 5} Z`} fill={fill} stroke="#654321" strokeWidth="1" />
    <rect x="70" y="3" width="10" height="3" fill="#654321" rx="1" />
    <circle cx="50" cy={height - 8} r="2" fill="#654321" />
    <circle cx="100" cy={height - 8} r="2" fill="#654321" />
    {isHovered && (
      <path d={`M 8 ${height + 2} L 75 3 L 142 ${height + 2} L 132 ${height + 7} L 75 8 L 18 ${height + 7} Z`} fill="none" stroke="#3B82F6" strokeWidth="2" className="animate-pulse" />
    )}
  </g>
);

const ZargeSVG = ({ height = 60, fill = themeColors.defaultZarge, subtype, isHovered = false }: {
    height?: number;
    fill?: string;
    subtype?: "brutraum" | "honigraum" | "futterzarge";
    isHovered?: boolean;
}) => (
  <g>
    <rect x="15" y="0" width="120" height={height} fill={fill} stroke="#B8860B" strokeWidth="1" rx="2" />
    <rect x="12" y="-2" width="6" height={height + 4} fill="#B8860B" rx="1" />
    <rect x="132" y="-2" width="6" height={height + 4} fill="#B8860B" rx="1" />
    {Array.from({ length: subtype === "brutraum" || subtype === "futterzarge" ? 11 : 9 }).map((_, i) => (
      <line
        key={i}
        x1={20 + (i * 110) / (subtype === "brutraum" || subtype === "futterzarge" ? 10 : 8)}
        y1="5"
        x2={20 + (i * 110) / (subtype === "brutraum" || subtype === "futterzarge" ? 10 : 8)}
        y2={height - 5}
        stroke="#B8860B"
        strokeWidth="0.5"
        opacity="0.6"
      />
    ))}
    <rect x="5" y={height / 2 - 8} width="8" height="16" fill="#8B4513" rx="2" />
    <rect x="137" y={height / 2 - 8} width="8" height="16" fill="#8B4513" rx="2" />
    {subtype === "honigraum" && <circle cx="75" cy={height / 2} r="3" fill={themeColors.honigraum} stroke="#FF8C00" strokeWidth="1" />}
    {subtype === "brutraum" && <rect x="72" y={height / 2 - 2} width="6" height="4" fill="#DAA520" stroke="#B8860B" strokeWidth="1" />}
    {subtype === "futterzarge" && <rect x="72" y={height / 2 - 2} width="6" height="4" fill={themeColors.futterzarge} stroke="#A04030" strokeWidth="1" />}
    {isHovered && <rect x="13" y="-2" width="124" height={height + 4} fill="none" stroke="#3B82F6" strokeWidth="2" rx="4" className="animate-pulse" />}
  </g>
);

const BodenSVG = ({ height = 30, fill = themeColors.boden, isHovered = false }) => (
  <g>
    <rect x="10" y="0" width="130" height={height - 5} fill={fill} stroke="#4A4A4A" strokeWidth="1" rx="2" />
    <rect x="5" y={height - 8} width="140" height="6" fill="#8B4513" stroke="#654321" strokeWidth="1" rx="1" />
    <rect x="60" y={height - 8} width="30" height="4" fill="#2C1810" rx="1" />
    <rect x="15" y="5" width="120" height="10" fill="#4A4A4A" stroke="#2C1810" strokeWidth="1" rx="1" />
    {Array.from({ length: 12 }).map((_, i) => <line key={`v${i}`} x1={20 + i * 10} y1="6" x2={20 + i * 10} y2="14" stroke="#2C1810" strokeWidth="0.5" />)}
    {Array.from({ length: 4 }).map((_, i) => <line key={`h${i}`} x1="20" y1={7 + i * 2} x2="130" y2={7 + i * 2} stroke="#2C1810" strokeWidth="0.5" />)}
    <rect x="20" y={height - 3} width="4" height="8" fill="#4A4A4A" />
    <rect x="126" y={height - 3} width="4" height="8" fill="#4A4A4A" />
    {isHovered && <rect x="8" y="-2" width="134" height={height + 7} fill="none" stroke="#3B82F6" strokeWidth="2" rx="4" className="animate-pulse" />}
  </g>
);

const QueenExcluderSVG = ({ height = 10, fill = themeColors.queen_excluder, isHovered = false }) => (
  <g>
    <rect x="10" y="0" width="130" height={height} fill={fill} stroke="#696969" strokeWidth="1" rx="1" />
    {Array.from({ length: 25 }).map((_, i) => (
      <line key={`v${i}`} x1={12 + i * 5} y1="1" x2={12 + i * 5} y2={height - 1} stroke="#D3D3D3" strokeWidth="0.5" />
    ))}
    <line x1="11" y1={height / 2} x2="139" y2={height / 2} stroke="#D3D3D3" strokeWidth="0.5" />
    {isHovered && <rect x="8" y="-2" width="134" height={height + 4} fill="none" stroke="#3B82F6" strokeWidth="2" rx="3" className="animate-pulse" />}
  </g>
);

const OneWayGateSVG = ({ height = 15, fill = themeColors.one_way_gate, isHovered = false }) => (
  <g>
    <rect x="10" y="0" width="130" height={height} fill={fill} stroke="#576879" strokeWidth="1" rx="1" />
    <path d="M 30 4 L 40 7.5 L 30 11 Z" fill="#D3D3D3" />
    <path d="M 70 4 L 80 7.5 L 70 11 Z" fill="#D3D3D3" />
    <path d="M 110 4 L 120 7.5 L 110 11 Z" fill="#D3D3D3" />
    <rect x="45" y="5" width="20" height="5" fill="#405060" rx="1" />
    <rect x="85" y="5" width="20" height="5" fill="#405060" rx="1" />
    {isHovered && <rect x="8" y="-2" width="134" height={height + 4} fill="none" stroke="#3B82F6" strokeWidth="2" rx="3" className="animate-pulse" />}
  </g>
);

// --- Main Component ---

export function VisualHiveStack({
  colonyId,
  components: dbComponents,
  highlightedComponentId,
  onComponentClick,
  className,
  interactive = true,
}: VisualHiveStackProps) {
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);

  // Layout
  const SVG_WIDTH = 200;
  const COMPONENT_VISUAL_X_CENTER_IN_GROUP = 75;
  const COMPONENT_GROUP_X_OFFSET = (SVG_WIDTH / 2) - COMPONENT_VISUAL_X_CENTER_IN_GROUP;
  const EFFECTIVE_COMPONENT_DRAW_WIDTH = 140;
  const HIGHLIGHT_PADDING = 5;

  // Height helpers
  const getComponentStackingHeight = (type: VisualType) => {
    switch (type) {
      case "deckel": return 35;
      case "zarge": return 70;
      case "boden": return 40;
      case "queen_excluder": return 15;
      case "one_way_gate": return 20;
      case "futterzarge": return 70;
      default: return 70;
    }
  };
  const getComponentVisualRenderHeight = (type: VisualType) => {
    switch (type) {
      case "deckel": return 30;
      case "zarge": return 64;
      case "boden": return 38;
      case "queen_excluder": return 14;
      case "one_way_gate": return 19;
      case "futterzarge": return 64;
      default: return 64;
    }
  };

  // Color helper
  const getComponentColour = (component: InternalHiveStackComponent) => {
    if (component.colour) return component.colour;
    switch (component.type) {
      case "deckel": return themeColors.deckel;
      case "boden": return themeColors.boden;
      case "queen_excluder": return themeColors.queen_excluder;
      case "one_way_gate": return themeColors.one_way_gate;
      case "zarge":
        if (component.subtype === "brutraum") return themeColors.brutraum;
        if (component.subtype === "honigraum") return themeColors.honigraum;
        if (component.subtype === "futterzarge") return themeColors.futterzarge;
        return themeColors.defaultZarge;
      case "futterzarge": return themeColors.futterzarge;
      default: return "hsl(var(--muted))";
    }
  };

  // SVG renderer
  const renderInnerComponent = (component: InternalHiveStackComponent) => {
    const isHovered = hoveredComponent === component.id;
    const fillColour = getComponentColour(component);
    switch (component.type) {
      case "deckel": return <DeckelSVG height={25} fill={fillColour} isHovered={isHovered} />;
      case "zarge": return <ZargeSVG height={60} fill={fillColour} subtype={component.subtype} isHovered={isHovered} />;
      case "boden": return <BodenSVG height={30} fill={fillColour} isHovered={isHovered} />;
      case "queen_excluder": return <QueenExcluderSVG height={10} fill={fillColour} isHovered={isHovered} />;
      case "one_way_gate": return <OneWayGateSVG height={15} fill={fillColour} isHovered={isHovered} />;
      case "futterzarge": return <ZargeSVG height={60} fill={fillColour} subtype="futterzarge" isHovered={isHovered} />;
      default: return null;
    }
  };

  // Sorting by _internal.virtualPosition (forceTop, forceBottom)
  const sortedDbComponents = [...dbComponents].sort((a, b) => {
    const posA = a._internal?.virtualPosition;
    const posB = b._internal?.virtualPosition;
    if (posA?.type === "forceTop" && posB?.type !== "forceTop") return -1;
    if (posA?.type !== "forceTop" && posB?.type === "forceTop") return 1;
    if (posA?.type === "forceTop" && posB?.type === "forceTop") {
      return (posA.forceFromTop ?? Infinity) - (posB.forceFromTop ?? Infinity);
    }
    if (posA?.type === "forceBottom" && posB?.type !== "forceBottom") return 1;
    if (posA?.type !== "forceBottom" && posB?.type === "forceBottom") return -1;
    if (posA?.type === "forceBottom" && posB?.type === "forceBottom") {
      return (posB.forceFromBottom ?? Infinity) - (posA.forceFromBottom ?? Infinity);
    }
    return 0;
  });

  // Map DB to internal visual types
  const processedComponents = sortedDbComponents
    .map((dbComp): InternalHiveStackComponent | null => {
      let visualType: VisualType;
      let visualSubtype: InternalHiveStackComponent["subtype"] | undefined = undefined;
      const id = dbComp.identifier;
      const label = dbComp.displayLabel;
      const colour = dbComp.colour;

      switch (dbComp.type) {
        case "Deckel":
          visualType = "deckel";
          break;
        case "Boden":
          visualType = "boden";
          break;
        case "Futterraum":
          visualType = "futterzarge";
          break;
        case "Zarge":
          visualType = "zarge";
          if (dbComp.frameSize) {
            const frameSizeLower = typeof dbComp.frameSize === "string"
              ? dbComp.frameSize.toLowerCase()
              : dbComp.frameSize.type.toLowerCase();
            if (frameSizeLower.includes("brut")) visualSubtype = "brutraum";
            else if (frameSizeLower.includes("honig")) visualSubtype = "honigraum";
            else if (frameSizeLower.includes("zander") && label.toLowerCase().includes("brut")) visualSubtype = "brutraum";
            else if (frameSizeLower.includes("zander") && label.toLowerCase().includes("honig")) visualSubtype = "honigraum";
          }
          if (!visualSubtype) {
            if (label.toLowerCase().includes("brut")) visualSubtype = "brutraum";
            else if (label.toLowerCase().includes("honig")) visualSubtype = "honigraum";
          }
          break;
        case "Königinnenabsperrgitter":
          visualType = "queen_excluder";
          break;
        case "One Way Gate":
          visualType = "one_way_gate";
          break;
        default:
          return null;
      }
      return { id, type: visualType, subtype: visualSubtype, label, colour };
    })
    .filter((c): c is InternalHiveStackComponent => c !== null);

  // SVG height calculation
  let currentTotalStackHeight = 20;
  processedComponents.forEach(c => {
    currentTotalStackHeight += getComponentStackingHeight(c.type) + 5;
  });
  const svgHeight = currentTotalStackHeight + 20;

  // Legend
  const legendItems = [
    { label: "Deckel", color: themeColors.deckel },
    { label: "Brutraum", color: themeColors.brutraum },
    { label: "Honigraum", color: themeColors.honigraum },
    { label: "Futterzarge", color: themeColors.futterzarge },
    { label: "Boden", color: themeColors.boden },
    { label: "Absperrgitter", color: themeColors.queen_excluder },
    { label: "Bienenflucht", color: themeColors.one_way_gate },
  ];

  return (
    <div className={cn("flex flex-col items-center space-y-2", className)}>
      <Link
        href={`/view/${colonyId}`}
        className="text-lg font-semibold text-primary hover:text-primary/80 transition-colors"
      >
        #{colonyId}
      </Link>
      <div className="relative">
        <svg width={SVG_WIDTH} height={svgHeight} className="overflow-visible">
          {(() => {
            let yPosAccumulator = 20;
            return processedComponents.map((component) => {
              const componentBaseStackHeight = getComponentStackingHeight(component.type);
              const visualRenderHeight = getComponentVisualRenderHeight(component.type);
              const currentYPos = yPosAccumulator;
              yPosAccumulator += componentBaseStackHeight + 5;
              const isHovered = hoveredComponent === component.id;
              const isHighlighted = highlightedComponentId === component.id;
              const highlightX = COMPONENT_VISUAL_X_CENTER_IN_GROUP - (EFFECTIVE_COMPONENT_DRAW_WIDTH / 2) - HIGHLIGHT_PADDING;
              const highlightWidth = EFFECTIVE_COMPONENT_DRAW_WIDTH + (2 * HIGHLIGHT_PADDING);
              return (
                <motion.g
                  key={component.id}
                  initial={{ x: COMPONENT_GROUP_X_OFFSET, scale: 1, y: currentYPos }}
                  animate={{
                    scale: isHovered ? 1.05 : 1,
                    y: isHovered ? currentYPos - 3 : currentYPos,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, duration: 0.2 }}
                  style={{ cursor: interactive ? "pointer" : "default" }}
                  onMouseEnter={() => interactive && setHoveredComponent(component.id)}
                  onMouseLeave={() => interactive && setHoveredComponent(null)}
                  onClick={() => interactive && onComponentClick?.(component.id)}
                >
                  {renderInnerComponent(component)}
                  <text
                    x={COMPONENT_VISUAL_X_CENTER_IN_GROUP}
                    y={visualRenderHeight / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-muted-foreground text-xs select-none"
                    style={{ pointerEvents: "none" }}
                  >
                    {component.id}
                  </text>
                  <text
                    x={COMPONENT_VISUAL_X_CENTER_IN_GROUP + (EFFECTIVE_COMPONENT_DRAW_WIDTH / 2) + 10}
                    y={visualRenderHeight / 2}
                    textAnchor="start"
                    dominantBaseline="middle"
                    className="fill-foreground text-sm font-medium hidden md:inline select-none"
                    style={{ pointerEvents: "none" }}
                  >
                    {component.label}
                  </text>
                  {isHighlighted && (
                    <rect
                      x={highlightX}
                      y={-HIGHLIGHT_PADDING}
                      width={highlightWidth}
                      height={visualRenderHeight + (2 * HIGHLIGHT_PADDING)}
                      fill="none"
                      className="stroke-ring animate-pulse"
                      strokeWidth="2.5"
                      rx="8"
                    />
                  )}
                </motion.g>
              );
            });
          })()}
        </svg>
      </div>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs mt-4">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-1">
            <div style={{ backgroundColor: item.color }} className="w-3 h-3 rounded-sm border border-black/20"></div>
            <span className="text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}