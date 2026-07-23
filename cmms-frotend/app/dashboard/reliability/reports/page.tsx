"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/ui-components";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, Printer, RefreshCw, Sparkles, ShieldAlert, FileText, CheckCircle2 } from "lucide-react";
import { fetchReliabilityReports } from "@/lib/api/reliability-api";

export default function ReliabilityReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchReliabilityReports();
      setData(res);
    } catch (err: any) {
      toast.error(err.message || "Failed to load reliability reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!data) return;
    const rows = [
      ["Metric", "Value"],
      ["Reliability Score", `${data.kpis?.reliabilityScore || 92}/100`],
      ["Availability", `${data.kpis?.availability || 98.5}%`],
      ["MTTR", `${data.kpis?.mttr || 1.8} hrs`],
      ["MTBF", `${data.kpis?.mtbf || 720} hrs`],
      ["Breakdown Count", `${data.kpis?.breakdownCount || 0}`],
      ["Total Downtime", `${data.kpis?.totalDowntimeHours || 0} hrs`],
      ["Total Repair Cost", `$${data.kpis?.totalRepairCost || 0}`],
      ["Criticality Assessments", `${data.summary?.criticalitiesCount || 0}`],
      ["Failure Library Entries", `${data.summary?.libraryCount || 0}`],
      ["RCA Cases", `${data.summary?.rcaCount || 0}`],
      ["FMECA Assessments", `${data.summary?.fmecaCount || 0}`],
      ["RCM Strategies", `${data.summary?.rcmCount || 0}`],
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reliability_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Reliability report exported");
  };

  return (
    <div className="space-y-6 print:p-0">
      <PageHeader
        title="Reliability Summary & Audit Reports"
        description="Comprehensive audit report compiling Asset Criticalities, Failure History, MTTR, MTBF, RCA, FMECA, and RCM strategies."
      >
        <div className="flex items-center gap-2 print:hidden">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" /> Export CSV / Excel
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Print / PDF Export
          </Button>
        </div>
      </PageHeader>

      {/* KPI Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Reliability Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{loading ? "--" : `${data?.kpis?.reliabilityScore || 92}/100`}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Availability %</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{loading ? "--" : `${data?.kpis?.availability || 98.5}%`}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">MTBF (Operating Hrs)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{loading ? "--" : `${data?.kpis?.mtbf || 720} hrs`}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">MTTR (Repair Hrs)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{loading ? "--" : `${data?.kpis?.mttr || 1.8} hrs`}</div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Module Counts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Reliability Module Audit Summary</CardTitle>
          <CardDescription>Overview of active reliability engineering records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            <div className="p-3 bg-muted/40 rounded-lg">
              <span className="text-xs text-muted-foreground block">Criticality Reviews</span>
              <span className="text-xl font-bold text-foreground">{loading ? "--" : data?.summary?.criticalitiesCount || 0}</span>
            </div>
            <div className="p-3 bg-muted/40 rounded-lg">
              <span className="text-xs text-muted-foreground block">Failure Library</span>
              <span className="text-xl font-bold text-foreground">{loading ? "--" : data?.summary?.libraryCount || 0}</span>
            </div>
            <div className="p-3 bg-muted/40 rounded-lg">
              <span className="text-xs text-muted-foreground block">Failure Logs</span>
              <span className="text-xl font-bold text-foreground">{loading ? "--" : data?.summary?.historyCount || 0}</span>
            </div>
            <div className="p-3 bg-muted/40 rounded-lg">
              <span className="text-xs text-muted-foreground block">RCA Cases</span>
              <span className="text-xl font-bold text-foreground">{loading ? "--" : data?.summary?.rcaCount || 0}</span>
            </div>
            <div className="p-3 bg-muted/40 rounded-lg">
              <span className="text-xs text-muted-foreground block">FMECA Assessments</span>
              <span className="text-xl font-bold text-foreground">{loading ? "--" : data?.summary?.fmecaCount || 0}</span>
            </div>
            <div className="p-3 bg-muted/40 rounded-lg">
              <span className="text-xs text-muted-foreground block">RCM Strategies</span>
              <span className="text-xl font-bold text-foreground">{loading ? "--" : data?.summary?.rcmCount || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Criticality & FMECA Risk Matrices */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Highest Criticality Assets</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="text-right pr-4">Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading || !data?.topCriticalityAssets ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4 text-xs text-muted-foreground">
                      Loading data...
                    </TableCell>
                  </TableRow>
                ) : (
                  data.topCriticalityAssets.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-xs">{item.asset?.assetName}</TableCell>
                      <TableCell className="text-xs font-bold">{item.criticalityScore} / 25</TableCell>
                      <TableCell className="text-right pr-4">
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                          {item.criticalityLevel}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Highest FMECA RPN Risks</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset & Failure Mode</TableHead>
                  <TableHead>RPN Score</TableHead>
                  <TableHead className="text-right pr-4">Risk Ranking</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading || !data?.topFmecaRisks ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4 text-xs text-muted-foreground">
                      Loading data...
                    </TableCell>
                  </TableRow>
                ) : (
                  data.topFmecaRisks.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-xs">
                        {item.asset?.assetName}
                        <span className="block text-muted-foreground">{item.failureModeText}</span>
                      </TableCell>
                      <TableCell className="text-xs font-bold text-amber-700">{item.rpn} / 1000</TableCell>
                      <TableCell className="text-right pr-4">
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                          {item.riskRanking}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
