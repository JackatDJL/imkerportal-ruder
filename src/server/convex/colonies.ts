import {
  mutation,
  type MutationCtx,
  query,
  type QueryCtx,
} from "#convex/server";
import { z } from "zod";
import { zodToConvex, zid } from "convex-helpers/server/zod";
import { type Doc } from "#convex/dataModel";
import { type apiType, ok, err } from "~/server/utility";

export const listColonies = query({
  handler: async (ctx) => {
    const colonies = await ctx.db.query("colonies").order("desc").collect();
    return colonies;
  },
});

export const getColony = query({
  args: zodToConvex(
    z.object({
      colonyId: zid("colony").optional(),
      identifier: z.string().startsWith("f").min(2).optional(),
    }),
  ),
  handler: async (ctx, args): apiType<Doc<"colonies">> => {
    if (!args.colonyId && !args.identifier) {
      return err()
        .ValidationError()
        .error("missing_colony_identifier")
        .message("Either colonyId or identifier must be provided")
        .build();
    }

    let colony;
    switch (args.colonyId ? "colonyId" : "identifier") {
      case "colonyId":
        colony = await ctx.db
          .query("colonies")
          .filter((q) => q.eq("_id", args.colonyId!.toString()))
          .first();
        break;
      case "identifier":
        colony = await ctx.db
          .query("colonies")
          .filter((q) => q.eq("identifier", args.identifier))
          .first();
        break;
    }
    if (!colony) {
      return err((s, t) => ({
        status: s.NotFound,
        type: t.NotFound,
        error: "colony_not_found",
        message: `Colony with ID ${"colonyId" in args ? args.colonyId : args.identifier} not found`,
      }));
    }

    return ok().Success().data(colony).build();
  },
});

async function generateColonyIdentifier(
  ctx: MutationCtx | QueryCtx,
  prefetchedQuery?: Doc<"colonies">[],
) {
  let query = prefetchedQuery;
  query ??= await ctx.db.query("colonies").collect();
  const identifiers = query.map((colony) => colony.identifier);
  let identifier: string;
  let i = 1;
  while (true) {
    identifier = `f${i}`;
    if (!identifiers.includes(identifier)) {
      break;
    }
    i++;
  }
  return identifier;
}

export const genNewColonyIdentifier = query({
  handler: async (ctx) => {
    return generateColonyIdentifier(ctx);
  },
});

export const createColony = mutation({
  args: zodToConvex(
    z.object({
      identifier: z.string().startsWith("f").min(2).optional(),
      location: z.string().optional(),
      hiveType: z
        .union([
          z.object({ type: z.literal("Deutsch Normalmaß (DNM)") }),
          z.object({ type: z.literal("Dadant US") }),
          z.object({ type: z.literal("Dadant Blatt") }),
          z.object({ type: z.literal("Zander") }),
          z.object({ type: z.literal("Langstroth") }),
          z.object({ type: z.literal("MiniPlus") }),
          z.object({ type: z.literal("Warré") }),
          z.object({ type: z.literal("Einraumbeute") }),
          z.object({ type: z.literal("Sonstiges"), description: z.string() }),
        ])
        .default({ type: "Deutsch Normalmaß (DNM)" }),
      createdAt: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional(),
      // .default(() => new Date().toISOString().slice(0, 10)), // YYYY-MM-DD format
    }),
  ),
  handler: async (ctx, args) => {
    const colonies = await ctx.db.query("colonies").collect();
    let identifier: string;
    if (!args.identifier) {
      identifier = await generateColonyIdentifier(ctx, colonies);
    } else {
      identifier = args.identifier;
      if (colonies.some((colony) => colony.identifier === identifier)) {
        throw new Error(`Colony with identifier ${identifier} already exists`);
      }
    }

    const newColony = await ctx.db.insert("colonies", {
      identifier,
      location: args.location,
      hiveType: args.hiveType ?? { type: "Deutsch Normalmaß (DNM)" },
      createdAt: args.createdAt ?? new Date().toISOString().slice(0, 10),
    });

    return newColony;
  },
});
