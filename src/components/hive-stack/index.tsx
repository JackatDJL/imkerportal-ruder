import type { dndPayloadType } from "~/server/flags";
import type z from "zod";
import { buttonHiveStack } from "./buttons";
import { dndHiveStack } from "./dnd";

export type dndPayload = z.infer<typeof dndPayloadType>;

export const HiveStack = ({ flags }: { flags: dndPayload }) => {
  if (flags.interactivity === "dnd") {
    return dndHiveStack(flags);
  } else {
    return buttonHiveStack(flags);
  }
};
