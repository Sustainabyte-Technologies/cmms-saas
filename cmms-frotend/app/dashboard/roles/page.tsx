import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roles | Dashboard",
  description: "Manage user roles and permissions",
};

export default function RolesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Roles</h1>
        <p className="mt-2 text-base text-muted-foreground">
          Manage user roles and their associated permissions.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-8">
        <p className="text-base text-muted-foreground">Roles management page coming soon...</p>
      </div>
    </div>
  );
}
