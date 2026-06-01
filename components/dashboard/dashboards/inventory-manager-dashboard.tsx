"use client";

import { DashboardCard, PageHeader, StatusBadge } from "@/components/shared/ui-components";
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
  Package,
  AlertTriangle,
  TrendingDown,
  DollarSign,
  Plus,
  ArrowUpRight,
  ArrowDown,
  ArrowUp,
  Archive,
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
  PieChart,
  Pie,
  Cell,
} from "recharts";

const stockMovement = [
  { month: "Jan", stockIn: 450, stockOut: 380 },
  { month: "Feb", stockIn: 520, stockOut: 410 },
  { month: "Mar", stockIn: 380, stockOut: 420 },
  { month: "Apr", stockIn: 610, stockOut: 390 },
  { month: "May", stockIn: 480, stockOut: 450 },
  { month: "Jun", stockIn: 550, stockOut: 480 },
];

const categoryDistribution = [
  { name: "Spare Parts", value: 45, color: "hsl(var(--primary))" },
  { name: "Lubricants", value: 20, color: "hsl(var(--info))" },
  { name: "Filters", value: 15, color: "hsl(var(--success))" },
  { name: "Electrical", value: 12, color: "hsl(var(--warning))" },
  { name: "Safety", value: 8, color: "hsl(var(--muted-foreground))" },
];

const lowStockItems = [
  { id: "INV-0234", name: "Hydraulic Seal Kit", category: "Spare Parts", current: 5, minimum: 20, status: "critical" },
  { id: "INV-0156", name: "Air Filter 10x20", category: "Filters", current: 12, minimum: 25, status: "low" },
  { id: "INV-0089", name: "Bearing SKF 6205", category: "Spare Parts", current: 8, minimum: 15, status: "low" },
  { id: "INV-0312", name: "Motor Oil 10W-40", category: "Lubricants", current: 15, minimum: 30, status: "low" },
];

const recentMovements = [
  { id: 1, item: "V-Belt A68", type: "out", quantity: 3, requestor: "WO-1241", date: "Today, 2:30 PM" },
  { id: 2, item: "Grease Gun Cartridge", type: "out", quantity: 10, requestor: "WO-1238", date: "Today, 11:00 AM" },
  { id: 3, item: "Hydraulic Hose 1/2\"", type: "in", quantity: 50, requestor: "PO-0089", date: "Yesterday" },
  { id: 4, item: "Electrical Fuse 30A", type: "out", quantity: 5, requestor: "WO-1235", date: "Yesterday" },
];

export function InventoryManagerDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Inventory Manager Dashboard"
        description="Manage materials, spare parts, and stock levels"
      >
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/inventory">
              <Archive className="mr-2 h-4 w-4" />
              Stock Adjustment
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/materials/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Link>
          </Button>
        </div>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Items"
          value="1,456"
          icon={Package}
          trend={{ value: 3, isPositive: true }}
          description="from last month"
        />
        <DashboardCard
          title="Low Stock Alerts"
          value="12"
          icon={AlertTriangle}
          trend={{ value: 4, isPositive: false }}
          description="items need reorder"
        />
        <DashboardCard
          title="Stock Value"
          value="$284,500"
          icon={DollarSign}
          trend={{ value: 5, isPositive: true }}
          description="total inventory"
        />
        <DashboardCard
          title="Items Issued Today"
          value="28"
          icon={TrendingDown}
          description="work order requests"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Stock Movement */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Stock Movement</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/reports" className="text-xs">
                View Report <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stockMovement}>
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
                  <Bar dataKey="stockIn" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} name="Stock In" />
                  <Bar dataKey="stockOut" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Stock Out" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Inventory by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-[280px] items-center justify-center">
              <div className="flex items-center gap-8">
                <div className="h-[200px] w-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {categoryDistribution.map((item) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-muted-foreground">{item.name}</span>
                      <span className="font-semibold">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      <Card className="border-warning/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-warning">
            <AlertTriangle className="h-5 w-5" />
            Low Stock Alerts
          </CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/purchase-requests/new" className="text-xs">
              Create Purchase Request
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {lowStockItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{item.name}</p>
                    <StatusBadge 
                      status={item.status} 
                      variant={item.status === "critical" ? "error" : "warning"} 
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">{item.category} - {item.id}</p>
                </div>
                <div className="w-32">
                  <div className="flex justify-between text-sm">
                    <span>{item.current}</span>
                    <span className="text-muted-foreground">/ {item.minimum}</span>
                  </div>
                  <Progress 
                    value={(item.current / item.minimum) * 100} 
                    className="h-2"
                  />
                </div>
                <Button size="sm" variant="outline" className="ml-4">
                  Reorder
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Movements */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold">Recent Stock Movements</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/inventory" className="text-xs">
              View All <ArrowUpRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentMovements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell className="font-medium">{movement.item}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {movement.type === "in" ? (
                        <ArrowDown className="h-4 w-4 text-success" />
                      ) : (
                        <ArrowUp className="h-4 w-4 text-primary" />
                      )}
                      <span className={movement.type === "in" ? "text-success" : "text-primary"}>
                        Stock {movement.type === "in" ? "In" : "Out"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{movement.quantity}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{movement.requestor}</TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">{movement.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
