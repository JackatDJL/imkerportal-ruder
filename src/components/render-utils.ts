import type { z, ZodTypeAny, ZodRawShape, UnknownKeysParam } from "zod";

// Fucking hated that typeerror
type CapitalizeString<S extends string> = S extends `${infer FirstLetter}${infer Rest}`
  ? `${Uppercase<FirstLetter>}${Rest}`
  : S;

// show type gen 
export type VisibilityResult<PossibleFieldNames extends string> = {
  [K in PossibleFieldNames as `show${CapitalizeString<K>}`]: boolean;
};

// why does esm not have a function for this??
function capitalize(s: string): string {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function createVisibilityCalculator<
  DiscriminatedUnionSchema extends z.ZodDiscriminatedUnion<string, ReadonlyArray<z.ZodObject<ZodRawShape, UnknownKeysParam, ZodTypeAny>>>,
  PossibleFieldNames extends keyof z.output<DiscriminatedUnionSchema['_def']['options'][number]>,
  DiscriminatorValueType extends Parameters<DiscriminatedUnionSchema['_def']['optionsMap']['get']>[0] // f*n. forgot about Parameters<>
>(
  discriminatedUnionSchema: DiscriminatedUnionSchema,
  discriminatorValue: DiscriminatorValueType
): VisibilityResult<Extract<PossibleFieldNames, string>> {

  type ActualPossibleFieldNames = Extract<PossibleFieldNames, string>;

  const intermediateVisibilityMap: Record<string, boolean> = {}; // NOT TYPED YET

  const allFoundFields = new Set<ActualPossibleFieldNames>();

  for (const optionSchema of discriminatedUnionSchema._def.options) {
    for (const key of Object.keys(optionSchema.shape)) {
      allFoundFields.add(key as ActualPossibleFieldNames);
    }
  }

  for (const rawField of allFoundFields) {
    intermediateVisibilityMap[`show${capitalize(rawField)}`] = false;
  }

  const specificSchema = discriminatedUnionSchema._def.optionsMap.get(discriminatorValue);
  if (specificSchema) {
    const shape = specificSchema.shape as Record<ActualPossibleFieldNames, ZodTypeAny>;
    for (const rawField of Object.keys(shape)) {
      if (allFoundFields.has(rawField as ActualPossibleFieldNames)) {
        intermediateVisibilityMap[`show${capitalize(rawField as ActualPossibleFieldNames)}`] = true;
      }
    }
  } else {
    console.warn(
      `Schema not found for type: ${String(discriminatorValue)}, or it's not a ZodObject. All derived field visibilities will remain false.`
    );
  }
  // Cast at the end once all properties are correctly assigned
  return intermediateVisibilityMap as VisibilityResult<ActualPossibleFieldNames>; 
}
