"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getRecentActivities, RecentActivitiesResponse } from "@/lib/api/dashboard-api";
import { Activity } from "lucide-react";

// Map action types to readable labels and colors
const ACTION_LABELS: { [key: string]: { label: string; color: string } } = {
  WORK_ORDER_CREATED: { label: "Created", color: "text-success" },
  WORK_ORDER_UPDATED: { label: "Updated", color: "text-info" },
  TECHNICIAN_ASSIGNED: { label: "Assigned", color: "text-primary" },
  WORK_ORDER_COMPLETED: { label: "Completed", color: "text-success" },
  WORK_ORDER_CLOSED: { label: "Closed", color: "text-muted-foreground" },
};

export function RecentActivitiesTable() {
  const [activities, setActivities] = useState<RecentActivitiesResponse>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getRecentActivities();
        setActivities(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch recent activities");
        console.error("Error fetching recent activities:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  };

  const getActionLabel = (action: string) => {
    return ACTION_LABELS[action] || { label: action, color: "text-muted-foreground" };
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Activity className="h-4 w-4" />
            Recent Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error("Recent activities error:", error);
    return null;
  }

  if (!activities || activities.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Activity className="h-4 w-4" />
          Recent Activities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Work Order ID</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Performed By</TableHead>
              <TableHead>Remarks</TableHead>
              <TableHead className="text-right">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity) => {
              const actionInfo = getActionLabel(activity.action);
              return (
                <TableRow key={activity.id}>
                  <TableCell className="font-mono text-sm">{activity.workOrderId.substring(0, 8)}...</TableCell>
                  <TableCell>
                    <span className={`text-sm font-medium ${actionInfo.color}`}>{actionInfo.label}</span>
                  </TableCell>
                  <TableCell className="text-sm">{activity.performedBy.fullName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{activity.remarks}</TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {formatDate(activity.createdAt)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
