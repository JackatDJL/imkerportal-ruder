import { type apiObjectType, ok, err } from "#utility";
import { zodToConvex, zid } from "convex-helpers/server/zod";
import { z } from "zod";
import { internalQuery, mutation, query } from "#convex/server";
import type { Id, Doc } from "#convex/dataModel";
import { internal } from "#convex/api";
import {
  hiveComponentBaseType,
  hiveComponentDataTypes,
  type hiveComponentTypes,
} from "../schema";

export const listComponents = query({
  handler: async (ctx): apiObjectType<Doc<"hiveComponents">[]> => {
    const components = await ctx.db.query("hiveComponents").collect();

    return ok((s, t) => ({
      status: s.Success,
      type: t.Success,
      data: components,
    })).object();
  },
});

export const listColonyComponents = query({
  args: zodToConvex(
    z.object({
      colonyId: zid("colonies").optional(),
      colonyIdentifier: z.string().startsWith("f").min(2).optional(),
    }),
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
    if (args.colonyId) {
      components = await ctx.db
        .query("hiveComponents")
        .filter((q) => q.eq(q.field("assignedColony"), args.colonyId))
        .collect();
    } else if (args.colonyIdentifier) {
      // First, find the colony ID from the identifier
      const colony = await ctx.db
        .query("colonies")
        .filter((q) => q.eq(q.field("identifier"), args.colonyIdentifier))
        .first();

      if (!colony) {
        return err((s, t) => ({
          status: s.NotFound,
          type: t.NotFound,
          error: "colony_not_found",
          message: `Colony with identifier ${args.colonyIdentifier} not found`,
        })).object();
      }

      components = await ctx.db
        .query("hiveComponents")
        .filter((q) => q.eq(q.field("assignedColony"), colony._id))
        .collect();
    }

    if (components.length === 0) {
      return ok((s, t) => ({
        status: s.Success,
        type: t.SuccessNoData,
        data: [],
        message: `No components found for colony with ID ${"colonyId" in args ? args.colonyId : args.colonyIdentifier}`,
      })).object();
    }
    return ok((s, t) => ({
      status: s.Success,
      type: t.Success,
      data: components,
    })).object();
  },
});

export const getComponent = query({
  args: zodToConvex(
    z.object({
      componentId: zid("hiveComponents").optional(),
      identifier: z.string().startsWith("f").min(2).optional(),
    }),
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
  },
});

export const internalGenerateComponentIdentifier = internalQuery({
  args: zodToConvex(
    z.object({
      componentType: z.enum([
        "Zarge",
        "Boden",
        "Deckel",
        "One Way Gate",
        "Königinnenabsperrgitter",
        "Futterraum",
      ]),
    }),
  ),
  handler: async (ctx, args) => {
    const components = await ctx.db.query("hiveComponents").collect();
    const identifiers = components.map((component) => component.identifier);
    let identifier: string;
    let i = 1;
    let prefix: string;

    switch (args.componentType) {
      case "Zarge":
        prefix = "z";
        break;
      case "Boden":
        prefix = "b";
        break;
      case "Deckel":
        prefix = "d";
        break;
      case "One Way Gate":
        prefix = "o";
        break;
      case "Königinnenabsperrgitter":
        prefix = "k";
        break;
      case "Futterraum":
        prefix = "fd";
        break;
    }

    do {
      identifier = `${prefix}${i}`;
      i++;
    } while (identifiers.includes(identifier));

    return identifier;
  },
});

export const generateComponentIdentifier = query({
  args: zodToConvex(
    z.object({
      componentType: z.enum([
        "Zarge",
        "Boden",
        "Deckel",
        "One Way Gate",
        "Königinnenabsperrgitter",
        "Futterraum",
      ]),
    }),
  ),
  handler: async (ctx, args): apiObjectType<string> => {
    const query = await ctx.runQuery(
      internal.hive.components.internalGenerateComponentIdentifier,
      args,
    );

    return ok((s, t) => ({
      status: s.Success,
      type: t.Success,
      data: query,
    })).object();
  },
});

