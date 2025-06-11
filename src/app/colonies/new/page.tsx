"use client";

import React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
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
import { ArrowLeft, Save, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import posthog from "posthog-js";
import { useMutation, useQuery } from "convex/react";
import { api } from "#convex/api";
import type { Doc } from "#convex/dataModel";
import { result } from "~/server/utility";

export default function NewColony() {
  const router = useRouter();

  const genIdentifierQuery = useQuery(
    api.hive.colonies.generateColonyIdentifier,
    {},
  );

  const genIdentifier = result(genIdentifierQuery).deconstruct().content();

  const [formData, setFormData] = useState<
    typeof api.hive.colonies.createColony._args
  >({
    identifier: "f...",
    hiveType: { type: "Deutsch Normalmaß (DNM)" },
    createdAt: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    if (genIdentifier) {
      setFormData((prev) => ({
        ...prev,
        identifier: genIdentifier,
      }));
    }
  }, [genIdentifier]);

  const mutation = useMutation(api.hive.colonies.createColony);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    posthog.capture("create-colony");
    void mutation(formData);
    router.push("/colonies/" + formData.identifier);
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
        <h1 className="text-3xl font-bold tracking-tight">Neues Bienenvolk</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
                <CardContent className="space-y-4">
                  <div>
                    {!genIdentifierQuery ? (
                      <Skeleton className="h-12 w-full" />
                    ) : (
                      <div>
                        <Label htmlFor="identifier">Volks-ID</Label>
                        <Input
                          id="identifier"
                          value={formData.identifier}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              identifier: e.target.value,
                            })
                          }
                          placeholder="z.B. f001, f002..."
                          required
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="location">Standort</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      placeholder="z.B. Schrebergarten, Garten..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="hiveType" id="hiveType">
                      Beutentyp
                    </Label>
                    <Select
                      defaultValue={
                        formData.hiveType?.type ?? "Deutsch Normalmaß (DNM)"
                      }
                      value={formData.hiveType?.type}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          hiveType:
                            value === "Sonstiges"
                              ? { type: "Sonstiges", description: "" }
                              : ({
                                  type: value,
                                } as Doc<"colonies">["hiveType"]),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dadant US">Dadant US</SelectItem>
                        <SelectItem value="Dadant Blatt">
                          Dadant Blatt
                        </SelectItem>
                        <SelectItem value="Zander">Zander</SelectItem>
                        <SelectItem value="Langstroth">Langstroth</SelectItem>
                        <SelectItem value="Deutsch Normalmaß (DNM)">
                          Deutsch Normalmaß (DNM)
                        </SelectItem>
                        <SelectItem value="MiniPlus">MiniPlus</SelectItem>
                        <SelectItem value="Warré">Warré</SelectItem>
                        <SelectItem value="Einraumbeute">
                          Einraumbeute
                        </SelectItem>
                        <SelectItem value="Sonstiges">Sonstiges</SelectItem>
                      </SelectContent>
                    </Select>
                    {formData.hiveType?.type === "Sonstiges" && (
                      <Input
                        type="text"
                        placeholder="Beuten Beschreibung"
                        value={formData.hiveType.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            hiveType: {
                              type: "Sonstiges",
                              description: e.target.value,
                            },
                          })
                        }
                      />
                    )}
                  </div>
                </CardContent>
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
            Volk erstellen
          </Button>
        </div>
      </form>
    </div>
  );
}
