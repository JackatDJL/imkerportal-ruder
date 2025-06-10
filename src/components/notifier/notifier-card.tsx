import { Card, CardContent } from "~/components/ui/card";
import Notifier from "./notifier";
import type { NotifierProps } from "./types";
import { getTypeBgColor, getCustomStyle } from "./utils";
import { cn } from "~/lib/utils";

export default function NotifierCard({
  type,
  label,
  description,
  extras,
  className,
  palette,
}: NotifierProps) {
  const bgColor = getTypeBgColor(type, palette);
  const customStyle = getCustomStyle(type, palette);

  return (
    <Card
      className={cn("border-2 shadow-lg", bgColor, className)}
      style={customStyle}
    >
      <CardContent className="p-8">
        <Notifier
          type={type}
          label={label}
          description={description}
          extras={extras}
          palette={palette}
        />
      </CardContent>
    </Card>
  );
}