export const createComponentType = z.object({
  data: z.discriminatedUnion("type", [
    z
      .object({
        identifier: z.string().startsWith("z").optional(),
        type: z.literal("Zarge"),
      })
      .merge(hiveComponentBaseType.omit({ type: true, internalData: true })) // Changed from _internal
      .merge(hiveComponentDataTypes),
    z
      .object({
        identifier: z.string().startsWith("b").optional(),
        type: z.literal("Boden"),
      })
      .merge(hiveComponentBaseType.omit({ type: true, internalData: true })) // Changed from _internal
      .merge(
        hiveComponentDataTypes.omit({
          frameSize: true,
          maxFrames: true,
          currentlyHolding: true,
        }),
      ),
    z
      .object({
        identifier: z.string().startsWith("d").optional(),
        type: z.literal("Deckel"),
        internalData: z.object({
          // Changed from _internal
          virtualPosition: z.object({
            type: z.literal("forceTop"),
            forceFromTop: z.literal(0),
          }),
        }),
      })
      .merge(hiveComponentBaseType.omit({ type: true, internalData: true })) // Changed from _internal
      .merge(
        hiveComponentDataTypes.omit({
          frameSize: true,
          maxFrames: true,
          currentlyHolding: true,
        }),
      ),
    z
      .object({
        identifier: z.string().startsWith("o").optional(),
        type: z.literal("One Way Gate"),
      })
      .merge(hiveComponentBaseType.omit({ type: true, internalData: true })) // Changed from _internal
      .merge(
        hiveComponentDataTypes.omit({
          frameSize: true,
          maxFrames: true,
          currentlyHolding: true,
        }),
      ),
    z
      .object({
        identifier: z.string().startsWith("k").optional(),
        type: z.literal("Königinnenabsperrgitter"),
      })
      .merge(hiveComponentBaseType.omit({ type: true, internalData: true })) // Changed from _internal
      .merge(
        hiveComponentDataTypes.omit({
          frameSize: true,
          maxFrames: true,
          currentlyHolding: true,
        }),
      ),
    z
      .object({
        identifier: z.string().startsWith("fd").optional(),
        type: z.literal("Futterraum"),
        internalData: z.object({
          // Changed from _internal
          virtualPosition: z.object({
            type: z.literal("forceTop"),
            forceFromTop: z.literal(1),
          }),
        }),
      })
      .merge(hiveComponentBaseType.omit({ type: true, internalData: true })) // Changed from _internal
      .merge(
        hiveComponentDataTypes.omit({
          frameSize: true,
          maxFrames: true,
          currentlyHolding: true,
        }),
      ),
  ]),
});

export const createComponent = mutation({
  args: zodToConvex(createComponentType),
  handler: async (ctx, args): apiObjectType<Id<"hiveComponents">> => {
    const components = await ctx.db.query("hiveComponents").collect();
    let identifier: string;
    if (!args.data.identifier) {
      identifier = await ctx.runQuery(
        internal.hive.components.internalGenerateComponentIdentifier,
        {
          componentType: args.data.type,
        },
      );
    } else {
      identifier = args.data.identifier;
      if (components.some((component) => component.identifier === identifier)) {
        return err((s, t) => ({
          status: s.Conflict,
          type: t.ConflictDuplicate,
          error: "colony_identifier_exists",
          message: `Colony with identifier ${identifier} already exists`,
        })).object();
      }
    }

    const newComponentOrderIndex = args.data.orderIndex;
    const assignedColonyId = args.data.assignedColony;

    // If an orderIndex is provided and a colony is assigned, adjust existing components
    if (newComponentOrderIndex !== undefined && assignedColonyId) {
      const existingColonyComponents = await ctx.db
        .query("hiveComponents")
        .filter((q) => q.eq(q.field("assignedColony"), assignedColonyId))
        .collect();

      // Sort existing components by their current orderIndex to ensure correct re-indexing
      const sortedExistingComponents = [...existingColonyComponents].sort(
        (a, b) => {
          const aIndex = a.orderIndex ?? Number.POSITIVE_INFINITY;
          const bIndex = b.orderIndex ?? Number.POSITIVE_INFINITY;
          return aIndex - bIndex;
        },
      );

      // Increment orderIndex for components that will be shifted down
      const updates = sortedExistingComponents.map(async (comp) => {
        const currentOrderIndex =
          comp.orderIndex ?? sortedExistingComponents.length; // Default to end if not set
        if (currentOrderIndex >= newComponentOrderIndex) {
          await ctx.db.patch(comp._id, { orderIndex: currentOrderIndex + 1 });
        }
      });
      await Promise.all(updates);
    }

    const helper: z.infer<typeof hiveComponentTypes> = {
      ...args.data,
      identifier,
      // orderIndex is already part of args.data due to the merge with hiveComponentBaseType
    };

    const response = await ctx.db.insert("hiveComponents", helper);

    return ok((s, t) => ({
      status: s.Success,
      type: t.Success,
      data: response,
    })).object();
  },
});

export const updateComponentOrder = mutation({
  args: zodToConvex(
    z.object({
      orderedIdentifiers: z.array(z.string()), // Array of component identifiers in the new order
    }),
  ),
  handler: async (ctx, args): apiObjectType<boolean> => {
    const { orderedIdentifiers } = args;
    const updates = orderedIdentifiers.map(async (identifier, index) => {
      const component = await ctx.db
        .query("hiveComponents")
        .filter((q) => q.eq(q.field("identifier"), identifier))
        .first();
      if (component) {
        await ctx.db.patch(component._id, { orderIndex: index });
      }
    });
    await Promise.all(updates);
    return ok((s, t) => ({
      status: s.Success,
      type: t.Success,
      data: true,
      message: "Component order updated successfully",
    })).object();
  },
});

// need internal mutation "moveComponent" to move components between colonies and to storage

//
