"use client";

import React, { type ReactNode, useMemo, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useAnimation,
  type animationControls,
} from "motion/react";
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
  DragOverlay,
  type UniqueIdentifier,
  type Active,
  type Over,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS, type Transform } from "@dnd-kit/utilities";
import { Button } from "./ui/button";
import { GripVertical, Plus, MoveRight } from "lucide-react";
import { useMobile } from "~/hooks/use-mobile";

export interface VisualHiveStackProps {
  colony: Doc<"colonies">;
  components: Doc<"hiveComponents">[];
  highlight?: string;
  links?: boolean;
  showIdsInComponents?: boolean;
  showComponentLabels?: boolean;
  showPlacingComponentLabel?: boolean;
  interactive?: boolean;
  liveEdit?: boolean;
  onMove?: (newOrderedIdentifiers: string[]) => void;
  placementMode?: boolean;
  placingComponentType?: Doc<"hiveComponents">["type"];
  onPlacementSelect?: (orderIndex: number) => void;
  selectedPlacementIndex?: number | null;
  isConfirmingPlacement?: boolean;
  onPlacementAnimationComplete?: () => void;
  className?: string;
  EFFECTIVE_COMPONENT_DRAW_WIDTH: number;
}

export const themeColors = {
  Deckel: "#334155",
  Boden: "#A16207",
  Zarge: "#EA580C",
  Brutraum: "#EA580C",
  Honigraum: "#F59E0B",
  Futterraum: "#D946EF",
  Koeniginnenabspehrgitter: "#64748B",
  OneWayGate: "#0EA5E9",
  ZargeCamouflageSpot: "#10B981",
  DetailLight: "#E2E8F0",
  DetailDark: "#475569",
};

const renderPlacingComponentPreviewSVG = (
  type: Doc<"hiveComponents">["type"],
  visualRenderHeight: number,
  color: string,
  uniqueKey?: string,
) => {
  const commonProps = { isHovered: false, uniqueKey: uniqueKey ?? type };
  switch (type) {
    case "Deckel":
      return <DeckelSVG height={25} fill={color} {...commonProps} />;
    case "Boden":
      return <BodenSVG height={30} fill={color} {...commonProps} />;
    case "Königinnenabsperrgitter":
      return <QueenExcluderSVG height={14} fill={color} {...commonProps} />;
    case "One Way Gate":
      return <OneWayGateSVG height={19} fill={color} {...commonProps} />;
    case "Zarge":
    case "Futterraum":
      return (
        <ZargeSVG
          height={visualRenderHeight}
          fill={color}
          type={type}
          {...commonProps}
        />
      );
    default:
      return (
        <rect
          width="120"
          height={visualRenderHeight}
          fill={color}
          rx="3"
          x="15"
        />
      );
  }
};

