import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team Management | Dashboard",
  description: "Manage team members and assignments",
};

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Team Management</h1>
        <p className="mt-2 text-base text-muted-foreground">
          Manage team members and monitor their assignments.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-8">
        <p className="text-base text-muted-foreground">Team management page coming soon...</p>
      </div>
    </div>
  );
}
