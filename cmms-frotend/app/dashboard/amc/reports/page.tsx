"use client";

import { useEffect, useState } from "react";
import {
  FileSpreadsheet,
  Download,
  BarChart3,
  TrendingUp,
  ShieldAlert,
  Clock,
  DollarSign,
  CheckCircle,
  RefreshCw,
  Printer,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { fetchAMCContracts, fetchAMCStatistics, AMCContract, AMCStatistics } from "@/lib/api/amc-api";
import { toast } from "sonner";

export default function AMCReportsPage() {
  const [stats, setStats] = useState<AMCStatistics | null>(null);
  const [contracts, setContracts] = useState<AMCContract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    setLoading(true);
    try {
      const [sRes, cRes] = await Promise.all([
        fetchAMCStatistics(),
        fetchAMCContracts({ limit: 100 }),
      ]);
      setStats(sRes);
      setContracts(cRes.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load reports data");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!contracts.length) {
      toast.error("No contract data available to generate PDF");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups to download the PDF report");
      return;
    }

    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = new Date().toLocaleTimeString();

    const tableRows = contracts.map((c: AMCContract, i: number) => `
      <tr style="background-color: ${i % 2 === 0 ? '#ffffff' : '#f8fafc'};">
        <td style="padding: 10px 12px; font-family: monospace; font-weight: bold; color: #166534;">${c.contractNumber}</td>
        <td style="padding: 10px 12px; font-weight: 600; color: #0f172a;">${c.contractName}</td>
        <td style="padding: 10px 12px; color: #334155;">${c.customer?.name || 'N/A'}</td>
        <td style="padding: 10px 12px;"><span style="display: inline-block; padding: 2px 8px; font-size: 10px; font-weight: 600; border-radius: 4px; background-color: #e2e8f0; color: #334155;">${c.contractType.replace('_', ' ')}</span></td>
        <td style="padding: 10px 12px;"><span style="display: inline-block; padding: 2px 8px; font-size: 10px; font-weight: 600; border-radius: 4px; background-color: ${c.status === 'ACTIVE' ? '#dcfce7' : '#f1f5f9'}; color: ${c.status === 'ACTIVE' ? '#15803d' : '#64748b'};">${c.status}</span></td>
        <td style="padding: 10px 12px; font-size: 12px; color: #334155;">${c.slaResponseTime} hrs</td>
        <td style="padding: 10px 12px; font-size: 12px; color: #334155;">${c.slaResolutionTime} hrs</td>
        <td style="padding: 10px 12px; text-align: right; font-weight: bold; color: #0f172a;">$${c.contractValue.toLocaleString()}</td>
      </tr>
    `).join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>FixByte CMMS - AMC Audit & Financial Report</title>
          <style>
            @page { size: A4 portrait; margin: 10mm; }
            body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 15px; background: #fff; }
            .header-bar { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #15803d; padding-bottom: 12px; margin-bottom: 18px; }
            .logo-sub { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #15803d; margin-top: 2px; }
            .meta-box { text-align: right; font-size: 11px; color: #64748b; }
            .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
            .kpi-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; background: #fafafa; }
            .kpi-title { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 3px; }
            .kpi-val { font-size: 18px; font-weight: 800; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 11px; }
            th { background-color: #0f172a; color: #ffffff; text-align: left; padding: 8px 10px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
            td { border-bottom: 1px solid #e2e8f0; }
            .footer-sign { margin-top: 35px; display: flex; justify-content: space-between; padding-top: 15px; border-top: 1px solid #cbd5e1; }
            .sign-box { width: 180px; text-align: center; font-size: 10px; color: #64748b; }
            .sign-line { border-top: 1px solid #0f172a; margin-top: 35px; margin-bottom: 4px; }
          </style>
        </head>
        <body>
          <div class="header-bar">
            <div style="display: flex; align-items: center; gap: 12px;">
              <img src="${window.location.origin}/logo1.png" style="height: 42px; width: auto; object-fit: contain;" />
              <div style="display: flex; flex-direction: column;">
                <img src="${window.location.origin}/logo2.png" style="height: 24px; width: auto; object-fit: contain;" />
                <div class="logo-sub">Enterprise AMC Audit Report</div>
              </div>
            </div>
            <div class="meta-box">
              <div><strong>Generated Date:</strong> ${dateStr}</div>
              <div><strong>Time:</strong> ${timeStr}</div>
              <div><strong>Document Ref:</strong> RPT-AMC-${Date.now().toString().slice(-6)}</div>
            </div>
          </div>

          <div class="kpi-grid">
            <div class="kpi-card" style="border-left: 4px solid #15803d;">
              <div class="kpi-title">Total Contract Value</div>
              <div class="kpi-val" style="color: #15803d;">$${(stats?.monthlyRevenue || 0).toLocaleString()}</div>
            </div>
            <div class="kpi-card" style="border-left: 4px solid #0284c7;">
              <div class="kpi-title">Active AMC Contracts</div>
              <div class="kpi-val">${stats?.activeContracts || 0}</div>
            </div>
            <div class="kpi-card" style="border-left: 4px solid #6366f1;">
              <div class="kpi-title">Avg Response SLA</div>
              <div class="kpi-val">24.0 Hours</div>
            </div>
            <div class="kpi-card" style="border-left: 4px solid #e11d48;">
              <div class="kpi-title">SLA Breaches</div>
              <div class="kpi-val" style="color: #e11d48;">${stats?.slaBreaches || 0}</div>
            </div>
          </div>

          <h3 style="font-size: 14px; font-weight: 700; margin-bottom: 10px; color: #0f172a;">AMC Contract Directory & SLA Compliance</h3>
          <table>
            <thead>
              <tr>
                <th>Contract No</th>
                <th>Contract Title</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Status</th>
                <th>Response SLA</th>
                <th>Resolution SLA</th>
                <th style="text-align: right;">Contract Value</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>

          <div class="footer-sign">
            <div class="sign-box">
              <div class="sign-line"></div>
              <div>Prepared By: Maintenance Manager</div>
            </div>
            <div class="sign-box">
              <div class="sign-line"></div>
              <div>Approved By: Director of Operations</div>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const exportSummaryCSV = () => {
    if (!contracts.length) {
      toast.error("No data to export");
      return;
    }
    const headers = [
      "Contract Number",
      "Contract Name",
      "Customer",
      "Type",
      "Status",
      "Start Date",
      "End Date",
      "Response SLA (hrs)",
      "Resolution SLA (hrs)",
      "Value",
    ];
    const rows = contracts.map((c: AMCContract) => [
      c.contractNumber,
      `"${c.contractName.replace(/"/g, '""')}"`,
      `"${(c.customer?.name || "").replace(/"/g, '""')}"`,
      c.contractType,
      c.status,
      new Date(c.startDate).toLocaleDateString(),
      new Date(c.endDate).toLocaleDateString(),
      c.slaResponseTime,
      c.slaResolutionTime,
      c.contractValue,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r: any[]) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `amc_summary_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("AMC Summary Report exported to CSV");
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">AMC Service & Financial Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Audit compliance, SLA response benchmarks, financial performance & asset coverage metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={loadReportsData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportSummaryCSV}>
            <Download className="h-4 w-4 mr-2" /> Export Audit CSV
          </Button>
          <Button size="sm" onClick={handleExportPDF} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Printer className="h-4 w-4 mr-2" /> Export PDF Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-l-4 border-l-primary">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Total Contract Value</p>
              <h3 className="text-2xl font-bold mt-1">${(stats?.monthlyRevenue || 0).toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <DollarSign className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-emerald-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Active Contracts</p>
              <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {stats?.activeContracts || 0}
              </h3>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
              <CheckCircle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-indigo-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">SLA Response Average</p>
              <h3 className="text-2xl font-bold mt-1">24.0 hrs</h3>
            </div>
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500">
              <Clock className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-rose-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">SLA Breaches</p>
              <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                {stats?.slaBreaches || 0}
              </h3>
            </div>
            <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500">
              <ShieldAlert className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Audit Summary Table */}
      <Card className="shadow-sm">
        <CardHeader className="p-4 border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold">AMC Audit & Compliance Summary</CardTitle>
            <CardDescription>Comprehensive overview of contract SLAs and value distribution</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-bold">Contract No.</TableHead>
                <TableHead className="font-bold">Contract Name</TableHead>
                <TableHead className="font-bold">Customer</TableHead>
                <TableHead className="font-bold">Type</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="font-bold">Response SLA</TableHead>
                <TableHead className="font-bold">Resolution SLA</TableHead>
                <TableHead className="font-bold text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Generating AMC report...
                  </TableCell>
                </TableRow>
              ) : contracts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    No contract records available to display in report.
                  </TableCell>
                </TableRow>
              ) : (
                contracts.map((c: AMCContract) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs font-bold text-primary">{c.contractNumber}</TableCell>
                    <TableCell className="font-semibold text-foreground text-sm">{c.contractName}</TableCell>
                    <TableCell className="text-xs font-medium">{c.customer?.name || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs font-mono">
                        {c.contractType.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          c.status === "ACTIVE"
                            ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/20"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-bold text-primary">{c.slaResponseTime} hours</TableCell>
                    <TableCell className="text-xs font-bold text-primary">{c.slaResolutionTime} hours</TableCell>
                    <TableCell className="text-right font-semibold text-sm">
                      ${c.contractValue.toLocaleString()}
                    </TableCell>
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
