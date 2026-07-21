"use client";

import Link from "next/link";
import { ChevronRight, LayoutDashboard, AlertTriangle, ShieldAlert, BarChart3, Clock, Play, FileSearch, Sparkles } from "lucide-react";
import { PageHeader, DashboardCard, EmptyState } from "@/components/shared/ui-components";
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

export default function ReliabilityDashboardPage() {
  const breadcrumbItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Reliability Engineering", href: "/dashboard/reliability" },
    { name: "Dashboard" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <Breadcrumb items={breadcrumbItems} />
        <PageHeader
          title="Reliability Dashboard"
          description="Overview of asset performance, reliability metrics, and predictive analytics."
        >
          <Button variant="outline" size="sm" className="gap-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10">
            <Sparkles className="h-4 w-4" />
            Reliability Report
          </Button>
        </PageHeader>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Reliability Score"
          value="--"
          description="Coming Soon"
          icon={ShieldAlert}
        />
        <DashboardCard
          title="Availability"
          value="--"
          description="Coming Soon"
          icon={Play}
        />
        <DashboardCard
          title="Mean Time Between Failures (MTBF)"
          value="--"
          description="Coming Soon"
          icon={Clock}
        />
        <DashboardCard
          title="Mean Time to Repair (MTTR)"
          value="--"
          description="Coming Soon"
          icon={WrenchIcon}
        />
      </div>

      {/* Additional Placeholder Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Critical Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">--</div>
            <p className="text-xs text-muted-foreground mt-1">Pending Criticality Review</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">High Risk Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">--</div>
            <p className="text-xs text-muted-foreground mt-1">Based on FMECA risk evaluation</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Failure Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">--</div>
            <p className="text-xs text-muted-foreground mt-1">Historical failure data</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Open RCA Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">--</div>
            <p className="text-xs text-muted-foreground mt-1">Investigations in progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytical Insights Placeholder Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border border-border/80">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Top Failure Modes & Trends</CardTitle>
            <CardDescription>Analysis of common failure occurrences and patterns</CardDescription>
          </CardHeader>
          <CardContent className="h-[240px] flex items-center justify-center border-t border-border/40">
            <EmptyState
              title="No trend data available"
              description="Failure trend & top failure mode visualizations will be available in upcoming implementation."
              icon={BarChart3}
            />
          </CardContent>
        </Card>

        <Card className="border border-border/80">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Critical Assets & Downtime Analysis</CardTitle>
            <CardDescription>Highest risk assets ranked by downtime contribution</CardDescription>
          </CardHeader>
          <CardContent className="h-[240px] flex items-center justify-center border-t border-border/40">
            <EmptyState
              title="No critical assets mapped"
              description="Downtime trends, critical assets, and top failure causes will be available in upcoming implementation."
              icon={FileSearch}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Temporary internal definition to avoid missing icon
function WrenchIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 text-primary"
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}
