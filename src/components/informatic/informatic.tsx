import { cn } from "~/lib/utils"
import { HexagonIcon } from "./hexagon-icon"
import { getTypeIcon, getTypeColor } from "./utils"
import type { InformaticProps } from "./types"

export function Informatic({ type, label, description, extras, className, palette }: InformaticProps) {
  const IconComponent = getTypeIcon(type)
  const iconColor = getTypeColor(type, palette)

  return (
    <div className={cn("flex flex-col items-center text-center space-y-6", className)}>
      <div className="relative">
        <HexagonIcon palette={palette} />
        <div className="absolute inset-0 flex items-center justify-center">
          <IconComponent className={cn("w-10 h-10 drop-shadow-sm", iconColor)} strokeWidth={2.5} />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xl font-bold text-foreground">{label}</h3>
        <p className="text-sm text-muted-foreground max-w-md leading-relaxed">{description}</p>
      </div>

      {extras && <div className="mt-6">{extras}</div>}
    </div>
  )
}
