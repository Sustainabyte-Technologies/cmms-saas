"use client";

import { DashboardCard, PageHeader, StatusBadge } from "@/components/shared/ui-components";
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
  ClipboardList,
  Calendar,
  TrendingUp,
  Users,
  Plus,
  ArrowUpRight,
  AlertTriangle,
  Clock,
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
  LineChart,
  Line,
} from "recharts";

const workOrderStats = [
  { month: "Jan", created: 45, completed: 42, overdue: 3 },
  { month: "Feb", created: 52, completed: 50, overdue: 2 },
  { month: "Mar", created: 48, completed: 45, overdue: 3 },
  { month: "Apr", created: 61, completed: 58, overdue: 3 },
  { month: "May", created: 55, completed: 54, overdue: 1 },
  { month: "Jun", created: 67, completed: 62, overdue: 5 },
];

const technicianPerformance = [
  { name: "Week 1", mttr: 4.2, mtbf: 168 },
  { name: "Week 2", mttr: 3.8, mtbf: 172 },
  { name: "Week 3", mttr: 4.5, mtbf: 165 },
  { name: "Week 4", mttr: 3.5, mtbf: 180 },
];

const pendingWorkOrders = [
  { id: "WO-1241", asset: "CNC Machine #3", priority: "critical", assignee: "Unassigned", due: "Today" },
  { id: "WO-1242", asset: "HVAC Unit #5", priority: "high", assignee: "Mike Johnson", due: "Tomorrow" },
  { id: "WO-1243", asset: "Conveyor #2", priority: "medium", assignee: "Sarah Chen", due: "In 2 days" },
  { id: "WO-1244", asset: "Generator #1", priority: "low", assignee: "Tom Williams", due: "In 3 days" },
];

const upcomingPM = [
  { id: "PM-101", asset: "Compressor #1", type: "Quarterly Service", due: "Tomorrow", assignee: "Team A" },
  { id: "PM-102", asset: "Boiler System", type: "Monthly Inspection", due: "In 2 days", assignee: "Team B" },
  { id: "PM-103", asset: "Electrical Panel", type: "Annual Audit", due: "In 5 days", assignee: "Team A" },
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

export function MaintenanceManagerDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Maintenance Manager Dashboard"
        description="Oversee maintenance operations and team performance"
      >
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/maintenance-planning">
              <Calendar className="mr-2 h-4 w-4" />
              Plan Maintenance
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/work-orders/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Work Order
            </Link>
          </Button>
        </div>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Open Work Orders"
          value="23"
          icon={ClipboardList}
          trend={{ value: 8, isPositive: false }}
          description="from last week"
        />
        <DashboardCard
          title="PM Compliance"
          value="94%"
          icon={Calendar}
          trend={{ value: 3, isPositive: true }}
          description="this month"
        />
        <DashboardCard
          title="MTTR (Hours)"
          value="3.8"
          icon={Clock}
          trend={{ value: 12, isPositive: true }}
          description="improved"
        />
        <DashboardCard
          title="Team Utilization"
          value="87%"
          icon={Users}
          trend={{ value: 5, isPositive: true }}
          description="efficiency rate"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Work Order Trends */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Work Order Trends</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/reports" className="text-xs">
                View Report <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workOrderStats}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="completed" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} name="Completed" />
                  <Bar dataKey="overdue" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} name="Overdue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Performance Metrics (MTTR)</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/reports" className="text-xs">
                Details <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={technicianPerformance}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line type="monotone" dataKey="mttr" stroke="hsl(var(--primary))" strokeWidth={2} name="MTTR (hrs)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Work Orders */}
        <Card>
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
                {pendingWorkOrders.map((wo) => (
                  <TableRow key={wo.id}>
                    <TableCell>
                      <p className="font-medium">{wo.id}</p>
                      <p className="text-xs text-muted-foreground">{wo.asset}</p>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={wo.priority} variant={getPriorityVariant(wo.priority)} />
                    </TableCell>
                    <TableCell className={wo.assignee === "Unassigned" ? "text-warning" : ""}>
                      {wo.assignee}
                    </TableCell>
                    <TableCell className="text-right text-sm">{wo.due}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Upcoming PM */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Calendar className="h-4 w-4 text-info" />
              Upcoming Preventive Maintenance
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/preventive" className="text-xs">
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
                {upcomingPM.map((pm) => (
                  <TableRow key={pm.id}>
                    <TableCell>
                      <p className="font-medium">{pm.id}</p>
                      <p className="text-xs text-muted-foreground">{pm.asset}</p>
                    </TableCell>
                    <TableCell className="text-sm">{pm.type}</TableCell>
                    <TableCell>{pm.assignee}</TableCell>
                    <TableCell className="text-right text-sm">{pm.due}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
