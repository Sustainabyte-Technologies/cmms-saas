"use client";

import Link from "next/link";
import { ChevronRight, History, BarChart3, Clock, AlertTriangle } from "lucide-react";
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

export default function FailureHistoryPage() {
  const breadcrumbItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Reliability Engineering", href: "/dashboard/reliability" },
    { name: "Failure History" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <Breadcrumb items={breadcrumbItems} />
        <PageHeader
          title="Failure History Log"
          description="View and analyze historical failures compiled from completed work orders and breakdown reports."
        >
          <Button variant="outline" size="sm" disabled>
            Export Log
          </Button>
        </PageHeader>
      </div>

      {/* Analytical Card Placeholders */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-card/50">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-semibold">Total Logged Failures</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">--</p>
            <p className="text-xs text-muted-foreground mt-1">Aggregated across all assets</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-semibold">MTTF Average</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">--</p>
            <p className="text-xs text-muted-foreground mt-1">Mean Time To Failure</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-semibold">Avg Downtime / Failure</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">--</p>
            <p className="text-xs text-muted-foreground mt-1">Average system restoration time</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Empty State Panel */}
      <Card className="border border-border/80">
        <CardContent className="p-8">
          <EmptyState
            title="No failure history records found"
            description="Failure records from completed work orders will be displayed in upcoming implementation."
            icon={History}
          />
        </CardContent>
      </Card>
    </div>
  );
}
