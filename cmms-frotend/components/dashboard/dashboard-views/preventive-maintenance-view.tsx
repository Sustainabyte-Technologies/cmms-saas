"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { toastService } from "@/lib/toast-service";
import {
  Calendar,
  Play,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  MapPin,
  Wrench,
  Activity,
  ShieldCheck,
  Zap,
  ArrowUpRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import {
  fetchPMDashboardSummary,
  fetchPMStatusDistribution,
  fetchPMFrequencyBreakdown,
  fetchPMUpcomingList,
  fetchPMOverdueList,
  fetchPMAutoWorkOrders,
  fetchPMByLocation,
  fetchPMRecentActivities,
  fetchPMPerformanceSummary,
  type PMDashboardSummary,
  type PMStatusDistributionItem,
  type PMFrequencyItem,
  type PMUpcomingItem,
  type PMOverdueItem,
  type PMAutoWorkOrderItem,
  type PMByLocationItem,
  type PMRecentActivityItem,
  type PMPerformanceSummary,
} from "@/lib/api/preventive-maintenance-api";

// ─── helpers ──────────────────────────────────────────────────────────────────
function priorityBadge(priority: string) {
  const map: Record<string, string> = {
    CRITICAL: "bg-red-500/15 text-red-500 border-red-500/30",
    HIGH: "bg-orange-500/15 text-orange-500 border-orange-500/30",
    MEDIUM: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    LOW: "bg-blue-400/15 text-blue-400 border-blue-400/30",
  };
  return (
    <span className={`text-[10px] font-bold border rounded px-1.5 py-0.5 ${map[priority] ?? "bg-muted/20 text-muted-foreground border-border"}`}>
      {priority}
    </span>
  );
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    OPEN: "bg-blue-500/15 text-blue-500 border-blue-500/30",
    ASSIGNED: "bg-violet-500/15 text-violet-500 border-violet-500/30",
    IN_PROGRESS: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    COMPLETED: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
    CLOSED: "bg-gray-500/15 text-gray-400 border-gray-500/30",
  };
  const label = status.replace(/_/g, " ");
  return (
    <span className={`text-[10px] font-bold border rounded px-1.5 py-0.5 ${map[status] ?? "bg-muted/20 text-muted-foreground border-border"}`}>
      {label}
    </span>
  );
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m} min${m !== 1 ? "s" : ""} ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr${h !== 1 ? "s" : ""} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d !== 1 ? "s" : ""} ago`;
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function PreventiveMaintenanceView() {
  const [runningPm, setRunningPm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState<PMDashboardSummary>({
    totalPMs: 0, activePMs: 0, inactivePMs: 0, upcomingPMs: 0,
    overduePMs: 0, dueToday: 0, completedThisMonth: 0, pmCompliance: 0,
  });
  const [statusDist, setStatusDist] = useState<PMStatusDistributionItem[]>([]);
  const [frequencyData, setFrequencyData] = useState<PMFrequencyItem[]>([]);
  const [upcomingList, setUpcomingList] = useState<PMUpcomingItem[]>([]);
  const [overdueList, setOverdueList] = useState<PMOverdueItem[]>([]);
  const [autoWOs, setAutoWOs] = useState<PMAutoWorkOrderItem[]>([]);
  const [byLocation, setByLocation] = useState<PMByLocationItem[]>([]);
  const [activities, setActivities] = useState<PMRecentActivityItem[]>([]);
  const [performance, setPerformance] = useState<PMPerformanceSummary>({
    mttrHours: 0, onTimeCompletion: 0, avgDelayDays: 0, pmEfficiency: 0, completedThisMonth: 0,
  });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [sum, dist, freq, upcoming, overdue, wos, loc, acts, perf] = await Promise.all([
          fetchPMDashboardSummary(),
          fetchPMStatusDistribution(),
          fetchPMFrequencyBreakdown(),
          fetchPMUpcomingList(),
          fetchPMOverdueList(),
          fetchPMAutoWorkOrders(),
          fetchPMByLocation(),
          fetchPMRecentActivities(),
          fetchPMPerformanceSummary(),
        ]);
        if (sum) setSummary(sum);
        if (dist) setStatusDist(dist);
        if (freq) setFrequencyData(freq);
        if (upcoming) setUpcomingList(upcoming);
        if (overdue) setOverdueList(overdue);
        if (wos) setAutoWOs(wos);
        if (loc) setByLocation(loc);
        if (acts) setActivities(acts);
        if (perf) setPerformance(perf);
      } catch (err) {
        console.error("❌ Error loading PM dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleManualRun = () => {
    setRunningPm(true);
    const toastId = toastService.loading("Starting PM Scheduling Engine...");
    setTimeout(() => {
      setRunningPm(false);
      toastService.successWithId("PM Engine Run Successful!", toastId, "Generated automated PM work orders for upcoming cycle.");
    }, 2000);
  };

  const maxLoc = byLocation.reduce((m, l) => Math.max(m, l.count), 0) || 1;

  return (
    <div className="space-y-6">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Preventive Maintenance Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor PM schedules, compliance, and maintenance performance.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-[10px] font-bold text-muted-foreground uppercase border rounded-lg px-2.5 py-1 bg-muted/20">
            Admin • Supervisor • Site In-Charge
          </div>
          <Button size="sm" onClick={handleManualRun} disabled={runningPm}
            className="bg-primary hover:bg-primary/90 text-white font-bold h-8 text-[11px] px-3 shadow">
            <Play className="h-3.5 w-3.5 mr-1" />
            Trigger PM Engine
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-muted-foreground animate-pulse">Loading PM diagnostics…</p>
        </div>
      ) : (
        <>
          {/* ── 1. KPI Cards (6) ──────────────────────────────────────────── */}
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 xl:grid-cols-6">
            {[
              { label: "Active PM", value: summary.activePMs, icon: <CheckCircle className="h-5 w-5" />, color: "text-emerald-500", bg: "bg-emerald-500/10 text-emerald-500", sub: "All Active Plans" },
              { label: "Upcoming PM", value: summary.upcomingPMs, icon: <Calendar className="h-5 w-5" />, color: "text-blue-400", bg: "bg-blue-500/10 text-blue-400", sub: "Next 7 Days" },
              { label: "PM Due Today", value: summary.dueToday, icon: <Clock className="h-5 w-5" />, color: "text-amber-500", bg: "bg-amber-500/10 text-amber-500", sub: "Due Today" },
              { label: "Overdue PM", value: summary.overduePMs, icon: <AlertTriangle className="h-5 w-5" />, color: "text-red-500", bg: "bg-red-500/10 text-red-500", sub: "Overdue Plans" },
              { label: "Completed PM", value: summary.completedThisMonth, icon: <Wrench className="h-5 w-5" />, color: "text-violet-500", bg: "bg-violet-500/10 text-violet-500", sub: "This Month" },
              { label: "PM Compliance", value: `${summary.pmCompliance}%`, icon: <ShieldCheck className="h-5 w-5" />, color: summary.pmCompliance >= 90 ? "text-emerald-500" : "text-amber-500", bg: "bg-primary/10 text-primary", sub: "Target: ≥ 95%", isCompliance: true, compliance: summary.pmCompliance },
            ].map((k, idx) => (
              <Card key={idx} className="p-3 flex flex-col gap-2">
                <div className={`w-8 h-8 rounded-lg ${k.bg} flex items-center justify-center`}>
                  {k.icon}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase leading-tight">{k.label}</p>
                  <p className={`text-xl font-bold mt-0.5 ${k.color}`}>{k.value}</p>
                  <p className="text-[9px] text-muted-foreground">{k.sub}</p>
                  {(k as any).isCompliance && (
                    <Progress value={(k as any).compliance} className="h-1 mt-1" />
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* ── 2. Status Distribution Donut + Frequency Bar ──────────────── */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* PM Status Donut */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold">PM Status Distribution</CardTitle>
                <CardDescription>Distribution of PM plans by current status.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="h-[180px] w-[180px] shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={statusDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                          {statusDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip
                          contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                          formatter={(v: any, n: any) => [v + " plans", n]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-2">
                    {statusDist.map((s, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                        <span className="flex-1 text-muted-foreground">{s.name}</span>
                        <span className="font-bold">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* PM by Frequency */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold">PM by Frequency</CardTitle>
                <CardDescription>Breakdown of PM plans by scheduling frequency.</CardDescription>
              </CardHeader>
              <CardContent>
                {frequencyData.length > 0 ? (
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={frequencyData}>
                        <XAxis dataKey="frequency" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                        <YAxis hide />
                        <Tooltip
                          contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                          formatter={(v: any) => [v + " plans", "Count"]}
                        />
                        <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[200px] flex items-center justify-center">
                    <p className="text-xs text-muted-foreground">No frequency data available.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── 3. Upcoming + Overdue Tables ──────────────────────────────── */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Upcoming PM */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-400" />
                  Upcoming PM (Next 7 Days)
                </CardTitle>
                <CardDescription>Scheduled PM tasks due within 7 days.</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingList.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border/60">
                          <th className="text-left py-2 px-1 font-bold text-muted-foreground uppercase text-[10px]">PM Title</th>
                          <th className="text-left py-2 px-1 font-bold text-muted-foreground uppercase text-[10px]">Asset</th>
                          <th className="text-left py-2 px-1 font-bold text-muted-foreground uppercase text-[10px]">Due Date</th>
                          <th className="text-left py-2 px-1 font-bold text-muted-foreground uppercase text-[10px]">Freq</th>
                          <th className="text-left py-2 px-1 font-bold text-muted-foreground uppercase text-[10px]">Priority</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {upcomingList.map((pm) => (
                          <tr key={pm.id} className="hover:bg-muted/10 transition-colors">
                            <td className="py-2 px-1">
                              <p className="font-semibold text-foreground truncate max-w-[120px]">{pm.title}</p>
                              <p className="text-[10px] text-muted-foreground">{pm.pmNumber}</p>
                            </td>
                            <td className="py-2 px-1 text-muted-foreground truncate max-w-[80px]">{pm.assetName}</td>
                            <td className="py-2 px-1 text-muted-foreground">{pm.dueDate}</td>
                            <td className="py-2 px-1 text-[10px] text-muted-foreground">{pm.frequency}</td>
                            <td className="py-2 px-1">{priorityBadge(pm.priority)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-8">🎉 No upcoming PM in the next 7 days.</p>
                )}
              </CardContent>
            </Card>

            {/* Overdue PM */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Overdue PM
                </CardTitle>
                <CardDescription>PM plans that have passed their due date.</CardDescription>
              </CardHeader>
              <CardContent>
                {overdueList.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border/60">
                          <th className="text-left py-2 px-1 font-bold text-muted-foreground uppercase text-[10px]">PM Title</th>
                          <th className="text-left py-2 px-1 font-bold text-muted-foreground uppercase text-[10px]">Asset</th>
                          <th className="text-left py-2 px-1 font-bold text-muted-foreground uppercase text-[10px]">Due Date</th>
                          <th className="text-left py-2 px-1 font-bold text-muted-foreground uppercase text-[10px]">Overdue By</th>
                          <th className="text-left py-2 px-1 font-bold text-muted-foreground uppercase text-[10px]">Priority</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {overdueList.map((pm) => (
                          <tr key={pm.id} className="hover:bg-red-500/5 transition-colors">
                            <td className="py-2 px-1">
                              <p className="font-semibold text-foreground truncate max-w-[120px]">{pm.title}</p>
                              <p className="text-[10px] text-muted-foreground">{pm.pmNumber}</p>
                            </td>
                            <td className="py-2 px-1 text-muted-foreground truncate max-w-[80px]">{pm.assetName}</td>
                            <td className="py-2 px-1 text-muted-foreground">{pm.dueDate}</td>
                            <td className="py-2 px-1">
                              <span className="text-red-500 font-bold">{pm.daysOverdue} Day{pm.daysOverdue !== 1 ? "s" : ""}</span>
                            </td>
                            <td className="py-2 px-1">{priorityBadge(pm.priority)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-8">✅ No overdue PM tasks.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── 4. Auto-Generated Work Orders ─────────────────────────────── */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Wrench className="h-4 w-4 text-violet-500" />
                Auto-Generated Work Orders
              </CardTitle>
              <CardDescription>Work orders automatically created by PM triggers.</CardDescription>
            </CardHeader>
            <CardContent>
              {autoWOs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border/60">
                        <th className="text-left py-2 px-2 font-bold text-muted-foreground uppercase text-[10px]">WO Number</th>
                        <th className="text-left py-2 px-2 font-bold text-muted-foreground uppercase text-[10px]">PM Title</th>
                        <th className="text-left py-2 px-2 font-bold text-muted-foreground uppercase text-[10px]">Asset</th>
                        <th className="text-left py-2 px-2 font-bold text-muted-foreground uppercase text-[10px]">Created On</th>
                        <th className="text-left py-2 px-2 font-bold text-muted-foreground uppercase text-[10px]">Due Date</th>
                        <th className="text-left py-2 px-2 font-bold text-muted-foreground uppercase text-[10px]">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {autoWOs.map((wo) => (
                        <tr key={wo.id} className="hover:bg-muted/10 transition-colors">
                          <td className="py-2.5 px-2">
                            <span className="font-mono text-[10px] bg-violet-500/10 text-violet-400 px-1.5 py-0.5 rounded font-bold">
                              {wo.woNumber}
                            </span>
                          </td>
                          <td className="py-2.5 px-2">
                            <p className="font-semibold text-foreground">{wo.pmTitle}</p>
                            <p className="text-[10px] text-muted-foreground">{wo.pmNumber}</p>
                          </td>
                          <td className="py-2.5 px-2 text-muted-foreground">{wo.assetName}</td>
                          <td className="py-2.5 px-2 text-muted-foreground">{wo.createdAt}</td>
                          <td className="py-2.5 px-2 text-muted-foreground">{wo.dueDate ?? "—"}</td>
                          <td className="py-2.5 px-2">{statusBadge(wo.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-8">No auto-generated work orders yet.</p>
              )}
            </CardContent>
          </Card>

          {/* ── 5. PM by Location + PM Compliance Gauge ───────────────────── */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* PM by Location */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-400" />
                  PM by Location (Top 5)
                </CardTitle>
                <CardDescription>Distribution of PM plans across top asset locations.</CardDescription>
              </CardHeader>
              <CardContent>
                {byLocation.length > 0 ? (
                  <div className="space-y-3">
                    {byLocation.map((loc, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-muted-foreground w-32 shrink-0 truncate">{loc.location}</span>
                        <div className="flex-1 bg-muted/30 rounded-full h-6 overflow-hidden">
                          <div
                            className="h-full rounded-full flex items-center justify-end pr-2.5 transition-all duration-500 bg-primary"
                            style={{ width: `${Math.max(6, (loc.count / maxLoc) * 100)}%` }}
                          >
                            <span className="text-[10px] font-bold text-white">{loc.count}</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-primary w-6 text-right">{loc.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-6">No location data available.</p>
                )}
              </CardContent>
            </Card>

            {/* PM Compliance Gauge */}
            <Card className="flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  PM Compliance
                </CardTitle>
                <CardDescription>Overall PM completion rate vs target.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col items-center justify-center gap-4 py-4">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
                    <circle
                      cx="50" cy="50" r="40" fill="none"
                      stroke={summary.pmCompliance >= 90 ? "#22c55e" : summary.pmCompliance >= 70 ? "#f59e0b" : "#ef4444"}
                      strokeWidth="10"
                      strokeDasharray={`${(summary.pmCompliance / 100) * 251.2} 251.2`}
                      strokeLinecap="round"
                      className="transition-all duration-700"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-2xl font-bold ${summary.pmCompliance >= 90 ? "text-emerald-500" : summary.pmCompliance >= 70 ? "text-amber-500" : "text-red-500"}`}>
                      {summary.pmCompliance}%
                    </span>
                    <span className="text-[10px] text-muted-foreground font-semibold">Compliance</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Target: ≥ 95%</p>
                  <p className={`text-xs font-bold mt-1 ${summary.pmCompliance >= 95 ? "text-emerald-500" : "text-amber-500"}`}>
                    {summary.pmCompliance >= 95 ? "✅ On Target" : "⚠️ Below Target"}
                  </p>
                </div>
                <div className="w-full space-y-1.5 text-xs border-t border-border/50 pt-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed / Month</span>
                    <span className="font-bold text-emerald-500">{summary.completedThisMonth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Overdue</span>
                    <span className="font-bold text-red-500">{summary.overduePMs}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── 6. Performance Summary + Recent Activities ─────────────────── */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Performance KPIs */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  PM Performance Summary
                </CardTitle>
                <CardDescription>Key maintenance performance indicators.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "MTTR (PM)", value: `${performance.mttrHours} hrs`, icon: <Clock className="h-4 w-4 text-blue-400" />, color: "text-blue-400" },
                  { label: "On-Time Completion", value: `${performance.onTimeCompletion}%`, icon: <CheckCircle className="h-4 w-4 text-emerald-500" />, color: "text-emerald-500" },
                  { label: "Avg Delay (days)", value: `${performance.avgDelayDays}`, icon: <AlertTriangle className="h-4 w-4 text-amber-500" />, color: "text-amber-500" },
                  { label: "PM Efficiency", value: `${performance.pmEfficiency}%`, icon: <Zap className="h-4 w-4 text-violet-500" />, color: "text-violet-500" },
                ].map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-border/50 bg-muted/10">
                    <div className="flex items-center gap-2">
                      {p.icon}
                      <span className="text-xs text-muted-foreground font-semibold">{p.label}</span>
                    </div>
                    <span className={`text-sm font-bold ${p.color}`}>{p.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent PM Activities */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Recent PM Activities
                </CardTitle>
                <CardDescription>Latest PM-related work order updates and activities.</CardDescription>
              </CardHeader>
              <CardContent>
                {activities.length > 0 ? (
                  <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                    {activities.map((act) => (
                      <div key={act.id} className="flex items-start justify-between gap-3 p-2.5 rounded-xl border border-border/50 bg-muted/10 hover:bg-muted/20 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{act.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                            Asset: {act.assetName} • {act.technician} • {act.pmNumber || act.woNumber}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {statusBadge(act.status)}
                          <span className="text-[10px] text-muted-foreground">{timeAgo(act.updatedAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-8">No recent PM activities found.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
