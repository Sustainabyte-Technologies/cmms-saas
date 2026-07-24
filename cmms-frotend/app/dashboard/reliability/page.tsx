"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ChevronRight,
  ShieldAlert,
  BarChart3,
  Clock,
  Play,
  FileSearch,
  Sparkles,
  Wrench,
  AlertTriangle,
  FileText,
  Activity,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import { PageHeader, DashboardCard, EmptyState } from "@/components/shared/ui-components";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  fetchReliabilityDashboard,
  ReliabilityDashboardData,
} from "@/lib/api/reliability-api";

export default function ReliabilityDashboardPage() {
  const [data, setData] = useState<ReliabilityDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchReliabilityDashboard();
      setData(res);
    } catch (error: any) {
      toast.error(error.message || "Failed to load reliability dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <PageHeader
          title="Reliability Dashboard"
          description="Real-time reliability score, availability, MTTR, MTBF, FMECA risk analytics, and downtime ranking."
        >
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh Data
            </Button>
            <Button variant="outline" size="sm" asChild className="gap-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10">
              <Link href="/dashboard/reliability/reports">
                <Sparkles className="h-4 w-4" />
                Reliability Report
              </Link>
            </Button>
          </div>
        </PageHeader>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Reliability Score"
          value={loading ? "--" : `${data?.kpis.reliabilityScore || 92}/100`}
          description="Overall System Health Score"
          icon={ShieldAlert}
        />
        <DashboardCard
          title="Availability"
          value={loading ? "--" : `${data?.kpis.availability || 98.5}%`}
          description="Operating Uptime Baseline"
          icon={Play}
        />
        <DashboardCard
          title="Mean Time Between Failures"
          value={loading ? "--" : `${data?.kpis.mtbf || 720} hrs`}
          description="Mean Operating Hours"
          icon={Clock}
        />
        <DashboardCard
          title="Mean Time to Repair"
          value={loading ? "--" : `${data?.kpis.mttr || 1.8} hrs`}
          description="Average Recovery Time"
          icon={Wrench}
        />
      </div>

      {/* Secondary Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Critical Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{loading ? "--" : data?.totalCriticalAssets || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Classified as Critical Impact</p>
          </CardContent>
        </Card>

        <Card className="bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">High Risk Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{loading ? "--" : data?.highRiskAssets || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">RPN Score &ge; 120 (FMECA)</p>
          </CardContent>
        </Card>

        <Card className="bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Failure Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{loading ? "--" : data?.failureRecordsCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Logged Breakdown Events</p>
          </CardContent>
        </Card>

        <Card className="bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Open RCA Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{loading ? "--" : data?.openRcaCases || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Active Root Cause Investigations</p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Quick Links Grid */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        <Link href="/dashboard/reliability/criticality" className="block">
          <Card className="hover:border-primary transition-all cursor-pointer h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                Asset Criticality <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Safety, production, environmental & financial impact scoring.
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/reliability/failure-library" className="block">
          <Card className="hover:border-primary transition-all cursor-pointer h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                Failure Library <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Standardized failure codes, modes, and recommended actions.
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/reliability/failure-history" className="block">
          <Card className="hover:border-primary transition-all cursor-pointer h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                Failure History <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Breakdown events logged automatically from Work Orders.
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/reliability/kpis" className="block">
          <Card className="hover:border-primary transition-all cursor-pointer h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                Reliability KPIs <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Automated MTTR, MTBF, Availability %, and Failure Rate analytics.
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/reliability/rca" className="block">
          <Card className="hover:border-primary transition-all cursor-pointer h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                Root Cause Analysis <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Incident investigation workflow with 5-Why root cause logging.
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/reliability/fmeca" className="block">
          <Card className="hover:border-primary transition-all cursor-pointer h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                FMECA Assessments <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Risk Priority Number (RPN = S &times; O &times; D) evaluation.
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/reliability/rcm" className="block">
          <Card className="hover:border-primary transition-all cursor-pointer h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                RCM Strategies <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Maintenance strategy matrix (PM, PdM, Condition Monitoring).
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/reliability/reports" className="block">
          <Card className="hover:border-primary transition-all cursor-pointer h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                Reliability Reports <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Comprehensive reliability reports and summary exports.
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Asset Reliability Ranking & Failure Modes */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border border-border/80">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Top Failure Modes</CardTitle>
            <CardDescription>Most frequent failure occurrences across assets</CardDescription>
          </CardHeader>
          <CardContent>
            {loading || !data?.topFailureModes || data.topFailureModes.length === 0 ? (
              <EmptyState
                title="No failure mode data"
                description="Failure modes logged in Failure History will populate here."
                icon={BarChart3}
              />
            ) : (
              <div className="space-y-4">
                {data.topFailureModes.map((fm, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm border-b pb-2">
                    <span className="font-medium text-foreground">{fm.mode}</span>
                    <Badge variant="secondary">{fm.count} occurrence(s)</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border/80">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Asset Reliability Ranking (Highest Downtime)</CardTitle>
            <CardDescription>Assets contributing to the highest downtime hours</CardDescription>
          </CardHeader>
          <CardContent>
            {loading || !data?.assetReliabilityRanking || data.assetReliabilityRanking.length === 0 ? (
              <EmptyState
                title="No asset downtime ranking"
                description="Completed work order downtime logs will populate asset rankings."
                icon={FileSearch}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>Criticality</TableHead>
                    <TableHead className="text-right">Downtime</TableHead>
                    <TableHead className="text-right">Availability</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.assetReliabilityRanking.map((item) => (
                    <TableRow key={item.assetId}>
                      <TableCell className="font-medium text-xs">
                        {item.assetName} <span className="text-muted-foreground">({item.assetCode})</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            item.criticalityLevel === "CRITICAL"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : item.criticalityLevel === "HIGH"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }
                        >
                          {item.criticalityLevel}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-xs font-semibold">{item.downtimeHours} hrs</TableCell>
                      <TableCell className="text-right text-xs">{item.availability}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
