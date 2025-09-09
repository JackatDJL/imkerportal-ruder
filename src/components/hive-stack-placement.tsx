"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import VisualHiveStack from "./hive-stack";
import type { Doc } from "#convex/dataModel";
import { Button } from "./ui/button";
import { Check, X } from "lucide-react";
import { useState, useEffect } from "react";

interface HiveStackPlacementProps {
  colony: Doc<"colonies">;
  components: Doc<"hiveComponents">[];
  // IMPORTANT: Add newComponentType prop
  newComponentType: Doc<"hiveComponents">["type"];
  onPlacementSelected: (orderIndex: number | null) => void;
  initialOrderIndex: number | null;
}

export default function HiveStackPlacement({
  colony,
  components,
  newComponentType, // Destructure new prop
  onPlacementSelected,
  initialOrderIndex,
}: HiveStackPlacementProps) {
  const [selectedOrderIndex, setSelectedOrderIndex] = useState<number | null>(
    initialOrderIndex,
  );
  const [isConfirming, setIsConfirming] = useState(false);

  // Update internal state if initialOrderIndex changes from parent
  useEffect(() => {
    setSelectedOrderIndex(initialOrderIndex);
    if (initialOrderIndex !== null) {
      // If there's an initial index, we are "editing" a placement,
      // so the component should visually be "out" for potential re-selection.
      // This state is handled by VisualHiveStack's selectedPlacementIndex.
    }
  }, [initialOrderIndex]);

  const handleConfirm = () => {
    setIsConfirming(true);
    // The actual call to onPlacementSelected will happen after the animation
    // in VisualHiveStack, triggered by onPlacementAnimationComplete.
    // For now, we'll rely on a timeout or a direct call if animation callback is too complex initially.
    // onPlacementSelected(selectedOrderIndex); // This would be immediate
  };

  const handleAnimationComplete = () => {
    onPlacementSelected(selectedOrderIndex);
    setIsConfirming(false); // Reset confirming state
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Komponente platzieren</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <p className="text-sm text-muted-foreground">
          Klicken Sie auf eine gestrichelte Linie, um die Position der neuen
          Komponente im Volk auszuwählen.
        </p>
        <VisualHiveStack
          colony={colony}
          components={components}
          placementMode={true}
          placingComponentType={newComponentType} // Pass the type of the component being placed
          onPlacementSelect={(index) => {
            setSelectedOrderIndex(index);
            setIsConfirming(false); // If user selects a new slot, reset confirmation
          }}
          selectedPlacementIndex={selectedOrderIndex}
          interactive={false}
          liveEdit={false}
          showIdsInComponents={true}
          showComponentLabels={true}
          isConfirmingPlacement={isConfirming} // Pass confirming state
          onPlacementAnimationComplete={handleAnimationComplete} // Callback for when animation finishes
        />
        <div className="flex gap-2">
          <Button
            onClick={handleConfirm}
            type="button"
            disabled={selectedOrderIndex === null || isConfirming}
          >
            <Check className="mr-2 h-4 w-4" />
            {isConfirming ? "Platziere..." : "Bestätigen"}
          </Button>
          <Button
            variant="outline"
            type="button"
            onClick={() => {
              onPlacementSelected(null);
              setIsConfirming(false);
            }}
            disabled={isConfirming}
          >
            <X className="mr-2 h-4 w-4" />
            Abbrechen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
