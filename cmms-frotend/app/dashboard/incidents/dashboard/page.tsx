"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { PageHeader, DashboardCard } from "@/components/shared/ui-components";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  fetchIncidentDashboard,
  IncidentDashboardData,
} from "@/lib/api/incidents-api";
import {
  ShieldAlert,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Flame,
  Zap,
  Eye,
  Plus,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function IncidentDashboardPage() {
  const [data, setData] = useState<IncidentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetchIncidentDashboard();
      setData(res);
    } catch (error: any) {
      toast.error(error.message || "Failed to load incident dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-2">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        Loading Incident Dashboard Metrics...
      </div>
    );
  }

  const metrics = data?.metrics || {
    total: 0,
    open: 0,
    underInvestigation: 0,
    correctiveAction: 0,
    resolved: 0,
    closed: 0,
    critical: 0,
    high: 0,
    nearMiss: 0,
    fire: 0,
    electrical: 0,
  };

  const monthlyTrend = data?.monthlyTrend || [];
  const statusDist = data?.statusDistribution || [];
  const severityDist = data?.severityDistribution || [];
  const typeDist = data?.typeDistribution || [];
  const recentIncidents = data?.recentIncidents || [];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Incident Management Dashboard"
        description="Executive metrics, safety KPIs, incident trends, and severity distribution."
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadDashboard}>
            <RefreshCw className="mr-1.5 h-4 w-4" /> Refresh
          </Button>
          <Button asChild size="sm">
            <Link href="/dashboard/incidents/new">
              <Plus className="mr-1.5 h-4 w-4" /> Report Incident
            </Link>
          </Button>
        </div>
      </PageHeader>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
        <DashboardCard
          title="Total Incidents"
          value={metrics.total.toString()}
          icon={ShieldAlert}
          description="Total logged incident events"
          className="border-primary/20 hover:shadow-md transition-all"
        />

        <DashboardCard
          title="Open Incidents"
          value={metrics.open.toString()}
          icon={Clock}
          description="Pending action or assignment"
          className="border-amber-500/20 hover:shadow-md transition-all"
        />

        <DashboardCard
          title="Under Investigation"
          value={metrics.underInvestigation.toString()}
          icon={AlertTriangle}
          description="Active root-cause analysis"
          className="border-blue-500/20 hover:shadow-md transition-all"
        />

        <DashboardCard
          title="Resolved"
          value={metrics.resolved.toString()}
          icon={CheckCircle2}
          description="Corrective action applied"
          className="border-emerald-500/20 hover:shadow-md transition-all"
        />

        <DashboardCard
          title="Closed Incidents"
          value={metrics.closed.toString()}
          icon={CheckCircle2}
          description="Verified & signed off"
          className="border-gray-500/20 hover:shadow-md transition-all"
        />

        <DashboardCard
          title="Critical Severity"
          value={metrics.critical.toString()}
          icon={AlertOctagon}
          description="Immediate high priority"
          className="border-red-500/20 bg-red-500/5 hover:shadow-md transition-all"
        />

        <DashboardCard
          title="High Severity"
          value={metrics.high.toString()}
          icon={AlertTriangle}
          description="Major operational impact"
          className="border-amber-500/20 hover:shadow-md transition-all"
        />

        <DashboardCard
          title="Near Miss"
          value={metrics.nearMiss.toString()}
          icon={ShieldAlert}
          description="Safety warning occurrences"
          className="border-purple-500/20 hover:shadow-md transition-all"
        />

        <DashboardCard
          title="Fire Incidents"
          value={metrics.fire.toString()}
          icon={Flame}
          description="Thermal or combustion hazards"
          className="border-orange-500/20 hover:shadow-md transition-all"
        />

        <DashboardCard
          title="Electrical Incidents"
          value={metrics.electrical.toString()}
          icon={Zap}
          description="Voltage or arc flash events"
          className="border-yellow-500/20 hover:shadow-md transition-all"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Incident Trend */}
        <Card className="hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Monthly Incident Trend (Last 6 Months)
            </CardTitle>
            <CardDescription>Frequency of reported incident occurrences per month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border) / 0.4)" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis allowDecimals={false} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Bar dataKey="count" name="Incidents" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Severity Distribution Pie Chart */}
        <Card className="hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-primary" />
              Severity Distribution
            </CardTitle>
            <CardDescription>Breakdown of incidents by risk severity levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityDist}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {severityDist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Incident Type Distribution Bar Chart */}
        <Card className="lg:col-span-2 hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Incident Type Distribution</CardTitle>
            <CardDescription>Occurrences categorized by Incident Type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeDist} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border) / 0.4)" />
                  <XAxis type="number" allowDecimals={false} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis dataKey="type" type="category" width={140} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                  />
                  <Bar dataKey="count" name="Incidents" fill="#8b5cf6" radius={[0, 4, 4, 0]} maxBarSize={25} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Incidents Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Recent Incident Logs</CardTitle>
            <CardDescription>Latest reported incidents requiring attention</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/incidents">View All Incidents</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {recentIncidents.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No recent incidents logged.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Incident #</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reported Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentIncidents.map((inc) => (
                  <TableRow key={inc.id}>
                    <TableCell className="font-mono text-xs font-bold text-primary">
                      {inc.incidentNumber}
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {inc.title}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted">
                        {inc.incidentType}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          inc.severity === "CRITICAL"
                            ? "bg-red-500/15 text-red-700"
                            : inc.severity === "HIGH"
                            ? "bg-amber-500/15 text-amber-700"
                            : "bg-blue-500/15 text-blue-700"
                        }
                      >
                        {inc.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{inc.status}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(inc.reportedDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/incidents/${inc.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
