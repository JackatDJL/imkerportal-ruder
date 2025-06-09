import type React from "react"
import { Info, AlertTriangle, AlertCircle, ArrowRight, CheckCircle, Database, RotateCcw } from "lucide-react"
import type { InformaticType } from "./types"
import { getContrastColor, type ColorPalette } from "./color-system"

export function getTypeIcon(type: InformaticType) {
  const iconMap = {
    info: Info,
    alert: AlertTriangle,
    warning: AlertCircle,
    redirect: ArrowRight,
    success: CheckCircle,
    database: Database,
    refresh: RotateCcw,
  }
  return iconMap[type]
}

export function getTypeColor(type: InformaticType, palette?: ColorPalette): string {
  if (!palette) {
    // Default colors if no palette provided
    const colorMap = {
      info: "text-blue-600",
      alert: "text-red-600",
      warning: "text-amber-600",
      redirect: "text-purple-600",
      success: "text-green-600",
      database: "text-indigo-600",
      refresh: "text-orange-600",
    }
    return colorMap[type]
  }

  // Generate color from palette
  const typeIndex = {
    info: 0,
    success: 1,
    warning: 2,
    alert: 3,
    database: 4,
    redirect: 5,
    refresh: 0,
  }

  const colorIndex = typeIndex[type] % palette.colors.length
  const hexColor = palette.colors[colorIndex] ?? ""

  // Return the contrast color for better visibility
  return getContrastColor(hexColor) === "#ffffff" ? "text-white" : "text-gray-800"
}

export function getTypeBgColor(type: InformaticType, palette?: ColorPalette): string {
  if (!palette) {
    // Default gradient backgrounds
    const bgColorMap = {
      info: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200",
      alert: "bg-gradient-to-br from-red-50 to-red-100 border-red-200",
      warning: "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200",
      redirect: "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200",
      success: "bg-gradient-to-br from-green-50 to-green-100 border-green-200",
      database: "bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200",
      refresh: "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200",
    }
    return bgColorMap[type]
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
  }

  const colorIndex = typeIndex[type] % palette.colors.length
  const primaryColor = palette.colors[colorIndex]
  const secondaryColor = palette.colors[(colorIndex + 1) % palette.colors.length]

  return `bg-gradient-to-br border-2`
}

export function getCustomStyle(type: InformaticType, palette?: ColorPalette): React.CSSProperties {
  if (!palette) return {}

  const typeIndex = {
    info: 0,
    success: 1,
    warning: 2,
    alert: 3,
    database: 4,
    redirect: 5,
    refresh: 0,
  }

  const colorIndex = typeIndex[type] % palette.colors.length
  const primaryColor = palette.colors[colorIndex]
  const secondaryColor = palette.colors[(colorIndex + 1) % palette.colors.length]

  return {
    background: `linear-gradient(135deg, ${primaryColor}15 0%, ${secondaryColor}25 100%)`,
    borderColor: primaryColor + "40",
  }
}
