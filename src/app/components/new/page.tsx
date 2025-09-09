"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type SubmitHandler, Controller } from "react-hook-form";

import { api } from "#convex/api";
import type { Doc, Id } from "#convex/dataModel"; // Import Id
import { result } from "~/server/utility";

import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useQuery, useMutation } from "@tanstack/react-query"; // Import useMutation

import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

import {
  ArrowLeft,
  Plus,
  Save,
  Move,
  RulerIcon as RulerDimensionLine,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { Label } from "~/components/ui/label";
import Choicebox from "~/components/choicebox";
import { ComboBox } from "~/components/combobox";
import { DatePicker } from "~/components/date-picker";
import HiveStackPlacement from "~/components/hive-stack-placement";
// import { NotifierDialog } from "~/components/notifier"; // Removed NotifierDialog import

type FormData = typeof api.hive.components.createComponent._args.data;

export default function NewComponent() {
  const router = useRouter();

  const { data: coloniesQueryResult, isLoading: coloniesLoading } = useQuery(
    convexQuery(api.hive.colonies.listColonies, {}),
  );
  const coloniesResult = result(coloniesQueryResult);

  const [colonies, setColonies] = useState<Doc<"colonies">[]>([]);
  const [selectedColonyId, setSelectedColonyId] = useState<
    Id<"colonies"> | undefined
  >(undefined);
  const [showPlacementSection, setShowPlacementSection] = useState(false); // Changed from showPlacementModal
  const [placementOrderIndex, setPlacementOrderIndex] = useState<number | null>(
    null,
  );

  const { handleSubmit, watch, setValue, control, register } =
    useForm<FormData>({
      defaultValues: {
        type: "Zarge",
        identifier: "",
        assignedColony: "_lager",
        frameSize: "DNM (Deutsch Normalmaß)",
        maxFrames: 12,
        currentlyHolding: 12,
        condition: "new",
        // Format initial date values to match schema expectations
        lastCleaned: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
        usedSince: new Date().toISOString().slice(0, 10),
        notes: "",
      },
    });

  const selectedComponentType = watch("type");
  const assignedColonyIdentifier = watch("assignedColony"); // Watch the identifier string

  // Fetch components for the selected colony when assignedColony changes
  const {
    data: colonyComponentsQueryResponse,
    // isLoading: colonyComponentsLoading,
  } = useQuery({
    ...convexQuery(api.hive.components.listColonyComponents, {
      colonyIdentifier:
        assignedColonyIdentifier !== "_lager"
          ? assignedColonyIdentifier
          : undefined,
    }),
    enabled:
      assignedColonyIdentifier !== "_lager" &&
      assignedColonyIdentifier !== undefined,
  });
  const colonyComponentsQueryResult = result(colonyComponentsQueryResponse);

  const colonyComponents: Doc<"hiveComponents">[] =
    colonyComponentsQueryResult?.isOk() &&
    colonyComponentsQueryResult.value.data
      ? colonyComponentsQueryResult.value.data
      : [];

  const {
    data: componentIdentifierQueryResult,
    isLoading: componentIdentifierLoading,
  } = useQuery(
    convexQuery(api.hive.components.generateComponentIdentifier, {
      componentType: selectedComponentType,
    }),
  );
  const componentIdentifier = result(componentIdentifierQueryResult);

  useEffect(() => {
    if (coloniesLoading) {
      return;
    }
    if (coloniesResult.isErr()) {
      console.error("Error fetching colonies:", coloniesResult.error);
      toast.error(
        `Fehler beim Laden der Völker: ${coloniesResult.error.message}`,
      );
      setColonies([]);
    }
    if (coloniesResult.isOk()) {
      setColonies(coloniesResult.value.data ?? []);
    }
  }, [coloniesLoading, coloniesResult]);

  useEffect(() => {
    if (componentIdentifierLoading) {
      return;
    }
    if (componentIdentifier.isOk()) {
      setValue("identifier", componentIdentifier.value.data ?? "");
    } else if (componentIdentifier.isErr()) {
      console.error(
        "Error generating component identifier:",
        componentIdentifier.error,
      );
      toast.error(
        `Fehler beim Generieren der Komponentennummer: ${componentIdentifier.error.message}`,
      );
    }
  }, [componentIdentifier, componentIdentifierLoading, setValue]);

  // Update selectedColonyId when assignedColony changes
  useEffect(() => {
    if (assignedColonyIdentifier && assignedColonyIdentifier !== "_lager") {
      const foundColony = colonies.find(
        (c) => c.identifier === assignedColonyIdentifier,
      );
      if (foundColony) {
        setSelectedColonyId(foundColony._id);
      } else {
        setSelectedColonyId(undefined);
      }
    } else {
      setSelectedColonyId(undefined);
    }
  }, [assignedColonyIdentifier, colonies]);

  const createComponentMutation = useMutation({
    mutationFn: useConvexMutation(api.hive.components.createComponent),
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    console.log("Form Data Submitted:", data);
    let finalAssignedColony: Id<"colonies"> | undefined = undefined;

    if (data.assignedColony && data.assignedColony !== "_lager") {
      const colony = colonies.find((c) => c.identifier === data.assignedColony);
      if (colony) {
        finalAssignedColony = colony._id;
      } else {
        toast.error("Selected colony not found.");
        return;
      }
    }

    // Format dates correctly
    // lastCleaned: YYYY-MM-DD or "new"
    const formattedLastCleaned = data.lastCleaned
      ? new Date(data.lastCleaned).toISOString().slice(0, 10)
      : undefined;

    // usedSince: DD-MM-YYYY
    const usedSinceDate = data.usedSince ? new Date(data.usedSince) : undefined;
    const formattedUsedSince = usedSinceDate
      ? `${String(usedSinceDate.getDate()).padStart(2, "0")}-${String(
          usedSinceDate.getMonth() + 1,
        ).padStart(2, "0")}-${usedSinceDate.getFullYear()}`
      : "";

    // Base data common to all component types
    const baseData = {
      identifier: data.identifier,
      type: data.type,
      assignedColony: finalAssignedColony,
      condition: data.condition,
      lastCleaned: formattedLastCleaned,
      usedSince: formattedUsedSince,
      notes: data.notes,
      orderIndex: placementOrderIndex ?? undefined,
    };

    let componentData: FormData;

    // Construct data based on selected component type to match discriminated union schema
    switch (data.type) {
      case "Zarge":
        componentData = {
          ...baseData,
          type: "Zarge",
          frameSize: data.frameSize,
          maxFrames: data.maxFrames,
          currentlyHolding: data.currentlyHolding,
        };
        break;
      case "Boden":
        componentData = {
          ...baseData,
          type: "Boden",
          // frameSize, maxFrames, currentlyHolding are omitted for Boden
        };
        break;
      case "Deckel":
        componentData = {
          ...baseData,
          type: "Deckel",
          internalData: {
            // Changed from _internal
            virtualPosition: {
              type: "forceTop",
              forceFromTop: 0,
            },
          },
          // frameSize, maxFrames, currentlyHolding are omitted for Deckel
        };
        break;
      case "One Way Gate":
        componentData = {
          ...baseData,
          type: "One Way Gate",
          // frameSize, maxFrames, currentlyHolding are omitted
        };
        break;
      case "Königinnenabsperrgitter":
        componentData = {
          ...baseData,
          type: "Königinnenabsperrgitter",
          // frameSize, maxFrames, currentlyHolding are omitted
        };
        break;
      case "Futterraum":
        componentData = {
          ...baseData,
          type: "Futterraum",
          internalData: {
            // Changed from _internal
            virtualPosition: {
              type: "forceTop",
              forceFromTop: 1,
            },
          },
          // frameSize, maxFrames, currentlyHolding are omitted
        };
        break;
      default:
        // Fallback or error handling for unknown types
        toast.error("Unbekannter Komponententyp ausgewählt.");
        return;
    }

    const response = await createComponentMutation.mutateAsync({
      data: componentData,
    });
    const resultData = result(response);
    if (resultData.isOk()) {
      toast.success("Komponente erfolgreich erstellt!");
      router.push("/components/" + data.identifier);
    } else {
      toast.error(
        `Fehler beim Erstellen der Komponente: ${resultData.error.message}`,
      );
    }
  };

  const handlePlacementSelection = (index: number | null) => {
    setPlacementOrderIndex(index);
    setShowPlacementSection(false); // Close the section after selection
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="relative mb-6 flex items-center justify-center max-sm:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="absolute left-0"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Neue Komponente</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Form Content */}
        <div className="flex grow items-center justify-center">
          <div
            className="grid w-5/6 gap-6 md:w-4/5 xl:w-3/4"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(600px, 1fr))",
              gridGap: "1rem",
            }}
          >
            {/* Component Type Selection */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ gridColumn: "1 / -1" }}
            >
              <Card>
                <CardContent className="space-y-4 max-xl:hidden">
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <Choicebox
                        options={[
                          { value: "Zarge", label: "Zarge" },
                          { value: "Boden", label: "Boden" },
                          { value: "Deckel", label: "Deckel" },
                          { value: "One Way Gate", label: "One Way Gate" },
                          {
                            value: "Königinnenabsperrgitter",
                            label: "Königinnenabsperrgitter",
                          },
                          { value: "Futterraum", label: "Futterraum" },
                        ]}
                        value={field.value}
                        onChange={field.onChange}
                        direction={"row"}
                        size="sm"
                        variant="card"
                        className="justify-around xl:justify-center"
                        optionClassName="xl:px-4 xl:mx-2"
                      />
                    )}
                  />
                </CardContent>
                <CardContent className="flex items-center space-y-4 max-sm:justify-center xl:hidden">
                  <CardDescription
                    className="mx-1 text-lg font-semibold max-sm:hidden"
                    style={{ transform: "translateY(0.5rem)" }}
                  >
                    Komponententyp:
                  </CardDescription>
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <ComboBox
                        options={[
                          { value: "Zarge", label: "Zarge" },
                          { value: "Boden", label: "Boden" },
                          { value: "Deckel", label: "Deckel" },
                          { value: "One Way Gate", label: "One Way Gate" },
                          {
                            value: "Königinnenabsperrgitter",
                            label: "Königinnenabsperrgitter",
                          },
                          { value: "Futterraum", label: "Futterraum" },
                        ]}
                        className="mx-3"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Basic Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Grundinformationen
                  </CardTitle>
                  <CardDescription>Identifikation und Standort</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {componentIdentifierLoading ? (
                    <Skeleton className="h-12 w-full" />
                  ) : (
                    <Controller
                      name="identifier"
                      control={control}
                      render={({ field }) => (
                        <div>
                          <Label htmlFor="identifier">Volks-ID</Label>
                          <Input
                            id="identifier"
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="z.B. f001, f002..."
                          />
                        </div>
                      )}
                    />
                  )}

                  {coloniesLoading ? (
                    <Skeleton className="h-12 w-full" />
                  ) : (
                    <Controller
                      name="assignedColony"
                      control={control}
                      render={({ field }) => (
                        <div>
                          <Label htmlFor="colony">Volk</Label>
                          <ComboBox
                            id="colony"
                            options={[
                              { value: "_lager", label: "Nicht Zugewiesen" },
                              ...colonies.map((colony) => ({
                                value: colony.identifier,
                                label: colony.identifier,
                              })),
                            ]}
                            value={field.value}
                            onChange={(value: unknown) => {
                              field.onChange(value);
                              setPlacementOrderIndex(null); // Reset placement when colony changes
                              setShowPlacementSection(false); // Hide placement section
                            }}
                          />
                        </div>
                      )}
                    />
                  )}

                  {selectedColonyId && (
                    <div className="space-y-2">
                      <Label htmlFor="placement">Platzierung im Volk</Label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          setShowPlacementSection(!showPlacementSection)
                        }
                        className="w-full"
                      >
                        {placementOrderIndex !== null
                          ? `Position: ${placementOrderIndex}`
                          : "Position auswählen"}
                      </Button>
                      {placementOrderIndex !== null && (
                        <p className="text-sm text-muted-foreground">
                          Komponente wird an Position {placementOrderIndex}{" "}
                          eingefügt.
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Zarge Specific Information */}
            <AnimatePresence>
              {selectedComponentType === "Zarge" && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Card className="w-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Move className="h-5 w-5" />
                        Größendaten
                      </CardTitle>
                      <CardDescription>
                        Zusätzliche Details für Zargen
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Controller
                        name="frameSize"
                        control={control}
                        render={({ field }) => (
                          <div>
                            <Label htmlFor="frameSize">Rähmchenmaß</Label>
                            <ComboBox
                              id="frameSize"
                              options={[
                                { value: "Zander", label: "Zander" },
                                { value: "Dadant Brut", label: "Dadant Brut" },
                                {
                                  value: "Dadant Honig",
                                  label: "Dadant Honig",
                                },
                                {
                                  value: "DNM (Deutsch Normalmaß)",
                                  label: "DNM (Deutsch Normalmaß)",
                                },
                                { value: "Langstroth", label: "Langstroth" },
                                { value: "MiniPlus", label: "MiniPlus" },
                              ]}
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </div>
                        )}
                      />
                      <div>
                        <Label htmlFor="maxFrames">
                          Maximale Rähmchenanzahl
                        </Label>
                        <Input
                          id="maxFrames"
                          type="number"
                          placeholder="z.B. 10, 12, 14..."
                          {...register("maxFrames", {
                            valueAsNumber: true,
                          })}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <Label htmlFor="currentlyHolding">
                          Aktuell gehaltene Rähmchen
                        </Label>
                        <Input
                          id="currentlyHolding"
                          type="number"
                          placeholder="z.B. 10, 12, 14..."
                          {...register("currentlyHolding", {
                            valueAsNumber: true,
                          })}
                          className="w-full"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Inline Placement Card */}
            <AnimatePresence>
              {selectedColonyId && showPlacementSection && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ gridColumn: "1 / -1" }} // Span full width
                >
                  <HiveStackPlacement
                    colony={colonies.find((c) => c._id === selectedColonyId)!}
                    components={colonyComponents}
                    newComponentType={selectedComponentType}
                    onPlacementSelected={handlePlacementSelection}
                    initialOrderIndex={placementOrderIndex}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* // condition + lastCleaned + usedSince */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RulerDimensionLine className="h-5 w-5" />
                    Zustand und Nutzung
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Controller
                    name="condition"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <Label htmlFor="condition">Zustand</Label>
                        <ComboBox
                          id="condition"
                          options={[
                            { value: "new", label: "Neu" },
                            { value: "good", label: "Gut" },
                            { value: "used", label: "Gebraucht" },
                            { value: "worn", label: "Abgenutzt" },
                            {
                              value: "needs repair",
                              label: "Reparaturbedürftig",
                            },
                            { value: "disinfected", label: "Desinfiziert" },
                            { value: "wax residue", label: "Wachsreste" },
                          ]}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </div>
                    )}
                  />

                  <Controller
                    name="lastCleaned"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <Label htmlFor="lastCleaned">Letzte Reinigung</Label>
                        <DatePicker
                          value={
                            field.value ? new Date(field.value) : undefined
                          }
                          onChange={(date) => {
                            if (date instanceof Date) {
                              field.onChange(date.toISOString().slice(0, 10));
                            } else {
                              field.onChange("");
                            }
                          }}
                          mode="single"
                          toDate={new Date()}
                          disabled={(date) => date > new Date()}
                          showTodayButton
                          cardTitle="Letzte Reinigung"
                          cardDescription="Nur vergangene Daten erlaubt"
                        />
                      </div>
                    )}
                  />

                  <Controller
                    name="usedSince"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <Label htmlFor="usedSince">In Benutzung seit</Label>
                        <DatePicker
                          value={
                            field.value ? new Date(field.value) : undefined
                          }
                          onChange={(date) => {
                            if (date instanceof Date) {
                              field.onChange(date.toISOString().slice(0, 10));
                            } else {
                              field.onChange("");
                            }
                          }}
                          mode="single"
                          toDate={new Date()}
                          disabled={(date) => date > new Date()}
                          showTodayButton
                          cardTitle="In Benutzung seit"
                          cardDescription="Nur vergangene Daten erlaubt"
                        />
                      </div>
                    )}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Additional Information */}
            {/* // notes */}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 max-sm:justify-center">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Abbrechen
          </Button>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Komponente erstellen
          </Button>
        </div>
      </form>
    </div>
  );
}
