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
import { Leaf } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

export function SustainabilityView() {
  const weeklyEnergyData = [
    { name: "Week 1", kwh: 1200 },
    { name: "Week 2", kwh: 1140 },
    { name: "Week 3", kwh: 980 },
    { name: "Week 4", kwh: 1040 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Leaf className="h-6 w-6 text-emerald-500 animate-pulse" />
            Sustainability View (Enterprise Phase)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time carbon audits, emissions offset index, water footprint, and waste recycling values.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card className="p-4 flex flex-col justify-between border-emerald-500/10">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Carbon Emission</span>
          <CardTitle className="text-xl font-bold mt-2">12.4 tCO₂e</CardTitle>
        </Card>

        <Card className="p-4 flex flex-col justify-between border-emerald-500/10">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">CO₂ Reduction</span>
          <CardTitle className="text-xl font-bold mt-2 text-emerald-500">-1.8 tons</CardTitle>
        </Card>

        <Card className="p-4 flex flex-col justify-between border-emerald-500/10">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Water Usage</span>
          <CardTitle className="text-xl font-bold mt-2 text-blue-500">18,500 Gal</CardTitle>
        </Card>

        <Card className="p-4 flex flex-col justify-between border-emerald-500/10">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Waste Generation</span>
          <CardTitle className="text-xl font-bold mt-2">420 kg</CardTitle>
          <span className="text-[10px] text-emerald-500 font-semibold mt-1">78% recycled</span>
        </Card>

        <Card className="p-4 flex flex-col justify-between border-emerald-500/10">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">ESG Score</span>
          <div>
            <CardTitle className="text-xl font-bold mt-2 text-emerald-600">94 / 100</CardTitle>
            <Progress value={94} className="h-1 mt-1 bg-emerald-500/10" />
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between border-emerald-500/10">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Energy Saving</span>
          <CardTitle className="text-xl font-bold mt-2 text-emerald-500">+$2,840</CardTitle>
          <span className="text-[10px] text-muted-foreground mt-1">Saved this month</span>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Weekly energy saving graph */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold">Weekly Energy Savings (kWh)</CardTitle>
            <CardDescription>Track factory electricity efficiency after smart load-balancing optimizations.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyEnergyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="kwh" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={45}>
                    {weeklyEnergyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 2 ? "#3b82f6" : "#10b981"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Active ESG initiatives list */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Initiatives & Compliance</CardTitle>
            <CardDescription>Active ESG efficiency projects.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3.5 rounded-xl border border-border bg-emerald-500/[0.01] hover:bg-emerald-500/[0.03] transition-colors">
              <div className="flex justify-between items-center text-xs font-bold mb-1">
                <span>LED Retrofitting Building B</span>
                <span className="text-emerald-500">Complete</span>
              </div>
              <p className="text-[11px] text-muted-foreground">Replaced 420 halogen bulbs with high-efficiency LEDs. Savings: 1,400 kWh/month.</p>
            </div>
            <div className="p-3.5 rounded-xl border border-border bg-muted/30">
              <div className="flex justify-between items-center text-xs font-bold mb-1">
                <span>Solar Water Pump Install</span>
                <span className="text-indigo-500 text-[10px]">Phase 2</span>
              </div>
              <p className="text-[11px] text-muted-foreground">Planning installation for external generator pad. Scheduled for mid-July.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
