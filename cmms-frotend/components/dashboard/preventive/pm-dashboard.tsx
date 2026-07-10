"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  CheckSquare,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface PMDashboardProps {
  totalPMsCount: number;
  onTrackCount: number;
  onTrackPercent: number;
  dueSoonCount: number;
  dueSoonPercent: number;
  overdueCount: number;
  overduePercent: number;
  completedCount: number;
  completedPercent: number;
  donutData: any[];
  upcomingPMsList: any[];
  getCategoryIcon: (category?: string) => any;
  getDueDateSubtext: (pm: any) => string;
  getDynamicStatus: (pm: any) => any;
  formatDateSafely: (dateString: string | null | undefined) => string;
  setStatusFilter: (filter: string) => void;
  setSearchQuery: (query: string) => void;
}

export function PMDashboard({
  totalPMsCount,
  onTrackCount,
  onTrackPercent,
  dueSoonCount,
  dueSoonPercent,
  overdueCount,
  overduePercent,
  completedCount,
  completedPercent,
  donutData,
  upcomingPMsList,
  getCategoryIcon,
  getDueDateSubtext,
  getDynamicStatus,
  formatDateSafely,
  setStatusFilter,
  setSearchQuery,
}: PMDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total PM Schedules</p>
              <p className="text-3xl font-bold mt-1 text-slate-900">{totalPMsCount}</p>
              <p className="text-xs text-muted-foreground mt-2">All time</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Calendar className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">On Track</p>
              <p className="text-3xl font-bold mt-1 text-emerald-600">{onTrackCount}</p>
              <p className="text-xs text-muted-foreground mt-2 font-medium text-emerald-600">{onTrackPercent}%</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Due Soon</p>
              <p className="text-3xl font-bold mt-1 text-amber-600">{dueSoonCount}</p>
              <p className="text-xs text-muted-foreground mt-2 font-medium text-amber-600">{dueSoonPercent}%</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Overdue</p>
              <p className="text-3xl font-bold mt-1 text-rose-600">{overdueCount}</p>
              <p className="text-xs text-muted-foreground mt-2 font-medium text-rose-600">{overduePercent}%</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
              <AlertCircle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed (This Month)</p>
              <p className="text-3xl font-bold mt-1 text-indigo-600">{completedCount}</p>
              <p className="text-xs text-muted-foreground mt-2 font-medium text-indigo-600">{completedPercent}%</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <CheckSquare className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Row */}
      <div className="grid gap-6 md:grid-cols-3 items-stretch">
        {/* Pie Chart Card */}
        <Card className="md:col-span-2 shadow-sm h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b animate-fade-in">
            <CardTitle className="text-base font-semibold">PM Status Overview</CardTitle>
            <Select defaultValue="this_month">
              <SelectTrigger className="w-[120px] h-8 text-xs font-medium">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="this_year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              {/* Pie Circle */}
              <div className="relative h-[200px] flex items-center justify-center">
                {totalPMsCount === 0 ? (
                  <div className="text-center text-sm text-muted-foreground">
                    No PM schedules to display chart
                  </div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={donutData}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={85}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {donutData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-4xl font-extrabold text-slate-800">{totalPMsCount}</span>
                      <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">Total</span>
                    </div>
                  </>
                )}
              </div>

              {/* Legend List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 font-medium">
                    <div className="h-3 w-3 rounded-full bg-[#16a34a]" />
                    <span>On Track</span>
                  </div>
                  <span className="font-semibold text-slate-800">
                    {onTrackCount} ({onTrackPercent}%)
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 font-medium">
                    <div className="h-3 w-3 rounded-full bg-[#d97706]" />
                    <span>Due Soon</span>
                  </div>
                  <span className="font-semibold text-slate-800">
                    {dueSoonCount} ({dueSoonPercent}%)
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 font-medium">
                    <div className="h-3 w-3 rounded-full bg-[#e11d48]" />
                    <span>Overdue</span>
                  </div>
                  <span className="font-semibold text-slate-800">
                    {overdueCount} ({overduePercent}%)
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 font-medium">
                    <div className="h-3 w-3 rounded-full bg-[#64748b]" />
                    <span>Completed</span>
                  </div>
                  <span className="font-semibold text-slate-800">
                    {completedCount} ({completedPercent}%)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming PMs Card */}
        <Card className="shadow-sm h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
            <CardTitle className="text-base font-semibold">Upcoming PMs</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs font-semibold text-primary"
              onClick={() => {
                setStatusFilter("all");
                setSearchQuery("");
              }}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-4 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              {upcomingPMsList.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                  No upcoming schedules found.
                </div>
              ) : (
                upcomingPMsList.map((pm) => {
                  const IconComponent = getCategoryIcon(pm.asset?.assetName);
                  const dynamicStatus = getDynamicStatus(pm);
                  return (
                    <div key={pm.id} className="flex items-start justify-between p-3 border rounded-xl bg-card hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 leading-tight">
                            {pm.pmNumber} - {pm.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 font-medium">{pm.asset?.assetName || "Generic Asset"}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 flex flex-col items-end">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${dynamicStatus.colorClass}`}>
                          {getDueDateSubtext(pm)}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-medium mt-1">
                          {formatDateSafely(pm.nextDueDate)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
