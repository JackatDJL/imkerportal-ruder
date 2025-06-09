import type React from "react"
import type { ColorPalette } from "./color-system"

export type InformaticType = "info" | "alert" | "warning" | "redirect" | "success" | "database" | "refresh"

export interface InformaticProps {
  type: InformaticType
  label: string
  description: string
  extras?: React.ReactNode
  className?: string
  palette: ColorPalette
}
