"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTechnicianWorkload, TechnicianWorkloadResponse } from "@/lib/api/dashboard-api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Users } from "lucide-react";

interface ChartDataItem {
  technician: string;
  assignedWorkOrders: number;
}

export function TechnicianWorkloadChart() {
  const [workloadData, setWorkloadData] = useState<ChartDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkload = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getTechnicianWorkload();
        
        // Filter out technicians with 0 assigned work orders if needed
        const chartData = data.filter(item => item.assignedWorkOrders > 0);
        
        setWorkloadData(chartData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch technician workload");
        console.error("Error fetching technician workload:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkload();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Users className="h-4 w-4" />
            Technician Workload
          </CardTitle>
          <p className="text-sm text-muted-foreground">Assigned work orders per technician.</p>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-gray-200 rounded-lg animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error("Technician workload error:", error);
    return null;
  }

  if (!workloadData || workloadData.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Users className="h-4 w-4" />
          Technician Workload
        </CardTitle>
        <p className="text-sm text-muted-foreground">Assigned work orders per technician.</p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={workloadData}
              margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="technician" 
                className="text-xs" 
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                className="text-xs" 
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value) => [`${value} Work Orders`, "Assigned"]}
              />
              <Bar 
                dataKey="assignedWorkOrders" 
                fill="hsl(var(--primary))" 
                radius={[8, 8, 0, 0]}
                name="Assigned Work Orders"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
