/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { api } from "#convex/api";
import { result, type apiError } from "~/server/utility";
import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import { ArrowLeft, Plus, Save } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import { type Doc } from "#convex/dataModel";
import { useEffect, useRef } from "react";
import Choicebox from "~/components/choicebox";
import { ComboBox } from "~/components/combobox";
import { create } from "zustand";

// --- Consolidated Zustand Store ---
interface ApiState {
  colonyApiResponse?: Doc<"colonies">[];
  identifierApiResponse?: string;
  colonyApiError?: apiError;
  identifierApiError?: apiError;
}

interface ApiActions {
  setApiResponse: (field: "colonyApi" | "identifierApi", response: Doc<"colonies">[] | string) => void;
  clearApiResponse: (field: "colonyApi" | "identifierApi") => void;
  setError: (field: "colonyApi" | "identifierApi", error: apiError) => void;
  clearError: (field: "colonyApi" | "identifierApi") => void;
}

const useApiAndErrorStore = create<ApiState & ApiActions>((set) => ({
  colonyApiResponse: undefined,
  identifierApiResponse: undefined,
  colonyApiError: undefined,
  identifierApiError: undefined,

  setApiResponse: (field, response) => {
    set((state) => ({
      ...state,
      [`${field}ApiResponse`]: response,
      [`${field}ApiError`]: undefined, // Clear error on successful response
    }));
  },
  clearApiResponse: (field) => {
    set((state) => ({
      ...state,
      [`${field}ApiResponse`]: undefined,
    }));
  },
  setError: (field, error) => {
    set((state) => ({
      ...state,
      [`${field}ApiError`]: error,
      [`${field}ApiResponse`]: undefined, // Clear response on error
    }));
  },
  clearError: (field) => {
    set((state) => ({
      ...state,
      [`${field}ApiError`]: undefined,
    }));
  },
}));

type FormData = typeof api.hive.components.createComponent._args.data;

export default function NewComponent() {
  const router = useRouter();

  const {
    // colonyApiResponse,
    // identifierApiResponse,
    // colonyApiError,
    // identifierApiError,
    setApiResponse,
    setError,
  } = useApiAndErrorStore();

  const { data: coloniesQueryResult, isLoading: coloniesLoading } = useQuery(
    convexQuery(api.hive.colonies.listColonies, {}),
  );
  const colonies = result(coloniesQueryResult);

  const {
    // register,
    handleSubmit,
    watch,
    setValue,
    control,
    // formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      type: "Zarge",
      identifier: '',
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

  // Ref to track the last identifier value that was successfully set into the form
  const lastSetIdentifierRef = useRef<string | null>(null);

  // Handle colony data/errors
  useEffect(() => {
    if (colonies.isOk() && colonies.value.data) {
      setApiResponse("colonyApi", colonies.value.data);
    } else if (colonies.isErr()) {
      setError("colonyApi", colonies.error);
    }
  }, [colonies]);

  // Handle component identifier data/errors
  useEffect(() => {
    if (componentIdentifier.isOk() && componentIdentifier.value.data) {
      const newIdentifier = componentIdentifier.value.data;
      // Only set the value if it's different from the current form value
      // AND it's different from the last value we successfully set
      if (newIdentifier !== watch('identifier') && newIdentifier !== lastSetIdentifierRef.current) {
        setApiResponse("identifierApi", newIdentifier);
        setValue("identifier", newIdentifier, { shouldValidate: true });
        lastSetIdentifierRef.current = newIdentifier; // Update the ref
      }
    } else if (componentIdentifier.isErr()) {
      setError("identifierApi", componentIdentifier.error);
      // Only clear if the current form value is not already empty
      if (watch('identifier') !== '') {
        setValue("identifier", '', { shouldValidate: true });
        lastSetIdentifierRef.current = null; // Clear ref on error
      }
    }
  }, [componentIdentifier]);

  // Reset the lastSetIdentifierRef when selectedComponentType changes
  // This ensures that a new identifier can be fetched and set when the component type is altered.
  useEffect(() => {
    lastSetIdentifierRef.current = null;
  }, [selectedComponentType]);

  const onSubmit: SubmitHandler<FormData> = (data) => {
    console.log("Form Data Submitted:", data);
    // You would typically call a Convex mutation here, e.g.:
    // createComponentMutation.mutate(data);
  };

  const overallLoading = coloniesLoading || componentIdentifierLoading;

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
          <div className="grid w-5/6 gap-6 md:w-4/5 xl:w-3/4">
            {/* Component Type Selection */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
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
              // className="grid gap-6 lg:grid-cols-2"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Grundinformationen
                  </CardTitle>
                  <CardDescription>Identifikation und Standort</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Example of a registered input field
                  <div>
                    <Label htmlFor="usedSince">Genutzt seit</Label>
                    <Input id="usedSince" type="date" {...register("usedSince")} />
                  </div> */}
                  Test
                </CardContent>
              </Card>
            </motion.div>
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
