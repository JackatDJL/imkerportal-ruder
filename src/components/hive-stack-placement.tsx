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
  onPlacementSelected: (orderIndex: number | null) => void;
  initialOrderIndex: number | null;
}

export default function HiveStackPlacement({
  colony,
  components,
  onPlacementSelected,
  initialOrderIndex,
}: HiveStackPlacementProps) {
  const [selectedOrderIndex, setSelectedOrderIndex] = useState<number | null>(
    initialOrderIndex,
  );

  // Update internal state if initialOrderIndex changes from parent
  useEffect(() => {
    setSelectedOrderIndex(initialOrderIndex);
  }, [initialOrderIndex]);

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
          onPlacementSelect={setSelectedOrderIndex}
          selectedPlacementIndex={selectedOrderIndex} // Pass selected index for highlighting
          interactive={false} // Disable general interaction in placement mode
          liveEdit={false} // Disable live editing in placement mode
          showIdsInComponents={true}
          showComponentLabels={true}
        />
        <div className="flex gap-2">
          <Button
            onClick={() => onPlacementSelected(selectedOrderIndex)}
            type="button"
            disabled={selectedOrderIndex === null}
          >
            <Check className="mr-2 h-4 w-4" />
            Bestätigen
          </Button>
          <Button
            variant="outline"
            type="button"
            onClick={() => onPlacementSelected(null)}
          >
            <X className="mr-2 h-4 w-4" />
            Abbrechen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
