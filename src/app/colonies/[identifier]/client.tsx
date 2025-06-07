/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { type Preloaded, usePreloadedQuery } from "convex/react";
import { type api } from "#convex/api";
import { deconstruct } from "~/server/utility";
import { notFound } from "next/navigation";

export function CatchedColoniesClientPage(props: {
  colonyQuery: Preloaded<typeof api.colonies.getColony>;
  identifier: string;
}) {
  const { colonyQuery, identifier } = props;
  const colonyApi = usePreloadedQuery(colonyQuery);
  if (colonyApi.isErr()) notFound();

  const colony = deconstruct(colonyApi);

  return <p>{JSON.stringify(colony)}</p>;
}
