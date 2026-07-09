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
import {
  Building,
  MapPin,
  Factory,
  ClipboardList,
  Percent,
  Gauge,
  AlertTriangle,
  Activity,
  BarChart3,
} from "lucide-react";

// Import API utilities
import { getDashboardOverview, getRecentActivities } from "@/lib/api/dashboard-api";
import { getCustomers } from "@/lib/api/customers-api";
import { fetchAssets } from "@/lib/api/assets-api";
import { fetchWorkOrders } from "@/lib/api/work-orders-api";

export function ExecutiveView() {
  const [stats, setStats] = useState({
    totalCustomers: 3,
    totalSites: 5,
    totalAssets: 3,
    totalWorkOrders: 8,
    pmCompliance: 96.4,
    assetHealth: 87.0,
    maintenanceCost: 12400,
  });

  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [overview, custs, woList, assetList, actLogs] = await Promise.all([
          getDashboardOverview().catch(() => null),
          getCustomers().catch(() => []),
          fetchWorkOrders().catch(() => []),
          fetchAssets().catch(() => []),
          getRecentActivities().catch(() => []),
        ]);

        const computedStats = { ...stats };
        if (custs && custs.length > 0) {
          computedStats.totalCustomers = custs.length;
          computedStats.totalSites = custs.reduce((acc, c) => acc + (c.sites?.length || 0), 0);
        }
        const hasAssets = assetList && !Array.isArray(assetList) && assetList.data;
        if (hasAssets && assetList.data.length > 0) {
          computedStats.totalAssets = assetList.data.length;
        }
        const hasWorkOrders = woList && !Array.isArray(woList) && woList.workOrders;
        if (hasWorkOrders && woList.workOrders.length > 0) {
          computedStats.totalWorkOrders = woList.workOrders.length;
        }
        if (overview && overview.cards) {
          if (overview.cards.totalAssets) computedStats.totalAssets = overview.cards.totalAssets;
          if (overview.cards.totalWorkOrders) computedStats.totalWorkOrders = overview.cards.totalWorkOrders;
        }

        setStats(computedStats);
        setActivities(actLogs || []);
      } catch (err) {
        console.error("Error loading Executive data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const topSites = [
    { name: "Site Chennai", manager: "Rajesh Kumar", compliance: "98.5%", health: "92%", cost: "$2,400" },
    { name: "Site Bangalore", manager: "Anil Dev", compliance: "97.0%", health: "88%", cost: "$4,100" },
    { name: "Site Mumbai", manager: "Amit Shah", compliance: "95.2%", health: "85%", cost: "$3,800" },
  ];

  const criticalAlerts = [
    { id: 1, text: "Critical Vibration spike on Air Compressor CL-04 (Site Chennai)", time: "10 mins ago" },
    { id: 2, text: "Generator Fuel low alert - safety reserves running (Site Mumbai)", time: "1 hour ago" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Executive View (CEO / Admin)
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overall business health metrics, portfolio compliance, cost indices, and critical alarms.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-7">
        <Card className="p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Total Customers</span>
            <Building className="h-4 w-4 text-primary" />
          </div>
          <CardTitle className="text-xl font-bold mt-2">{stats.totalCustomers}</CardTitle>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Total Sites</span>
            <MapPin className="h-4 w-4 text-primary" />
          </div>
          <CardTitle className="text-xl font-bold mt-2">{stats.totalSites}</CardTitle>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Total Assets</span>
            <Factory className="h-4 w-4 text-primary" />
          </div>
          <CardTitle className="text-xl font-bold mt-2">{stats.totalAssets}</CardTitle>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Total Work Orders</span>
            <ClipboardList className="h-4 w-4 text-primary" />
          </div>
          <CardTitle className="text-xl font-bold mt-2">{stats.totalWorkOrders}</CardTitle>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">PM Compliance</span>
            <Percent className="h-4 w-4 text-emerald-500" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold mt-2">{stats.pmCompliance}%</CardTitle>
            <Progress value={stats.pmCompliance} className="h-1 mt-1.5" />
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Asset Health</span>
            <Gauge className="h-4 w-4 text-emerald-500" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold mt-2">{stats.assetHealth}%</CardTitle>
            <Progress value={stats.assetHealth} className="h-1 mt-1.5" />
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Maint. Cost</span>
            <span className="text-sm font-bold text-emerald-500">$</span>
          </div>
          <CardTitle className="text-xl font-bold mt-2">${stats.maintenanceCost.toLocaleString()}</CardTitle>
        </Card>
      </div>

      {/* Alerts and Layout Details */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Side: Top Sites and Alerts */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold">Top Performing Sites</CardTitle>
              <CardDescription>Sites rated by PM compliance rates and asset health index.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-border font-bold text-muted-foreground pb-2">
                      <th className="py-2">Site Name</th>
                      <th className="py-2">Manager</th>
                      <th className="py-2">Compliance</th>
                      <th className="py-2">Health</th>
                      <th className="py-2">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topSites.map((s, idx) => (
                      <tr key={idx} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                        <td className="py-3 font-semibold text-foreground">{s.name}</td>
                        <td className="py-3 text-muted-foreground">{s.manager}</td>
                        <td className="py-3 text-emerald-500 font-bold">{s.compliance}</td>
                        <td className="py-3 font-bold">{s.health}</td>
                        <td className="py-3 font-semibold">{s.cost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-500/20 bg-red-500/[0.01]">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-red-500 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 animate-pulse text-red-500" />
                Critical Alerts
              </CardTitle>
              <CardDescription>Active exceptions flagged from regional sites.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {criticalAlerts.map((a) => (
                <div key={a.id} className="p-3 border border-red-500/10 rounded-xl bg-red-500/[0.02] flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">{a.text}</span>
                  <span className="text-muted-foreground shrink-0">{a.time}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Recent Activities */}
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle className="text-base font-bold">Recent Activities</CardTitle>
            <CardDescription>Live audit logs from system users.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto max-h-[360px] space-y-4">
            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-muted-foreground">
                <Activity className="h-8 w-8 opacity-40 mb-2" />
                No activities logged today.
              </div>
            ) : (
              activities.slice(0, 8).map((act) => (
                <div key={act.id} className="flex items-start gap-3 text-xs leading-normal">
                  <div className="h-6 w-6 rounded-full bg-primary/10 border flex items-center justify-center text-[10px] shrink-0 font-bold">
                    {act.performedBy?.fullName?.slice(0, 2).toUpperCase() || "US"}
                  </div>
                  <div>
                    <p className="font-bold text-foreground">
                      {act.performedBy?.fullName || "User"} <span className="font-normal text-muted-foreground">{act.action}</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
