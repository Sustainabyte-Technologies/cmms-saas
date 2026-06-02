import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Material Management | Dashboard",
  description: "Manage materials and equipment inventory",
};

export default function MaterialsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Material Management</h1>
        <p className="mt-2 text-base text-muted-foreground">
          Manage materials, equipment, and inventory items.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-8">
        <p className="text-base text-muted-foreground">Materials management page coming soon...</p>
      </div>
    </div>
  );
}
