"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Notifier,
  NotifierCard,
  NotifierDialog,
  useInfoDialog,
  type NotifierType,
} from "~/components/notifier";
import {
  defaultPalettes,
  type ColorPalette,
} from "~/components/notifier/color-system";

export default function NotifierDemo() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPalette, setSelectedPalette] = useState<ColorPalette>(
    defaultPalettes.hive!,
  );
  const { showInfo, InfoDialog } = useInfoDialog();
  const types: NotifierType[] = [
    "info",
    "alert",
    "warning",
    "redirect",
    "success",
    "database",
    "refresh",
  ];

  return (
    <div className="container mx-auto min-h-screen space-y-16 bg-background p-8">
      <div className="text-center">
        <h1 className="mb-6 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-4xl font-bold text-transparent">
          🐝 Hive Informatic Design System
        </h1>
        <p className="mb-8 text-lg text-muted-foreground">
          A comprehensive set of informational components with beautiful
          honeycomb design
        </p>

        {/* Palette Selector */}
        <div className="mb-8">
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            Choose Color Palette
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {Object.values(defaultPalettes).map((palette) => (
              <button
                key={palette.name}
                onClick={() => setSelectedPalette(palette)}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2 transition-all ${
                  selectedPalette.name === palette.name
                    ? "border-accent bg-accent/10"
                    : "border-border hover:border-accent/50"
                }`}
              >
                <div className="flex gap-1">
                  {palette.colours.slice(0, 3).map((color) => (
                    <div
                      key={color}
                      style={{ backgroundColor: color }}
                      className="h-4 w-4 rounded-full"
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">{palette.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Core Component Showcase */}
      <section>
        <h2 className="mb-8 text-center text-3xl font-semibold text-foreground">
          Core Components
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {types.map((type) => (
            <div key={type} className="rounded-xl border bg-card p-6 shadow-lg">
              <h3 className="mb-6 text-center text-lg font-medium text-foreground capitalize">
                {type}
              </h3>
              <Notifier
                type={type}
                label={`${type.charAt(0).toUpperCase() + type.slice(1)} Message`}
                description={`This is a ${type} message example with the beautiful honeycomb design.`}
                palette={selectedPalette}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Card Implementation */}
      <section>
        <h2 className="mb-8 text-center text-3xl font-semibold text-foreground">
          Card Implementation
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <NotifierCard
            type="warning"
            label="System Maintenance"
            description="The system will undergo maintenance from 2:00 AM to 4:00 AM UTC. Please plan accordingly."
            palette={selectedPalette}
            extras={
              <Button variant="outline" className="bg-background/80">
                Schedule Reminder
              </Button>
            }
          />
          <NotifierCard
            type="success"
            label="Deployment Successful"
            description="Your application has been successfully deployed to production environment."
            palette={selectedPalette}
            extras={
              <div className="flex space-x-3">
                <Button size="sm" className="bg-accent hover:bg-accent/90">
                  View Live
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-background/80"
                >
                  View Logs
                </Button>
              </div>
            }
          />
        </div>
      </section>

      {/* Dialog Implementation */}
      <section>
        <h2 className="mb-8 text-center text-3xl font-semibold text-foreground">
          Dialog Implementation
        </h2>
        <div className="flex justify-center space-x-4">
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-accent hover:bg-accent/90"
          >
            Open Dialog
          </Button>
          <Button
            onClick={() =>
              showInfo(
                "database",
                "Connection Restored",
                "Database connection has been successfully restored and is now operational.",
                undefined,
                selectedPalette,
              )
            }
            variant="outline"
            className="bg-background/80"
          >
            Show Info Dialog
          </Button>
        </div>

        <NotifierDialog
          type={"database"}
          label="Dialog Example"
          description="This is an example of the notifier component in a dialog format with the beautiful honeycomb design."
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          palette={selectedPalette}
          extras={
            <Button onClick={() => setDialogOpen(false)} variant="outline">
              Close
            </Button>
          }
        />

        {InfoDialog}
      </section>

      {/* Default Palette Presets */}
      <section>
        <h2 className="mb-8 text-center text-3xl font-semibold text-foreground">
          Default Palette Examples
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Object.values(defaultPalettes).map((palette) => (
            <NotifierCard
              key={palette.name}
              type="info"
              label={`${palette.name} Theme`}
              description={`Example using the ${palette.name.toLowerCase()} color palette with beautiful gradients.`}
              palette={palette}
              extras={
                <Button
                  size="sm"
                  onClick={() => setSelectedPalette(palette)}
                  variant="outline"
                  className="bg-background/80"
                >
                  Use This Palette
                </Button>
              }
            />
          ))}
        </div>
      </section>
    </div>
  );
}
