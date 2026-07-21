"use client";

import Link from "next/link";
import { ChevronRight, BarChart3, Clock, Play, TrendingUp, AlertTriangle, ShieldCheck } from "lucide-react";
import { PageHeader, DashboardCard, EmptyState } from "@/components/shared/ui-components";
import { Card, CardContent } from "@/components/ui/card";

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

export default function ReliabilityKpisPage() {
  const breadcrumbItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Reliability Engineering", href: "/dashboard/reliability" },
    { name: "Reliability KPIs" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <Breadcrumb items={breadcrumbItems} />
        <PageHeader
          title="Reliability KPIs"
          description="Track and monitor key performance indicators to assess equipment and plant reliability."
        />
      </div>

      {/* KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title="Mean Time Between Failures (MTBF)"
          value="--"
          description="Target: > 720 Hours"
          icon={Clock}
        />
        <DashboardCard
          title="Mean Time to Repair (MTTR)"
          value="--"
          description="Target: < 2.0 Hours"
          icon={Clock}
        />
        <DashboardCard
          title="Equipment Availability"
          value="--"
          description="Target: > 98.5%"
          icon={Play}
        />
        <DashboardCard
          title="Failure Rate (λ)"
          value="--"
          description="Failures per million hours"
          icon={TrendingUp}
        />
        <DashboardCard
          title="Total Downtime"
          value="--"
          description="Accumulated hours this month"
          icon={AlertTriangle}
        />
        <DashboardCard
          title="Reliability %"
          value="--"
          description="Probability of survival index"
          icon={ShieldCheck}
        />
      </div>

      {/* Empty State visual check */}
      <Card className="border border-border/80">
        <CardContent className="p-8">
          <EmptyState
            title="KPI reports and trends under development"
            description="Detailed KPI drill-downs and trend charts will be available in upcoming implementation."
            icon={BarChart3}
          />
        </CardContent>
      </Card>
    </div>
  );
}
