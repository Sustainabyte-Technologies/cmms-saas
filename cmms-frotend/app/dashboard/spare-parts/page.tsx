import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Spare Parts | Dashboard",
  description: "Manage spare parts inventory",
};

export default function SparepartsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Spare Parts</h1>
        <p className="mt-2 text-base text-muted-foreground">
          Track and manage spare parts inventory and stock levels.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-8">
        <p className="text-base text-muted-foreground">Spare parts management page coming soon...</p>
      </div>
    </div>
  );
}
