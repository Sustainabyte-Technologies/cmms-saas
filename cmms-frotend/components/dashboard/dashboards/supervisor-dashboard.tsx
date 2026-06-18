"use client";

import { PageHeader, StatusBadge } from "@/components/shared/ui-components";
import { DashboardOverviewCards } from "@/components/dashboard/dashboard-overview-cards";
import { WorkOrderStatusChart } from "@/components/dashboard/work-order-status-chart";
import { UserRoleDistributionChart } from "@/components/dashboard/user-role-distribution-chart";
import { TechnicianWorkloadChart } from "@/components/dashboard/technician-workload-chart";
import { RecentActivitiesTable } from "@/components/dashboard/recent-activities-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ClipboardList,
  Users,
  Clock,
  CheckCircle,
  ArrowUpRight,
  AlertTriangle,
  User,
} from "lucide-react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const teamWorkload = [
  { name: "Mike J.", assigned: 5, completed: 3, inProgress: 2 },
  { name: "Sarah C.", assigned: 4, completed: 2, inProgress: 2 },
  { name: "Tom W.", assigned: 6, completed: 4, inProgress: 2 },
  { name: "Emily D.", assigned: 3, completed: 1, inProgress: 2 },
];

const activeWorkOrders = [
  { id: "WO-1241", title: "Fix Hydraulic Leak", asset: "Press Machine #2", technician: "Mike Johnson", status: "in_progress", progress: 75 },
  { id: "WO-1242", title: "Replace Motor Bearings", asset: "Conveyor #5", technician: "Sarah Chen", status: "in_progress", progress: 45 },
  { id: "WO-1243", title: "Calibrate Sensors", asset: "Packaging Line A", technician: "Tom Williams", status: "open", progress: 0 },
  { id: "WO-1244", title: "Inspect Safety Guards", asset: "CNC Machine #1", technician: "Emily Davis", status: "in_progress", progress: 90 },
];

const teamMembers = [
  { name: "Mike Johnson", status: "Working", currentTask: "WO-1241", location: "Building A" },
  { name: "Sarah Chen", status: "Working", currentTask: "WO-1242", location: "Building B" },
  { name: "Tom Williams", status: "Available", currentTask: "-", location: "Workshop" },
  { name: "Emily Davis", status: "Working", currentTask: "WO-1244", location: "Building A" },
];

const getStatusVariant = (status: string) => {
  switch (status) {
    case "completed": return "success";
    case "in_progress": return "info";
    case "open": return "warning";
    default: return "default";
  }
};

export function SupervisorDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Supervisor Dashboard"
        description="Monitor work orders and manage your team"
      >
        <Button variant="outline" asChild>
          <Link href="/dashboard/work-orders">
            <ClipboardList className="mr-2 h-4 w-4" />
            Assign Tasks
          </Link>
        </Button>
      </PageHeader>

      {/* KPI Cards */}
      <DashboardOverviewCards />

      {/* Team Workload Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold">Team Workload Distribution</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/team" className="text-xs">
              Manage Team <ArrowUpRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamWorkload} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis dataKey="name" type="category" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} width={60} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="completed" fill="hsl(var(--success))" stackId="a" name="Completed" />
                <Bar dataKey="inProgress" fill="hsl(var(--primary))" stackId="a" name="In Progress" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row - Work Order Status & User Role Distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        <WorkOrderStatusChart />
        <UserRoleDistributionChart />
      </div>

      {/* Technician Workload */}
      <TechnicianWorkloadChart />

      {/* Tables Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Work Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <ClipboardList className="h-4 w-4" />
              Active Work Orders
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/work-orders" className="text-xs">
                View All <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeWorkOrders.map((wo) => (
                <div key={wo.id} className="space-y-2 rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{wo.id} - {wo.title}</p>
                      <p className="text-xs text-muted-foreground">{wo.asset}</p>
                    </div>
                    <StatusBadge status={wo.status.replace("_", " ")} variant={getStatusVariant(wo.status)} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{wo.technician}</span>
                    <span className="font-medium">{wo.progress}%</span>
                  </div>
                  <Progress value={wo.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Team Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Users className="h-4 w-4" />
              Team Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Technician</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Current Task</TableHead>
                  <TableHead className="text-right">Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.map((member) => (
                  <TableRow key={member.name}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">{member.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge 
                        status={member.status} 
                        variant={member.status === "Working" ? "info" : "success"} 
                      />
                    </TableCell>
                    <TableCell className="text-sm">{member.currentTask}</TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">{member.location}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Escalations */}
      <Card className="border-warning/50 bg-warning/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-warning">
            <AlertTriangle className="h-5 w-5" />
            Attention Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-background p-3">
              <div>
                <p className="font-medium">WO-1245 - Overdue by 2 hours</p>
                <p className="text-sm text-muted-foreground">Emergency Pump Repair - Unassigned</p>
              </div>
              <Button size="sm">Assign Now</Button>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-background p-3">
              <div>
                <p className="font-medium">Parts Request Pending</p>
                <p className="text-sm text-muted-foreground">Hydraulic seals needed for WO-1241</p>
              </div>
              <Button size="sm" variant="outline">Review</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <RecentActivitiesTable />
    </div>
  );
}
