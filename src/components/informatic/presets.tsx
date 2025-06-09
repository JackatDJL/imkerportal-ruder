"use client"

import type React from "react"

import { Button } from "~/components/ui/button"
import { InformaticCard } from "./informatic-card"
import { InformaticAlert } from "./informatic-alert"
import { InformaticDialog } from "./informatic-dialog"
import { useState } from "react"
import type { ColorPalette } from "./color-system"
import { defaultPalettes } from "./color-system"

type InformaticType = "success" | "warning" | "error" | "info" | "database" | "redirect" | "refresh"

interface PresetProps {
  palette?: ColorPalette
}

// Work in Progress Page
export function WorkInProgressPage({ palette = defaultPalettes.hive }: PresetProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <InformaticCard
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
  )
}

// Refresh Client Popup
export function RefreshClientPopup({ palette = defaultPalettes.hive }: PresetProps) {
  return (
    <InformaticAlert
      type="refresh"
      label="Update Available"
      description="A new version of the application is available. Please refresh your browser to get the latest features."
      palette={palette}
      extras={
        <Button onClick={() => window.location.reload()} className="mt-2">
          Refresh Now
        </Button>
      }
    />
  )
}

// Database Connection Error
export function DatabaseErrorCard({ palette = defaultPalettes.hive }: PresetProps) {
  return (
    <InformaticCard
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
  )
}

// Success Message
export function SuccessMessage({
  message,
  palette = defaultPalettes.hive,
}: { message: string; palette?: ColorPalette }) {
  return <InformaticAlert type="success" label="Success!" description={message} palette={palette} />
}

// Redirect Notice
export function RedirectNotice({
  destination,
  palette = defaultPalettes.hive,
}: { destination: string; palette?: ColorPalette }) {
  return (
    <InformaticCard
      type="redirect"
      label="Redirecting..."
      description={`You will be redirected to ${destination} in a few seconds.`}
      palette={palette}
      extras={
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></div>
          <span>Please wait...</span>
        </div>
      }
    />
  )
}

// Info Dialog Hook
export function useInfoDialog(defaultPalette = defaultPalettes.hive) {
  const [open, setOpen] = useState(false)
  const [config, setConfig] = useState<{
    type: InformaticType
    label: string
    description: string
    extras?: React.ReactNode
    palette?: ColorPalette
  } | null>(null)

  const showInfo = (
    type: InformaticType,
    label: string,
    description: string,
    extras?: React.ReactNode,
    palette = defaultPalette,
  ) => {
    setConfig({ type, label, description, extras, palette })
    setOpen(true)
  }

  const InfoDialog = config ? <InformaticDialog {...config} open={open} onOpenChange={setOpen} /> : null

  return { showInfo, InfoDialog }
}
