import { api } from "#convex/api";
import { preloadQuery } from "convex/nextjs";
import { CatchedColoniesClientPage } from "./client";
import { redirect } from "next/navigation";

export default async function ColonyPage({
  params,
}: {
  params: Promise<{ identifier: string }>;
}) {
  const { identifier } = await params;

  if (!identifier.startsWith("f") || identifier.length < 2) {
    redirect(`/${identifier}`);
  }

  const colony = await preloadQuery(api.hive.colonies.getColony, { identifier });

  return (
    <CatchedColoniesClientPage colonyQuery={colony} identifier={identifier} />
  );
}
