"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LineChart as LineChartIcon } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export function AnalyticsReportsView() {
  const trendData = [
    { month: "Jan", breakdowns: 12, routines: 45, efficiency: 88 },
    { month: "Feb", breakdowns: 8, routines: 52, efficiency: 90 },
    { month: "Mar", breakdowns: 14, routines: 48, efficiency: 87 },
    { month: "Apr", breakdowns: 6, routines: 56, efficiency: 92 },
    { month: "May", breakdowns: 9, routines: 61, efficiency: 94 },
    { month: "Jun", breakdowns: 4, routines: 65, efficiency: 95 },
  ];

  const costSplitData = [
    { name: "Labor Costs", value: 6500, color: "#3b82f6" },
    { name: "Spare Parts", value: 3800, color: "#10b981" },
    { name: "Vendor Contracts", value: 2100, color: "#f59e0b" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <LineChartIcon className="h-6 w-6 text-primary" />
            Analytics & Reports View
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Analyze asset MTTR/MTBF, cost allocations, technician workloads, and export compliance reports.
          </p>
        </div>
        <div className="text-[10px] font-bold text-muted-foreground uppercase border rounded-lg px-2.5 py-1 bg-muted/20 shrink-0">
          Audience: Admin • Management
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="p-4 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Mean Time to Repair (MTTR)</span>
          <CardTitle className="text-2xl font-bold mt-2">2.2 hrs</CardTitle>
          <span className="text-[10px] text-emerald-500 font-semibold mt-1">-12% reduction from Q1</span>
        </Card>
        <Card className="p-4 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Mean Time Between Failures (MTBF)</span>
          <CardTitle className="text-2xl font-bold mt-2">198 hrs</CardTitle>
          <span className="text-[10px] text-emerald-500 font-semibold mt-1">+8.4% uptime extension</span>
        </Card>
        <Card className="p-4 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Technician Performance</span>
          <CardTitle className="text-2xl font-bold mt-2">94.8%</CardTitle>
          <span className="text-[10px] text-muted-foreground mt-1 font-semibold">Avg SLA compliance</span>
        </Card>
        <Card className="p-4 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Asset Performance Score</span>
          <CardTitle className="text-2xl font-bold mt-2">87 / 100</CardTitle>
          <span className="text-[10px] text-muted-foreground mt-1 font-semibold">Overall health score</span>
        </Card>
        <Card className="p-4 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">PM Efficiency Rate</span>
          <CardTitle className="text-2xl font-bold mt-2 text-emerald-500">96.4%</CardTitle>
          <Progress value={96.4} className="h-1 mt-2.5" />
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Column 1: Maintenance Trend line chart */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold">Maintenance Trend & Downtime Analysis</CardTitle>
            <CardDescription>Breakdowns vs routine tasks over the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  <Legend />
                  <Line type="monotone" dataKey="routines" stroke="#10b981" name="Routine Tasks" strokeWidth={2} />
                  <Line type="monotone" dataKey="breakdowns" stroke="#ef4444" name="Breakdowns" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Column 2: Cost Analysis Pie Chart */}
        <Card className="flex flex-col justify-between h-full">
          <CardHeader>
            <CardTitle className="text-base font-bold">Cost Analysis Breakdown</CardTitle>
            <CardDescription>Expenses split by resource allocation.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <div className="h-[150px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={costSplitData} cx="55%" cy="50%" innerRadius={50} outerRadius={68} paddingAngle={3} dataKey="value">
                    {costSplitData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {costSplitData.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-bold">${item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
