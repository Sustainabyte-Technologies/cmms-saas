import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maintenance Planning | Dashboard",
  description: "Plan and schedule preventive maintenance tasks",
};

export default function MaintenancePlanningPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Maintenance Planning</h1>
        <p className="mt-2 text-base text-muted-foreground">
          Create and manage maintenance schedules and plans.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-8">
        <p className="text-base text-muted-foreground">Maintenance planning page coming soon...</p>
      </div>
    </div>
  );
}
