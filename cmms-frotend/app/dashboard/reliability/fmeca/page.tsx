"use client";

import Link from "next/link";
import { ChevronRight, Layers, FileText, Activity, AlertTriangle, ShieldCheck } from "lucide-react";
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

export default function FmecaPage() {
  const breadcrumbItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Reliability Engineering", href: "/dashboard/reliability" },
    { name: "FMECA" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <Breadcrumb items={breadcrumbItems} />
        <PageHeader
          title="FMECA / FMEA Analysis"
          description="Analyze Failure Modes, Effects, and Criticality (FMECA) to evaluate risk priority and assign preventative actions."
        >
          <Button disabled variant="outline" size="sm">
            Import Template
          </Button>
        </PageHeader>
      </div>

      {/* RPN Placeholders */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-card/50">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Highest RPN Score</span>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl font-bold">--</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Identified Failure Modes</span>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl font-bold">--</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-green-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Action Recommendations</span>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl font-bold">--</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Empty State Panel */}
      <Card className="border border-border/80">
        <CardContent className="p-8">
          <EmptyState
            title="No FMECA sheets configured"
            description="FMECA risk evaluation grids, criticality calculations, and mitigation recommendations will be available in upcoming implementation."
            icon={Layers}
          />
        </CardContent>
      </Card>
    </div>
  );
}
