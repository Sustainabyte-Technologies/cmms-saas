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
  ShoppingCart,
  FileInput,
  Building2,
  CheckCircle,
  Plus,
  ArrowUpRight,
  Clock,
  DollarSign,
  XCircle,
  AlertCircle,
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

const purchaseStats = [
  { month: "Jan", requests: 12, approved: 10, orders: 8 },
  { month: "Feb", requests: 15, approved: 14, orders: 12 },
  { month: "Mar", requests: 18, approved: 16, orders: 14 },
  { month: "Apr", requests: 14, approved: 12, orders: 11 },
  { month: "May", requests: 20, approved: 18, orders: 15 },
  { month: "Jun", requests: 22, approved: 20, orders: 18 },
];

const spendingTrend = [
  { month: "Jan", amount: 45000 },
  { month: "Feb", amount: 52000 },
  { month: "Mar", amount: 48000 },
  { month: "Apr", amount: 61000 },
  { month: "May", amount: 55000 },
  { month: "Jun", amount: 67000 },
];

const pendingApprovals = [
  { id: "PR-0456", item: "Hydraulic Pump Assembly", requestor: "Mike Johnson", amount: "$2,450", date: "Today", priority: "high" },
  { id: "PR-0457", item: "Electrical Control Panel", requestor: "Sarah Chen", amount: "$5,800", date: "Yesterday", priority: "medium" },
  { id: "PR-0458", item: "Safety Equipment Kit", requestor: "Tom Williams", amount: "$890", date: "2 days ago", priority: "low" },
];

const recentPurchaseOrders = [
  { id: "PO-0234", vendor: "Industrial Supplies Co.", amount: "$12,500", status: "ordered", delivery: "In 3 days" },
  { id: "PO-0233", vendor: "MechParts Ltd.", amount: "$8,200", status: "received", delivery: "Delivered" },
  { id: "PO-0232", vendor: "SafetyFirst Inc.", amount: "$3,400", status: "approved", delivery: "Processing" },
  { id: "PO-0231", vendor: "ElectroPro", amount: "$6,750", status: "ordered", delivery: "In 5 days" },
];

const topVendors = [
  { name: "Industrial Supplies Co.", orders: 24, value: "$145,000", rating: 4.8 },
  { name: "MechParts Ltd.", orders: 18, value: "$98,000", rating: 4.6 },
  { name: "SafetyFirst Inc.", orders: 15, value: "$45,000", rating: 4.9 },
];

const getStatusVariant = (status: string) => {
  switch (status) {
    case "received": return "success";
    case "ordered": return "info";
    case "approved": return "warning";
    case "pending": return "default";
    default: return "default";
  }
};

const getPriorityVariant = (priority: string) => {
  switch (priority) {
    case "high": return "error";
    case "medium": return "warning";
    case "low": return "success";
    default: return "default";
  }
};

export function PurchaseManagerDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Purchase Manager Dashboard"
        description="Manage procurement, vendors, and purchase orders"
      >
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/vendors">
              <Building2 className="mr-2 h-4 w-4" />
              Manage Vendors
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/purchase/new">
              <Plus className="mr-2 h-4 w-4" />
              Create PO
            </Link>
          </Button>
        </div>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Pending Requests"
          value="8"
          icon={FileInput}
          description="awaiting approval"
        />
        <DashboardCard
          title="Open POs"
          value="12"
          icon={ShoppingCart}
          trend={{ value: 3, isPositive: true }}
          description="from last week"
        />
        <DashboardCard
          title="This Month Spend"
          value="$67,500"
          icon={DollarSign}
          trend={{ value: 8, isPositive: false }}
          description="vs budget"
        />
        <DashboardCard
          title="Active Vendors"
          value="24"
          icon={Building2}
          description="registered vendors"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Purchase Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Purchase Activity</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/reports" className="text-xs">
                View Report <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={purchaseStats}>
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
                  <Bar dataKey="requests" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} name="Requests" />
                  <Bar dataKey="approved" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Approved" />
                  <Bar dataKey="orders" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} name="POs Created" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Spending Trend */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Monthly Spending Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={spendingTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `$${v/1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Spending']}
                  />
                  <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <AlertCircle className="h-5 w-5 text-warning" />
            Pending Approvals
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/approvals" className="text-xs">
              View All <ArrowUpRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pendingApprovals.map((request) => (
              <div key={request.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium">{request.id}</span>
                    <StatusBadge status={request.priority} variant={getPriorityVariant(request.priority)} />
                  </div>
                  <p className="mt-1 font-medium">{request.item}</p>
                  <p className="text-sm text-muted-foreground">
                    Requested by {request.requestor} - {request.date}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-semibold">{request.amount}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-destructive">
                      <XCircle className="mr-1 h-4 w-4" />
                      Reject
                    </Button>
                    <Button size="sm">
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tables Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent POs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Recent Purchase Orders</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/purchase" className="text-xs">
                View All <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO #</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPurchaseOrders.map((po) => (
                  <TableRow key={po.id}>
                    <TableCell className="font-mono font-medium">{po.id}</TableCell>
                    <TableCell>
                      <p>{po.vendor}</p>
                      <p className="text-xs text-muted-foreground">{po.delivery}</p>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={po.status} variant={getStatusVariant(po.status)} />
                    </TableCell>
                    <TableCell className="text-right font-medium">{po.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Vendors */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Top Vendors</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/vendors" className="text-xs">
                Manage <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead className="text-right">Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topVendors.map((vendor) => (
                  <TableRow key={vendor.name}>
                    <TableCell className="font-medium">{vendor.name}</TableCell>
                    <TableCell>{vendor.orders}</TableCell>
                    <TableCell>{vendor.value}</TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center gap-1">
                        <span className="text-warning">★</span>
                        {vendor.rating}
                      </span>
                    </TableCell>
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