export default function VisualHiveStack({
  colony,
  components,
  highlight,
  links = true,
  showIdsInComponents = false,
  showComponentLabels = true,
  showPlacingComponentLabel = true,
  interactive = true,
  liveEdit = false,
  onMove,
  placementMode = false,
  placingComponentType,
  onPlacementSelect,
  selectedPlacementIndex = null,
  isConfirmingPlacement = false,
  onPlacementAnimationComplete,
  className,
}: VisualHiveStackProps) {
  const isMobile = useMobile();
  const [isMobileEditing, setIsMobileEditing] = useState(false);
  const [orderedComponents, setOrderedComponents] = useState<
    Doc<"hiveComponents">[]
  >([]);
  const [currentPlacingType, setCurrentPlacingType] =
    useState(placingComponentType);
  const [placingComponentPosition, setPlacingComponentPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [draggedPreviewId, setDraggedPreviewId] =
    useState<UniqueIdentifier | null>(null);
  const placementPreviewControls = useAnimation();
  const arrowControls = useAnimation();

  const SVG_WIDTH = 250;
  const COMPONENT_VISUAL_X_CENTER_IN_GROUP = 75 + 50;
  const COMPONENT_GROUP_X_OFFSET =
    SVG_WIDTH / 2 - COMPONENT_VISUAL_X_CENTER_IN_GROUP + 50;
  const EFFECTIVE_COMPONENT_DRAW_WIDTH = 140;
  const HIGHLIGHT_PADDING = 5;
  const PREVIEW_X_BASE = 20;
  const ARROW_LENGTH = 60;

  useEffect(() => {
    const sorted = [...components].sort((a, b) => {
      if (a.orderIndex !== undefined && b.orderIndex !== undefined)
        return a.orderIndex - b.orderIndex;
      const posA = a.internalData?.virtualPosition;
      const posB = b.internalData?.virtualPosition;
      if (
        posA?.type === "forceTop" &&
        posB?.type === "forceTop" &&
        "forceFromTop" in posA &&
        "forceFromTop" in posB
      )
        return (posA.forceFromTop ?? 0) - (posB.forceFromTop ?? 0);
      if (
        posA?.type === "forceBottom" &&
        posB?.type === "forceBottom" &&
        "forceFromBottom" in posA &&
        "forceFromBottom" in posB
      )
        return (posB.forceFromBottom ?? 0) - (posA.forceFromBottom ?? 0);
      if (posA?.type === "forceTop") return -1;
      if (posB?.type === "forceTop") return 1;
      if (posA?.type === "forceBottom") return 1;
      if (posB?.type === "forceBottom") return -1;
      return a._creationTime - b._creationTime;
    });
    setOrderedComponents(sorted);
  }, [components]);

  useEffect(() => {
    if (placingComponentType !== currentPlacingType) {
      void placementPreviewControls
        .start({ opacity: 0, scale: 0.9 })
        .then(() => {
          setCurrentPlacingType(placingComponentType);
          void placementPreviewControls.start({
            opacity: 1,
            scale: 1,
            transition: { delay: 0.05 },
          });
        });
    }
  }, [placingComponentType, currentPlacingType, placementPreviewControls]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor),
  );

  const handleDragEndSortable = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setOrderedComponents((items) => {
        const oldIndex = items.findIndex(
          (item) => item.identifier === active.id,
        );
        const newIndex = items.findIndex((item) => item.identifier === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        if (onMove) onMove(newOrder.map((c) => c.identifier));
        return newOrder;
      });
    }
  };

  const handleDragEndPreview = (event: DragEndEvent) => {
    setDraggedPreviewId(null);
    const { over } = event;
    if (
      over &&
      typeof over.id === "string" &&
      over.id.startsWith("placement-marker-")
    ) {
      const orderIndex = parseInt(over.id.replace("placement-marker-", ""), 10);
      onPlacementSelect?.(orderIndex);
    }
  };

  const isDraggableEnabled = liveEdit && (!isMobile || isMobileEditing);

  const getComponentStackingHeight = useMemo(
    () => (type: Doc<"hiveComponents">["type"]) => {
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
    },
    [],
  );

  const getComponentVisualRenderHeight = useMemo(
    () => (type: Doc<"hiveComponents">["type"]) => {
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
    },
    [],
  );

  const getComponentColour = useMemo(
    () =>
      (
        componentOrType: Doc<"hiveComponents"> | Doc<"hiveComponents">["type"],
      ) => {
        const type =
          typeof componentOrType === "string"
            ? componentOrType
            : componentOrType.type;
        switch (type) {
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
      },
    [],
  );

  const renderInnerComponent = (component: Doc<"hiveComponents">) => {
    const visualHeight = getComponentVisualRenderHeight(component.type);
    const color = getComponentColour(component);
    const uniqueKey = component.identifier ?? component._id.toString();

    switch (component.type) {
      case "Deckel":
        return <DeckelSVG height={25} fill={color} isHovered={false} />;
      case "Boden":
        return <BodenSVG height={30} fill={color} isHovered={false} />;
      case "Königinnenabsperrgitter":
        return <QueenExcluderSVG height={14} fill={color} isHovered={false} />;
      case "One Way Gate":
        return <OneWayGateSVG height={19} fill={color} isHovered={false} />;
      case "Zarge":
      case "Futterraum":
        return (
          <ZargeSVG
            height={visualHeight}
            fill={color}
            type={component.type}
            uniqueKey={uniqueKey}
          />
        );
      default:
        return (
          <rect width="120" height={visualHeight} fill={color} rx="3" x="15" />
        );
    }
  };

  const componentSpacing = 5;
  const markerHeight = 35;
  const markerSpacing = 12;

  const placementMarkerYPositions = useMemo(() => {
    const positions: { orderIndex: number; y: number; height: number }[] = [];
    let yAccumulator = placementMode ? markerSpacing / 2 : 20;

    if (placementMode) {
      positions.push({
        orderIndex: 0,
        y: yAccumulator + markerHeight / 2,
        height: markerHeight,
      });
      yAccumulator += markerHeight + markerSpacing;
    }

    orderedComponents.forEach((c, index) => {
      yAccumulator += getComponentStackingHeight(c.type) + componentSpacing;
      if (placementMode) {
        positions.push({
          orderIndex: index + 1,
          y: yAccumulator + markerHeight / 2,
          height: markerHeight,
        });
        yAccumulator += markerHeight + markerSpacing;
      }
    });
    return positions;
  }, [
    orderedComponents,
    placementMode,
    markerHeight,
    markerSpacing,
    getComponentStackingHeight,
  ]);

  let currentTotalStackHeight = 0;
  if (placementMode) currentTotalStackHeight += markerHeight + markerSpacing;
  orderedComponents.forEach((c) => {
    currentTotalStackHeight +=
      getComponentStackingHeight(c.type) + componentSpacing;
    if (placementMode) currentTotalStackHeight += markerHeight + markerSpacing;
  });
  const svgHeight = Math.max(200, currentTotalStackHeight + 20);

  const legendItems = useMemo(
    () =>
      Array.from(
        new Map(
          components
            .map((c) => ({
              label: c.type.toString(),
              color: getComponentColour(c),
            }))
            .map((item) => [item.label, item]),
        ).values(),
      ).sort((a, b) => a.label.localeCompare(b.label)),
    [components, getComponentColour],
  );

  const selectedMarkerInfo = placementMarkerYPositions.find(
    (p) => p.orderIndex === selectedPlacementIndex,
  );
  const placingComponentVisualHeight = currentPlacingType
    ? getComponentVisualRenderHeight(currentPlacingType)
    : 0;
  const placingComponentTargetY = selectedMarkerInfo
    ? selectedMarkerInfo.y - placingComponentVisualHeight / 2
    : 0;

  useEffect(() => {
    if (
      placementMode &&
      currentPlacingType &&
      selectedPlacementIndex !== null &&
      selectedMarkerInfo
    ) {
      const targetY = selectedMarkerInfo.y - placingComponentVisualHeight / 2;
      if (isConfirmingPlacement) {
        void placementPreviewControls
          .start({
            x: COMPONENT_GROUP_X_OFFSET,
            y: targetY,
            opacity: [1, 0.7, 0],
            scale: [1, 1.05, 0.8],
            transition: { duration: 0.5, ease: "easeOut" },
          })
          .then(onPlacementAnimationComplete);
        void arrowControls.start({ opacity: 0, transition: { duration: 0.2 } });
      } else {
        void placementPreviewControls.start({
          x: PREVIEW_X_BASE,
          y: targetY,
          opacity: 1,
          scale: 1,
          transition: {
            type: "spring",
            stiffness: 220,
            damping: 25,
            duration: 0.3,
          },
        });
        void arrowControls.start({
          opacity: 1,
          transition: { delay: 0.1, duration: 0.2 },
        });
      }
      setPlacingComponentPosition({ x: PREVIEW_X_BASE, y: targetY });
    } else {
      void arrowControls.start({ opacity: 0 });
      setPlacingComponentPosition(null);
    }
  }, [
    selectedPlacementIndex,
    currentPlacingType,
    isConfirmingPlacement,
    placementMode,
    selectedMarkerInfo,
    onPlacementAnimationComplete,
    placingComponentVisualHeight,
    placementPreviewControls,
    arrowControls,
    COMPONENT_GROUP_X_OFFSET,
    PREVIEW_X_BASE,
  ]);

  const previewDraggableId = "placing-component-preview";

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
          {" "}
          {isMobileEditing ? "Done Editing" : "Edit Stack"}{" "}
        </Button>
      )}

      <div className="relative flex w-full justify-center">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={(event: { active: Active }) => {
            if (event.active.id === previewDraggableId)
              setDraggedPreviewId(previewDraggableId);
          }}
          onDragEnd={
            draggedPreviewId ? handleDragEndPreview : handleDragEndSortable
          }
        >
          <svg
            width={SVG_WIDTH}
            height={svgHeight}
            className="overflow-visible"
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="8"
                refY="3.5"
                orient="auto"
                fill="hsl(var(--foreground))"
              >
                <polygon points="0 0, 10 3.5, 0 7" />
              </marker>
            </defs>

            <SortableContext
              items={orderedComponents.map((c) => c.identifier)}
              strategy={verticalListSortingStrategy}
            >
              {(() => {
                let yPosAccumulator = placementMode ? markerSpacing / 2 : 20; // Start for first marker or first component
                const elements: ReactNode[] = [];

                if (placementMode) {
                  // Always show top marker if in placement mode
                  elements.push(
                    <PlacementMarker
                      key="marker-top"
                      orderIndex={0}
                      y={yPosAccumulator} // Y for the center of this marker
                      onSelect={onPlacementSelect}
                      SVG_WIDTH={SVG_WIDTH}
                      COMPONENT_GROUP_X_OFFSET={COMPONENT_GROUP_X_OFFSET}
                      EFFECTIVE_COMPONENT_DRAW_WIDTH={
                        EFFECTIVE_COMPONENT_DRAW_WIDTH
                      }
                      markerHeight={markerHeight}
                      markerSpacing={markerSpacing}
                      isSelected={selectedPlacementIndex === 0}
                    />,
                  );
                  yPosAccumulator += markerHeight + markerSpacing; // Account for its height + spacing
                }

                orderedComponents.forEach((component, index) => {
                  const componentBaseStackHeight = getComponentStackingHeight(
                    component.type,
                  );
                  const visualRenderHeight = getComponentVisualRenderHeight(
                    component.type,
                  );
                  const currentYPos = yPosAccumulator;

                  elements.push(
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
                      interactive={interactive && !placementMode}
                      isDraggableEnabled={isDraggableEnabled && !placementMode}
                      placementModeActive={placementMode}
                      COMPONENT_GROUP_X_OFFSET={COMPONENT_GROUP_X_OFFSET}
                      COMPONENT_VISUAL_X_CENTER_IN_GROUP={
                        COMPONENT_VISUAL_X_CENTER_IN_GROUP
                      }
                      EFFECTIVE_COMPONENT_DRAW_WIDTH={
                        EFFECTIVE_COMPONENT_DRAW_WIDTH
                      }
                      HIGHLIGHT_PADDING={HIGHLIGHT_PADDING}
                      renderInnerComponent={renderInnerComponent}
                    />,
                  );
                  yPosAccumulator +=
                    componentBaseStackHeight + componentSpacing;

                  if (placementMode) {
                    const markerOrderIndex = index + 1;
                    elements.push(
                      <PlacementMarker
                        key={`marker-${markerOrderIndex}`}
                        orderIndex={markerOrderIndex}
                        y={yPosAccumulator} // Y for the center of this marker
                        onSelect={onPlacementSelect}
                        SVG_WIDTH={SVG_WIDTH}
                        COMPONENT_GROUP_X_OFFSET={COMPONENT_GROUP_X_OFFSET}
                        EFFECTIVE_COMPONENT_DRAW_WIDTH={
                          EFFECTIVE_COMPONENT_DRAW_WIDTH
                        }
                        markerHeight={markerHeight}
                        markerSpacing={markerSpacing}
                        isSelected={selectedPlacementIndex === markerOrderIndex}
                      />,
                    );
                    yPosAccumulator += markerHeight + markerSpacing;
                  }
                });
                return elements;
              })()}
            </SortableContext>

            {placementMode &&
              currentPlacingType &&
              selectedPlacementIndex !== null &&
              placingComponentPosition &&
              !isConfirmingPlacement && (
                <DraggablePreview
                  id={previewDraggableId}
                  type={currentPlacingType}
                  initialX={placingComponentPosition.x}
                  initialY={placingComponentPosition.y}
                  visualHeight={placingComponentVisualHeight}
                  color={getComponentColour(currentPlacingType)}
                  arrowControls={() => arrowControls}
                  placementPreviewControls={() => placementPreviewControls}
                  arrowLength={ARROW_LENGTH}
                  targetXForArrow={
                    COMPONENT_GROUP_X_OFFSET +
                    EFFECTIVE_COMPONENT_DRAW_WIDTH / 2
                  }
                  showLabel={true}
                  EFFECTIVE_COMPONENT_DRAW_WIDTH={
                    EFFECTIVE_COMPONENT_DRAW_WIDTH
                  }
                />
              )}
            {placementMode &&
              currentPlacingType &&
              isConfirmingPlacement &&
              selectedMarkerInfo && (
                <motion.g
                  key={`confirming-animation-${selectedPlacementIndex}`}
                  initial={{
                    x: PREVIEW_X_BASE,
                    y: placingComponentTargetY,
                    opacity: 1,
                    scale: 1,
                  }}
                  animate={{
                    x: COMPONENT_GROUP_X_OFFSET,
                    y: selectedMarkerInfo.y - placingComponentVisualHeight / 2,
                    opacity: 0,
                    scale: 0.8,
                  }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  onAnimationComplete={onPlacementAnimationComplete}
                >
                  {renderPlacingComponentPreviewSVG(
                    currentPlacingType,
                    placingComponentVisualHeight,
                    getComponentColour(currentPlacingType),
                  )}
                </motion.g>
              )}

            <DragOverlay>
              {draggedPreviewId === previewDraggableId &&
                currentPlacingType &&
                placingComponentPosition && (
                  <g
                    style={{
                      transform: `translate(${placingComponentPosition.x}px, ${placingComponentPosition.y}px)`,
                    }}
                  >
                    {renderPlacingComponentPreviewSVG(
                      currentPlacingType,
                      placingComponentVisualHeight,
                      getComponentColour(currentPlacingType),
                    )}
                  </g>
                )}
            </DragOverlay>
          </svg>
        </DndContext>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-1">
            {" "}
            <div
              style={{ backgroundColor: item.color }}
              className="h-3 w-3 rounded-sm border border-black/20"
            ></div>{" "}
            <span className="text-muted-foreground">{item.label}</span>{" "}
          </div>
        ))}
      </div>
    </div>
  );
}

