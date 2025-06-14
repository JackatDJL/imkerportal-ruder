"use client";

import React, { type ReactNode } from "react";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "~/lib/utils";
import type { Doc } from "#convex/dataModel";
import DeckelSVG from "./hive-stack/deckel";
import BodenSVG from "./hive-stack/boden";
import QueenExcluderSVG from "./hive-stack/queen-excluder";
import OneWayGateSVG from "./hive-stack/one-way-gate";
import ZargeSVG from "./hive-stack/zarge";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "./ui/button";
import { GripVertical, Plus } from "lucide-react"; // Added Plus icon
import { useMobile } from "~/hooks/use-mobile";

// --- Types ---

export interface VisualHiveStackProps {
  colony: Doc<"colonies">;
  components: Doc<"hiveComponents">[];
  highlight?: string;
  links?: boolean;
  showIdsInComponents?: boolean;
  showComponentLabels?: boolean;
  interactive?: boolean;
  liveEdit?: boolean; // New prop for live editing
  onMove?: (newOrderedIdentifiers: string[]) => void; // New prop for move callback
  placementMode?: boolean; // New prop for placement mode
  onPlacementSelect?: (orderIndex: number) => void; // New prop for placement mode
  selectedPlacementIndex?: number | null; // New prop for highlighting selected placement
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
  liveEdit = false, // Default to false
  onMove, // Destructure new prop
  placementMode = false, // Default to false
  onPlacementSelect, // Destructure new prop
  selectedPlacementIndex = null, // Default to null
  className,
}: VisualHiveStackProps) {
  const isMobile = useMobile();
  const [isMobileEditing, setIsMobileEditing] = useState(false);
  const [orderedComponents, setOrderedComponents] = useState<
    Doc<"hiveComponents">[]
  >([]);

  useEffect(() => {
    // Sort components by orderIndex if available, otherwise by creation time
    const sorted = [...components].sort((a, b) => {
      if (a.orderIndex !== undefined && b.orderIndex !== undefined) {
        return a.orderIndex - b.orderIndex;
      }
      const posA = a.internalData?.virtualPosition;
      const posB = b.internalData?.virtualPosition;

      if (posA && posB) {
        if (posA.type === "forceTop" && posB.type === "forceTop") {
          if (
            posA.type === "forceTop" &&
            "forceFromTop" in posA &&
            posB.type === "forceTop" &&
            "forceFromTop" in posB
          ) {
            return (
              (Number(posA.forceFromTop) ?? 0) -
              (Number(posB.forceFromTop) ?? 0)
            );
          }
          return 0; // Default fallback if properties are not present
        }

        if (posA.type === "forceBottom" && posB.type === "forceBottom") {
          if (
            posA.type === "forceBottom" &&
            "forceFromBottom" in posA &&
            posB.type === "forceBottom" &&
            "forceFromBottom" in posB
          ) {
            return (
              (posB.type === "forceBottom"
                ? (Number(posB.forceFromBottom) ?? 0)
                : 0) -
              (posA.type === "forceBottom"
                ? (Number(posA.forceFromBottom) ?? 0)
                : 0)
            );
          }
          return 0; // Default fallback if properties are not present
        }
        if (posA.type === "forceBottom" && posB.type === "forceBottom") {
          return (
            (posB.type === "forceBottom" && "forceFromBottom" in posB
              ? Number(posB.forceFromBottom)
              : 0) -
            (posA.type === "forceBottom" && "forceFromBottom" in posA
              ? Number(posA.forceFromBottom)
              : 0)
          );
        }
      }
      // Default sort if no specific order or virtual position
      return a._creationTime - b._creationTime;
    });
    setOrderedComponents(sorted);
  }, [components]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setOrderedComponents((items) => {
        const oldIndex = items.findIndex(
          (item) => item.identifier === active.id,
        );
        const newIndex = items.findIndex(
          (item) => item.identifier === over?.id,
        );
        const newOrder = arrayMove(items, oldIndex, newIndex);

        if (onMove) {
          onMove(newOrder.map((c) => c.identifier));
        }
        return newOrder;
      });
    }
  };

  const isDraggableEnabled = liveEdit && (!isMobile || isMobileEditing);

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
            isHovered={false} // Hover state handled by SortableItem
          />
        );
      case "Boden":
        return (
          <BodenSVG
            height={30}
            fill={getComponentColour(component)}
            isHovered={false} // Hover state handled by SortableItem
          />
        );
      case "Königinnenabsperrgitter":
        return (
          <QueenExcluderSVG
            height={14}
            fill={getComponentColour(component)}
            isHovered={false} // Hover state handled by SortableItem
          />
        );
      case "One Way Gate":
        return (
          <OneWayGateSVG
            height={19}
            fill={getComponentColour(component)}
            isHovered={false} // Hover state handled by SortableItem
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

  // SVG height calculation (adjust for placement markers)
  let currentTotalStackHeight = 0;
  const componentSpacing = 5;
  const markerHeight = 30; // Height of the insertion marker visual
  const markerSpacing = 10; // Space between marker and component

  if (placementMode) {
    // Account for the top marker
    currentTotalStackHeight += markerHeight + markerSpacing;
  }

  orderedComponents.forEach((c) => {
    currentTotalStackHeight +=
      getComponentStackingHeight(c.type) + componentSpacing;
    if (placementMode) {
      currentTotalStackHeight += markerHeight + markerSpacing; // Add space for marker after each component
    }
  });

  const svgHeight = currentTotalStackHeight + 20; // Add some padding at the bottom

  // Legend
  function generateLegend(components: Doc<"hiveComponents">[]) {
    return Array.from(
      new Map(
        components
          .map((component) => ({
            label: component.type.toString(),
            color: getComponentColour(component),
          }))
          .map((item) => [item.label, item]), // Use Map to filter duplicates by label
      ).values(),
    ).sort((a, b) => a.label.localeCompare(b.label)); // Sort by label
  }

  const legendItems = generateLegend(orderedComponents);

  return (
    <div className={cn("flex flex-col items-center space-y-2", className)}>
      <Link
        href={`/colonies/${colony.identifier}`}
        prefetch
        className="text-lg font-semibold text-primary transition-colors hover:text-primary/80"
      >
        #{colony.identifier}
      </Link>

      {liveEdit && isMobile && (
        <Button
          onClick={() => setIsMobileEditing(!isMobileEditing)}
          variant="outline"
          size="sm"
          type="button"
          className="mb-4"
        >
          {isMobileEditing ? "Done Editing" : "Edit Stack"}
        </Button>
      )}

      <div className="relative">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={orderedComponents.map((c) => c.identifier)}
            strategy={verticalListSortingStrategy}
          >
            <svg
              width={SVG_WIDTH}
              height={svgHeight}
              className="overflow-visible"
            >
              {placementMode && (
                <PlacementMarker
                  y={0} // At the very top
                  orderIndex={0}
                  onSelect={onPlacementSelect}
                  SVG_WIDTH={SVG_WIDTH}
                  COMPONENT_GROUP_X_OFFSET={COMPONENT_GROUP_X_OFFSET}
                  EFFECTIVE_COMPONENT_DRAW_WIDTH={
                    EFFECTIVE_COMPONENT_DRAW_WIDTH
                  }
                  markerHeight={markerHeight}
                  markerSpacing={markerSpacing}
                  isSelected={selectedPlacementIndex === 0} // Pass isSelected prop
                />
              )}

              {(() => {
                let yPosAccumulator = placementMode
                  ? markerHeight + markerSpacing
                  : 20; // Start position for first component
                return orderedComponents.map((component, index) => {
                  const componentBaseStackHeight = getComponentStackingHeight(
                    component.type,
                  );
                  const visualRenderHeight = getComponentVisualRenderHeight(
                    component.type,
                  );
                  const currentYPos = yPosAccumulator;

                  const componentElement = (
                    <SortableItem
                      key={component.identifier}
                      id={component.identifier}
                      component={component}
                      currentYPos={currentYPos}
                      visualRenderHeight={visualRenderHeight}
                      highlight={highlight}
                      links={links}
                      showIdsInComponents={showIdsInComponents}
                      showComponentLabels={showComponentLabels}
                      interactive={interactive && !placementMode} // Disable interaction in placement mode
                      isDraggableEnabled={isDraggableEnabled && !placementMode} // Disable dragging in placement mode
                      COMPONENT_GROUP_X_OFFSET={COMPONENT_GROUP_X_OFFSET}
                      COMPONENT_VISUAL_X_CENTER_IN_GROUP={
                        COMPONENT_VISUAL_X_CENTER_IN_GROUP
                      }
                      EFFECTIVE_COMPONENT_DRAW_WIDTH={
                        EFFECTIVE_COMPONENT_DRAW_WIDTH
                      }
                      HIGHLIGHT_PADDING={HIGHLIGHT_PADDING}
                      renderInnerComponent={renderInnerComponent}
                    />
                  );

                  yPosAccumulator +=
                    componentBaseStackHeight + componentSpacing;

                  if (placementMode) {
                    const markerY = yPosAccumulator;
                    yPosAccumulator += markerHeight + markerSpacing; // Add space for marker
                    return (
                      <React.Fragment key={component.identifier}>
                        {componentElement}
                        <PlacementMarker
                          y={markerY} // After the current component
                          orderIndex={index + 1}
                          onSelect={onPlacementSelect}
                          SVG_WIDTH={SVG_WIDTH}
                          COMPONENT_GROUP_X_OFFSET={COMPONENT_GROUP_X_OFFSET}
                          EFFECTIVE_COMPONENT_DRAW_WIDTH={
                            EFFECTIVE_COMPONENT_DRAW_WIDTH
                          }
                          markerHeight={markerHeight}
                          markerSpacing={markerSpacing}
                          isSelected={selectedPlacementIndex === index + 1} // Pass isSelected prop
                        />
                      </React.Fragment>
                    );
                  } else {
                    return componentElement;
                  }
                });
              })()}
            </svg>
          </SortableContext>
        </DndContext>
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

interface SortableItemProps {
  id: string;
  component: Doc<"hiveComponents">;
  currentYPos: number;
  visualRenderHeight: number;
  highlight?: string;
  links: boolean;
  showIdsInComponents: boolean;
  showComponentLabels: boolean;
  interactive: boolean;
  isDraggableEnabled: boolean;
  COMPONENT_GROUP_X_OFFSET: number;
  COMPONENT_VISUAL_X_CENTER_IN_GROUP: number;
  EFFECTIVE_COMPONENT_DRAW_WIDTH: number;
  HIGHLIGHT_PADDING: number;
  renderInnerComponent: (
    component: Doc<"hiveComponents">,
  ) => ReactNode | undefined;
}

function SortableItem({
  id,
  component,
  currentYPos,
  visualRenderHeight,
  highlight,
  links,
  showIdsInComponents,
  showComponentLabels,
  interactive,
  isDraggableEnabled,
  COMPONENT_GROUP_X_OFFSET,
  COMPONENT_VISUAL_X_CENTER_IN_GROUP,
  EFFECTIVE_COMPONENT_DRAW_WIDTH,
  HIGHLIGHT_PADDING,
  renderInnerComponent,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1, // Bring dragged item to front
  };

  const isHighlighted = highlight === component.identifier;
  const highlightX =
    COMPONENT_VISUAL_X_CENTER_IN_GROUP -
    EFFECTIVE_COMPONENT_DRAW_WIDTH / 2 -
    HIGHLIGHT_PADDING;
  const highlightWidth = EFFECTIVE_COMPONENT_DRAW_WIDTH + 2 * HIGHLIGHT_PADDING;

  return (
    <Link
      href={
        links && !isDraggableEnabled
          ? `/components/${component.identifier}`
          : "#"
      }
      key={component.identifier}
      className={cn("group", {
        "pointer-events-none": !interactive || isDraggableEnabled, // Disable link when dragging or in edit mode
      })}
      prefetch={links && !isDraggableEnabled}
    >
      <motion.g
        ref={(node) => setNodeRef(node as unknown as HTMLElement)}
        style={{
          ...style,
          x: COMPONENT_GROUP_X_OFFSET,
          y: currentYPos,
        }}
        initial={{ scale: 1 }}
        animate={{ scale: isDragging ? 1.05 : 1 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
          duration: 0.2,
        }}
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
        {isDraggableEnabled && (
          <g
            className="cursor-grab active:cursor-grabbing"
            transform={`translate(${COMPONENT_VISUAL_X_CENTER_IN_GROUP - 10}, ${visualRenderHeight / 2 - 10})`}
            {...attributes}
            {...listeners}
          >
            <rect x="-15" y="-15" width="30" height="30" fill="transparent" />{" "}
            {/* Larger hit area */}
            <GripVertical
              className="text-muted-foreground/70 hover:text-primary/80"
              size={20}
            />
          </g>
        )}
      </motion.g>
    </Link>
  );
}

interface PlacementMarkerProps {
  y: number;
  orderIndex: number;
  onSelect?: (orderIndex: number) => void;
  SVG_WIDTH: number;
  COMPONENT_GROUP_X_OFFSET: number;
  EFFECTIVE_COMPONENT_DRAW_WIDTH: number;
  markerHeight: number;
  markerSpacing: number;
  isSelected: boolean; // New prop
}

function PlacementMarker({
  y,
  orderIndex,
  onSelect,
  // SVG_WIDTH,
  COMPONENT_GROUP_X_OFFSET,
  EFFECTIVE_COMPONENT_DRAW_WIDTH,
  markerHeight,
  markerSpacing,
  isSelected,
}: PlacementMarkerProps) {
  const markerVisualY = y + markerSpacing / 2; // Position the visual part of the marker
  const markerX = COMPONENT_GROUP_X_OFFSET + EFFECTIVE_COMPONENT_DRAW_WIDTH / 2;

  return (
    <g
      className={cn("group cursor-pointer", {
        "opacity-100": isSelected, // Always full opacity if selected
      })}
      onClick={() => onSelect?.(orderIndex)}
      style={{ transform: `translateY(${markerVisualY}px)` }}
    >
      <rect
        x={COMPONENT_GROUP_X_OFFSET + 10}
        y={0}
        width={EFFECTIVE_COMPONENT_DRAW_WIDTH - 20}
        height={markerHeight}
        fill="none"
        stroke={
          isSelected ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"
        } // Highlight stroke
        strokeDasharray="4 4"
        strokeWidth="1.5"
        rx="2"
        className={cn("transition-opacity", {
          "opacity-50 group-hover:opacity-100": !isSelected, // Only fade if not selected
        })}
      />
      <Plus
        x={markerX - 10}
        y={markerHeight / 4}
        size={20}
        className={cn("transition-colors", {
          "text-primary": isSelected, // Highlight icon
          "text-muted-foreground opacity-70 group-hover:text-primary group-hover:opacity-100":
            !isSelected,
        })}
      />
      <rect // Invisible hit area for easier clicking
        x={COMPONENT_GROUP_X_OFFSET}
        y={-markerSpacing / 2} // Extend hit area slightly above and below
        width={EFFECTIVE_COMPONENT_DRAW_WIDTH}
        height={markerHeight + markerSpacing}
        fill="transparent"
      />
    </g>
  );
}
