"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toastService } from "@/lib/toast-service";
import {
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Zap,
  Fuel,
  Droplet,
  Flame,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  BarChart,
  Bar,
  Cell,
} from "recharts";

export function FutureSmartViews() {
  const [analyzing, setAnalyzing] = useState(false);
  const [actions, setActions] = useState([
    {
      id: 1,
      title: "Predictive Bearing Replacement",
      asset: "Conveyor Belt Motor (CV-02)",
      urgency: "High",
      reason: "High frequency vibration spike detected by AI telemetry",
      savings: "$1,800 in breakdown prevention",
    },
    {
      id: 2,
      title: "HVAC Filter Swap Optimization",
      asset: "AHU-4 (Building B)",
      urgency: "Medium",
      reason: "Differential pressure trend suggests saturation in 4 days",
      savings: "12% energy efficiency improvement",
    },
  ]);

  const runDiagnostic = () => {
    setAnalyzing(true);
    const toastId = toastService.loading("AI Engine analyzing sensor telemetry...");
    setTimeout(() => {
      setAnalyzing(false);
      toastService.successWithId("Telemetry scan complete!", toastId, "All systems verified. No new anomalies detected.");
    }, 2000);
  };

  const handleAction = (id: number, title: string) => {
    const toastId = toastService.loading(`Auto-scheduling PM for ${title}...`);
    setTimeout(() => {
      setActions(actions.filter(a => a.id !== id));
      toastService.successWithId("PM Work Order Created!", toastId, `Assigned and scheduled successfully.`);
    }, 1500);
  };

  const energyData = [
    { month: "Jan", electricity: 42000, diesel: 1100, water: 22000, solar: 6500, gas: 310 },
    { month: "Feb", electricity: 45000, diesel: 1200, water: 24000, solar: 7200, gas: 320 },
    { month: "Mar", electricity: 41000, diesel: 950, water: 21000, solar: 8000, gas: 290 },
    { month: "Apr", electricity: 46000, diesel: 1050, water: 23500, solar: 8500, gas: 330 },
    { month: "May", electricity: 44000, diesel: 1300, water: 25000, solar: 9200, gas: 340 },
    { month: "Jun", electricity: 43000, diesel: 1150, water: 24200, solar: 9400, gas: 315 },
  ];

  const costData = [
    { name: "Electricity", value: 8500, color: "#3b82f6" },
    { name: "Diesel", value: 2400, color: "#f59e0b" },
    { name: "Water", value: 1200, color: "#10b981" },
    { name: "Solar", value: 500, color: "#eab308" },
    { name: "Gas", value: 1800, color: "#ec4899" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-violet-500 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-indigo-600 animate-pulse" />
            Future Smart Views (⚡ Energy View - IoT Phase)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time IoT telemetry tracking electricity, diesel, water, solar, gas consumption and costs.
          </p>
        </div>
        <Button onClick={runDiagnostic} disabled={analyzing} className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold shadow-md hover:shadow-lg transition-all gap-2">
          <Sparkles className="h-4 w-4" />
          {analyzing ? "AI Scanning..." : "Run AI Diagnostic Scan"}
        </Button>
      </div>

      {/* Resource Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="bg-card hover:shadow-xs transition-shadow">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-blue-500">Electricity</CardDescription>
            <Zap className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-2xl font-bold">43,000 kWh</CardTitle>
            <p className="text-[10px] text-muted-foreground mt-1 font-semibold">Active load: 142 kW</p>
            <Progress value={85} className="h-1 mt-2 bg-blue-500/10" />
          </CardContent>
        </Card>

        <Card className="bg-card hover:shadow-xs transition-shadow">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-amber-500">Diesel</CardDescription>
            <Fuel className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-2xl font-bold">1,150 Liters</CardTitle>
            <p className="text-[10px] text-muted-foreground mt-1 font-semibold">Gen tank level: 82%</p>
            <Progress value={82} className="h-1 mt-2 bg-amber-500/10" />
          </CardContent>
        </Card>

        <Card className="bg-card hover:shadow-xs transition-shadow">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-emerald-500">Water</CardDescription>
            <Droplet className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-2xl font-bold">24,200 Gal</CardTitle>
            <p className="text-[10px] text-muted-foreground mt-1 font-semibold">Flow rate: 42 GPM</p>
            <Progress value={68} className="h-1 mt-2 bg-emerald-500/10" />
          </CardContent>
        </Card>

        <Card className="bg-card hover:shadow-xs transition-shadow">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-yellow-500">Solar</CardDescription>
            <Sparkles className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-2xl font-bold">9,400 kWh</CardTitle>
            <p className="text-[10px] text-muted-foreground mt-1 font-semibold">Today generated: 320 kWh</p>
            <Progress value={94} className="h-1 mt-2 bg-yellow-500/10" />
          </CardContent>
        </Card>

        <Card className="bg-card hover:shadow-xs transition-shadow">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-pink-500">Gas</CardDescription>
            <Flame className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-2xl font-bold">315 m³</CardTitle>
            <p className="text-[10px] text-muted-foreground mt-1 font-semibold">Supply pressure: 2.1 bar</p>
            <Progress value={60} className="h-1 mt-2 bg-pink-500/10" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold">AI Preventive Recommendations</CardTitle>
            <CardDescription>
              Predictive tasks generated from sensor anomalies and machine-learning models.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {actions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                <p className="font-semibold text-sm mt-3">All clear!</p>
                <p className="text-xs text-muted-foreground mt-1">No pending AI-recommended actions.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {actions.map((action) => (
                  <div key={action.id} className="p-4 rounded-xl border border-indigo-500/10 bg-indigo-500/[0.02] flex items-start justify-between gap-4 transition-all hover:bg-indigo-500/[0.04]">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-500`}>
                          {action.urgency} Urgency
                        </span>
                        <h4 className="text-sm font-bold text-foreground">{action.title}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground font-semibold">Asset: <span className="text-foreground">{action.asset}</span></p>
                      <p className="text-xs text-muted-foreground">{action.reason}</p>
                      <div className="text-xs font-semibold text-emerald-500 flex items-center gap-1 mt-1">
                        <TrendingUp className="h-3 w-3" />
                        Estimated Savings: {action.savings}
                      </div>
                    </div>
                    <Button size="sm" onClick={() => handleAction(action.id, action.title)} className="bg-indigo-500 hover:bg-indigo-600 text-white shrink-0 text-xs font-bold">
                      Approve Work Order
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Smart Load Balancing</CardTitle>
            <CardDescription>Predicted peaks vs. dynamic scheduling adjustments.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3.5 rounded-xl border border-border bg-muted/30">
              <div className="flex justify-between items-center text-xs font-bold mb-1">
                <span>Peak Load Mitigation</span>
                <span className="text-emerald-500">Optimal</span>
              </div>
              <p className="text-xs text-muted-foreground">Smart scheduler postponed heavy cleaning runs to off-peak grid hours (10:00 PM).</p>
            </div>
            <div className="p-3.5 rounded-xl border border-border bg-muted/30">
              <div className="flex justify-between items-center text-xs font-bold mb-1">
                <span>Workforce Efficiency</span>
                <span className="text-indigo-500">89%</span>
              </div>
              <p className="text-xs text-muted-foreground">AI recommends grouping HVAC orders in Zone 3 to save travel time.</p>
            </div>
            <Button size="sm" variant="outline" className="w-full text-xs font-bold" onClick={() => toastService.info("Smart Workforce optimizer updated!")}>
              Optimize Schedules
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Consumption and Cost Charts */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold">Monthly Consumption</CardTitle>
            <CardDescription>IoT utility telemetry tracking across resources.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={energyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  <Legend />
                  <Line type="monotone" dataKey="electricity" stroke="#3b82f6" name="Electricity (kWh)" strokeWidth={2.5} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="water" stroke="#10b981" name="Water (Gal)" strokeWidth={2} />
                  <Line type="monotone" dataKey="solar" stroke="#eab308" name="Solar (kWh)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Cost Comparison</CardTitle>
            <CardDescription>Monthly resource spend allocation.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col justify-between h-[280px]">
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costData}>
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                    {costData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {costData.map((item, idx) => (
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
