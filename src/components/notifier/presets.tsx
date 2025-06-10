"use client";

import type React from "react";

import { Button } from "~/components/ui/button";
import NotifierCard from "./notifier-card";
import NotifierDialog from "./notifier-dialog";
import { useState } from "react";
import type { ColorPalette } from "./color-system";
import { defaultPalettes } from "./color-system";
import type { NotifierType } from "./types";

interface PresetProps {
  palette?: ColorPalette;
}

// Work in Progress Page
export function WorkInProgressPage({
  palette = defaultPalettes.hive,
}: PresetProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <NotifierCard
        type="warning"
        label="Work in Progress"
        description="This page is currently under maintenance. Please check back later."
        palette={palette}
        extras={
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
        }
      />
    </div>
  );
}

// Not Found Page
export function NotFoundPage({
  palette = defaultPalettes.hive,
}: PresetProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <NotifierCard
        type="warning"
        label="Page Not Found"
        description="The page you're looking for doesn't exist or has been moved."
        palette={palette}
        extras={
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
        }
      />
    </div>
  );
}

// // Refresh Client Popup
// export function RefreshClientPopup({
//   palette = defaultPalettes.hive,
// }: PresetProps) {
//   return (
//     <NotifierAlert
//       type="refresh"
//       label="Update Available"
//       description="A new version of the application is available. Please refresh your browser to get the latest features."
//       palette={palette}
//       extras={
//         <Button onClick={() => window.location.reload()} className="mt-2">
//           Refresh Now
//         </Button>
//       }
//     />
//   );
// }

// Database Connection Error
export function DatabaseErrorCard({
  palette = defaultPalettes.hive,
}: PresetProps) {
  return (
    <NotifierCard
      type="database"
      label="Database Connection Error"
      description="Unable to connect to the database. Please try again later or contact support."
      palette={palette}
      extras={
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
          <Button variant="secondary">Contact Support</Button>
        </div>
      }
    />
  );
}

// // Success Message
// export function SuccessMessage({
//   message,
//   palette = defaultPalettes.hive,
// }: {
//   message: string;
//   palette?: ColorPalette;
// }) {
//   return (
//     <NotifierAlert
//       type="success"
//       label="Success!"
//       description={message}
//       palette={palette}
//     />
//   );
// }

// Redirect Notice
export function RedirectNotice({
  destination,
  palette = defaultPalettes.hive,
}: {
  destination: string;
  palette?: ColorPalette;
}) {
  return (
    <NotifierCard
      type="redirect"
      label="Redirecting..."
      description={`You will be redirected to ${destination} in a few seconds.`}
      palette={palette}
      extras={
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-accent"></div>
          <span>Please wait...</span>
        </div>
      }
    />
  );
}

// Info Dialog Hook
export function useInfoDialog(defaultPalette = defaultPalettes.hive) {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<{
    type: NotifierType;
    label: string;
    description: string;
    extras?: React.ReactNode;
    palette?: ColorPalette;
  } | null>(null);

  const showInfo = (
    type: NotifierType,
    label: string,
    description: string,
    extras?: React.ReactNode,
    palette = defaultPalette,
  ) => {
    setConfig({ type, label, description, extras, palette });
    setOpen(true);
  };

  const InfoDialog = config ? (
    <NotifierDialog {...config} open={open} onOpenChange={setOpen} />
  ) : null;

  return { showInfo, InfoDialog };
}
