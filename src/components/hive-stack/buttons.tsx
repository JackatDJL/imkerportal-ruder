import { toast } from "sonner";
import type { dndPayload } from ".";
import { WorkInProgressPage } from "../notifier";

export const buttonHiveStack = (flags: dndPayload) => {
  if (flags.interactivity !== "buttons") return <></>;

  toast.info("Button Hive Stack is enabled", {});

  toast.info("Design is " + flags.design);

  return <WorkInProgressPage />;
};
