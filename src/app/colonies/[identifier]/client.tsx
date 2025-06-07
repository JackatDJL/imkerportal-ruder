"use client";
import { type Preloaded, usePreloadedQuery } from "convex/react";
import { type api } from "#convex/api";
import { deconstruct, result } from "~/server/utility";
import { notFound } from "next/navigation";
import posthog from "posthog-js";

export function CatchedColoniesClientPage(props: {
  colonyQuery: Preloaded<typeof api.colonies.getColony>;
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

  return <p>{JSON.stringify(colony)}</p>;
  // return (
  //   <p>
  //     data
  //   </p>
  // )
}
