// import { auth } from "@clerk/nextjs/server";
import { /** dedupe, */ flag } from "flags/next";
// import { postHogAdapter } from "@flags-sdk/posthog";

// const identify = dedupe(() => {
//   const user = auth();
//   return user;
// });

export const devModeFlag = flag({
  key: "dev-mode",
  description: "Overwrites some difficult Stuff",
  defaultValue: false,
  decide() {
    return process.env.NODE_ENV === "development";
  },
});
