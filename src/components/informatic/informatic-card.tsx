import { Card, CardContent } from "~/components/ui/card"
import { Informatic } from "./informatic"
import type { InformaticProps } from "./types"
import { getTypeBgColor, getCustomStyle } from "./utils"
import { cn } from "~/lib/utils"

export function InformaticCard({ type, label, description, extras, className, palette }: InformaticProps) {
  const bgColor = getTypeBgColor(type, palette)
  const customStyle = getCustomStyle(type, palette)

  return (
    <Card className={cn("border-2 shadow-lg", bgColor, className)} style={customStyle}>
      <CardContent className="p-8 bg-card">
        <Informatic type={type} label={label} description={description} extras={extras} palette={palette} />
      </CardContent>
    </Card>
  )
}
