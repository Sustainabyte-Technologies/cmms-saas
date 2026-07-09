"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Factory,
  AlertTriangle,
  CheckCircle,
  Settings,
  Archive,
  ShieldAlert,
  Activity,
  Zap,
  ChevronRight,
  ChevronDown,
  Building2,
  MapPin,
  Layers,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  fetchAssetDashboardStats,
  fetchAssetDashboardCategories,
  fetchAssetDashboardDowntime,
  fetchAssetDashboardHealthDistribution,
  fetchAssetDashboardLifecycle,
  fetchAssetDashboardLocationHierarchy,
  fetchAssetDashboardCriticalList,
  type LocationHierarchyCustomer,
  type CriticalAssetItem,
} from "@/lib/api/assets-api";

// ─── helpers ───────────────────────────────────────────────────────────────────
function statusBadge(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    BREAKDOWN: { label: "Breakdown", cls: "bg-red-500/15 text-red-500 border-red-500/30" },
    UNDER_MAINTENANCE: { label: "Maintenance", cls: "bg-amber-500/15 text-amber-500 border-amber-500/30" },
    IDLE: { label: "Idle", cls: "bg-blue-400/15 text-blue-400 border-blue-400/30" },
    ACTIVE: { label: "Active", cls: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30" },
    RETIRED: { label: "Retired", cls: "bg-gray-500/15 text-gray-400 border-gray-500/30" },
  };
  const s = map[status] ?? { label: status, cls: "bg-muted/20 text-muted-foreground border-border" };
  return (
    <span className={`text-[10px] font-bold border rounded px-1.5 py-0.5 ${s.cls}`}>
      {s.label}
    </span>
  );
}

function healthColor(h: number) {
  if (h >= 80) return "bg-emerald-500";
  if (h >= 55) return "bg-amber-500";
  return "bg-red-500";
}

function healthText(h: number) {
  if (h >= 80) return "text-emerald-500";
  if (h >= 55) return "text-amber-500";
  return "text-red-500";
}

