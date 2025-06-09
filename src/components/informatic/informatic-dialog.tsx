import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { Informatic } from "./informatic"
import type { InformaticProps } from "./types"

interface InformaticDialogProps extends InformaticProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InformaticDialog({
  type,
  label,
  description,
  extras,
  open,
  onOpenChange,
  className,
  palette,
}: InformaticDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background">
        <DialogHeader className="sr-only">
          <DialogTitle>{label}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Informatic
            type={type}
            label={label}
            description={description}
            extras={extras}
            className={className}
            palette={palette}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
