"use client";

import Link from "next/link";
import { ChevronRight, FileSpreadsheet, Download, FileText, TrendingUp, BarChart3 } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/shared/ui-components";
import { Card, CardContent } from "@/components/ui/card";
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

export default function ReliabilityReportsPage() {
  const breadcrumbItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Reliability Engineering", href: "/dashboard/reliability" },
    { name: "Reports" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <Breadcrumb items={breadcrumbItems} />
        <PageHeader
          title="Reliability Reports"
          description="Access analytical reports on Weibull life data analysis, growth models, system availability, and downtime statistics."
        >
          <Button disabled className="gap-2 bg-primary/80">
            <Download className="h-4 w-4" />
            Generate Report
          </Button>
        </PageHeader>
      </div>

      {/* Reports types placeholder templates */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:border-primary/50 transition-all cursor-default bg-card/50">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">Weibull Life Data Analysis</p>
              <p className="text-xs text-muted-foreground mt-0.5">Asset lifetime survival probability distribution</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-all cursor-default bg-card/50">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">Crow-AMSAA Growth Model</p>
              <p className="text-xs text-muted-foreground mt-0.5">Failure trends & reliability growth mapping</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-all cursor-default bg-card/50">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">Asset Bad Actor Report</p>
              <p className="text-xs text-muted-foreground mt-0.5">Ranking of assets contributing highest breakdown time</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-all cursor-default bg-card/50">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">System Reliability Log</p>
              <p className="text-xs text-muted-foreground mt-0.5">Raw breakdown & PM intervals logs export</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Empty State Panel */}
      <Card className="border border-border/80">
        <CardContent className="p-8">
          <EmptyState
            title="No reliability reports generated"
            description="Reliability analytics calculations, charts, and downloadable reports will be available in upcoming implementation."
            icon={FileSpreadsheet}
          />
        </CardContent>
      </Card>
    </div>
  );
}
