import type React from "react";
import {
  Info,
  AlertTriangle,
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Database,
  RotateCcw,
} from "lucide-react";
import type { NotifierType } from "./types";
import { defaultPalettes, type ColorPalette } from "./color-system";

/**
 * Get the icon component for a specific informative component type.
 * @date June 9, 2025
 * @author JackatDJL
 *
 * @export
 * @param type The type of the informative component.
 * @returns The icon component associated with the specified type.
 */
export function getTypeIcon(type: NotifierType) {
  const iconMap = {
    info: Info,
    alert: AlertTriangle,
    warning: AlertCircle,
    redirect: ArrowRight,
    success: CheckCircle,
    database: Database,
    refresh: RotateCcw,
  };
  return iconMap[type];
}

/**
 * Get the text color for a specific informative component type.
 * @date June 9, 2025
 * @author JackatDJL
 *
 * @export
 * @param type The type of the informative component.
 * @param [palette] The color palette to use.
 * @returns The text color class for the specified type.
 */
export function getTypeColor(
  type: NotifierType,
  palette?: ColorPalette,
): string {
  if (!palette) {
    return defaultPalettes[type]?.iconColour ?? "text-blue-500";
  }

  // Return the contrast color for better visibility
  return `text-[${palette.iconColour}]`;
}

export function getTypeBgColor(
  type: NotifierType,
  palette?: ColorPalette,
): string {
  if (!palette) {
    // Default gradient backgrounds
    const bgColorMap = {
      info: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200",
      alert: "bg-gradient-to-br from-red-50 to-red-100 border-red-200",
      warning: "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200",
      redirect:
        "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200",
      success: "bg-gradient-to-br from-green-50 to-green-100 border-green-200",
      database:
        "bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200",
      refresh:
        "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200",
    };
    return bgColorMap[type];
  }

  // Generate background from palette
  const typeIndex = {
    info: 0,
    success: 1,
    warning: 2,
    alert: 3,
    database: 4,
    redirect: 5,
    refresh: 0,
  };

  const colorIndex = typeIndex[type] % palette.colours.length;

  return `bg-gradient-to-br from-[${palette.colours[colorIndex]}] to-[${palette.colours[(colorIndex + 1) % palette.colours.length]}] border-2`;
}

export function getCustomStyle(
  type: NotifierType,
  palette?: ColorPalette,
): React.CSSProperties {
  if (!palette) return {};

  const typeIndex = {
    info: 0,
    success: 1,
    warning: 2,
    alert: 3,
    database: 4,
    redirect: 5,
    refresh: 0,
  };

  const colorIndex = typeIndex[type] % palette.colours.length;
  const primaryColor = palette.colours[colorIndex];
  const secondaryColor =
    palette.colours[(colorIndex + 1) % palette.colours.length];

  return {
    background: `linear-gradient(135deg, ${primaryColor}15 0%, ${secondaryColor}25 100%)`,
    borderColor: primaryColor + "40",
  };
}
