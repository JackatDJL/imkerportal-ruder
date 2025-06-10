import type React from "react";
import type { ColorPalette } from "./color-system";

export type NotifierType =
  | "info"
  | "alert"
  | "warning"
  | "redirect"
  | "success"
  | "database"
  | "refresh";

export interface NotifierProps {
  type: NotifierType;
  label: string;
  description: string;
  extras?: React.ReactNode;
  className?: string;
  palette?: ColorPalette;
}
