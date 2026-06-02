import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Tasks | Dashboard",
  description: "View and manage your assigned tasks",
};

export default function MyTasksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">My Tasks</h1>
        <p className="mt-2 text-base text-muted-foreground">
          View and manage your assigned maintenance tasks.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-8">
        <p className="text-base text-muted-foreground">My tasks page coming soon...</p>
      </div>
    </div>
  );
}
