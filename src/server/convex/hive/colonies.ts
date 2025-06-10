import {
  internalQuery,
  mutation,
  query,
} from "#convex/server";
import { z } from "zod";
import { zodToConvex, zid } from "convex-helpers/server/zod";
import { type Id, type Doc } from "#convex/dataModel";
import { internal } from "#convex/api";
import { type apiObjectType, ok, err } from "~/server/utility";

export const listColonies = query({
  handler: async (ctx): apiObjectType<Doc<"colonies">[]> => {
    const colonies = await ctx.db.query("colonies").order("desc").collect();
    return ok((s, t) => ({
      status: s.Success,
      type: t.Success,
      data: colonies,
    })).object();
  },
});

export const getColony = query({
  args: zodToConvex(
    z.object({
      colonyId: zid("colonies").optional(),
      identifier: z.string().startsWith("f").min(2).optional(),
    }),
  ),
  handler: async (ctx, args): apiObjectType<Doc<"colonies">> => {
    const query = ctx.runQuery(internal.hive.colonies.internalGetColony, {
      colonyId: args.colonyId,
      identifier: args.identifier,
    });
    return query
  }})

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
  handler: async (ctx, args): apiObjectType<Id<"colonies">> => {
    const colonies = await ctx.db.query("colonies").collect();
    let identifier: string;
    if (!args.identifier) {
      identifier = await ctx.runQuery(internal.hive.colonies.internalGenerateColonyIdentifier, {});
    } else {
      identifier = args.identifier;
      if (colonies.some((colony) => colony.identifier === identifier)) {
        return err((s, t) => ({
          status: s.Conflict,
          type: t.ConflictDuplicate,
          error: "colony_identifier_exists",
          message: `Colony with identifier ${identifier} already exists`,
        })).object();
      }
    }

    const newColony = await ctx.db.insert("colonies", {
      identifier,
      location: args.location,
      hiveType: args.hiveType ?? { type: "Deutsch Normalmaß (DNM)" },
      createdAt: args.createdAt ?? new Date().toISOString().slice(0, 10),
    });

    return ok((s, t) => ({
      status: s.Success,
      type: t.Success,
      data: newColony,
    })).object();
  },
});

export const internalGetColony = internalQuery({
  args: zodToConvex(
    z.object({
      colonyId: zid("colonies").optional(),
      identifier: z.string().startsWith("f").min(2).optional(),
    }),
  ),
  handler: async (ctx, args): apiObjectType<Doc<"colonies">> => {
    if (!args.colonyId && !args.identifier) {
      return err((s, t) => ({
        status: s.ValidationError,
        type: t.ValidationErrorUnknown,
        error: "missing_colony_identifier",
        message: "Either colonyId or identifier must be provided",
      })).object();
    }

    let colony: Doc<"colonies"> | null = null;
    switch (args.colonyId ? "colonyId" : "identifier") {
      case "colonyId":
        colony = await ctx.db
          .query("colonies")
          .filter((q) => q.eq(q.field("_id"), args.colonyId!.toString()))
          .first();
        break;
      case "identifier":
        colony = await ctx.db
          .query("colonies")
          .filter((q) => q.eq(q.field("identifier"), args.identifier))
          .first();
        break;
    }

    if (!colony) {
      return err((s, t) => ({
        status: s.NotFound,
        type: t.NotFound,
        error: "colony_not_found",
        message: `Colony with ID ${"colonyId" in args ? args.colonyId : args.identifier} not found`,
      })).object();
    }

    return ok((s, t) => ({
      status: s.Success,
      type: t.Success,
      data: colony,
    })).object();
  }
})

export const generateColonyIdentifier = query({
  handler: async (ctx): apiObjectType<string> => {
    const query = await ctx.runQuery(internal.hive.colonies.internalGenerateColonyIdentifier, {});
    return ok((s, t) => ({
      status: s.Success,
      type: t.Success,
      data: query,
    })).object();
  }
})

export const internalGenerateColonyIdentifier = internalQuery({
  handler: async (ctx) => {
    const colonies = await ctx.db.query("colonies").collect();
    const identifiers = colonies.map(colony => colony.identifier);
    let identifier: string;
    let i = 1;
    do {
      identifier = `f${i}`;
      i++;
    } while (identifiers.includes(identifier));
    
    return identifier;
  }
})