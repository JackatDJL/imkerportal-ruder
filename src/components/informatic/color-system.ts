export interface ColorPalette {
  name: string
  colors: string[]
}

export const defaultPalettes: Record<string, ColorPalette> = {
  hive: {
    name: "Hive",
    colors: ["#fbbf24", "#f59e0b", "#ea580c", "#dc2626", "#eab308", "#ca8a04"],
  },
  ocean: {
    name: "Ocean",
    colors: ["#3b82f6", "#1d4ed8", "#1e40af", "#1e3a8a", "#60a5fa", "#2563eb"],
  },
  forest: {
    name: "Forest",
    colors: ["#22c55e", "#16a34a", "#15803d", "#166534", "#4ade80", "#059669"],
  },
  sunset: {
    name: "Sunset",
    colors: ["#f97316", "#ea580c", "#dc2626", "#b91c1c", "#fb923c", "#c2410c"],
  },
  purple: {
    name: "Purple",
    colors: ["#a855f7", "#9333ea", "#7c3aed", "#6d28d9", "#c084fc", "#8b5cf6"],
  },
}

export function generateGradient(colors: string[], index: number): string {
  const colorCount = colors.length
  const primaryIndex = index % colorCount
  const secondaryIndex = (index + 1) % colorCount

  return `linear-gradient(135deg, ${colors[primaryIndex]} 0%, ${colors[secondaryIndex]} 100%)`
}

export function generateHexagonGradients(palette: ColorPalette) {
  const gradients: Record<string, string> = {}

  palette.colors.forEach((color, index) => {
    const nextColor = palette.colors[(index + 1) % palette.colors.length] ?? color
    gradients[`hex${index + 1}`] = generateGradient([color, nextColor], index)
  })

  return gradients
}

export function getContrastColor(hexColor: string): string {
  // Remove # if present
  const hex = hexColor.replace("#", "")

  // Convert to RGB
  const r = Number.parseInt(hex.substr(0, 2), 16)
  const g = Number.parseInt(hex.substr(2, 2), 16)
  const b = Number.parseInt(hex.substr(4, 2), 16)

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  // Return white for dark colors, dark for light colors
  return luminance > 0.5 ? "#1f2937" : "#ffffff"
}
