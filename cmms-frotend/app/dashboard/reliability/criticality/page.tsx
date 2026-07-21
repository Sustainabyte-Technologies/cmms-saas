"use client";

import Link from "next/link";
import { ChevronRight, AlertTriangle, ShieldAlert, ShieldCheck, ShieldAlert as ShieldWarning, Sparkles } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/shared/ui-components";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface BreadcrumbItem {
  name: string;
  href?: string;
}

function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex mb-4 text-xs font-medium text-muted-foreground/80 items-center gap-1.5">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={item.name} className="flex items-center gap-1.5">
            {index > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/45 shrink-0" />}
            {isLast || !item.href ? (
              <span className="text-foreground font-semibold truncate max-w-[150px]">{item.name}</span>
            ) : (
              <Link href={item.href} className="hover:text-foreground transition-colors truncate max-w-[150px]">
                {item.name}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}

export default function AssetCriticalityPage() {
  const breadcrumbItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Reliability Engineering", href: "/dashboard/reliability" },
    { name: "Asset Criticality" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <Breadcrumb items={breadcrumbItems} />
        <PageHeader
          title="Asset Criticality Management"
          description="Classify and rank assets by criticality to optimize maintenance strategy and resource allocation."
        >
          <Button disabled className="gap-2 bg-primary/80">
            <Sparkles className="h-4 w-4" />
            Classify Asset
          </Button>
        </PageHeader>
      </div>

      {/* Criticality Classification Placeholders */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-red-500/20 bg-red-500/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-red-500">Critical</span>
              <ShieldAlert className="h-5 w-5 text-red-500" />
            </div>
            <CardTitle className="text-2xl font-bold mt-2">--</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Immediate action required upon failure. Business-critical assets.</p>
          </CardContent>
        </Card>

        <Card className="border-orange-500/20 bg-orange-500/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-500">High</span>
              <ShieldWarning className="h-5 w-5 text-orange-500" />
            </div>
            <CardTitle className="text-2xl font-bold mt-2">--</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">High disruption potential. Scheduled preventative priority.</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-yellow-600">Medium</span>
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            </div>
            <CardTitle className="text-2xl font-bold mt-2">--</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Moderate operational impact. Standard maintenance cycle.</p>
          </CardContent>
        </Card>

        <Card className="border-green-500/20 bg-green-500/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-green-600">Low</span>
              <ShieldCheck className="h-5 w-5 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold mt-2">--</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Low operational impact. Run-to-failure strategy candidate.</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Empty State Panel */}
      <Card className="border border-border/80">
        <CardContent className="p-8">
          <EmptyState
            title="No asset criticality classifications defined"
            description="Asset criticality assessment and configuration will be available in upcoming implementation."
            icon={AlertTriangle}
          />
        </CardContent>
      </Card>
    </div>
  );
}
