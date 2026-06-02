"use client";

import { PageHeader } from "@/components/shared/ui-components";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, FileText, TrendingUp, DollarSign, Wrench, Package } from "lucide-react";
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

// Mock data
const workOrdersByMonth = [
  { month: "Jul", completed: 42, pending: 8 },
  { month: "Aug", completed: 55, pending: 12 },
  { month: "Sep", completed: 48, pending: 6 },
  { month: "Oct", completed: 61, pending: 9 },
  { month: "Nov", completed: 52, pending: 11 },
  { month: "Dec", completed: 58, pending: 7 },
  { month: "Jan", completed: 67, pending: 10 },
];

const maintenanceCostsByCategory = [
  { category: "Mechanical", cost: 45000 },
  { category: "Electrical", cost: 32000 },
  { category: "HVAC", cost: 28000 },
  { category: "Safety", cost: 15000 },
  { category: "Other", cost: 12000 },
];

const assetsByStatus = [
  { name: "Operational", value: 1090, color: "hsl(var(--success))" },
  { name: "Maintenance", value: 128, color: "hsl(var(--warning))" },
  { name: "Repair", value: 45, color: "hsl(var(--destructive))" },
  { name: "Retired", value: 21, color: "hsl(var(--muted-foreground))" },
];

const mttrData = [
  { month: "Jul", mttr: 4.2 },
  { month: "Aug", mttr: 3.8 },
  { month: "Sep", mttr: 4.5 },
  { month: "Oct", mttr: 3.2 },
  { month: "Nov", mttr: 3.0 },
  { month: "Dec", mttr: 2.8 },
  { month: "Jan", mttr: 2.5 },
];

const reports = [
  { name: "Work Order Summary", description: "Overview of all work orders", icon: FileText },
  { name: "Asset Performance", description: "Asset health and performance metrics", icon: TrendingUp },
  { name: "Maintenance Costs", description: "Cost analysis by category", icon: DollarSign },
  { name: "Technician Productivity", description: "Team performance metrics", icon: Wrench },
  { name: "Inventory Analysis", description: "Stock levels and usage trends", icon: Package },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="Gain insights into your maintenance operations"
      >
        <div className="flex items-center gap-3">
          <Select defaultValue="30">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </PageHeader>

      {/* Quick Reports */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.name} className="cursor-pointer hover:border-primary/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{report.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{report.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Work Orders by Month */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Work Orders by Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workOrdersByMonth}>
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
                  <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Completed" />
                  <Bar dataKey="pending" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Assets by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Assets by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-[300px] items-center justify-center">
              <div className="flex items-center gap-8">
                <div className="h-[220px] w-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={assetsByStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {assetsByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {assetsByStatus.map((item) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-muted-foreground">{item.name}</span>
                      <span className="font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Maintenance Costs by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Maintenance Costs by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={maintenanceCostsByCategory} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `$${v / 1000}k`} />
                  <YAxis dataKey="category" type="category" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Cost']}
                  />
                  <Bar dataKey="cost" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Mean Time to Repair */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Mean Time to Repair (MTTR)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mttrData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `${v}h`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value} hours`, 'MTTR']}
                  />
                  <Line
                    type="monotone"
                    dataKey="mttr"
                    stroke="hsl(var(--success))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--success))', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
