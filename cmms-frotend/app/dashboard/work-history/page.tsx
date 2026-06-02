import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Work History | Dashboard",
  description: "View your work history and completed tasks",
};

export default function WorkHistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Work History</h1>
        <p className="mt-2 text-base text-muted-foreground">
          View your completed work orders and task history.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-8">
        <p className="text-base text-muted-foreground">Work history page coming soon...</p>
      </div>
    </div>
  );
}