interface DraggablePreviewProps {
  id: UniqueIdentifier;
  type: Doc<"hiveComponents">["type"];
  initialX: number;
  initialY: number;
  visualHeight: number;
  color: string;
  arrowControls: typeof animationControls;
  placementPreviewControls: typeof animationControls;
  showLabel: boolean;
  arrowLength: number;
  targetXForArrow: number;
  EFFECTIVE_COMPONENT_DRAW_WIDTH: number;
}

function DraggablePreview({
  id,
  type,
  initialX,
  initialY,
  visualHeight,
  color,
  arrowControls,
  placementPreviewControls,
  showLabel,
  arrowLength,
  targetXForArrow,
  EFFECTIVE_COMPONENT_DRAW_WIDTH,
}: DraggablePreviewProps) {
  const { attributes, listeners, setNodeRef, transform } = useSortable({ id });

  const style: React.CSSProperties = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : { transform: `translate(${initialX}px, ${initialY}px)` }; // Use transform for initial position as well

  return (
    <motion.g
      ref={setNodeRef as React.Ref<SVGGElement>} // Cast setNodeRef to the correct type
      style={style}
      animate={placementPreviewControls()}
      drag
      dragMomentum={false}
      className="cursor-grab active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      {/* Arrow line for preview */}
      <line
        x1={EFFECTIVE_COMPONENT_DRAW_WIDTH / 2 + 10} // Arrow starts right of the preview's center
        y1={visualHeight / 2}
        x2={
          targetXForArrow -
          initialX -
          EFFECTIVE_COMPONENT_DRAW_WIDTH / 2 +
          arrowLength -
          25
        } // Adjusted target
        y2={visualHeight / 2}
        stroke="hsl(var(--foreground))"
        strokeWidth="2"
        markerEnd="url(#arrowhead)"
      />
      <g>
        {renderPlacingComponentPreviewSVG(
          type,
          visualHeight,
          color,
          String(id),
        )}
        {showLabel && (
          <text
            x={EFFECTIVE_COMPONENT_DRAW_WIDTH / 2}
            y={visualHeight + 15}
            textAnchor="middle"
            className="fill-muted-foreground text-xs select-none"
          >
            {type}
          </text>
        )}
      </g>
    </motion.g>
  );
}

