// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { zodToConvex, zid } from "convex-helpers/server/zod";
import { z } from "zod";

const strength = z
  .tuple([
    z.object({
      value: z
        .union([
          z.literal("1"), // Sehr Schwach
          z.literal("2"), // Schwach
          z.literal("3"), // Mittel
          z.literal("4"), // Stark
          z.literal("5"), // Sehr Stark
        ])
        .default("3"),
    }),
    z
      .object({
        count: z.number().default(12),
      })
      .optional(),
    z
      .object({
        broodBoxCount: z.number().default(0),
        honeyBoxCount: z.number().default(0),
        broodBoxOccupation: z.string().optional(),
        honeyBoxOccupation: z.string().optional(),
      })
      .optional(),
    z.object({ description: z.string() }).optional(),
  ])
  .optional();

const condition = z
  .enum([
    "new",
    "good",
    "used",
    "worn",
    "needs repair",
    "disinfected",
    "wax residue",
  ])
  .default("new");

const weather = z
  .object({
    temperatureCelsius: z.number(),
    precipitation: z.enum([
      "none",
      "drizzle",
      "light rain",
      "rain",
      "heavy rain",
      "hail",
      "snow",
    ]),
    wind: z.enum([
      "calm",
      "light breeze",
      "moderate wind",
      "strong wind",
      "storm",
    ]),
    cloudCover: z.enum([
      "sunny",
      "lightly cloudy",
      "cloudy",
      "heavily cloudy",
      "overcast",
    ]),
    humidityPercentage: z.number().min(0).max(100),
  })
  .optional();

const hiveComponentBaseType = z.object({
  identifier: z
    .string()
    .startsWith("z")
    .or(
      // Zarge
      z.string().startsWith("b"), // Boden
    )
    .or(
      z.string().startsWith("d"), // Deckel
    )
    .or(
      z.string().startsWith("o"), // One Way Gate
    )
    .or(
      z.string().startsWith("k"), // Königinnenabsperrgitter
    )
    .or(
      z.string().startsWith("f"), // Futterraum
    ),
  type: z
    .union([
      z.literal("Zarge"),
      z.literal("Boden"),
      z.literal("Deckel"),
      z.literal("One Way Gate"),
      z.literal("Königinnenabsperrgitter"),
      z.literal("Futterraum"),
    ])
    .default("Zarge"),
  _internal: z
    .object({
      virtualPosition: z
        .union([
          z.object({
            type: z.literal("forceTop"),
            forceFromTop: z.number().positive().int(), // Position of a Component from the top of the hive
          }),
          z.object({
            type: z.literal("forceBottom"),
            forceFromBottom: z.number().positive().int(), // Position of a Component from the bottom of the hive
          }),
        ])
        .optional(), // expandable once needed
    })
    .optional(),
});

const hiveComponentDataTypes = z.object({
  asignedColony: zid("colonies"), // Foreign key to colonies table
  // The usability and optionality of entries should be omited below (hiveComponentDataTypes)
  frameSize: z.union([
    z.literal("Zander"),
    z.literal("Dadant Brut"),
    z.literal("Dadant Honig"),
    z.literal("DNM (Deutsch Normalmaß)"),
    z.literal("Langstroth"),
    z.literal("MiniPlus"),
    z.object({
      type: z.literal("Sonstiges"), // Custom frame size
      description: z.string(), // Custom frame size description
    }),
  ]),
  maxFrames: z.number().int().positive().default(12), // Maximum number of frames this component can hold
  currentlyHolding: z.number().int().nonnegative().default(0), // Currently occupied frames
  usedSince: z.string().regex(/^\d{2}-\d{2}-\d{4}$/), // DD-MM-YYYY format
  condition,
  lastCleaned: z
    .string()
    .regex(/^new|\d{4}-\d{2}-\d{2}$/)
    .default("new"), // "new" or YYYY-MM-DD format
  location: z.string().optional(), // Optional location for the component
  notes: z.string().optional(), // Optional notes about the component
});

