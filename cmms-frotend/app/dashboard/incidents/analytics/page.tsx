"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/ui-components";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { fetchIncidentStatistics, IncidentDashboardData } from "@/lib/api/incidents-api";
import { ArrowLeft, RefreshCw, BarChart3, TrendingUp, ShieldCheck } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export default function IncidentAnalyticsPage() {
  const [data, setData] = useState<IncidentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await fetchIncidentStatistics();
      setData(res);
    } catch (error: any) {
      toast.error(error.message || "Failed to load incident statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-2">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        Loading Incident Analytics...
      </div>
    );
  }

  const monthlyTrend = data?.monthlyTrend || [];
  const typeDist = data?.typeDistribution || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <PageHeader
        title="Incident Analytics & Safety Performance"
        description="Comprehensive safety trend metrics, operational risk patterns, and incident statistics."
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/incidents">
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Incidents
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={loadStats}>
            <RefreshCw className="mr-1.5 h-4 w-4" /> Refresh
          </Button>
        </div>
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-4 border-l-4 border-l-primary">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Logged Incidents</p>
              <p className="text-2xl font-bold">{data?.metrics.total || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-red-500">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-xs text-muted-foreground font-medium">Critical Incidents Rate</p>
              <p className="text-2xl font-bold">
                {data?.metrics.total
                  ? `${Math.round(((data.metrics.critical || 0) / data.metrics.total) * 100)}%`
                  : "0%"}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-emerald-500" />
            <div>
              <p className="text-xs text-muted-foreground font-medium">Resolution Compliance Rate</p>
              <p className="text-2xl font-bold">
                {data?.metrics.total
                  ? `${Math.round(
                      (((data.metrics.resolved || 0) + (data.metrics.closed || 0)) /
                        data.metrics.total) *
                        100
                    )}%`
                  : "0%"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Incident Volume Over Time</CardTitle>
          <CardDescription>Monthly incident volume trends across all business units</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border) / 0.4)" />
                <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <YAxis allowDecimals={false} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                />
                <Legend />
                <Bar dataKey="count" name="Incidents Logged" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
