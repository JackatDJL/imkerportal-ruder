/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { motion } from "motion/react"
import { useState } from "react"
import Link from "next/link"
import { cn } from "~/lib/utils"

interface HiveStackComponent {
  id: string
  type: "deckel" | "zarge" | "boden"
  subtype?: "brutraum" | "honigraum" | "futterzarge"
  label: string
  colour?: string // Changed from color, made optional
}

export interface VisualHiveStackProps {
  colonyId: string
  components: HiveStackComponent[]
  highlightedComponentId?: string
  onComponentClick?: (componentId: string) => void
  className?: string
  interactive?: boolean
}

// Define theme colours (you can customize these or use CSS variables from your theme)
const themeColors = {
  deckel: "#8B4513",     // Example: Dark Brown
  boden: "#654321",      // Example: Darker Brown
  brutraum: "#FFD700",   // Example: Yellow Gold
  honigraum: "#FFA500",   // Example: Orange
  futterzarge: "#FF6347", // Example: Tomato Red
  defaultZarge: "#D2B48C", // Example: Tan for generic zarge
};

// Vector graphics components for each hive part (DeckelSVG, ZargeSVG, BodenSVG)
// These components (DeckelSVG, ZargeSVG, BodenSVG) remain unchanged from your provided code.
// ... DeckelSVG code ...
// ... ZargeSVG code ...
// ... BodenSVG code ...
const DeckelSVG = ({ width = 150, height = 25, fill = "#8B4513", isHovered = false }) => (
  <g>
    {/* Roof slope */}
    <path
      d={`M 10 ${height} L 75 5 L 140 ${height} L 130 ${height + 5} L 75 10 L 20 ${height + 5} Z`}
      fill={fill}
      stroke="#654321"
      strokeWidth="1"
    />
    {/* Roof ridge */}
    <rect x="70" y="3" width="10" height="3" fill="#654321" rx="1" />
    {/* Ventilation holes */}
    <circle cx="50" cy={height - 8} r="2" fill="#654321" />
    <circle cx="100" cy={height - 8} r="2" fill="#654321" />
    {isHovered && (
      <path
        d={`M 8 ${height + 2} L 75 3 L 142 ${height + 2} L 132 ${height + 7} L 75 8 L 18 ${height + 7} Z`}
        fill="none"
        stroke="#3B82F6" // Highlight color
        strokeWidth="2"
        className="animate-pulse"
      />
    )}
  </g>
)

const ZargeSVG = ({ width = 150, height = 60, fill = "#FFD700", subtype = "brutraum", isHovered = false }) => (
  <g>
    {/* Main box */}
    <rect x="15" y="0" width="120" height={height} fill={fill} stroke="#B8860B" strokeWidth="1" rx="2" />

    {/* Corner reinforcements */}
    <rect x="12" y="-2" width="6" height={height + 4} fill="#B8860B" rx="1" />
    <rect x="132" y="-2" width="6" height={height + 4} fill="#B8860B" rx="1" />

    {/* Frame guides (vertical lines) */}
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

    {/* Handles */}
    <rect x="5" y={height / 2 - 8} width="8" height="16" fill="#8B4513" rx="2" />
    <rect x="137" y={height / 2 - 8} width="8" height="16" fill="#8B4513" rx="2" />

    {/* Type indicator */}
    {subtype === "honigraum" && (
      <circle cx="75" cy={height / 2} r="3" fill="#FFA500" stroke="#FF8C00" strokeWidth="1" />
    )}
    {subtype === "brutraum" && (
      <rect x="72" y={height / 2 - 2} width="6" height="4" fill="#DAA520" stroke="#B8860B" strokeWidth="1" />
    )}
     {subtype === "futterzarge" && ( // Simple indicator for Futterzarge
      <rect x="72" y={height / 2 - 2} width="6" height="4" fill={themeColors.futterzarge} stroke="#A04030" strokeWidth="1" />
    )}

    {isHovered && (
      <rect
        x="13"
        y="-2"
        width="124"
        height={height + 4}
        fill="none"
        stroke="#3B82F6" // Highlight color
        strokeWidth="2"
        rx="4"
        className="animate-pulse"
      />
    )}
  </g>
)

const BodenSVG = ({ width = 150, height = 30, fill = "#654321", isHovered = false }) => (
  <g>
    {/* Main bottom board */}
    <rect x="10" y="0" width="130" height={height - 5} fill={fill} stroke="#4A4A4A" strokeWidth="1" rx="2" />

    {/* Landing board */}
    <rect x="5" y={height - 8} width="140" height="6" fill="#8B4513" stroke="#654321" strokeWidth="1" rx="1" />

    {/* Entrance */}
    <rect x="60" y={height - 8} width="30" height="4" fill="#2C1810" rx="1" />

    {/* Ventilation mesh area */}
    <rect x="15" y="5" width="120" height="10" fill="#4A4A4A" stroke="#2C1810" strokeWidth="1" rx="1" />

    {/* Mesh pattern */}
    {Array.from({ length: 12 }).map((_, i) => (
      <line key={`v${i}`} x1={20 + i * 10} y1="6" x2={20 + i * 10} y2="14" stroke="#2C1810" strokeWidth="0.5" />
    ))}
    {Array.from({ length: 4 }).map((_, i) => (
      <line key={`h${i}`} x1="20" y1={7 + i * 2} x2="130" y2={7 + i * 2} stroke="#2C1810" strokeWidth="0.5" />
    ))}

    {/* Support legs */}
    <rect x="20" y={height - 3} width="4" height="8" fill="#4A4A4A" />
    <rect x="126" y={height - 3} width="4" height="8" fill="#4A4A4A" />

    {isHovered && (
      <rect
        x="8"
        y="-2"
        width="134"
        height={height + 7}
        fill="none"
        stroke="#3B82F6" // Highlight color
        strokeWidth="2"
        rx="4"
        className="animate-pulse"
      />
    )}
  </g>
)


