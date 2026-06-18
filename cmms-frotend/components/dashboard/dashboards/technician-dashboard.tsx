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
import { Badge } from "@/components/ui/badge";
import {
  CheckSquare,
  Clock,
  CheckCircle,
  Play,
  Pause,
  Camera,
  MessageSquare,
  ArrowRight,
  AlertCircle,
  Wrench,
} from "lucide-react";
import Link from "next/link";

const myTasks = [
  { 
    id: "WO-1241", 
    title: "Fix Hydraulic Leak", 
    asset: "Press Machine #2",
    location: "Building A, Floor 2",
    priority: "high",
    status: "in_progress",
    progress: 75,
    dueDate: "Today, 5:00 PM",
    description: "Hydraulic leak detected at main cylinder. Replace seals and check for damage.",
  },
  { 
    id: "WO-1246", 
    title: "Replace Air Filter", 
    asset: "HVAC Unit #3",
    location: "Building B, Roof",
    priority: "medium",
    status: "open",
    progress: 0,
    dueDate: "Tomorrow, 10:00 AM",
    description: "Scheduled filter replacement as part of monthly maintenance.",
  },
  { 
    id: "WO-1247", 
    title: "Calibrate Temperature Sensors", 
    asset: "Cold Storage Unit",
    location: "Building C, Basement",
    priority: "low",
    status: "open",
    progress: 0,
    dueDate: "In 2 days",
    description: "Quarterly calibration of all temperature monitoring sensors.",
  },
];

const recentlyCompleted = [
  { id: "WO-1238", title: "Lubricate Bearings", asset: "Conveyor #7", completedAt: "Today, 11:30 AM", timeSpent: "1.5 hrs" },
  { id: "WO-1235", title: "Replace Belt", asset: "Packaging Machine", completedAt: "Yesterday, 4:15 PM", timeSpent: "2 hrs" },
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

export function TechnicianDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Technician Dashboard"
        description="View and manage your assigned tasks"
      >
        <Button asChild>
          <Link href="/dashboard/my-tasks">
            <CheckSquare className="mr-2 h-4 w-4" />
            View All Tasks
          </Link>
        </Button>
      </PageHeader>

      {/* KPI Cards */}
      <DashboardOverviewCards />

      {/* Work Order Status */}
      <WorkOrderStatusChart />

      {/* Current Tasks */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">My Tasks</h2>
        
        {myTasks.map((task, index) => (
          <Card key={task.id} className={index === 0 ? "border-primary" : ""}>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                {/* Task Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="font-mono">{task.id}</Badge>
                    <StatusBadge status={task.priority} variant={getPriorityVariant(task.priority)} />
                    <StatusBadge status={task.status.replace("_", " ")} variant={task.status === "in_progress" ? "info" : "default"} />
                    {index === 0 && (
                      <Badge className="bg-primary">Current Task</Badge>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold">{task.title}</h3>
                    <p className="text-sm text-muted-foreground">{task.asset}</p>
                  </div>

                  <p className="text-sm">{task.description}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Due: {task.dueDate}
                    </span>
                    <span>Location: {task.location}</span>
                  </div>

                  {task.status === "in_progress" && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{task.progress}%</span>
                      </div>
                      <Progress value={task.progress} className="h-2" />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 lg:flex-col">
                  {task.status === "open" ? (
                    <Button className="gap-2">
                      <Play className="h-4 w-4" />
                      Start Work
                    </Button>
                  ) : task.status === "in_progress" ? (
                    <>
                      <Button variant="outline" className="gap-2">
                        <Pause className="h-4 w-4" />
                        Pause
                      </Button>
                      <Button className="gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Complete
                      </Button>
                    </>
                  ) : null}
                  <Button variant="outline" size="sm" className="gap-2">
                    <Camera className="h-4 w-4" />
                    Add Photo
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Add Note
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recently Completed */}
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <CheckCircle className="h-4 w-4 text-success" />
            Recently Completed
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/work-history" className="text-xs">
              View History <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentlyCompleted.map((task) => (
              <div key={task.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="font-medium">{task.id} - {task.title}</p>
                  <p className="text-sm text-muted-foreground">{task.asset}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{task.completedAt}</p>
                  <p className="text-xs text-muted-foreground">Time: {task.timeSpent}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto flex-col gap-2 py-4">
              <AlertCircle className="h-5 w-5 text-warning" />
              <span>Report Issue</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4">
              <Wrench className="h-5 w-5" />
              <span>Request Parts</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4">
              <MessageSquare className="h-5 w-5" />
              <span>Contact Supervisor</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4">
              <Clock className="h-5 w-5" />
              <span>Log Time</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User Role Distribution */}
      <UserRoleDistributionChart />

      {/* Technician Workload */}
      <TechnicianWorkloadChart />

      {/* Recent Activities */}
      <RecentActivitiesTable />
    </div>
  );
}
