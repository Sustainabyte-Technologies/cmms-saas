import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Audit Logs | Dashboard",
  description: "View system audit logs and activity history",
};

export default function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Audit Logs</h1>
        <p className="mt-2 text-base text-muted-foreground">
          View system audit logs and activity history for compliance and monitoring.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-8">
        <p className="text-base text-muted-foreground">Audit logs page coming soon...</p>
      </div>
    </div>
  );
}
