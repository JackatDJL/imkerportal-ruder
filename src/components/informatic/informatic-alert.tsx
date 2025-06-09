import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { HexagonIcon } from "./hexagon-icon"
import { getTypeIcon, getTypeColor } from "./utils"
import type { InformaticProps } from "./types"
import { cn } from "~/lib/utils"

export function InformaticAlert({ type, label, description, extras, className, palette }: InformaticProps) {
  const IconComponent = getTypeIcon(type)
  const iconColor = getTypeColor(type, palette)

  return (
    <Alert className={cn("border-l-4 p-6 bg-card", className)}>
      <div className="flex items-start space-x-4">
        <div className="relative flex-shrink-0">
          <HexagonIcon className="w-16 h-16" palette={palette} />
          <div className="absolute inset-0 flex items-center justify-center">
            <IconComponent className={cn("w-6 h-6 drop-shadow-sm", iconColor)} strokeWidth={2.5} />
          </div>
        </div>
        <div className="flex-1 pt-2">
          <AlertTitle className="text-lg text-foreground">{label}</AlertTitle>
          <AlertDescription className="mt-2 text-base text-muted-foreground">{description}</AlertDescription>
          {extras && <div className="mt-4">{extras}</div>}
        </div>
      </div>
    </Alert>
  )
}