export function VisualHiveStack({
  colonyId,
  components,
  highlightedComponentId,
  onComponentClick,
  className,
  interactive = true,
}: VisualHiveStackProps) {
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null)

  // Layout Constants
  const SVG_WIDTH = 200;
  // Visual center of components (drawn from x=10/15 with width 120/130, so center is ~75)
  const COMPONENT_VISUAL_X_CENTER_IN_GROUP = 75;
  // Offset to center the component group (centered at 75) within the SVG (center at 100)
  const COMPONENT_GROUP_X_OFFSET = (SVG_WIDTH / 2) - COMPONENT_VISUAL_X_CENTER_IN_GROUP; // 100 - 75 = 25

  // Approximate visual width of the drawn part of components
  const EFFECTIVE_COMPONENT_DRAW_WIDTH = 140;
  const HIGHLIGHT_PADDING = 5; // Padding for the highlight box

  const getComponentStackingHeight = (type: HiveStackComponent["type"]) => {
    switch (type) {
      case "deckel": return 35;
      case "zarge": return 70;
      case "boden": return 40;
      default: return 70;
    }
  }

  const getComponentVisualRenderHeight = (type: HiveStackComponent["type"]) => {
    switch (type) {
      case "deckel": return 25 + 5; // DeckelSVG height + extra visual parts
      case "zarge": return 60 + 4;  // ZargeSVG height + extra visual parts
      case "boden": return 30 + 8;  // BodenSVG height + extra visual parts
      default: return 60;
    }
  };

  const getComponentColour = (component: HiveStackComponent) => {
    if (component.colour) return component.colour;
    if (component.type === "deckel") return themeColors.deckel;
    if (component.type === "boden") return themeColors.boden;
    if (component.type === "zarge") {
      if (component.subtype === "brutraum") return themeColors.brutraum;
      if (component.subtype === "honigraum") return themeColors.honigraum;
      if (component.subtype === "futterzarge") return themeColors.futterzarge;
      return themeColors.defaultZarge;
    }
    return "hsl(var(--muted))"; // Fallback using a CSS variable
  }

  const renderInnerComponent = (component: HiveStackComponent) => {
    const isHovered = hoveredComponent === component.id;
    const fillColour = getComponentColour(component);
    switch (component.type) {
      case "deckel": return <DeckelSVG height={25} fill={fillColour} isHovered={isHovered} />;
      case "zarge": return <ZargeSVG height={60} fill={fillColour} subtype={component.subtype} isHovered={isHovered} />;
      case "boden": return <BodenSVG height={30} fill={fillColour} isHovered={isHovered} />;
      default: return <ZargeSVG height={60} fill={fillColour} subtype={component.subtype} isHovered={isHovered} />;
    }
  }

  let currentTotalStackHeight = 20; // Initial Y offset for the first component
  components.forEach(c => {
    currentTotalStackHeight += getComponentStackingHeight(c.type) + 5; // Add component height and spacing
  });
  const svgHeight = currentTotalStackHeight + 20; // Add some bottom padding within SVG

  const legendItems = [
    { label: "Deckel", color: themeColors.deckel },
    { label: "Brutraum", color: themeColors.brutraum },
    { label: "Honigraum", color: themeColors.honigraum },
    { label: "Futterzarge", color: themeColors.futterzarge },
    { label: "Boden", color: themeColors.boden },
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
            let yPosAccumulator = 20; // Initial Y offset
            return components.map((component) => {
              const componentBaseStackHeight = getComponentStackingHeight(component.type);
              const visualRenderHeight = getComponentVisualRenderHeight(component.type);
              
              const currentYPos = yPosAccumulator;
              yPosAccumulator += componentBaseStackHeight + 5; // Increment for next component

              const isHovered = hoveredComponent === component.id;
              const isHighlighted = highlightedComponentId === component.id;

              // Calculate highlight box position and size relative to the motion.g group
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

                  {/* Component ID - Always centered on component */}
                  <text
                    x={COMPONENT_VISUAL_X_CENTER_IN_GROUP}
                    y={visualRenderHeight / 2} // Vertically centered
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-muted-foreground text-xs select-none"
                    style={{ pointerEvents: "none" }}
                  >
                    {component.id}
                  </text>

                  {/* Component Label - Desktop: to the right. Mobile: hidden. */}
                  <text
                    x={COMPONENT_VISUAL_X_CENTER_IN_GROUP + (EFFECTIVE_COMPONENT_DRAW_WIDTH / 2) + 10} // Position to the right
                    y={visualRenderHeight / 2} // Vertically aligned with ID
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
                      y={-HIGHLIGHT_PADDING} // Relative to component's visual top
                      width={highlightWidth}
                      height={visualRenderHeight + (2 * HIGHLIGHT_PADDING)}
                      fill="none"
                      // Assuming 'ring' is a color defined in your tailwind.config.js
                      // If stroke-ring doesn't work directly, you might need to ensure 'ring' is a simple color
                      // or revert to hsl(var(--ring)) if it's a complex variable.
                      // For SVG attributes, Tailwind classes like stroke-blue-500 work.
                      // If 'ring' is setup like 'colors.ring' in tailwind config, 'stroke-ring' should work.
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

      {/* Component Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs mt-4">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-1">
            <div style={{ backgroundColor: item.color }} className="w-3 h-3 rounded-sm border border-black/20"></div>
            <span className="text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
