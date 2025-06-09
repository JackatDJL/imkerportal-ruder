"use client"

import { Button } from "~/components/ui/button"
import { defaultPalettes, type ColorPalette } from "./color-system"

interface PaletteSelectorProps {
  selectedPalette: ColorPalette
  onPaletteChange: (palette: ColorPalette) => void
}

export function PaletteSelector({ selectedPalette, onPaletteChange }: PaletteSelectorProps) {
  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {Object.values(defaultPalettes).map((palette) => (
        <Button
          key={palette.name}
          variant={selectedPalette.name === palette.name ? "default" : "outline"}
          onClick={() => onPaletteChange(palette)}
          className="flex items-center space-x-2"
        >
          <div className="flex space-x-1">
            {palette.colors.slice(0, 3).map((color, index) => (
              <div
                key={index}
                className="w-3 h-3 rounded-full border border-background"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span>{palette.name}</span>
        </Button>
      ))}
    </div>
  )
}
