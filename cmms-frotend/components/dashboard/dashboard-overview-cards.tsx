"use client";

import { useEffect, useState } from "react";
import { DashboardCard } from "@/components/shared/ui-components";
import { getDashboardOverview, DashboardOverviewResponse } from "@/lib/api/dashboard-api";
import {
  Server,
  ClipboardList,
  Users,
  AlertTriangle,
} from "lucide-react";

export function DashboardOverviewCards() {
  const [overviewData, setOverviewData] = useState<DashboardOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getDashboardOverview();
        setOverviewData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch dashboard overview");
        console.error("Error fetching dashboard overview:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    console.error("Dashboard overview error:", error);
    // Silently fail - show empty state or skip rendering
    return null;
  }

  if (!overviewData) {
    return null;
  }

  const { cards } = overviewData;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <DashboardCard
        title="Total Users"
        value={cards.totalUsers.toString()}
        icon={Users}
        description="System users"
      />
      <DashboardCard
        title="Total Assets"
        value={cards.totalAssets.toString()}
        icon={Server}
        description="Registered assets"
      />
      <DashboardCard
        title="Work Orders"
        value={cards.totalWorkOrders.toString()}
        icon={ClipboardList}
        description="All work orders"
      />
      <DashboardCard
        title="Open Work Orders"
        value={cards.openWorkOrders.toString()}
        icon={AlertTriangle}
        description="Pending tasks"
      />
    </div>
  );
}
