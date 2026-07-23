"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/ui-components";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  fetchServiceTicketDashboard,
  ServiceTicketDashboardData,
} from "@/lib/api/service-tickets-api";
import {
  Ticket,
  Plus,
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  FileSpreadsheet,
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  RefreshCw,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from "recharts";

export default function ServiceTicketDashboardPage() {
  const [data, setData] = useState<ServiceTicketDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchServiceTicketDashboard();
      setData(res);
    } catch (error: any) {
      toast.error(error.message || "Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-2">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        Loading service ticket metrics & analytics...
      </div>
    );
  }

  const metrics = data?.metrics || {
    total: 0,
    newTickets: 0,
    assigned: 0,
    inProgress: 0,
    onHold: 0,
    resolved: 0,
    closed: 0,
    urgent: 0,
    overdue: 0,
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Service Ticket Dashboard"
        description="Real-time KPI metrics, resolution throughput, and category breakdown for service requests."
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/service-tickets">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Ticket List
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/service-tickets/new">
              <Plus className="mr-2 h-4 w-4" /> New Ticket
            </Link>
          </Button>
        </div>
      </PageHeader>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase">Total Tickets</CardDescription>
            <CardTitle className="text-3xl font-bold">{metrics.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-muted-foreground">All logged service requests</span>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase">New</CardDescription>
            <CardTitle className="text-3xl font-bold text-blue-600">{metrics.newTickets}</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-muted-foreground">Awaiting initial review</span>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase">Assigned</CardDescription>
            <CardTitle className="text-3xl font-bold text-purple-600">{metrics.assigned}</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-muted-foreground">Assigned to technician/manager</span>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase">In Progress</CardDescription>
            <CardTitle className="text-3xl font-bold text-amber-600">{metrics.inProgress}</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-muted-foreground">Under active work/investigation</span>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase">Resolved</CardDescription>
            <CardTitle className="text-3xl font-bold text-emerald-600">{metrics.resolved}</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-muted-foreground">Service completed</span>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-slate-400">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase">Closed</CardDescription>
            <CardTitle className="text-3xl font-bold text-slate-700">{metrics.closed}</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-muted-foreground">Archived & verified closed</span>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 bg-red-50/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" /> Urgent Priority
            </CardDescription>
            <CardTitle className="text-3xl font-bold text-red-600">{metrics.urgent}</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-red-600/80 font-medium">Immediate intervention needed</span>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 bg-orange-50/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase text-orange-600 flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" /> Overdue (&gt;7 Days)
            </CardDescription>
            <CardTitle className="text-3xl font-bold text-orange-600">{metrics.overdue}</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-orange-600/80 font-medium">Exceeded SLA target</span>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Monthly Ticket Volume Trend
            </CardTitle>
            <CardDescription>Number of service tickets created per month over the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.monthlyTrend || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Tickets" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <PieIcon className="h-5 w-5 text-primary" /> Priority Breakdown
            </CardTitle>
            <CardDescription>Distribution of ticket priority levels.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.priorityDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {(data?.priorityDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" /> Status Distribution
            </CardTitle>
            <CardDescription>Current operational state of service tickets.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.statusDistribution || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={90} />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Ticket className="h-5 w-5 text-primary" /> Category Distribution
            </CardTitle>
            <CardDescription>Service requests categorized by domain.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.categoryDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="Tickets" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tickets */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Recent Service Tickets</CardTitle>
            <CardDescription>Latest service requests submitted to the system.</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/service-tickets">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data?.recentTickets.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">No service tickets recorded yet.</p>
            ) : (
              data?.recentTickets.map((t) => (
                <div key={t.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div className="space-y-0.5">
                    <Link href={`/dashboard/service-tickets/${t.id}`} className="font-semibold text-sm hover:underline text-primary">
                      {t.ticketNumber}: {t.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {t.location} • Requested by {t.requester?.fullName || "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{t.category}</Badge>
                    <Badge variant="secondary" className="text-xs">{t.status}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
