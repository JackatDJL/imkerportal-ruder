"use client"

import { useState } from "react"
import { Button } from "~/components/ui/button"
import {
  Informatic,
  InformaticCard,
  InformaticAlert,
  InformaticDialog,
  useInfoDialog,
  type InformaticType,
} from "~/components/informatic"
import { PaletteSelector } from "~/components/informatic/palette-selector"
import { defaultPalettes, type ColorPalette } from "~/components/informatic/color-system"

export default function InformaticDemo() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<InformaticType>("info")
  const [selectedPalette, setSelectedPalette] = useState<ColorPalette>(defaultPalettes.hive)
  const { showInfo, InfoDialog } = useInfoDialog()

  const types: InformaticType[] = ["info", "alert", "warning", "redirect", "success", "database", "refresh"]

  return (
    <div className="container mx-auto p-8 space-y-16 bg-background min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
          🐝 Hive Informatic Design System
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          A comprehensive set of informational components with beautiful honeycomb design
        </p>

        {/* Palette Selector */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Choose Color Palette</h3>
          <PaletteSelector selectedPalette={selectedPalette} onPaletteChange={setSelectedPalette} />
        </div>
      </div>

      {/* Core Component Showcase */}
      <section>
        <h2 className="text-3xl font-semibold mb-8 text-center text-foreground">Core Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {types.map((type) => (
            <div key={type} className="p-6 bg-card border rounded-xl shadow-lg">
              <h3 className="text-lg font-medium mb-6 capitalize text-center text-foreground">{type}</h3>
              <Informatic
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
        <h2 className="text-3xl font-semibold mb-8 text-center text-foreground">Card Implementation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <InformaticCard
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
          <InformaticCard
            type="success"
            label="Deployment Successful"
            description="Your application has been successfully deployed to production environment."
            palette={selectedPalette}
            extras={
              <div className="flex space-x-3">
                <Button size="sm" className="bg-accent hover:bg-accent/90">
                  View Live
                </Button>
                <Button size="sm" variant="outline" className="bg-background/80">
                  View Logs
                </Button>
              </div>
            }
          />
        </div>
      </section>

      {/* Alert Implementation */}
      <section>
        <h2 className="text-3xl font-semibold mb-8 text-center text-foreground">Alert Implementation</h2>
        <div className="space-y-6">
          <InformaticAlert
            type="info"
            label="New Feature Available"
            description="We've added new collaboration tools to help your team work more efficiently together."
            palette={selectedPalette}
            extras={
              <Button variant="link" className="p-0 h-auto text-accent">
                Learn More →
              </Button>
            }
          />
          <InformaticAlert
            type="alert"
            label="Action Required"
            description="Your subscription will expire in 3 days. Please update your payment method to continue using our services."
            palette={selectedPalette}
            extras={
              <Button size="sm" className="mt-2 bg-accent hover:bg-accent/90">
                Update Payment
              </Button>
            }
          />
        </div>
      </section>

      {/* Dialog Implementation */}
      <section>
        <h2 className="text-3xl font-semibold mb-8 text-center text-foreground">Dialog Implementation</h2>
        <div className="flex justify-center space-x-4">
          <Button onClick={() => setDialogOpen(true)} className="bg-accent hover:bg-accent/90">
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

        <InformaticDialog
          type={selectedType}
          label="Dialog Example"
          description="This is an example of the informatic component in a dialog format with the beautiful honeycomb design."
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
        <h2 className="text-3xl font-semibold mb-8 text-center text-foreground">Default Palette Examples</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(defaultPalettes).map((palette) => (
            <InformaticCard
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
  )
}
