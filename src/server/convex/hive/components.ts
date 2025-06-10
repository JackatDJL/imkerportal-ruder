import { type Doc } from "#convex/dataModel";
import { query } from "#convex/server";
import { type apiObjectType, ok, err } from "#utility";
import { zodToConvex, zid } from "convex-helpers/server/zod";
import { z } from "zod";

export const listComponents = query({
  handler: async (ctx): apiObjectType<Doc<"hiveComponents">[]> => {
    const components = await ctx.db.query("hiveComponents").collect();

    return ok((s, t) => ({
      status: s.Success,
      type: t.Success,
      data: components,
    })).object();
  }
})

export const listColonyComponents = query({
  args: zodToConvex(
    z.object({
      colonyId: zid("colonies").optional(),
      colonyIdentifier: z.string().startsWith("f").min(2).optional(),
    })
  ),
  handler: async (ctx, args): apiObjectType<Doc<"hiveComponents">[]> => {
    if (!args.colonyId && !args.colonyIdentifier) {
      return err((s, t) => ({
        status: s.ValidationError,
        type: t.ValidationErrorUnknown,
        error: "missing_colony_identifier",
        message: "Either colonyId or colonyIdentifier must be provided",
      })).object();
    }

    let components: Doc<"hiveComponents">[] = [];
    switch (args.colonyId ? "colonyId" : "colonyIdentifier") {
      case "colonyId":
        components = await ctx.db
          .query("hiveComponents")
          .filter((q) => q.eq(q.field("_id"), args.colonyId!.toString()))
          .collect();
        break;
      case "colonyIdentifier":
        components = await ctx.db
          .query("hiveComponents")
          .filter((q) => q.eq(q.field("identifier"), args.colonyIdentifier))
          .collect();
        break;

    }
    if (components.length === 0) {
      return err((s, t) => ({
        status: s.NotFound,
        type: t.NotFound,
        error: "colony_components_not_found",
        message: `No components found for colony with ID ${"colonyId" in args ? args.colonyId : args.colonyIdentifier}`,
      })).object();
    }
    return ok((s, t) => ({
      status: s.Success,
      type: t.Success,
      data: components,
    })).object();
  }
})

export const getComponent = query({
  args: zodToConvex(
    z.object({
      componentId: zid("hiveComponents").optional(),
      identifier: z.string().startsWith("f").min(2).optional(),
    })
  ),
  handler: async (ctx, args): apiObjectType<Doc<"hiveComponents">> => {
    if (!args.componentId && !args.identifier) {
      return err((s, t) => ({
        status: s.ValidationError,
        type: t.ValidationErrorUnknown,
        error: "missing_component_identifier",
        message: "Either componentId or identifier must be provided",
      })).object();
    }

    let component: Doc<"hiveComponents"> | null = null;
    switch (args.componentId ? "componentId" : "identifier") {
      case "componentId":
        component = await ctx.db
          .query("hiveComponents")
          .filter((q) => q.eq(q.field("_id"), args.componentId!.toString()))
          .first();
        break;
      case "identifier":
        component = await ctx.db
          .query("hiveComponents")
          .filter((q) => q.eq(q.field("identifier"), args.identifier))
          .first();
        break;
    }

    if (!component) {
      return err((s, t) => ({
        status: s.NotFound,
        type: t.NotFound,
        error: "component_not_found",
        message: `Component with ID ${"componentId" in args ? args.componentId : args.identifier} not found`,
      })).object();
    }

    return ok((s, t) => ({
      status: s.Success,
      type: t.Success,
      data: component,
    })).object();
  }
})