// ─── Location Hierarchy Row ────────────────────────────────────────────────────
function LocationRow({ customer }: { customer: LocationHierarchyCustomer }) {
  const [open, setOpen] = useState(false);
  const [openSites, setOpenSites] = useState<Record<string, boolean>>({});

  return (
    <div className="border border-border/60 rounded-xl overflow-hidden">
      {/* Customer row */}
      <button
        className="w-full flex items-center justify-between px-4 py-2.5 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Building2 className="h-4 w-4 text-primary" />
          {customer.name}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            {customer.count} assets
          </span>
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </div>
      </button>

      {open && customer.sites.map((site) => (
        <div key={site.id} className="border-t border-border/40">
          {/* Site row */}
          <button
            className="w-full flex items-center justify-between px-6 py-2 bg-muted/10 hover:bg-muted/30 transition-colors text-left"
            onClick={() => setOpenSites((s) => ({ ...s, [site.id]: !s[site.id] }))}
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground/80">
              <MapPin className="h-3.5 w-3.5 text-blue-400" />
              {site.name}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold bg-blue-400/10 text-blue-400 px-2 py-0.5 rounded-full">
                {site.count} assets
              </span>
              {openSites[site.id] ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            </div>
          </button>

          {openSites[site.id] && (
            <div className="bg-muted/5 divide-y divide-border/30">
              {site.departments.map((dept) => (
                <div key={dept.id} className="flex items-center justify-between px-10 py-1.5">
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <Layers className="h-3 w-3 text-violet-400" />
                    {dept.name}
                  </div>
                  <span className="text-[10px] font-bold text-violet-400">{dept.count} assets</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function AssetView() {
  const [assetStats, setAssetStats] = useState({
    totalAssets: 0,
    activeAssets: 0,
    underMaintenance: 0,
    criticalAssets: 0,
    idleAssets: 0,
    retiredAssets: 0,
    warrantyExpiring: 0,
    avgHealthScore: 0,
    availability: 0,
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [downtimeData, setDowntimeData] = useState<any[]>([]);
  const [healthDist, setHealthDist] = useState<any[]>([]);
  const [lifecycle, setLifecycle] = useState<any[]>([]);
  const [locationHierarchy, setLocationHierarchy] = useState<LocationHierarchyCustomer[]>([]);
  const [criticalList, setCriticalList] = useState<CriticalAssetItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [stats, cats, downtime, healthD, life, locH, critL] = await Promise.all([
          fetchAssetDashboardStats(),
          fetchAssetDashboardCategories(),
          fetchAssetDashboardDowntime(),
          fetchAssetDashboardHealthDistribution(),
          fetchAssetDashboardLifecycle(),
          fetchAssetDashboardLocationHierarchy(),
          fetchAssetDashboardCriticalList(),
        ]);

        if (stats) setAssetStats(stats as any);
        if (cats) setCategories(cats);
        if (downtime) setDowntimeData(downtime);
        if (healthD) setHealthDist(healthD);
        if (life) setLifecycle(life);
        if (locH) setLocationHierarchy(locH);
        if (critL) setCriticalList(critL);
      } catch (err) {
        console.error("❌ Error loading asset dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const kpiCards = [
    {
      label: "Total Assets",
      value: assetStats.totalAssets,
      icon: <Factory className="h-5 w-5" />,
      color: "text-foreground",
      bg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      label: "Active Assets",
      value: assetStats.activeAssets,
      icon: <CheckCircle className="h-5 w-5" />,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
    },
    {
      label: "Under Maintenance",
      value: assetStats.underMaintenance,
      icon: <Settings className="h-5 w-5" />,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      iconColor: "text-amber-500",
    },
    {
      label: "Critical (Breakdown)",
      value: assetStats.criticalAssets,
      icon: <AlertTriangle className="h-5 w-5" />,
      color: "text-red-500",
      bg: "bg-red-500/10",
      iconColor: "text-red-500",
    },
    {
      label: "Retired Assets",
      value: assetStats.retiredAssets,
      icon: <Archive className="h-5 w-5" />,
      color: "text-gray-400",
      bg: "bg-gray-500/10",
      iconColor: "text-gray-400",
    },
    {
      label: "Warranty Expiring",
      value: assetStats.warrantyExpiring,
      sub: "(next 30 days)",
      icon: <ShieldAlert className="h-5 w-5" />,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      iconColor: "text-orange-500",
    },
    {
      label: "Avg Health Score",
      value: `${assetStats.avgHealthScore}%`,
      icon: <Activity className="h-5 w-5" />,
      color: assetStats.avgHealthScore >= 80 ? "text-emerald-500" : assetStats.avgHealthScore >= 55 ? "text-amber-500" : "text-red-500",
      bg: "bg-violet-500/10",
      iconColor: "text-violet-500",
    },
    {
      label: "Asset Availability",
      value: `${assetStats.availability}%`,
      icon: <Zap className="h-5 w-5" />,
      color: assetStats.availability >= 90 ? "text-emerald-500" : "text-amber-500",
      bg: "bg-cyan-500/10",
      iconColor: "text-cyan-500",
    },
  ];

  // Max for lifecycle funnel bar width
  const maxLifecycle = lifecycle.reduce((m, l) => Math.max(m, l.count), 0) || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Factory className="h-6 w-6 text-primary" />
            Asset View
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Complete asset diagnostics, health distribution, lifecycle, locations and warranty details.
          </p>
        </div>
        <div className="text-[10px] font-bold text-muted-foreground uppercase border rounded-lg px-2.5 py-1 bg-muted/20 shrink-0">
          Admin • Site In-Charge • Supervisor
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-muted-foreground animate-pulse">Loading Asset diagnostics…</p>
        </div>
      ) : (
        <>
          {/* ── 1. KPI Cards (8) ─────────────────────────────────────── */}
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 xl:grid-cols-8">
            {kpiCards.map((k, idx) => (
              <Card key={idx} className="p-3 flex flex-col gap-2">
                <div className={`w-8 h-8 rounded-lg ${k.bg} flex items-center justify-center ${k.iconColor}`}>
                  {k.icon}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase leading-tight">{k.label}</p>
                  {k.sub && <p className="text-[9px] text-muted-foreground leading-tight">{k.sub}</p>}
                  <p className={`text-xl font-bold mt-0.5 ${k.color}`}>{k.value}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* ── 2. Health Distribution Donut + Category Bar ───────────── */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Donut */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold">Asset Health Distribution</CardTitle>
                <CardDescription>Real-time asset health categorisation across the fleet.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={healthDist}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {healthDist.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                        formatter={(value: any, name: any) => [value + " assets", name]}
                      />
                      <Legend iconType="circle" iconSize={8} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {healthDist.map((h, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs p-2 rounded-lg border border-border/50 bg-muted/10">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: h.color }} />
                      <span className="text-muted-foreground flex-1">{h.name}</span>
                      <span className="font-bold">{h.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Category Bar */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold">Asset Category Distribution</CardTitle>
                <CardDescription>Number of assets by category type across all sites.</CardDescription>
              </CardHeader>
              <CardContent>
                {categories.length > 0 ? (
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categories} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis
                          type="category"
                          dataKey="category"
                          width={90}
                          tick={{ fontSize: 11 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                          formatter={(v: any) => [v + " assets", "Count"]}
                        />
                        <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[220px] flex items-center justify-center">
                    <p className="text-xs text-muted-foreground">No category data available.</p>
                  </div>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {categories.slice(0, 6).map((c, idx) => (
                    <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                      {c.category}: {c.count}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── 3. Asset Lifecycle Status (funnel) ───────────────────── */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">Asset Lifecycle Status</CardTitle>
              <CardDescription>Pipeline view showing asset progression through lifecycle stages.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lifecycle.map((stage, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <span className="text-xs font-semibold text-muted-foreground w-24 shrink-0">{stage.stage}</span>
                    <div className="flex-1 bg-muted/30 rounded-full h-7 relative overflow-hidden">
                      <div
                        className="h-full rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                        style={{
                          width: `${Math.max(8, (stage.count / maxLifecycle) * 100)}%`,
                          background: stage.color,
                        }}
                      >
                        <span className="text-[10px] font-bold text-white">{stage.count}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold w-10 text-right" style={{ color: stage.color }}>
                      {stage.count}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ── 4. Critical Assets Table ─────────────────────────────── */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Critical Assets & Warranty Status
              </CardTitle>
              <CardDescription>
                Assets in Breakdown, Under Maintenance, or Idle – with health score, warranty, last service and next PM.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {criticalList.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border/60">
                        <th className="text-left py-2 px-2 font-bold text-muted-foreground uppercase tracking-wide">Asset</th>
                        <th className="text-left py-2 px-2 font-bold text-muted-foreground uppercase tracking-wide">Category</th>
                        <th className="text-left py-2 px-2 font-bold text-muted-foreground uppercase tracking-wide">Health %</th>
                        <th className="text-left py-2 px-2 font-bold text-muted-foreground uppercase tracking-wide">Warranty</th>
                        <th className="text-left py-2 px-2 font-bold text-muted-foreground uppercase tracking-wide">Last Service</th>
                        <th className="text-left py-2 px-2 font-bold text-muted-foreground uppercase tracking-wide">Next PM</th>
                        <th className="text-left py-2 px-2 font-bold text-muted-foreground uppercase tracking-wide">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {criticalList.map((a) => (
                        <tr key={a.id} className="hover:bg-muted/10 transition-colors">
                          <td className="py-2.5 px-2">
                            <p className="font-bold text-foreground">{a.assetName}</p>
                            <p className="text-[10px] text-muted-foreground">{a.assetCode}</p>
                          </td>
                          <td className="py-2.5 px-2 text-muted-foreground">{a.category}</td>
                          <td className="py-2.5 px-2">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-muted/30 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${healthColor(a.health)}`}
                                  style={{ width: `${a.health}%` }}
                                />
                              </div>
                              <span className={`font-bold ${healthText(a.health)}`}>{a.health}%</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-2">
                            <span
                              className={`font-semibold ${
                                a.warranty === "Expired"
                                  ? "text-red-500"
                                  : a.warranty === "Expiring Soon"
                                  ? "text-orange-500"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {a.warranty}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-muted-foreground">{a.lastService ?? "—"}</td>
                          <td className="py-2.5 px-2 text-muted-foreground">{a.nextPm ?? "—"}</td>
                          <td className="py-2.5 px-2">{statusBadge(a.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-8">
                  🎉 No critical or maintenance assets at this time.
                </p>
              )}
            </CardContent>
          </Card>

          {/* ── 5. Location Hierarchy + Downtime ─────────────────────── */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Location Hierarchy */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold">Asset Location Overview</CardTitle>
                <CardDescription>Customer → Site → Department hierarchy with asset counts.</CardDescription>
              </CardHeader>
              <CardContent>
                {locationHierarchy.length > 0 ? (
                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                    {locationHierarchy.map((customer) => (
                      <LocationRow key={customer.id} customer={customer} />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-8">
                    No location data available.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Downtime Bar */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold">Asset Downtime Analysis</CardTitle>
                <CardDescription>Downtime hours aggregated by asset category from closed work orders.</CardDescription>
              </CardHeader>
              <CardContent>
                {downtimeData.length > 0 ? (
                  <>
                    <div className="h-[220px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={downtimeData}>
                          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                          <YAxis hide />
                          <Tooltip
                            contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                            formatter={(v: any) => [v + " hrs", "Downtime"]}
                          />
                          <Bar dataKey="hours" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-3 space-y-1.5">
                      {downtimeData.map((d, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs px-2 py-1 rounded-lg border border-border/40 bg-muted/10">
                          <span className="text-muted-foreground font-semibold">{d.name}</span>
                          <span className="font-bold text-red-400">{d.hours} hrs</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-[220px] flex items-center justify-center">
                    <p className="text-xs text-muted-foreground">No downtime records available.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
