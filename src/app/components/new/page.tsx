"use client";

import { api } from "#convex/api";
import { result } from "~/server/utility";
import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import { ArrowLeft, Plus, Save, Move } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import type { Doc } from "#convex/dataModel";
import { useEffect, useState } from "react";
import Choicebox from "~/components/choicebox";
import { ComboBox } from "~/components/combobox";
import { toast } from "sonner";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { Label } from "~/components/ui/label";
import { DatePicker } from "~/components/date-picker";

type FormData = typeof api.hive.components.createComponent._args.data;

export default function NewComponent() {
  const router = useRouter();

  const { data: coloniesQueryResult, isLoading: coloniesLoading } = useQuery(
    convexQuery(api.hive.colonies.listColonies, {}),
  );
  const coloniesResult = result(coloniesQueryResult);

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
        lastCleaned: new Date().toISOString(),
        usedSince: new Date().toISOString(),
        notes: "",
      },
    });

  const selectedComponentType = watch("type");

  const {
    data: componentIdentifierQueryResult,
    isLoading: componentIdentifierLoading,
  } = useQuery(
    convexQuery(api.hive.components.generateComponentIdentifier, {
      componentType: selectedComponentType,
    }),
  );
  const componentIdentifier = result(componentIdentifierQueryResult);

  // Error Handling
  const [colonies, setColonies] = useState<Doc<"colonies">[]>([]);

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
  }, [
    coloniesLoading,
    componentIdentifier,
    componentIdentifierLoading,
    setValue,
  ]);

  const onSubmit: SubmitHandler<FormData> = (data) => {
    console.log("Form Data Submitted:", data);
    if (data.assignedColony === "_lager") {
      data.assignedColony = undefined;
    }

    // You would typically call a Convex mutation here, e.g.:
    // createComponentMutation.mutate(data);
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
                            onChange={field.onChange}
                          />
                        </div>
                      )}
                    />
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

            {/* // OPTIONAL COLONY == SELECTED // POSITION // TODO: DESIGN COMPONENT */}

            {/* // condition + lastCleaned + usedSince */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {/* <Plus className="h-5 w-5" /> */}# NAME THIS CATEGORY
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
