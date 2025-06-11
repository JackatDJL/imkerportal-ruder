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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Skeleton } from "~/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { type Doc } from "#convex/dataModel";

type ColonyRouterForm = {
  colony: Doc<"colonies">["identifier"];
};

export default function NewComponentRouter() {
  const router = useRouter();
  const { data: coloniesApi, isPending } = useQuery(
    convexQuery(api.hive.colonies.listColonies, {}),
  );
  const { register, handleSubmit } = useForm<ColonyRouterForm>();

  const colonies = result(coloniesApi);
  if (colonies.isErr()) {
    console.error("Error fetching colonies:", colonies.error);
    return <div>Error loading colonies</div>;
  }
  const data = colonies.value.data;

  const onSubmit: SubmitHandler<ColonyRouterForm> = (formData) => {
    // Handle form submission
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="relative mb-6 flex items-center justify-center">
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
          <div className="grid w-3/4 gap-6">
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
                    Grunddaten
                  </CardTitle>
                  <CardDescription>Identifikation und Standort</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">Test</CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
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
