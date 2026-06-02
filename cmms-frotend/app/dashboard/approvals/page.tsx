import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Approvals | Dashboard",
  description: "Manage approval workflows",
};

export default function ApprovalsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Approvals</h1>
        <p className="mt-2 text-base text-muted-foreground">
          Review and approve purchase requests, work orders, and other items.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-8">
        <p className="text-base text-muted-foreground">Approvals page coming soon...</p>
      </div>
    </div>
  );
}
