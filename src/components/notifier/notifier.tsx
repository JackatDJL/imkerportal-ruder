import { cn } from "~/lib/utils";
import HexagonIcon from "./hexagon-icon";
import { getTypeIcon, getTypeColor } from "./utils";
import type { NotifierProps } from "./types";

export default function Notifier({
  type,
  label,
  description,
  extras,
  className,
  palette,
}: NotifierProps) {
  const IconComponent = getTypeIcon(type);
  const iconColor = getTypeColor(type, palette);

  return (
    <div
      className={cn(
        "flex flex-col items-center space-y-6 text-center",
        className,
      )}
    >
      <div className="relative">
        <HexagonIcon palette={palette} />
        <div className="absolute inset-0 flex items-center justify-center">
          <IconComponent
            color={
              iconColor.startsWith("text-[")
                ? iconColor.slice(6, -1)
                : iconColor
            }
            className={cn("h-10 w-10 drop-shadow-sm")}
            style={{
              transform: "translateY(-0.2rem)",
            }}
            strokeWidth={2.5}
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xl font-bold text-foreground">{label}</h3>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      {extras && <div className="mt-6">{extras}</div>}
    </div>
  );
}
