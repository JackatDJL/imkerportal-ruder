import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import Notifier from "./notifier";
import type { NotifierProps } from "./types";

interface NotifierDialogProps extends NotifierProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NotifierDialog({
  type,
  label,
  description,
  extras,
  open,
  onOpenChange,
  className,
  palette,
}: NotifierDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background sm:max-w-md">
        <DialogHeader className="sr-only">
          <DialogTitle>{label}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Notifier
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
  );
}
