import { type Doc, type Id } from "#convex/dataModel";
import VisualHiveStack from "~/components/hive-stack";

export default function TestPage() {
  const colony: Doc<"colonies"> = {
    _id: "123" as Id<"colonies">,
    _creationTime: 123,
    createdAt: "2025-06-03",
    hiveType: { type: "Deutsch Normalmaß (DNM)" },
    identifier: "f1",
    location: "Home",
  };

  const components: Doc<"hiveComponents">[] = [];

  return <VisualHiveStack colony={colony} components={components} />;
}
