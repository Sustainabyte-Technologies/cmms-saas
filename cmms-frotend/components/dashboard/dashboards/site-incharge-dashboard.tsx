"use client";

import { PageHeader, StatusBadge } from "@/components/shared/ui-components";
import { DashboardOverviewCards } from "@/components/dashboard/dashboard-overview-cards";
import { WorkOrderStatusChart } from "@/components/dashboard/work-order-status-chart";
import { TechnicianWorkloadChart } from "@/components/dashboard/technician-workload-chart";
import { RecentActivitiesTable } from "@/components/dashboard/recent-activities-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  Plus,
  ArrowUpRight,
  AlertTriangle,
  Building,
} from "lucide-react";
import Link from "next/link";

// Site-specific mock data for Pending Work Orders
const sitePendingWorkOrders = [
  { id: "WO-0891", asset: "HVAC Chiller #2", priority: "critical", assignee: "Sarah Chen", due: "Today" },
  { id: "WO-0894", asset: "Main Elevator Motor", priority: "high", assignee: "Mike Johnson", due: "Tomorrow" },
  { id: "WO-0897", asset: "Emergency Power Generator", priority: "high", assignee: "Unassigned", due: "In 2 days" },
  { id: "WO-0902", asset: "Water Filtration System", priority: "medium", assignee: "Tom Williams", due: "In 3 days" },
];

// Site-specific mock data for Upcoming PM Tasks
const siteUpcomingPM = [
  { id: "PM-204", asset: "Air Handling Unit AHU-1", type: "Filter Replacement", due: "Tomorrow", assignee: "Mike Johnson" },
  { id: "PM-207", asset: "Fire Alarm Control Panel", type: "Semi-Annual Audit", due: "In 3 days", assignee: "Sarah Chen" },
  { id: "PM-211", asset: "Exhaust Fan EF-3", type: "V-Belt Inspection", due: "In 5 days", assignee: "Tom Williams" },
];

const getPriorityVariant = (priority: string) => {
  switch (priority) {
    case "critical": return "error";
    case "high": return "warning";
    case "medium": return "info";
    case "low": return "success";
    default: return "default";
  }
};

export function SiteInchargeDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Site In-Charge Dashboard"
        description="Monitor and coordinate maintenance, assets, and tasks for your assigned site"
      >
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/portfolio?view=departments">
              <Building className="mr-2 h-4 w-4" />
              View Departments
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/work-orders">
              <Plus className="mr-2 h-4 w-4" />
              Create Work Order
            </Link>
          </Button>
        </div>
      </PageHeader>

      {/* KPI Cards (Scoped to the assigned site) */}
      <DashboardOverviewCards />

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Work Order Status distribution */}
        <WorkOrderStatusChart />
        {/* Technician workload distribution */}
        <TechnicianWorkloadChart />
      </div>

      {/* Tables Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Work Orders */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Pending Work Orders
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/work-orders" className="text-xs">
                View All <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Work Order</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead className="text-right">Due</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sitePendingWorkOrders.map((wo) => (
                  <TableRow key={wo.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <p className="font-medium text-sm">{wo.id}</p>
                      <p className="text-xs text-muted-foreground">{wo.asset}</p>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={wo.priority} variant={getPriorityVariant(wo.priority)} />
                    </TableCell>
                    <TableCell className={wo.assignee === "Unassigned" ? "text-warning font-medium text-sm" : "text-sm text-foreground"}>
                      {wo.assignee}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground font-medium">{wo.due}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Upcoming PM */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Calendar className="h-4 w-4 text-info" />
              Upcoming Preventive Maintenance
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/preventive?view=dashboard" className="text-xs">
                View All <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PM Task</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead className="text-right">Due</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {siteUpcomingPM.map((pm) => (
                  <TableRow key={pm.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <p className="font-medium text-sm">{pm.id}</p>
                      <p className="text-xs text-muted-foreground">{pm.asset}</p>
                    </TableCell>
                    <TableCell className="text-xs text-foreground font-medium">{pm.type}</TableCell>
                    <TableCell className="text-sm text-foreground">{pm.assignee}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground font-medium">{pm.due}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities (Automatically site-scoped) */}
      <RecentActivitiesTable />
    </div>
  );
}
