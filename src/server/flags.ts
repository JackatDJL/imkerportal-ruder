import { flag } from "flags/next";
import { postHogAdapter } from "@flags-sdk/posthog";
import z from "zod";
import { useFeatureFlagPayload } from "posthog-js/react";

export const devModeFlag = flag({
  key: "dev-mode",
  description: "Overwrites some difficult Stuff",
  defaultValue: false,
  decide() {
    return process.env.NODE_ENV === "development";
  },
});

export const cmdkFlag = flag({
  key: "cmdk",
  description: "Enables the Command+K command menu",
  defaultValue: true,
  adapter: postHogAdapter.isFeatureEnabled(),
});

export const dndPayloadType = z
  .discriminatedUnion("interactivity", [
    z.object({
      interactivity: z.literal("buttons"),
    }),
    z.object({
      interactivity: z.literal("dnd"),
      sorting: z.boolean().default(true),
      creation: z.boolean().default(true),
      deletion: z.boolean().default(true),
    }),
  ])
  .and(
    z.object({
      design: z.enum(["text-card", "hive-visualisation"]).default("text-card"),
    }),
  )
  .catch({
    interactivity: "buttons",
    design: "text-card",
  });

export const dndComponentsFlag = flag({
  key: "dnd-hive-components",
  description: "Drag n Drop the Hive Components order and add Components",
  adapter: postHogAdapter.featureFlagPayload((v) => dndPayloadType.parse(v)),
});

export const useDndComponentsFlag = () => {
  const data = useFeatureFlagPayload("dnd-hive-components");
  return dndPayloadType.parse(data);
};
