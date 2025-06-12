import { z, type ZodDiscriminatedUnion, type ZodTypeAny, type ZodDiscriminatedUnionOption } from "zod";

function capitalize(s: string): string {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function createVisibilityCalculator(
  discriminatedUnionSchema: ZodDiscriminatedUnion<string, ReadonlyArray<ZodDiscriminatedUnionOption<string>>>,
  discriminatorValue: string
): Record<string, boolean> {
  const visibilityMap: Record<string, boolean> = {};
  const allFoundFields = new Set<string>();

  // 1. Discover all possible fields from all options in the discriminated union
  for (const optionSchema of discriminatedUnionSchema._def.optionsMap.values()) {
    if (optionSchema instanceof z.ZodObject) {
      for (const key of Object.keys(optionSchema.shape)) {
        allFoundFields.add(key);
      }
    }
  }

  // 2. Initialize visibility for all found fields to false
  for (const field of allFoundFields) {
    visibilityMap[`show${capitalize(field)}`] = false;
  }

  // 3. Set visibility to true for fields present in the specific schema for the discriminatorValue
  const specificSchema = discriminatedUnionSchema._def.optionsMap.get(discriminatorValue);
  if (specificSchema && specificSchema instanceof z.ZodObject) {
    const shape = specificSchema.shape as Record<string, ZodTypeAny>;
    for (const field of Object.keys(shape)) {
      // Ensure the field was part of the initially discovered set, though it should be.
      if (allFoundFields.has(field)) {
        visibilityMap[`show${capitalize(field)}`] = true;
      }
    }
  } else {
    console.warn(
      `Schema not found for type: ${discriminatorValue}, or it's not a ZodObject. All derived field visibilities will remain false.`
    );
  }

  return visibilityMap;
}
