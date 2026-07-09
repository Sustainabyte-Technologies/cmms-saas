"use client";

import { useEffect, useState } from "react";
import { PageHeader, StatusBadge } from "@/components/shared/ui-components";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Package,
  AlertTriangle,
  ClipboardList,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { fetchInventoryDashboardStats, InventoryDashboardStats } from "@/lib/api/inventory-api";

export default function InventoryDashboardPage() {
  const [stats, setStats] = useState<InventoryDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchInventoryDashboardStats();
      setStats(data);
    } catch (e: any) {
      setError(e.message || "Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading dashboard metrics...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-4">
        <p className="text-destructive font-semibold">{error || "Failed to load stats"}</p>
        <Button onClick={loadStats}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Operations Dashboard"
        description="Monitor spare parts stock levels, transactions, and parts requests."
      >
        <Button variant="outline" onClick={loadStats}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Spare Parts</p>
                <p className="text-3xl font-bold">{stats.totalSpareParts}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Current Stock Value</p>
                <p className="text-3xl font-bold">${stats.currentStockValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
                <p className="text-3xl font-bold text-amber-600">{stats.pendingRequests}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <ClipboardList className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Low Stock Alerts</p>
                <p className="text-3xl font-bold text-rose-500">{stats.lowStockItems}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-rose-500/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-rose-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Issued Today</p>
                <p className="text-3xl font-bold text-blue-600">{stats.issuedToday}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <ArrowUpRight className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Received Today</p>
                <p className="text-3xl font-bold text-teal-600">{stats.receivedToday}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-teal-500/10 flex items-center justify-center">
                <ArrowDownLeft className="h-6 w-6 text-teal-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid options */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold">Quick Actions</h3>
            <p className="text-sm text-muted-foreground mb-4">Common inventory workflows</p>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/dashboard/inventory/spare-parts" passHref>
                <Button className="w-full justify-start py-6" variant="outline">
                  <Package className="mr-2 h-5 w-5" />
                  Manage Parts
                </Button>
              </Link>
              <Link href="/dashboard/inventory/requests" passHref>
                <Button className="w-full justify-start py-6" variant="outline">
                  <ClipboardList className="mr-2 h-5 w-5" />
                  Parts Requests
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Stock Highlights</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Critical Stock Shortages</span>
              <Link href="/dashboard/inventory/low-stock">
                <Button size="sm" variant="ghost">View All</Button>
              </Link>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Pending Requests Count</span>
              <Link href="/dashboard/inventory/requests?status=PENDING">
                <Button size="sm" variant="ghost">Process Requests</Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
