import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Users | Dashboard",
  description: "Manage system users and their access permissions",
};

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Users</h1>
        <p className="mt-2 text-base text-muted-foreground">
          Manage system users and their access permissions.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-8">
        <p className="text-base text-muted-foreground">Users management page coming soon...</p>
      </div>
    </div>
  );
}
