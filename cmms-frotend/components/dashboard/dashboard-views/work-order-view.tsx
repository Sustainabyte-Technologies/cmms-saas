"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Wrench,
  AlertTriangle,
  Clock,
  TrendingUp,
  MapPin,
  Users,
  CheckCircle,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import {
  fetchWorkOrderDashboardStats,
  fetchWorkOrderDashboardPriority,
  fetchWorkOrderDashboardTrend,
  fetchWorkOrderDashboardCategories,
  fetchWorkOrderDashboardSites,
  fetchWorkOrderDashboardWorkload,
  fetchWorkOrderDashboardSLA,
  fetchWorkOrderDashboardRecent,
  fetchWorkOrderDashboardCritical,
  fetchWorkOrderDashboardCompletionTime,
} from "@/lib/api/work-orders-api";

export function WorkOrderView() {
  const [woData, setWoData] = useState({
    open: 0,
    assigned: 0,
    inProgress: 0,
    completed: 0,
    closed: 0,
    overdue: 0,
    avgTime: "0.0 hrs",
  });
  const [priorityData, setPriorityData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [siteData, setSiteData] = useState<any[]>([]);
  const [workloadData, setWorkloadData] = useState<any[]>([]);
  const [slaData, setSlaData] = useState({ withinSLA: 100, outsideSLA: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [criticalOrders, setCriticalOrders] = useState<any[]>([]);
  const [completionSplit, setCompletionSplit] = useState({
    today: "0.0 hrs",
    thisWeek: "0.0 hrs",
    thisMonth: "0.0 hrs",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [
          stats,
          priority,
          trend,
          categories,
          sites,
          workload,
          sla,
          recent,
          critical,
          completion,
        ] = await Promise.all([
          fetchWorkOrderDashboardStats(),
          fetchWorkOrderDashboardPriority(),
          fetchWorkOrderDashboardTrend(),
          fetchWorkOrderDashboardCategories(),
          fetchWorkOrderDashboardSites(),
          fetchWorkOrderDashboardWorkload(),
          fetchWorkOrderDashboardSLA(),
          fetchWorkOrderDashboardRecent(),
          fetchWorkOrderDashboardCritical(),
          fetchWorkOrderDashboardCompletionTime(),
        ]);

        if (stats) setWoData(stats);
        if (priority) setPriorityData(priority);
        if (trend) setTrendData(trend);
        if (categories) setCategoryData(categories);
        if (sites) setSiteData(sites);
        if (workload) setWorkloadData(workload);
        if (sla) setSlaData(sla);
        if (recent) setRecentOrders(recent);
        if (critical) setCriticalOrders(critical);
        if (completion) setCompletionSplit(completion);
      } catch (err) {
        console.error("❌ Error loading work order dashboard views:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Wrench className="h-6 w-6 text-primary" />
            Work Order View
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Dispatch backlog, SLA response times, and technician productivity trackers.
          </p>
        </div>
        <div className="text-[10px] font-bold text-muted-foreground uppercase border rounded-lg px-2.5 py-1 bg-muted/20 shrink-0">
          Audience: Admin • Supervisor • Site In-Charge
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-muted-foreground animate-pulse">Loading Work Order analytics...</p>
        </div>
      ) : (
        <>
          {/* Top Level KPIs */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-6">
            <Card className="p-4 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Open</span>
              <CardTitle className="text-2xl font-bold mt-1 text-blue-500">{woData.open}</CardTitle>
            </Card>
            <Card className="p-4 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Assigned</span>
              <CardTitle className="text-2xl font-bold mt-1 text-slate-500">{woData.assigned}</CardTitle>
            </Card>
            <Card className="p-4 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">In Progress</span>
              <CardTitle className="text-2xl font-bold mt-1 text-indigo-500">{woData.inProgress}</CardTitle>
            </Card>
            <Card className="p-4 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Completed</span>
              <CardTitle className="text-2xl font-bold mt-1 text-emerald-500">{woData.completed}</CardTitle>
            </Card>
            <Card className="p-4 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Closed</span>
              <CardTitle className="text-2xl font-bold mt-1 text-teal-600">{woData.closed}</CardTitle>
            </Card>
            <Card className="p-4 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Overdue</span>
              <CardTitle className="text-2xl font-bold mt-1 text-red-500">{woData.overdue}</CardTitle>
            </Card>
          </div>

          {/* SLA Compliance and Avg Completion Time Splits */}
          <div className="grid gap-4 md:grid-cols-5">
            {/* SLA Compliance Card */}
            <Card className="md:col-span-2 flex flex-col justify-between">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-foreground">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  SLA Compliance
                </CardTitle>
                <CardDescription className="text-[11px]">SLA deadlines and completion compliance.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 pb-4">
                <div className="border rounded-xl p-3 bg-emerald-500/5 text-center">
                  <span className="text-[10px] font-bold text-emerald-600 block uppercase">Within SLA</span>
                  <span className="text-2xl font-bold text-emerald-600 mt-1 block">{slaData.withinSLA}%</span>
                </div>
                <div className="border rounded-xl p-3 bg-red-500/5 text-center">
                  <span className="text-[10px] font-bold text-red-500 block uppercase">Outside SLA</span>
                  <span className="text-2xl font-bold text-red-500 mt-1 block">{slaData.outsideSLA}%</span>
                </div>
              </CardContent>
            </Card>

            {/* Average Completion Time splits */}
            <Card className="md:col-span-3 flex flex-col justify-between">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  Average Completion Time
                </CardTitle>
                <CardDescription className="text-[11px]">Average resolution times mapped by period.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-2 pb-4">
                <div className="border rounded-xl p-3 bg-card/50 text-center">
                  <span className="text-[10px] font-bold text-muted-foreground block uppercase">Today</span>
                  <span className="text-lg font-bold text-foreground mt-1 block">{completionSplit.today}</span>
                </div>
                <div className="border rounded-xl p-3 bg-card/50 text-center">
                  <span className="text-[10px] font-bold text-muted-foreground block uppercase">This Week</span>
                  <span className="text-lg font-bold text-foreground mt-1 block">{completionSplit.thisWeek}</span>
                </div>
                <div className="border rounded-xl p-3 bg-card/50 text-center">
                  <span className="text-[10px] font-bold text-muted-foreground block uppercase">This Month</span>
                  <span className="text-lg font-bold text-foreground mt-1 block">{completionSplit.thisMonth}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Work Order Trend (last 30 days) */}
            <Card className="flex flex-col justify-between h-full">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-1.5">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Work Order Trend
                </CardTitle>
                <CardDescription>Daily creations, completions, and overdue updates (last 30 days).</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between pb-4">
                {trendData.length > 0 ? (
                  <div className="h-[220px] w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} style={{ fontSize: "10px" }} />
                        <YAxis tickLine={false} axisLine={false} style={{ fontSize: "10px" }} />
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                        <Legend style={{ fontSize: "11px" }} />
                        <Line type="monotone" dataKey="created" stroke="#3b82f6" name="Created" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="completed" stroke="#10b981" name="Completed" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="overdue" stroke="#ef4444" name="Overdue" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[220px] flex items-center justify-center">
                    <p className="text-xs text-muted-foreground">No trend logs found.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Work Orders by Category */}
            <Card className="flex flex-col justify-between h-full">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-1.5">
                  <Wrench className="h-5 w-5 text-primary" />
                  Work Orders by Category
                </CardTitle>
                <CardDescription>Distribution of registered work orders by functional categories.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between pb-4">
                {categoryData.some((c) => c.count > 0) ? (
                  <div className="h-[220px] w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryData}>
                        <XAxis dataKey="category" tickLine={false} axisLine={false} style={{ fontSize: "10px" }} />
                        <YAxis tickLine={false} axisLine={false} style={{ fontSize: "10px" }} />
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                        <Bar dataKey="count" fill="#3b82f6" name="Work Orders" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[220px] flex items-center justify-center">
                    <p className="text-xs text-muted-foreground">No categorized orders found.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sites & Technician Workload Grid */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Work Orders by Site */}
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-1.5">
                  <MapPin className="h-5 w-5 text-primary" />
                  Work Orders by Site
                </CardTitle>
                <CardDescription>Performance and backlog metrics mapped per site.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-3 overflow-y-auto max-h-[300px]">
                {siteData.map((site, idx) => (
                  <div key={idx} className="p-3 border rounded-xl bg-card/50 space-y-2">
                    <span className="font-bold text-xs text-foreground block">{site.siteName}</span>
                    <div className="grid grid-cols-3 gap-1 text-[10px] text-center">
                      <div className="p-1 border rounded bg-blue-500/5">
                        <span className="font-bold text-blue-500 block">Open</span>
                        <span className="font-bold block mt-0.5">{site.open}</span>
                      </div>
                      <div className="p-1 border rounded bg-emerald-500/5">
                        <span className="font-bold text-emerald-600 block">Completed</span>
                        <span className="font-bold block mt-0.5">{site.completed}</span>
                      </div>
                      <div className="p-1 border rounded bg-red-500/5">
                        <span className="font-bold text-red-500 block">Overdue</span>
                        <span className="font-bold block mt-0.5">{site.overdue}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {siteData.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-8">No sites registered.</p>
                )}
              </CardContent>
            </Card>

            {/* Technician Workload Table */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-1.5">
                  <Users className="h-5 w-5 text-primary" />
                  Technician Workload
                </CardTitle>
                <CardDescription>Productivity logs, assigned orders, and completion times.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="py-2.5 font-bold">Technician</th>
                      <th className="py-2.5 text-center font-bold">Assigned</th>
                      <th className="py-2.5 text-center font-bold">Completed</th>
                      <th className="py-2.5 text-center font-bold">Pending</th>
                      <th className="py-2.5 text-right font-bold">Average Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workloadData.map((tech, idx) => (
                      <tr key={idx} className="border-b hover:bg-muted/10">
                        <td className="py-2.5 font-semibold text-foreground">{tech.technician}</td>
                        <td className="py-2.5 text-center font-bold">{tech.assigned}</td>
                        <td className="py-2.5 text-center text-emerald-500 font-bold">{tech.completed}</td>
                        <td className="py-2.5 text-center text-blue-500 font-bold">{tech.pending}</td>
                        <td className="py-2.5 text-right font-bold text-muted-foreground">{tech.avgTime}</td>
                      </tr>
                    ))}
                    {workloadData.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center text-xs text-muted-foreground py-8">
                          No technician workloads reported.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          {/* Critical Work Orders Alerts Section */}
          {criticalOrders.length > 0 && (
            <Card className="border-red-500/20 bg-red-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-red-500 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" />
                  Critical Work Orders (Due Today / Overdue)
                </CardTitle>
                <CardDescription className="text-red-500/70 text-[11px]">
                  High priority items requiring immediate attention.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 pb-4">
                {criticalOrders.map((wo, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row justify-between sm:items-center p-3 rounded-xl border border-red-500/20 bg-card/60 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-red-500 uppercase border border-red-500/30 bg-red-500/10 px-2 py-0.5 rounded text-[10px]">
                          {wo.workOrderNumber}
                        </span>
                        <h4 className="font-bold text-foreground">{wo.title}</h4>
                      </div>
                      <p className="text-muted-foreground mt-1">
                        Asset: <span className="font-semibold">{wo.assetName}</span> • Technician:{" "}
                        <span className="font-semibold">{wo.technicianName}</span>
                      </p>
                    </div>
                    {wo.dueDate && (
                      <div className="text-red-500 font-bold text-[10px] sm:text-right mt-2 sm:mt-0 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Due: {new Date(wo.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recent Work Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-1.5">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                Recent Work Orders
              </CardTitle>
              <CardDescription>Summary of the latest 10 work orders logged.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="py-2.5 font-bold">WO Number</th>
                    <th className="py-2.5 font-bold">Title</th>
                    <th className="py-2.5 font-bold">Asset</th>
                    <th className="py-2.5 text-center font-bold">Priority</th>
                    <th className="py-2.5 font-bold">Technician</th>
                    <th className="py-2.5 text-center font-bold">Status</th>
                    <th className="py-2.5 text-right font-bold">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((wo, idx) => (
                    <tr key={idx} className="border-b hover:bg-muted/10">
                      <td className="py-2.5 font-bold text-foreground">
                        <span className="bg-muted px-2 py-1 rounded text-[10px]">
                          {wo.workOrderNumber}
                        </span>
                      </td>
                      <td className="py-2.5 font-medium text-foreground max-w-[150px] truncate">{wo.title}</td>
                      <td className="py-2.5 text-muted-foreground">{wo.assetName}</td>
                      <td className="py-2.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            wo.priority === "CRITICAL"
                              ? "bg-red-500/10 text-red-500 border border-red-500/20"
                              : wo.priority === "HIGH"
                              ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                              : wo.priority === "MEDIUM"
                              ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                              : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          }`}
                        >
                          {wo.priority}
                        </span>
                      </td>
                      <td className="py-2.5 text-muted-foreground">{wo.technicianName}</td>
                      <td className="py-2.5 text-center">
                        <span className="font-semibold text-slate-500">{wo.status}</span>
                      </td>
                      <td className="py-2.5 text-right text-muted-foreground font-medium">
                        {wo.dueDate ? new Date(wo.dueDate).toLocaleDateString() : "N/A"}
                      </td>
                    </tr>
                  ))}
                  {recentOrders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center text-xs text-muted-foreground py-8">
                        No work orders logged.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}


