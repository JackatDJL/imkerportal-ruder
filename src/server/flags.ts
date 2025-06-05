import { flag } from "flags/next";
import { postHogAdapter } from "@flags-sdk/posthog";

export const devModeFlag = flag({
  key: "dev-mode",
  description: "Overwrites some difficult Stuff",
  defaultValue: false,
  decide() {
    return process.env.NODE_ENV === "development";
  },
});

export const liveEditFlag = flag({
  key: "live-edit",
  description:
    "Enables live editing and saving of changes while editing information",
  defaultValue: false,
  adapter: postHogAdapter.isFeatureEnabled(),
});

export const cmdkFlag = flag({
  key: "cmdk",
  description: "Enables the Command+K command menu",
  defaultValue: true,
  adapter: postHogAdapter.isFeatureEnabled(),
});
