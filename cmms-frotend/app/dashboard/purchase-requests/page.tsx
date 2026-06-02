import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Purchase Requests | Dashboard",
  description: "Create and manage purchase requests",
};

export default function PurchaseRequestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Purchase Requests</h1>
        <p className="mt-2 text-base text-muted-foreground">
          Create, manage, and track purchase requests for materials and parts.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-8">
        <p className="text-base text-muted-foreground">Purchase requests page coming soon...</p>
      </div>
    </div>
  );
}
