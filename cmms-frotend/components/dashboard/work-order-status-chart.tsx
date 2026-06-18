"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWorkOrderStatus, WorkOrderStatusResponse } from "@/lib/api/dashboard-api";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

// Status colors matching the design
const STATUS_COLORS: { [key: string]: string } = {
  OPEN: "hsl(217, 91%, 60%)", // Blue
  ASSIGNED: "hsl(197, 71%, 53%)", // Cyan-blue
  IN_PROGRESS: "hsl(142, 71%, 45%)", // Green
  ON_HOLD: "hsl(38, 92%, 50%)", // Amber
  COMPLETED: "hsl(25, 95%, 53%)", // Orange
  CLOSED: "hsl(45, 93%, 51%)", // Yellow/Gold
};

export function WorkOrderStatusChart() {
  const [statusData, setStatusData] = useState<ChartDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getWorkOrderStatus();
        
        // Transform data for chart and filter out zero counts
        const chartData = data
          .filter(item => item.count > 0) // Only show statuses with count > 0
          .map(item => ({
            name: item.status,
            value: item.count,
            color: STATUS_COLORS[item.status] || "hsl(var(--primary))",
          }));
        
        setStatusData(chartData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch work order status");
        console.error("Error fetching work order status:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Work Order Status</CardTitle>
          <p className="text-sm text-muted-foreground">Distribution of work orders by status.</p>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-gray-200 rounded-lg animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error("Work order status error:", error);
    return null;
  }

  if (!statusData || statusData.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Work Order Status</CardTitle>
        <p className="text-sm text-muted-foreground">Distribution of work orders by status.</p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
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
                  const item = statusData.find(d => d.name === value);
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
