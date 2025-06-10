"use client";
import { type Preloaded, usePreloadedQuery } from "convex/react";
import { type api } from "#convex/api";
import { deconstruct, result } from "~/server/utility";
import { notFound } from "next/navigation";
import posthog from "posthog-js";
import { Card } from "~/components/ui/card";
import VisualHiveStack from "@/src/components/hive-stack";

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
    depth: Infinity,
    colors: true,
    showHidden: true,
  });

  if (colonyApi.isErr()) notFound();

  const colony = deconstruct(colonyApi);

  const data = colonyApi.value.data;

  return (
    <div className="mx-auto flex w-[90%] gap-4 p-4">
      <div className="w-[30%]">
        {data && <VisualHiveStack colony={data} components={[]} />}
      </div>
      <Card className="flex-1 p-4">
        <pre>{JSON.stringify(colony, null, 2)}</pre>
      </Card>
    </div>
  );
}
