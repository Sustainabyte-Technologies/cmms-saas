"use client";

import { PageHeader } from "@/components/shared/ui-components";
import { DashboardOverviewCards } from "@/components/dashboard/dashboard-overview-cards";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  ComposedChart,
  Line,
} from "recharts";

const energyTrendData = [
  { month: "Jan", consumption: 48000, savings: 4100 },
  { month: "Feb", consumption: 46500, savings: 4800 },
  { month: "Mar", consumption: 45800, savings: 5200 },
  { month: "Apr", consumption: 44200, savings: 6100 },
  { month: "May", consumption: 45900, savings: 5500 },
  { month: "Jun", consumption: 45200, savings: 5400 },
];

const budgetTrendData = [
  { month: "Jan", spend: 14200, target: 15000 },
  { month: "Feb", spend: 13800, target: 14500 },
  { month: "Mar", spend: 12900, target: 14000 },
  { month: "Apr", spend: 11500, target: 13500 },
  { month: "May", spend: 12400, target: 14000 },
  { month: "Jun", spend: 8900, target: 15000 },
];

const carbonTrendData = [
  { month: "Jan", emissions: 14.5, target: 16.0 },
  { month: "Feb", emissions: 13.8, target: 15.5 },
  { month: "Mar", emissions: 13.2, target: 15.0 },
  { month: "Apr", emissions: 12.8, target: 14.5 },
  { month: "May", emissions: 12.6, target: 14.0 },
  { month: "Jun", emissions: 12.4, target: 13.5 },
];

const waterTrendData = [
  { month: "Jan", usage: 22000, target: 24000 },
  { month: "Feb", usage: 21500, target: 23500 },
  { month: "Mar", usage: 20800, target: 23000 },
  { month: "Apr", usage: 19500, target: 22500 },
  { month: "May", usage: 18900, target: 22000 },
  { month: "Jun", usage: 18500, target: 21500 },
];

const maintenanceTrendData = [
  { month: "Jan", cost: 9800, target: 10500 },
  { month: "Feb", cost: 9400, target: 10000 },
  { month: "Mar", cost: 8900, target: 9500 },
  { month: "Apr", cost: 8500, target: 9000 },
  { month: "May", cost: 8200, target: 9000 },
  { month: "Jun", cost: 7800, target: 8500 },
];

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Admin Dashboard"
        description="Executive utility monitoring and financial budget overview"
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

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Energy Consumption & Savings Trend */}
        <Card className="hover:shadow-md transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Energy Consumption & Savings Trend</CardTitle>
            <CardDescription>Monthly electrical consumption (kWh) vs savings (kWh)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={energyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border) / 0.4)" />
                  <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis 
                    yAxisId="left" 
                    tickFormatter={(val) => `${val.toLocaleString()}`}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    tickFormatter={(val) => `${val.toLocaleString()}`}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} 
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="consumption" name="Consumption (kWh)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Line yAxisId="right" type="monotone" dataKey="savings" name="Savings (kWh)" stroke="#10b981" strokeWidth={2.5} activeDot={{ r: 6 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Operating Spend vs Target Budget Trend */}
        <Card className="hover:shadow-md transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Operating Spend vs Target Budget Trend</CardTitle>
            <CardDescription>Monthly actual spend vs allocated target budget</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border) / 0.4)" />
                  <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis 
                    tickFormatter={(val) => `$${val.toLocaleString()}`} 
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    formatter={(val: any) => [`$${val.toLocaleString()}`, undefined]}
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend />
                  <Bar dataKey="spend" name="Actual Spend" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  <Bar dataKey="target" name="Target Budget" fill="hsl(var(--muted-foreground) / 0.25)" radius={[4, 4, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Carbon Footprint vs Offset Goal */}
        <Card className="hover:shadow-md transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Carbon Footprint vs Offset Goal</CardTitle>
            <CardDescription>Monthly actual emissions (tCO₂e) vs reduction targets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={carbonTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border) / 0.4)" />
                  <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis 
                    tickFormatter={(val) => `${val} t`}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    formatter={(val: any) => [`${val} tCO₂e`, undefined]}
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend />
                  <Bar dataKey="emissions" name="Actual Emissions" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  <Bar dataKey="target" name="Reduction Target" fill="hsl(var(--muted-foreground) / 0.25)" radius={[4, 4, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Water Usage & Conservation Goal */}
        <Card className="hover:shadow-md transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Water Usage & Conservation Goal</CardTitle>
            <CardDescription>Monthly actual water usage (Gallons) vs threshold targets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={waterTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border) / 0.4)" />
                  <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis 
                    tickFormatter={(val) => `${val.toLocaleString()}`}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    formatter={(val: any) => [`${val.toLocaleString()} Gal`, undefined]}
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend />
                  <Bar dataKey="usage" name="Actual Usage" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  <Bar dataKey="target" name="Conservation Target" fill="hsl(var(--muted-foreground) / 0.25)" radius={[4, 4, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Routine Maintenance Costs vs Target */}
        <Card className="lg:col-span-2 hover:shadow-md transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Routine Maintenance Costs vs Target</CardTitle>
            <CardDescription>Monthly actual maintenance costs vs allocated budget limits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={maintenanceTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border) / 0.4)" />
                  <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis 
                    tickFormatter={(val) => `$${val.toLocaleString()}`}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    formatter={(val: any) => [`$${val.toLocaleString()}`, undefined]}
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend />
                  <Bar dataKey="cost" name="Actual Cost" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={45} />
                  <Line type="monotone" dataKey="target" name="Target Budget Limit" stroke="#6366f1" strokeWidth={2.5} activeDot={{ r: 6 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
