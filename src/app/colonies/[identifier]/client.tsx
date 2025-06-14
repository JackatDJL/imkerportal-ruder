"use client";
import {
  type Preloaded,
  usePreloadedQuery,
  useQuery,
  useMutation,
} from "convex/react";
import { api } from "#convex/api";
import { deconstruct, result } from "~/server/utility";
import { notFound } from "next/navigation";
import posthog from "posthog-js";
import { Card } from "~/components/ui/card";
import VisualHiveStack from "@/src/components/hive-stack";
import { toast } from "sonner";

export function CatchedColoniesClientPage(props: {
  colonyQuery: Preloaded<typeof api.hive.colonies.getColony>;
  identifier: string;
}) {
  const { colonyQuery, identifier } = props;
  posthog.capture("view-colony", {
    identifier,
  });
  const colonyResponse = usePreloadedQuery(colonyQuery);
  const colonyApi = result(colonyResponse);
  console.dir(colonyApi, {
    depth: Number.POSITIVE_INFINITY,
    colors: true,
    showHidden: true,
  });

  if (colonyApi.isErr()) notFound();

  const colony = deconstruct(colonyApi);
  const data = colonyApi.value.data;

  // Fetch components for this colony
  const componentsQuery = useQuery(api.hive.components.listColonyComponents, {
    colonyIdentifier: identifier,
  });
  const componentsResult = result(componentsQuery);
  const components = componentsResult.isOk() ? componentsResult.value.data : [];

  const updateComponentOrderMutation = useMutation(
    api.hive.components.updateComponentOrder,
  );

  const handleComponentMove = async (newOrderedIdentifiers: string[]) => {
    try {
      const response = await updateComponentOrderMutation({
        orderedIdentifiers: newOrderedIdentifiers,
      });
      const resultData = result(response);
      if (resultData.isOk()) {
        toast.success("Component order updated successfully!");
      } else {
        toast.error(
          `Failed to update component order: ${JSON.stringify(resultData.error)}`,
        );
      }
    } catch (error) {
      console.error("Error updating component order:", error);
      toast.error(
        "An unexpected error occurred while updating component order.",
      );
    }
  };

  return (
    <div className="mx-auto flex w-[90%] gap-4 p-4">
      <div className="w-[30%]">
        {data && (
          <VisualHiveStack
            colony={data}
            components={components ?? []}
            liveEdit={true} // Enable live editing
            onMove={handleComponentMove} // Pass the move handler
          />
        )}
      </div>
      <Card className="flex-1 p-4">
        <pre>{JSON.stringify(colony, null, 2)}</pre>
      </Card>
    </div>
  );
}