const hiveComponentTypes = z.discriminatedUnion("type", [
  z
    .object({
      identifier: z.string().startsWith("z"),
      type: z.literal("Zarge"),
    })
    .merge(hiveComponentBaseType.omit({ type: true }))
    .merge(hiveComponentDataTypes),
  z
    .object({
      identifier: z.string().startsWith("b"),
      type: z.literal("Boden"),
    })
    .merge(hiveComponentBaseType.omit({ type: true }))
    .merge(
      hiveComponentDataTypes.omit({
        frameSize: true,
        maxFrames: true,
        currentlyHolding: true,
      }),
    ),
  z
    .object({
      identifier: z.string().startsWith("d"),
      type: z.literal("Deckel"),
      _internal: z.object({
        virtualPosition: z.object({
          type: z.literal("forceTop"),
          forceFromTop: z.literal(0),
        }),
      }),
    })
    .merge(hiveComponentBaseType.omit({ type: true, _internal: true }))
    .merge(
      hiveComponentDataTypes.omit({
        frameSize: true,
        maxFrames: true,
        currentlyHolding: true,
      }),
    ),
  z
    .object({
      identifier: z.string().startsWith("o"),
      type: z.literal("One Way Gate"),
    })
    .merge(hiveComponentBaseType.omit({ type: true }))
    .merge(
      hiveComponentDataTypes.omit({
        frameSize: true,
        maxFrames: true,
        currentlyHolding: true,
      }),
    ),
  z
    .object({
      identifier: z.string().startsWith("k"),
      type: z.literal("Königinnenabsperrgitter"),
    })
    .merge(hiveComponentBaseType.omit({ type: true }))
    .merge(
      hiveComponentDataTypes.omit({
        frameSize: true,
        maxFrames: true,
        currentlyHolding: true,
      }),
    ),
  z
    .object({
      identifier: z.string().startsWith("f"),
      type: z.literal("Futterraum"),
      _internal: z.object({
        virtualPosition: z.object({
          type: z.literal("forceTop"),
          forceFromTop: z.literal(1),
        }),
      }),
    })
    .merge(hiveComponentBaseType.omit({ type: true, _internal: true }))
    .merge(
      hiveComponentDataTypes.omit({
        frameSize: true,
        maxFrames: true,
        currentlyHolding: true,
      }),
    ),
]);

