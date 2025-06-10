"use client";

import { motion } from "motion/react";
import { useState } from "react";
import Link from "next/link";
import { cn } from "~/lib/utils";
import { type Doc } from "#convex/dataModel";
import DeckelSVG from "./hive-stack/deckel";
import BodenSVG from "./hive-stack/boden";
import QueenExcluderSVG from "./hive-stack/queen-excluder";
import OneWayGateSVG from "./hive-stack/one-way-gate";
import ZargeSVG from "./hive-stack/zarge";

// --- Types ---

export interface VisualHiveStackProps {
  colony: Doc<"colonies">;
  components: Doc<"hiveComponents">[];
  highlight?: string;
  links?: boolean;
  showIdsInComponents?: boolean;
  showComponentLabels?: boolean;
  interactive?: boolean;
  className?: string;
}

// --- Theme Colors ---

export const themeColors = {
  Deckel: "#8B4513",
  Boden: "#654321",
  Brutraum: "#FFD700",
  Honigraum: "#FFA500",
  Futterraum: "#FF6347",
  Koeniginnenabspehrgitter: "#A9A9A9",
  OneWayGate: "#778899",
  Zarge: "#D2B48C",
};

// --- Main Component ---

export default function VisualHiveStack({
  colony,
  components,
  highlight,
  links = true,
  showIdsInComponents = false,
  showComponentLabels = true,
  interactive = true,
  className,
}: VisualHiveStackProps) {
  const [hoveredComponent, setHoveredComponent] = useState<
    Doc<"hiveComponents">["identifier"] | null
  >(null);

  // Layout
  const SVG_WIDTH = 200;
  const COMPONENT_VISUAL_X_CENTER_IN_GROUP = 75;
  const COMPONENT_GROUP_X_OFFSET =
    SVG_WIDTH / 2 - COMPONENT_VISUAL_X_CENTER_IN_GROUP;
  const EFFECTIVE_COMPONENT_DRAW_WIDTH = 140;
  const HIGHLIGHT_PADDING = 5;

  // Height helpers
  const getComponentStackingHeight = (type: Doc<"hiveComponents">["type"]) => {
    switch (type) {
      case "Deckel":
        return 35;
      case "Zarge":
        return 70;
      case "Boden":
        return 40;
      case "Königinnenabsperrgitter":
        return 15;
      case "One Way Gate":
        return 20;
      case "Futterraum":
        return 70;
      default:
        return 70;
    }
  };

  const getComponentVisualRenderHeight = (
    type: Doc<"hiveComponents">["type"],
  ) => {
    switch (type) {
      case "Deckel":
        return 30;
      case "Zarge":
        return 64;
      case "Boden":
        return 38;
      case "Königinnenabsperrgitter":
        return 14;
      case "One Way Gate":
        return 19;
      case "Futterraum":
        return 64;
      default:
        return 64;
    }
  };

  // Color helper
  const getComponentColour = (component: Doc<"hiveComponents">) => {
    switch (component.type) {
      case "Deckel":
        return themeColors.Deckel;
      case "Boden":
        return themeColors.Boden;
      case "Königinnenabsperrgitter":
        return themeColors.Koeniginnenabspehrgitter;
      case "One Way Gate":
        return themeColors.OneWayGate;
      case "Zarge":
        return themeColors.Zarge;
      case "Futterraum":
        return themeColors.Futterraum;

      default:
        return "hsl(var(--muted))";
    }
  };

  // SVG renderer
  const renderInnerComponent = (component: Doc<"hiveComponents">) => {
    switch (component.type) {
      case "Deckel":
        return (
          <DeckelSVG
            height={25}
            fill={getComponentColour(component)}
            isHovered={hoveredComponent === component.identifier}
          />
        );
      case "Boden":
        return (
          <BodenSVG
            height={30}
            fill={getComponentColour(component)}
            isHovered={hoveredComponent === component.identifier}
          />
        );
      case "Königinnenabsperrgitter":
        return (
          <QueenExcluderSVG
            height={14}
            fill={getComponentColour(component)}
            isHovered={hoveredComponent === component.identifier}
          />
        );
      case "One Way Gate":
        return (
          <OneWayGateSVG
            height={19}
            fill={getComponentColour(component)}
            isHovered={hoveredComponent === component.identifier}
          />
        );
      case "Zarge":
      case "Futterraum":
        return (
          <ZargeSVG
            height={getComponentVisualRenderHeight(component.type)}
            fill={getComponentColour(component)}
            type={component.type}
          />
        );
    }
  };

  // Sorter Function
  function sortComponentStack(components: Doc<"hiveComponents">[]) {
    return [...components].sort((a, b) => {
      const posA = a._internal?.virtualPosition;
      const posB = b._internal?.virtualPosition;

      if (!posA && !posB) return 0;

      if (posA?.type === posB?.type) {
        if (posA?.type === "forceTop" && posB?.type === "forceTop") {
          return (
            ((posA as { type: "forceTop"; forceFromTop: number })
              .forceFromTop ?? Infinity) -
            ((posB as { type: "forceTop"; forceFromTop: number })
              .forceFromTop ?? Infinity)
          );
        }
        if (posA?.type === "forceBottom" && posB?.type === "forceBottom") {
          return (
            ((posB as { type: "forceBottom"; forceFromBottom: number })
              .forceFromBottom ?? Infinity) -
            ((posA as { type: "forceBottom"; forceFromBottom: number })
              .forceFromBottom ?? Infinity)
          );
        }
        return 0;
      }

      if (posA?.type === "forceTop") return -1;
      if (posB?.type === "forceTop") return 1;
      if (posA?.type === "forceBottom") return 1;
      if (posB?.type === "forceBottom") return -1;

      return 0;
    });
  }

  const sortedComponents = sortComponentStack(components);

  // SVG height calculation
  let currentTotalStackHeight = 20;
  sortedComponents.forEach((c) => {
    currentTotalStackHeight += getComponentStackingHeight(c.type) + 5;
  });
  const svgHeight = currentTotalStackHeight + 20;

  // Legend

  function generateLegend(components: Doc<"hiveComponents">[]) {
    return components.map((component) => ({
      label: component.type.toString(),
      color: getComponentColour(component),
    }));
  }

  const legendItems = generateLegend(sortedComponents);

  return (
    <div className={cn("flex flex-col items-center space-y-2", className)}>
      <Link
        href={`/colonies/${colony.identifier}`}
        prefetch
        className="text-lg font-semibold text-primary transition-colors hover:text-primary/80"
      >
        #{colony.identifier}
      </Link>
      <div className="relative">
        <svg width={SVG_WIDTH} height={svgHeight} className="overflow-visible">
          {(() => {
            let yPosAccumulator = 20;
            return sortedComponents.map((component) => {
              const componentBaseStackHeight = getComponentStackingHeight(
                component.type,
              );
              const visualRenderHeight = getComponentVisualRenderHeight(
                component.type,
              );
              const currentYPos = yPosAccumulator;
              yPosAccumulator += componentBaseStackHeight + 5;
              const isHovered = hoveredComponent === component.identifier;
              const isHighlighted = highlight === component.identifier;
              const highlightX =
                COMPONENT_VISUAL_X_CENTER_IN_GROUP -
                EFFECTIVE_COMPONENT_DRAW_WIDTH / 2 -
                HIGHLIGHT_PADDING;
              const highlightWidth =
                EFFECTIVE_COMPONENT_DRAW_WIDTH + 2 * HIGHLIGHT_PADDING;
              return (
                <Link
                  href={links ? `/components/${component.identifier}` : "#"}
                  key={component.identifier}
                  className={cn("group", {
                    "pointer-events-none": !interactive,
                  })}
                  prefetch={links}
                >
                  <motion.g
                    key={component.identifier}
                    initial={{
                      x: COMPONENT_GROUP_X_OFFSET,
                      scale: 1,
                      y: currentYPos,
                    }}
                    animate={{
                      scale: isHovered ? 1.05 : 1,
                      y: isHovered ? currentYPos - 3 : currentYPos,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                      duration: 0.2,
                    }}
                    style={{ cursor: interactive ? "pointer" : "default" }}
                    onMouseEnter={() =>
                      interactive && setHoveredComponent(component.identifier)
                    }
                    onMouseLeave={() =>
                      interactive && setHoveredComponent(null)
                    }
                  >
                    {renderInnerComponent(component)}
                    {showIdsInComponents && (
                      <text
                        x={COMPONENT_VISUAL_X_CENTER_IN_GROUP}
                        y={visualRenderHeight / 2}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-muted-foreground text-xs select-none"
                        style={{ pointerEvents: "none" }}
                      >
                        {component.identifier}
                      </text>
                    )}
                    {showComponentLabels && (
                      <text
                        x={
                          COMPONENT_VISUAL_X_CENTER_IN_GROUP +
                          EFFECTIVE_COMPONENT_DRAW_WIDTH / 2 +
                          10
                        }
                        y={visualRenderHeight / 2}
                        textAnchor="start"
                        dominantBaseline="middle"
                        className="hidden fill-foreground text-sm font-medium select-none md:inline"
                        style={{ pointerEvents: "none" }}
                      >
                        {component.type.toString()}
                      </text>
                    )}
                    {isHighlighted && (
                      <rect
                        x={highlightX}
                        y={-HIGHLIGHT_PADDING}
                        width={highlightWidth}
                        height={visualRenderHeight + 2 * HIGHLIGHT_PADDING}
                        fill="none"
                        className="animate-pulse stroke-ring"
                        strokeWidth="2.5"
                        rx="8"
                      />
                    )}
                  </motion.g>
                </Link>
              );
            });
          })()}
        </svg>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-1">
            <div
              style={{ backgroundColor: item.color }}
              className="h-3 w-3 rounded-sm border border-black/20"
            ></div>
            <span className="text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
