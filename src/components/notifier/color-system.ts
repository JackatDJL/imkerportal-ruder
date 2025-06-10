/**
 * Represents a color palette with a name and an array of colors.
 * @date June 9, 2025
 * @author JackatDJL
 *
 * @export
 * @interface
 */
export interface ColorPalette {
  name: string;
  colours: string[];
  iconColour: string;
}

/**
 * Represents the default color palettes.
 * @date June 9, 2025
 * @author JackatDJL
 */
export const defaultPalettes: Record<string, ColorPalette> = {
  hive: {
    name: "Hive",
    colours: ["#fbbf24", "#f59e0b", "#ea580c", "#dc2626", "#eab308", "#ca8a04"],
    iconColour: "#ea580c",
  },
  ocean: {
    name: "Ocean",
    colours: ["#3b82f6", "#1d4ed8", "#1e40af", "#1e3a8a", "#60a5fa", "#2563eb"],
    iconColour: "#1e40af",
  },
  forest: {
    name: "Forest",
    colours: ["#22c55e", "#16a34a", "#15803d", "#166534", "#4ade80", "#059669"],
    iconColour: "#15803d",
  },
  sunset: {
    name: "Sunset",
    colours: ["#f97316", "#ea580c", "#dc2626", "#b91c1c", "#fb923c", "#c2410c"],
    iconColour: "#dc2626",
  },
  purple: {
    name: "Purple",
    colours: ["#a855f7", "#9333ea", "#7c3aed", "#6d28d9", "#c084fc", "#8b5cf6"],
    iconColour: "#7c3aed",
  },
};

/**
 * Generates a linear gradient string from an array of colors based on the index.
 * @date June 9, 2025
 * @author JackatDJL
 *
 * @export
 * @param colors
 * @param index
 * @returns
 */
export function generateGradient(colors: string[], index: number): string {
  const colorCount = colors.length;
  const primaryIndex = index % colorCount;
  const secondaryIndex = (index + 1) % colorCount;

  return `linear-gradient(135deg, ${colors[primaryIndex]} 0%, ${colors[secondaryIndex]} 100%)`;
}

export function generateHexagonGradients(palette: ColorPalette) {
  const gradients: Record<string, string> = {};

  palette.colours.forEach((color, index) => {
    const nextColor =
      palette.colours[(index + 1) % palette.colours.length] ?? color;
    gradients[`hex${index + 1}`] = generateGradient([color, nextColor], index);
  });

  return gradients;
}
