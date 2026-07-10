"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

export function InventoryView() {
  const [invData] = useState({
    invValue: 48250,
    lowStock: 5,
    criticalStock: 2,
    outOfStock: 1,
  });

  const topParts = [
    { name: "HVAC Filters MERV 13 (24x24)", consumed: 42, remaining: 12, cost: "$360" },
    { name: "Industrial Bearing Lube ISO 100", consumed: 18, remaining: 1, cost: "$85" },
    { name: "Copper Piping 1/2 inch 10ft", consumed: 28, remaining: 24, cost: "$480" },
  ];

  const purchaseRequests = [
    { req: "REQ-0024: 10 units Hydraulic Oil Drums", cost: "$1,800", date: "Today", status: "Pending Manager Review" },
    { req: "REQ-0025: 5 units Merf Replacement Filters", cost: "$250", date: "Yesterday", status: "Approved" },
  ];

  const consumptionData = [
    { name: "Filters", value: 45 },
    { name: "Lubricants", value: 25 },
    { name: "Pipes & Fittings", value: 30 },
  ];

  const colors = ["#3b82f6", "#f59e0b", "#10b981"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            Inventory View
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Spare parts valuation, stock depletion warnings, and purchase requisition statuses.
          </p>
        </div>
        <div className="text-[10px] font-bold text-muted-foreground uppercase border rounded-lg px-2.5 py-1 bg-muted/20 shrink-0">
          Audience: Inventory Manager • Admin
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Inventory Value</span>
          <CardTitle className="text-2xl font-bold mt-2">${invData.invValue.toLocaleString()}</CardTitle>
        </Card>
        <Card className="p-4 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Low Stock SKUs</span>
          <CardTitle className="text-2xl font-bold mt-2 text-amber-500">{invData.lowStock}</CardTitle>
        </Card>
        <Card className="p-4 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Critical Stock SKUs</span>
          <CardTitle className="text-2xl font-bold mt-2 text-red-500">{invData.criticalStock}</CardTitle>
        </Card>
        <Card className="p-4 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Out of Stock SKUs</span>
          <CardTitle className="text-2xl font-bold mt-2 text-destructive">{invData.outOfStock}</CardTitle>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Column 1: Top Spare Parts and Purchase Requests */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold">Top Spare Parts & Stock Levels</CardTitle>
              <CardDescription>Most frequently consumed spare parts index.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-border font-bold text-muted-foreground pb-2">
                      <th className="py-2">Part Name</th>
                      <th className="py-2">Consumed (Month)</th>
                      <th className="py-2">Remaining Stock</th>
                      <th className="py-2">Cost Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topParts.map((p, idx) => (
                      <tr key={idx} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                        <td className="py-3 font-semibold text-foreground">{p.name}</td>
                        <td className="py-3 text-muted-foreground font-bold">{p.consumed} units</td>
                        <td className="py-3">
                          <span className={`font-bold ${p.remaining < 5 ? "text-red-500" : "text-emerald-500"}`}>
                            {p.remaining} units
                          </span>
                        </td>
                        <td className="py-3 font-semibold">{p.cost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold">Purchase Requests Feed</CardTitle>
              <CardDescription>Requisitions generated for low-stock spare parts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {purchaseRequests.map((pr, idx) => (
                <div key={idx} className="p-3 border rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-foreground">{pr.req}</p>
                    <p className="text-muted-foreground mt-0.5">Created: {pr.date} • Status: <span className="font-semibold text-primary">{pr.status}</span></p>
                  </div>
                  <span className="font-bold text-emerald-500">{pr.cost}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Column 2: Stock Consumption Pie Chart */}
        <Card className="flex flex-col justify-between h-full">
          <CardHeader>
            <CardTitle className="text-base font-bold">Stock Consumption Breakdown</CardTitle>
            <CardDescription>Value allocation split by category.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={consumptionData} cx="55%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={3} dataKey="value">
                    {consumptionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {consumptionData.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: colors[idx] }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-bold">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
