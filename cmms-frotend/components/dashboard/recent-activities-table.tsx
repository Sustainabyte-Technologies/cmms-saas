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
import { StatusBadge } from "@/components/shared/ui-components";

// Map action types to readable labels and variants for StatusBadge
const ACTION_MAP: { [key: string]: { label: string; variant: "success" | "warning" | "error" | "info" | "default" } } = {
  CREATED: { label: "Created", variant: "success" },
  UPDATED: { label: "Updated", variant: "info" },
  DELETED: { label: "Deleted", variant: "error" },
  ASSIGNED: { label: "Assigned", variant: "info" },
  ACCEPTED: { label: "Accepted", variant: "info" },
  REJECTED: { label: "Rejected", variant: "warning" },
  COMPLETED: { label: "Completed", variant: "success" },
  
  // Legacy mappings
  WORK_ORDER_CREATED: { label: "Created", variant: "success" },
  WORK_ORDER_UPDATED: { label: "Updated", variant: "info" },
  TECHNICIAN_ASSIGNED: { label: "Assigned", variant: "info" },
  WORK_ORDER_COMPLETED: { label: "Completed", variant: "success" },
  WORK_ORDER_CLOSED: { label: "Closed", variant: "default" },
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

  const getActionInfo = (action: string) => {
    return ACTION_MAP[action] || { label: action, variant: "default" };
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
              <TableHead>Activity</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Performed By</TableHead>
              <TableHead>Remarks</TableHead>
              <TableHead className="text-right">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity) => {
              const actionInfo = getActionInfo(activity.action);
              const formatEntityType = (type: string): string => {
                if (!type) return "Work Order";
                const mapped: { [key: string]: string } = {
                  CUSTOMER: "Customer",
                  SITE: "Site",
                  DEPARTMENT: "Department",
                  SYSTEM: "System",
                  ASSET: "Asset",
                  WORK_ORDER: "Work Order",
                  CHECKLIST: "Checklist Template",
                };
                return mapped[type.toUpperCase()] || type;
              };

              return (
                <TableRow key={activity.id}>
                  <TableCell className="font-medium text-sm">
                    {activity.entityType ? (
                      <span>
                        {formatEntityType(activity.entityType)}{" "}
                        <span className="text-muted-foreground text-xs font-normal">
                          ({activity.entityName || activity.entityId.substring(0, 8)})
                        </span>
                      </span>
                    ) : (
                      <span>Work Order</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={actionInfo.label} variant={actionInfo.variant} />
                  </TableCell>
                  <TableCell className="text-sm">{activity.performedBy?.fullName || "System"}</TableCell>
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
