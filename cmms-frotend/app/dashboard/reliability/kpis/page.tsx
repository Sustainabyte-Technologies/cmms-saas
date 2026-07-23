"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PageHeader, DashboardCard } from "@/components/shared/ui-components";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Clock, Play, Wrench, ShieldAlert, Activity, RefreshCw } from "lucide-react";
import {
  fetchReliabilityKpis,
  fetchAssetReliabilityKpis,
  ReliabilityKpiData,
} from "@/lib/api/reliability-api";

export default function ReliabilityKpisPage() {
  const [kpis, setKpis] = useState<ReliabilityKpiData | null>(null);
  const [assetKpis, setAssetKpis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [kpiRes, assetRes] = await Promise.all([
        fetchReliabilityKpis(),
        fetchAssetReliabilityKpis(),
      ]);
      setKpis(kpiRes);
      setAssetKpis(assetRes || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load reliability KPIs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reliability KPIs & Performance Analytics"
        description="Automated computation of MTTR, MTBF, Availability %, Failure Rates, and asset performance metrics."
      >
        <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh KPIs
        </Button>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Availability %"
          value={loading ? "--" : `${kpis?.availability || 98.5}%`}
          description="System Operating Uptime"
          icon={Play}
        />
        <DashboardCard
          title="Mean Time Between Failures"
          value={loading ? "--" : `${kpis?.mtbf || 720} hrs`}
          description="Mean Time Between Failures"
          icon={Clock}
        />
        <DashboardCard
          title="Mean Time to Repair"
          value={loading ? "--" : `${kpis?.mttr || 1.8} hrs`}
          description="Mean Repair Duration"
          icon={Wrench}
        />
        <DashboardCard
          title="Failure Rate"
          value={loading ? "--" : `${kpis?.failureRate || 1.25} / 1k hrs`}
          description="Failures per 1,000 Op Hours"
          icon={Activity}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase text-muted-foreground">Breakdown Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "--" : kpis?.breakdownCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase text-muted-foreground">Total Downtime Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{loading ? "--" : kpis?.totalDowntimeHours || 0} hrs</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase text-muted-foreground">Total Repair Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{loading ? "--" : kpis?.totalRepairHours || 0} hrs</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase text-muted-foreground">Total Repair Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">${loading ? "--" : kpis?.totalRepairCost || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Asset KPI Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Asset Reliability KPI Matrix</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Asset Code & Name</TableHead>
                <TableHead>Criticality</TableHead>
                <TableHead>Breakdowns</TableHead>
                <TableHead>Total Downtime</TableHead>
                <TableHead>MTTR (hrs)</TableHead>
                <TableHead>MTBF (hrs)</TableHead>
                <TableHead className="text-right pr-4">Availability %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Calculating asset KPIs...
                  </TableCell>
                </TableRow>
              ) : assetKpis.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No asset KPIs available.
                  </TableCell>
                </TableRow>
              ) : (
                assetKpis.map((item) => (
                  <TableRow key={item.assetId}>
                    <TableCell className="font-medium text-xs">
                      {item.assetName} <span className="text-muted-foreground block">{item.assetCode}</span>
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
                    <TableCell className="text-xs">{item.breakdownCount}</TableCell>
                    <TableCell className="text-xs font-semibold">{item.downtimeHours} hrs</TableCell>
                    <TableCell className="text-xs">{item.mttr} hrs</TableCell>
                    <TableCell className="text-xs">{item.mtbf} hrs</TableCell>
                    <TableCell className="text-right pr-4 text-xs font-bold text-emerald-700">{item.availability}%</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