interface SortableItemProps {
  id: UniqueIdentifier;
  component: Doc<"hiveComponents">;
  currentYPos: number;
  visualRenderHeight: number;
  highlight?: string;
  links: boolean;
  showIdsInComponents: boolean;
  showComponentLabels: boolean;
  interactive: boolean;
  isDraggableEnabled: boolean;
  placementModeActive: boolean;
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
  placementModeActive,
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
  } = useSortable({ id, disabled: placementModeActive });
  const controls = useAnimation();

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform!), // Ensure transform is not null
    transition: isDragging ? undefined : (transition ?? undefined),
    zIndex: isDragging ? 10 : 1,
  };

  const handlePointerDown = () => {
    if (placementModeActive) {
      void controls.start({
        x: [0, -5, 5, -3, 3, 0].map((dx) => dx + COMPONENT_GROUP_X_OFFSET), // Apply to current X
        y: [0, 2, -2, 1, -1, 0].map((dy) => dy + currentYPos), // Apply to current Y
        transition: {
          type: "spring",
          stiffness: 500,
          damping: 15,
          duration: 0.3,
        },
      });
    }
  };

  const isHighlighted = highlight === component.identifier;
  const highlightX =
    COMPONENT_VISUAL_X_CENTER_IN_GROUP -
    EFFECTIVE_COMPONENT_DRAW_WIDTH / 2 -
    HIGHLIGHT_PADDING -
    50;
  const highlightWidth = EFFECTIVE_COMPONENT_DRAW_WIDTH + 2 * HIGHLIGHT_PADDING;

  return (
    <Link
      href={
        links && !isDraggableEnabled && !placementModeActive
          ? `/components/${component.identifier}`
          : "#"
      }
      key={String(id)}
      className={cn("group", {
        "pointer-events-none":
          !interactive || isDraggableEnabled || placementModeActive,
      })}
      prefetch={links && !isDraggableEnabled && !placementModeActive}
    >
      <motion.g
        ref={(node) => setNodeRef(node as HTMLElement | null)} // Refined cast
        style={{ ...style, x: COMPONENT_GROUP_X_OFFSET, y: currentYPos }}
        animate={controls}
        initial={{ scale: 1 }}
        whileHover={placementModeActive ? { scale: 1.02 } : {}}
        onPointerDown={handlePointerDown}
        className={
          placementModeActive
            ? "cursor-not-allowed"
            : isDraggableEnabled
              ? "cursor-grab"
              : "cursor-pointer"
        }
      >
        {renderInnerComponent(component)}
        {showIdsInComponents && (
          <text
            x={COMPONENT_VISUAL_X_CENTER_IN_GROUP - 50}
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
              10 -
              50
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
        {isDraggableEnabled && !placementModeActive && (
          <g
            className="active:cursor-grabbing"
            transform={`translate(${COMPONENT_VISUAL_X_CENTER_IN_GROUP - 10 - 50}, ${visualRenderHeight / 2 - 10})`}
            {...attributes}
            {...listeners}
          >
            <rect x="-15" y="-15" width="30" height="30" fill="transparent" />
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
  isSelected: boolean;
}

function PlacementMarker({
  y,
  orderIndex,
  onSelect,
  COMPONENT_GROUP_X_OFFSET,
  EFFECTIVE_COMPONENT_DRAW_WIDTH,
  markerHeight,
  markerSpacing,
  isSelected,
}: PlacementMarkerProps) {
  const markerVisualY = y;
  const markerX = COMPONENT_GROUP_X_OFFSET + EFFECTIVE_COMPONENT_DRAW_WIDTH / 2;

  return (
    <motion.g
      layout
      key={`placement-marker-${orderIndex}`}
      initial={{ opacity: 0.6 }}
      animate={{ opacity: isSelected ? 1 : 0.7, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("group cursor-pointer")}
      onClick={() => onSelect?.(orderIndex)}
      style={{ transform: `translateY(${markerVisualY - markerHeight / 2}px)` }}
      data-id={`placement-marker-${orderIndex}`}
    >
      <rect
        x={COMPONENT_GROUP_X_OFFSET + 5}
        y={0}
        width={EFFECTIVE_COMPONENT_DRAW_WIDTH - 10}
        height={markerHeight}
        fill={"hsla(var(--muted-hsl)/0.1)"}
        stroke={
          isSelected ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"
        }
        strokeDasharray="6 6"
        strokeWidth={isSelected ? "2" : "1.5"}
        rx="3"
        className={cn("transition-all")}
      />
      <Plus
        x={markerX - 10}
        y={markerHeight / 2 - 10}
        size={20}
        strokeWidth={isSelected ? 2.5 : 2}
        className={cn("transition-colors", {
          "text-primary": isSelected,
          "text-muted-foreground group-hover:text-primary": !isSelected,
        })}
      />
      <rect
        x={COMPONENT_GROUP_X_OFFSET}
        y={0}
        width={EFFECTIVE_COMPONENT_DRAW_WIDTH}
        height={markerHeight}
        fill="transparent"
      />
    </motion.g>
  );
}
