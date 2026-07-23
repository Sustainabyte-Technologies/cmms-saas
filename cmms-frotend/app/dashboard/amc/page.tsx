"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  Calendar,
  DollarSign,
  ShieldAlert,
  ArrowUpRight,
  Plus,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchAMCDashboard, AMCDashboardData } from "@/lib/api/amc-api";
import { toast } from "sonner";

export default function AMCDashboardPage() {
  const [data, setData] = useState<AMCDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetchAMCDashboard();
      setData(res);
    } catch (err: any) {
      toast.error(err.message || "Failed to load AMC Dashboard");
    } finally {
      setLoading(false);
    }
  };

  const stats = data?.statistics || {
    totalContracts: 0,
    activeContracts: 0,
    expiredContracts: 0,
    expiringSoon: 0,
    todaysVisits: 0,
    upcomingVisits: 0,
    slaBreaches: 0,
    monthlyRevenue: 0,
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">AMC Management Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enterprise Annual Maintenance Contracts, Covered Assets, SLA & Service Analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={loadDashboard} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" asChild>
            <Link href="/dashboard/amc/contracts/new">
              <Plus className="h-4 w-4 mr-2" />
              New AMC Contract
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Total Contracts</p>
              <h3 className="text-2xl font-bold mt-1">{stats.totalContracts}</h3>
              <p className="text-xs text-muted-foreground mt-1">All registered AMCs</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <FileText className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Active Contracts</p>
              <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.activeContracts}</h3>
              <p className="text-xs text-emerald-600/80 mt-1 font-medium">In coverage</p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
              <CheckCircle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Expiring Soon</p>
              <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats.expiringSoon}</h3>
              <p className="text-xs text-amber-600/80 mt-1 font-medium">Within 30 days</p>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Monthly Revenue</p>
              <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                ${stats.monthlyRevenue.toLocaleString()}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Total contract value</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
              <DollarSign className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 bg-indigo-500/10 rounded-lg text-indigo-500">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Today's Scheduled Visits</p>
              <p className="text-lg font-bold">{stats.todaysVisits}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 bg-sky-500/10 rounded-lg text-sky-500">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Upcoming AMC Visits</p>
              <p className="text-lg font-bold">{stats.upcomingVisits}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 bg-rose-500/10 rounded-lg text-rose-500">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">SLA Breaches</p>
              <p className="text-lg font-bold text-rose-600 dark:text-rose-400">{stats.slaBreaches}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 bg-purple-500/10 rounded-lg text-purple-500">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Expired Contracts</p>
              <p className="text-lg font-bold text-muted-foreground">{stats.expiredContracts}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid: Upcoming Expiry Timeline & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expiring Contracts Alert Table */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold">Upcoming Expiring Contracts</CardTitle>
              <CardDescription>Contracts requiring renewal action within 30 days</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/amc/renewals" className="text-xs font-semibold">
                Manage Renewals <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-muted/40 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : !data?.upcomingExpiryTimeline || data.upcomingExpiryTimeline.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="text-sm font-medium">No contracts expiring in the next 30 days</p>
              </div>
            ) : (
              <div className="divide-y border rounded-xl overflow-hidden">
                {data.upcomingExpiryTimeline.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/40 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-primary">{item.contractNumber}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {item.customerName}
                        </Badge>
                      </div>
                      <p className="text-sm font-semibold text-foreground">{item.contractName}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                          Expires in {item.remainingDays} days
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          End Date: {new Date(item.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/dashboard/amc/contracts/${item.id}`}>Details</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links & Contract Type Breakdown */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Contract Type Distribution</CardTitle>
            <CardDescription>Breakdown by coverage model</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data?.contractTypeDistribution?.map((ct) => (
              <div key={ct.type} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-foreground font-semibold">{ct.type.replace("_", " ")}</span>
                  <span className="text-muted-foreground">{ct.count} contracts</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{
                      width: `${Math.min(100, (ct.count / (stats.totalContracts || 1)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )) || <p className="text-xs text-muted-foreground">No data available</p>}

            <div className="pt-4 border-t space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quick Management</p>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="justify-start text-xs" asChild>
                  <Link href="/dashboard/amc/contracts">
                    <FileText className="h-3.5 w-3.5 mr-1.5" /> Contracts
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="justify-start text-xs" asChild>
                  <Link href="/dashboard/amc/renewals">
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Renewals
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="justify-start text-xs" asChild>
                  <Link href="/dashboard/amc/reports">
                    <TrendingUp className="h-3.5 w-3.5 mr-1.5" /> Reports
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="justify-start text-xs" asChild>
                  <Link href="/dashboard/amc/contracts/new">
                    <Plus className="h-3.5 w-3.5 mr-1.5" /> Create
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
