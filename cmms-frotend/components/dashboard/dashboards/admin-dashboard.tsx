"use client";

import { PageHeader, StatusBadge } from "@/components/shared/ui-components";
import { DashboardOverviewCards } from "@/components/dashboard/dashboard-overview-cards";
import { WorkOrderStatusChart } from "@/components/dashboard/work-order-status-chart";
import { UserRoleDistributionChart } from "@/components/dashboard/user-role-distribution-chart";
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
  Server,
  ClipboardList,
  Users,
  Shield,
  Plus,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
} from "lucide-react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const systemStats = [
  { month: "Jan", users: 45, logins: 1200 },
  { month: "Feb", users: 52, logins: 1450 },
  { month: "Mar", users: 58, logins: 1680 },
  { month: "Apr", users: 61, logins: 1720 },
  { month: "May", users: 65, logins: 1890 },
  { month: "Jun", users: 72, logins: 2100 },
];

const roleDistribution = [
  { name: "Technicians", value: 35, color: "hsl(var(--primary))" },
  { name: "Supervisors", value: 12, color: "hsl(var(--info))" },
  { name: "Managers", value: 8, color: "hsl(var(--success))" },
  { name: "Admin", value: 3, color: "hsl(var(--warning))" },
];

const recentAuditLogs = [
  { id: 1, user: "Mike Johnson", action: "Created Work Order #1245", module: "Work Orders", time: "2 min ago" },
  { id: 2, user: "Sarah Chen", action: "Updated Asset #A-0892", module: "Assets", time: "15 min ago" },
  { id: 3, user: "Tom Williams", action: "Completed Task #T-0456", module: "Tasks", time: "32 min ago" },
  { id: 4, user: "Emily Davis", action: "Added Inventory Item", module: "Inventory", time: "1 hour ago" },
];

const pendingApprovals = [
  { id: "PA-001", type: "Purchase Order", requestor: "David Brown", amount: "$4,500", status: "pending" },
  { id: "PA-002", type: "User Access", requestor: "New Employee", amount: "-", status: "pending" },
  { id: "PA-003", type: "Asset Disposal", requestor: "Mike Johnson", amount: "$2,100", status: "pending" },
];

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Admin Dashboard"
        description="Complete system oversight and user management"
      >
        <Button asChild>
          <Link href="/dashboard/users/new">
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Link>
        </Button>
      </PageHeader>

      {/* KPI Cards */}
      <DashboardOverviewCards />

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* System Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">System Activity</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/audit-logs" className="text-xs">
                View Logs <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={systemStats}>
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
                  <Line type="monotone" dataKey="logins" stroke="hsl(var(--primary))" strokeWidth={2} name="Logins" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* User Role Distribution */}
        <UserRoleDistributionChart />
      </div>

      {/* Work Order Status */}
      <WorkOrderStatusChart />

      {/* Technician Workload */}
      <TechnicianWorkloadChart />

      {/* Tables Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Approvals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Pending Approvals</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs">
              View All <ArrowUpRight className="ml-1 h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Requestor</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingApprovals.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{item.requestor}</TableCell>
                    <TableCell className="text-right">{item.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Audit Logs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Recent Audit Logs</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/audit-logs" className="text-xs">
                View All <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAuditLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.user}</TableCell>
                    <TableCell>
                      <p className="text-sm">{log.action}</p>
                      <p className="text-xs text-muted-foreground">{log.module}</p>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">{log.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* System Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Activity className="h-5 w-5" />
            System Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-lg bg-warning/10 p-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-warning" />
              <div>
                <p className="font-medium">License Renewal Required</p>
                <p className="text-sm text-muted-foreground">Your enterprise license expires in 30 days</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-success/10 p-3">
              <CheckCircle className="mt-0.5 h-5 w-5 text-success" />
              <div>
                <p className="font-medium">System Backup Completed</p>
                <p className="text-sm text-muted-foreground">Last backup: Today at 3:00 AM</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-info/10 p-3">
              <Clock className="mt-0.5 h-5 w-5 text-info" />
              <div>
                <p className="font-medium">Scheduled Maintenance</p>
                <p className="text-sm text-muted-foreground">System maintenance scheduled for Sunday 2:00 AM</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Role Distribution */}
      <UserRoleDistributionChart />

      {/* Recent Activities */}
      <RecentActivitiesTable />
    </div>
  );
}
