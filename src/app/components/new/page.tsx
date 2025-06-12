/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { api } from "#convex/api";
import { result } from "~/server/utility";
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
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Skeleton } from "~/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import { type Doc } from "#convex/dataModel";
import { useEffect, useState } from "react";
import { type z } from "zod";
import type { hiveComponentTypes } from "~/server/convex/schema";
import Choicebox from "~/components/choicebox";
import { ComboBox } from "~/components/combobox";
import { createVisibilityCalculator } from "~/components/render-utils";
import { createComponentType } from "~/server/convex/hive/components";

interface ErrorZustand {
  placeholder: string;
  // placeholder for implementing form validation errors mit dem Biblieothekserweiterungspacket zur erweiterung des Zustandsmanagements in Reaktion namens Zustand
}

type FormData = typeof api.hive.components.createComponent._args.data;

export default function NewComponentRouter() {
  const router = useRouter();

  const { data: coloniesData, isLoading: coloniesLoading } = useQuery(convexQuery(api.hive.colonies.listColonies, {}));
  const colonies = result(coloniesData);

  // Form State Management using react-hook-form
  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      type: "Zarge",
    }
  });

  const selectedComponentType = watch("type");
  const [fieldVisibility, setFieldVisibility] = useState(
    createVisibilityCalculator(createComponentType.shape.data, selectedComponentType)
  );
  
  

  useEffect(() => {
    setValue("type", selectedComponentType);
    setFieldVisibility(createVisibilityCalculator(createComponentType.shape.data, selectedComponentType));
  }, [selectedComponentType, setValue]);

  useEffect(() => {
    console.dir("Form Errors:", errors);
  }, [errors]);

  // thinking about implementing react-hook-form for better form management
  const onSubmit: SubmitHandler<FormData> = (data) => {
    console.log(data);
    // Process and submit form data here
    // Example: createComponentMutation.mutate({ data });
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
          <div className="grid xl:w-3/4 md:w-4/5 w-5/6 gap-6">
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
                          { value: "Königinnenabsperrgitter", label: "Königinnenabsperrgitter" },
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
                <CardContent className="space-y-4 xl:hidden flex items-center max-sm:justify-center">
                  <CardDescription className="text-lg font-semibold mx-1 max-sm:hidden" style={{ transform: "translateY(0.5rem)" }}>
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
                          { value: "Königinnenabsperrgitter", label: "Königinnenabsperrgitter" },
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
        <div className="flex justify-end max-sm:justify-center gap-4">
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
