"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserRoleDistribution, UserRoleDistributionResponse } from "@/lib/api/dashboard-api";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Users } from "lucide-react";

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

// Role colors - professional color scheme
const ROLE_COLORS: { [key: string]: string } = {
  ADMIN: "hsl(0, 84%, 60%)", // Red
  MAINTENANCE_MANAGER: "hsl(217, 91%, 60%)", // Blue
  SUPERVISOR: "hsl(142, 71%, 45%)", // Green
  TECHNICIAN: "hsl(38, 92%, 50%)", // Amber
  INVENTORY_MANAGER: "hsl(262, 80%, 50%)", // Purple
  PURCHASE_MANAGER: "hsl(25, 95%, 53%)", // Orange
};

// Role labels for display
const ROLE_LABELS: { [key: string]: string } = {
  ADMIN: "Admin",
  MAINTENANCE_MANAGER: "Maintenance Manager",
  SUPERVISOR: "Supervisor",
  TECHNICIAN: "Technician",
  INVENTORY_MANAGER: "Inventory Manager",
  PURCHASE_MANAGER: "Purchase Manager",
};

export function UserRoleDistributionChart() {
  const [roleData, setRoleData] = useState<ChartDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDistribution = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getUserRoleDistribution();
        
        // Transform data for chart
        const chartData = data.map(item => ({
          name: ROLE_LABELS[item.role] || item.role,
          value: item.count,
          color: ROLE_COLORS[item.role] || "hsl(var(--primary))",
        }));
        
        setRoleData(chartData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch user role distribution");
        console.error("Error fetching user role distribution:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDistribution();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Users className="h-4 w-4" />
            User Role Distribution
          </CardTitle>
          <p className="text-sm text-muted-foreground">Distribution of users by role.</p>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-gray-200 rounded-lg animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error("User role distribution error:", error);
    return null;
  }

  if (!roleData || roleData.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Users className="h-4 w-4" />
          User Role Distribution
        </CardTitle>
        <p className="text-sm text-muted-foreground">Distribution of users by role.</p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={roleData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {roleData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => value}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry: any) => {
                  const item = roleData.find(d => d.name === value);
                  return `${value}: ${item?.value || 0}`;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
