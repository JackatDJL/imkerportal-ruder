import { toast } from "sonner";
import type { dndPayload } from ".";
import { WorkInProgressPage } from "../notifier";

export const dndHiveStack = (flags: dndPayload) => {
  if (flags.interactivity !== "dnd") return <></>;
  const { sorting, creation, deletion } = flags;

  toast.info("DND Hive Stack is enabled", {
    description: `Sorting: ${sorting}, Creation: ${creation}, Deletion: ${deletion}`,
  });

  toast.info("Design is " + flags.design);

  return <WorkInProgressPage />;
};
