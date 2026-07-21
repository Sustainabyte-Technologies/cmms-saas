"use client";

import Link from "next/link";
import { ChevronRight, FileText, Settings, Shield, RefreshCw, AlertOctagon } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/shared/ui-components";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

export default function RcmPage() {
  const breadcrumbItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Reliability Engineering", href: "/dashboard/reliability" },
    { name: "RCM Analysis" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <Breadcrumb items={breadcrumbItems} />
        <PageHeader
          title="Reliability Centered Maintenance (RCM)"
          description="Design optimized maintenance tasks and schedules based on RCM logic (Preventive, Predictive, Run-to-Failure, or Redesign)."
        >
          <Button disabled variant="outline" size="sm">
            RCM Decision Tree
          </Button>
        </PageHeader>
      </div>

      {/* RCM strategy mix placeholders */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/50">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Preventive Maintenance</span>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl font-bold">--</p>
            <p className="text-xs text-muted-foreground mt-1">Recommended PM tasks</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-purple-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Predictive Maintenance</span>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl font-bold">--</p>
            <p className="text-xs text-muted-foreground mt-1">Condition-based monitoring recommendations</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-yellow-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Run to Failure (RTF)</span>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl font-bold">--</p>
            <p className="text-xs text-muted-foreground mt-1">Intentional RTF strategy assignments</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center gap-2">
              <AlertOctagon className="h-4 w-4 text-red-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Redesign Required</span>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl font-bold">--</p>
            <p className="text-xs text-muted-foreground mt-1">Asset design revision suggestions</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Empty State Panel */}
      <Card className="border border-border/80">
        <CardContent className="p-8">
          <EmptyState
            title="No RCM decisions recorded"
            description="RCM maintenance strategy maps, logic decision charts, and recommendations will be available in upcoming implementation."
            icon={FileText}
          />
        </CardContent>
      </Card>
    </div>
  );
}