export default defineSchema({
  // I. Völkerübersicht (Bee Colony Overview)
  colonies: defineTable(
    zodToConvex(
      z.object({
        identifier: z.string().startsWith("f"),
        location: z.string().optional(),
        hiveType: z
          .union([
            z.object({ type: z.literal("Dadant US") }),
            z.object({ type: z.literal("Dadant Blatt") }),
            z.object({ type: z.literal("Zander") }),
            z.object({ type: z.literal("Langstroth") }),
            z.object({ type: z.literal("Deutsch Normalmaß (DNM)") }),
            z.object({ type: z.literal("MiniPlus") }),
            z.object({ type: z.literal("Warré") }),
            z.object({ type: z.literal("Einraumbeute") }),
            z.object({ type: z.literal("Sonstiges"), description: z.string() }),
          ])
          .default({ type: "Deutsch Normalmaß (DNM)" }),
        queenOrigin: z.string().optional(),
        queenBirthYear: z
          .string()
          .regex(/^\d{4}$/)
          .default(String(new Date().getFullYear())), // YYYY format
        queenMarked: z
          .union([
            z.literal("Weiß (Jahr endet auf 1 od. 6)"),
            z.literal("Gelb (Jahr endet auf 2 od. 7)"),
            z.literal("Rot (Jahr endet auf 3 od. 8)"),
            z.literal("Grün (Jahr endet auf 4 od. 9)"),
            z.literal("Blau (Jahr endet auf 5 od. 0)"),
            z.literal("Nicht gezeichnet"),
          ])
          .default("Nicht gezeichnet"),
        queenTraits: z
          .object({
            gentleness: z
              .union([
                z.literal("1"), // Sehr Sanft
                z.literal("2"), // Sanft
                z.literal("3"), // Normal
                z.literal("4"), // Stechlustig
                z.literal("5"), // Sehr Stechlustig
              ])
              .default("3"),
            swarmingTendency: z
              .union([
                z.literal("1"), // Sehr Gering
                z.literal("2"), // Gering
                z.literal("3"), // Mittel
                z.literal("4"), // Stark
                z.literal("5"), // Sehr Stark
              ])
              .default("3"),
            combSitting: z
              .union([
                z.literal("1"), // Sehr Ruhig
                z.literal("2"), // Ruhig
                z.literal("3"), // Normal
                z.literal("4"), // Läuferisch
                z.literal("5"), // Sehr Läuferisch
              ])
              .default("3"),
            layingPerformance: z
              .union([
                z.literal("1"), // Schwach
                z.literal("2"), // Unterdurchschnittlich
                z.literal("3"), // Durchschnittlich
                z.literal("4"), // Gut
                z.literal("5"), // Sehr Gut
              ])
              .default("3"),
            honeyPerformance: z
              .union([
                z.literal("1"), // Schwach
                z.literal("2"), // Unterdurchschnittlich
                z.literal("3"), // Durchschnittlich
                z.literal("4"), // Gut
                z.literal("5"), // Sehr Gut
              ])
              .optional(),
            diseaseSusceptibility: z
              .union([
                z.literal("low"), // Gering
                z.literal("medium"), // Mittel
                z.literal("high"), // Hoch
              ])
              .optional(),
            otherTraits: z.string().optional(),
          })
          .default({
            gentleness: "3",
            swarmingTendency: "3",
            combSitting: "3",
            layingPerformance: "3",
            honeyPerformance: undefined,
            diseaseSusceptibility: undefined,
            otherTraits: undefined,
          }),
        currentStrength: strength,
        createdAt: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .default(() => new Date().toISOString().slice(0, 10)), // YYYY-MM-DD format
        dissolvedAt: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional(), // YYYY-MM-DD
        notes: z.string().optional(),
      }),
    ),
  )
    .index("by_identifier", ["identifier"])
    .index("by_location", ["location"]),

  // II. Völkerdurchsicht (Colony Inspection)
  colonyInspections: defineTable(
    zodToConvex(
      z.object({
        identifier: z.string().startsWith("v"),
        targetColony: zid("colonies"),
        date: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .default(() => new Date().toISOString().slice(0, 10)), // YYYY-MM-DD format
        weather,
        strength,
        sawQueen: z.boolean().default(false),
        broodPresent: z.boolean().default(false),
        larvaePresent: z.boolean().default(false),
        cappedBrood: z.union([
          z.object({
            present: z.literal(true),
            frameCount: z.number(),
            averageFrameAreaPercentage: z.number(),
            broodQuality: z.enum(["very good", "good", "patchy", "poor"]),
            notes: z.string().optional(),
          }),
          z.object({
            present: z.literal(false),
          }),
        ]),
        queenBrood: z.array(
          z.object({
            count: z.number(),
            type: z.enum([
              "swarm cell",
              "supersedure cell",
              "play cup",
              "silent supersedure cell",
            ]),
            condition: z.enum([
              "open (unfertilized)",
              "fertilized",
              "larva visible",
              "capped",
              "hatched",
              "eaten out",
              "destroyed",
            ]),
          }),
        ),
        droneBrood: z.enum([
          "none",
          "few",
          "normal",
          "many",
          "drone brood present",
        ]),
        foodStores: z.object({
          honey: z.enum([
            "none",
            "very low",
            "low",
            "medium",
            "high",
            "very high",
          ]),
          pollen: z.enum([
            "none",
            "very low",
            "low",
            "medium",
            "high",
            "very high",
          ]),
          notes: z.string().optional(),
        }),
        behavior: z.enum([
          "gentle",
          "calm",
          "nervous",
          "flighty",
          "defensive",
          "aggressive",
        ]),
        diseaseSigns: z.string().optional(),
        varroaControlMethod: z
          .enum([
            "bottom board diagnosis", // Gemülldiagnose
            "powder sugar method", // Puderzuckermethode
            "wash method", // Auswaschmethode
            "drone brood removal", // Bannwabenverfahren
            "no control performed", // Keine durchgeführt
            "visual inspection", // Sichtkontrolle
          ])
          .default("visual inspection"),
        varroaControlResult: z
          .string()
          .regex(
            /^(0|[1-9]\d*) Milben( pro Tag| in 3 Tagen)?|^(0|[1-9]\d*)\s?M(ilben)?(\s?\/\s?(Tag(en)?)?|(\s?in\s?(3\s?)?Tag(en)?))?$|^(0|[1-9]\d*)\s?[m](ilben)?(\s?\/\s?(Tag(en)?)?|(\s?in\s?(3\s?)?Tag(en)?))?$|^(0|[1-9]\d*)\s?[m,M](\/|\s?\/\s?)[d,h,D,H,T,t,s,S](tunde(n)?)?$/,
            "Invalid varroa control result format. Expected 'X Milben pro Tag' or 'X Milben in 3 Tagen' or 'X M / 3 d'.",
          )
          .optional(),
        actionsPerformed: z.array(
          z.union([
            z.object({
              action: z.literal("honey super added"), // Honigraum aufgesetzt
              id: zid("hiveComponents"),
            }),
            z.object({
              action: z.literal("honey super removed"),
              id: zid("hiveComponents"),
            }),
            z.object({
              action: z.literal("added queen stopper"), // Königinnenabsperrgitter hinzugefügt
              id: zid("hiveComponents"),
            }),
            z.object({
              action: z.literal("removed queen stopper"),
              id: zid("hiveComponents"),
            }),
            z.object({
              action: z.literal("added one way"), // Einwegventil hinzugefügt
              id: zid("hiveComponents"),
            }),
            z.object({
              action: z.literal("removed one way"),
              id: zid("hiveComponents"),
            }),
            z.object({
              action: z.literal("added drawn comb"), // Ausgebaute Wabe hinzugefügt
              id: zid("hiveComponents"),
            }),
            z.object({
              action: z.literal("removed drawn comb"),
              id: zid("hiveComponents"),
            }),
            z.object({
              action: z.literal("wax hygiene"), // Wabenhygiene
              type: z.enum(["removed old comb", "rearranged combs"]),
              count: z.number().optional(),
            }),
            z.object({
              action: z.literal("created split"), // Ableger erstellt
              id: zid("colonies"),
              // Nicht vergessen in api auch removed zu appenden
              broodFrames: z.number(),
              feedFrames: z.number(),
              beeMass: z.string().optional(), // e.g., "1 kg", "500 g"
              notes: z.string().optional(),
            }),
            z.object({
              action: z.literal("swarm check"), // Schwarmkontrolle
            }),
            z.object({
              action: z.literal("broke queen cells"), // Weiselzellen gebrochen
              count: z.number(),
            }),
            z.object({
              action: z.literal("fed"), // Gefüttert
              type: z.enum([
                "refill feeding frame", // Futterwabe aufgefüllt
                "add feeding frame", // Futterwabe hinzugefügt
                "remove feeding frame", // Futterwabe entfernt
              ]),
              feedingId: zid("feedings"),
            }),
            z.object({
              action: z.literal("treatment"), // Behandelt Varroa
              type: z.enum(["varroa", "other"]),
              note: z.string(),
              treatmentId: zid("treatments"),
            }),
            z.object({
              action: z.literal("other"), // Sonstiges
              description: z.string(),
            }),
          ]),
        ),
        nextInspectionDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional(), // YYYY-MM-DD
        notes: z.string().optional(),
      }),
    ),
  )
    .index("by_identifier", ["identifier"])
    .index("by_targetColony", ["targetColony"]),

  // III. Zargenverwaltung (Hive Box/Component Management)

  hiveComponents: defineTable(zodToConvex(hiveComponentTypes))
    .index("by_identifier", ["identifier"])
    .index("by_asignedColony", ["asignedColony"])
    .index("by_type", ["type"]),

  // IV. Behandlungen & Fütterung (Treatments & Feeding)

  feedings: defineTable(
    zodToConvex(
      (() => {
        const extend = z.object({
          identifier: z.string().startsWith("fa"), // Quick access id (autoincremented) // f = feeding a = action fa = feeding action
          targetFeedingFrame: zid("hiveComponents"), // Foreign key to hiveComponents table
          targetColony: zid("colonies"), // Foreign key to colonies table
          medium: z
            .enum([
              "sugar syrup",
              "honey syrup",
              "pollen substitute",
              "pollen substitute patty",
              "candy",
              "liquid feed",
              "dry feed",
            ])
            .default("sugar syrup"), // Futtermedium
          amountKgOrL: z.number().positive(), // Menge in kg oder Liter
        });
        return z.union([
          z
            .object({
              type: z.literal("regular"), // Normale Winterfütterung
            })
            .merge(extend),
          z
            .object({
              type: z.literal("emergency"),
              reason: z.string(),
            })
            .merge(extend),
        ]);
      })(),
    ),
  ),

  treatments: defineTable(
    zodToConvex(
      z.object({
        identifier: z.string().startsWith("ta"), // Quick access id (autoincremented) // t = treatment a = action ta = treatment action
        targetColony: zid("colonies"), // Foreign key to colonies table
        type: z.enum(["varroa", "other"]).default("varroa"), // Treatment type
        reason: z.string().default("Varroa control"), // Reason for treatment, default to Varroa control
        product: z
          .union([
            z.literal("formic acid"), // Ameisensäure
            z.literal("oxalic acid"), // Oxalsäure
            z.literal("thymol"), // Thymol
            z.object({
              type: z.literal("other"),
              description: z.string(), // Custom product description
            }),
          ])
          .default("formic acid"), // Default to formic acid
        batch: z.string().optional(), // Optional batch number
        concentration: z
          .string()
          .regex(/^(\d+(\.\d+)?\s?%|\d+(\.\d+)?\s?(g|mg)\/(g|kg))$/), // e.g., "60%", "3.5 g/kg"
        applicationMethod: z
          .enum([
            "trickle application", // Träufelmethode
            "vaporization", // Verdampfung
            "fumigation", // Vernebelung
            "spray application", // Sprühmethode
            "pad application", // Pad-Methode
            "strip application", // Streifenmethode
            "powder application", // Puderzuckermethode
            "drone brood removal", // Bannwabenverfahren
          ])
          .default("trickle application"),
        reminder: z
          .object({
            // Execution by Convex backend
            message: z.string(), // Reminder message
          })
          .optional(),
        treatingPerson: z.string(),
        supplier: z.string().optional(), // Optional supplier of the treatment product
        veterinarian: z.string().optional(), // Optional veterinarian
        note: z.string().optional(), // Optional notes about the treatment
      }),
    ),
  )
    .index("by_identifier", ["identifier"])
    .index("by_targetColony", ["targetColony"]),

  // V. Honigernte (Honey Harvest)
  honeyHarvests: defineTable(
    zodToConvex(
      z.object({
        identifier: z.string().startsWith("h"), // Quick access id (autoincremented) // h = honey harvest
        targetColony: zid("colonies"), // Foreign key to colonies table
        type: z.enum([
          "early nectar flow", // Frühtracht
          "rapeseed", // Raps
          "lime", // Linde
          "summer bloom", // Sommerblüte allgemein
          "forest honey", // Waldhonig
          "phacelia", // Phacelia
          "sunflower", // Sonnenblume
          "acacia", // Akazie
          "cornflower", // Kornblume
          "heather", // Heide
          "clover", // Klee
          "fruit blossom", // Obstblüte
          "dandelion", // Löwenzahn
          "buckwheat", // Buchweizen
          "sweet chestnut", // Edelkastanie
          "mixed", // Mischhonig
        ]),
        harvestDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .default(() => new Date().toISOString().slice(0, 10)), // YYYY-MM-DD format

        estimatedAmountPreExtractionKg: z.number().positive(), // Estimated amount before extraction in kg
        actualAmountPostExtractionKg: z.number().positive().optional(), // Actual amount after extraction in kg
        waterContentPercentage: z.number().min(0).max(100).optional(), // Water content in percentage
        notes: z.string().optional(), // Optional notes about the harvest
      }),
    ),
  )
    .index("by_identifier", ["identifier"])
    .index("by_targetColony", ["targetColony"]),

  // VI. Zucht (Queen Breeding) - Für zukünftige Implementierung
  // queen_breeding_series: defineTable({
  //   zuchtserieId: v.string(), // User-defined ID
  //   muttervolkId: v.string(), // Foreign key to colonies.volksId
  //   datum_umlarven: v.string(), // YYYY-MM-DD
  //   anzahl_umgelarvter_zellen: v.number(),
  //   anzahl_angenommener_zellen: v.number(),
  //   pflegevolkIds: v.string(), // User-defined IDs, e.g., comma-separated or JSON string of array
  //   erwartetes_schlupfdatum: v.string(), // YYYY-MM-DD
  //   tatsaechliches_schlupfdatum: v.optional(v.string()), // YYYY-MM-DD
  //   anzahl_geschluepfter_koeniginnen: v.number(),
  //   // Details for one queen produced by this series; might be an array if series produces multiple tracked queens
  //   begattungseinheitId: v.string(), // EWK/Apidea ID
  //   begattungsart: v.union(
  //     v.literal("Belegstelle"),
  //     v.literal("Standbegattet"),
  //     v.literal("Instrumentell besamt"),
  //   ),
  //   belegstelle_name: v.optional(v.string()),
  //   datum_einweiselung_koenigin: v.optional(v.string()), // YYYY-MM-DD
  //   zielvolkId: v.optional(v.string()), // Foreign key to colonies.volksId
  //   begattungserfolg_in_eilage: v.optional(v.boolean()),
  //   neue_koeniginId: v.string(), // User-defined ID for the new queen
  //   bemerkungen_zucht: v.optional(v.string()),
  // })
  //   .index("by_zuchtserieId", ["zuchtserieId"])
  //   .index("by_muttervolkId", ["muttervolkId"])
  //   .index("by_neue_koeniginId", ["neue_koeniginId"]),
});
