import { redirect } from "next/navigation";

export default function ColonyPage() {
  redirect("/");
  return (
    <div className="flex items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">Colony Page</h1>
    </div>
  );
}
