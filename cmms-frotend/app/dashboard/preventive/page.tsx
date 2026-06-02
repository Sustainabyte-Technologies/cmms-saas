"use client";

import { useState } from "react";
import { PageHeader, StatusBadge, EmptyState } from "@/components/shared/ui-components";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreHorizontal, Calendar, Eye, Edit, Trash2, Play } from "lucide-react";

// Mock data
const pmSchedules = [
  {
    id: "PM-001",
    title: "Monthly HVAC Inspection",
    asset: "HVAC System",
    frequency: "Monthly",
    lastCompleted: "Dec 15, 2025",
    nextDue: "Jan 15, 2026",
    assignee: "Mike Johnson",
    status: "due_soon",
  },
  {
    id: "PM-002",
    title: "Quarterly Generator Service",
    asset: "Backup Generator",
    frequency: "Quarterly",
    lastCompleted: "Oct 10, 2025",
    nextDue: "Jan 10, 2026",
    assignee: "Sarah Chen",
    status: "overdue",
  },
  {
    id: "PM-003",
    title: "Weekly Safety Check",
    asset: "Fire Suppression",
    frequency: "Weekly",
    lastCompleted: "Jan 8, 2026",
    nextDue: "Jan 15, 2026",
    assignee: "John Smith",
    status: "on_track",
  },
  {
    id: "PM-004",
    title: "Annual Calibration",
    asset: "CNC Machine #1",
    frequency: "Yearly",
    lastCompleted: "Jan 20, 2025",
    nextDue: "Jan 20, 2026",
    assignee: "Emily Davis",
    status: "due_soon",
  },
  {
    id: "PM-005",
    title: "Daily Conveyor Inspection",
    asset: "Conveyor #7",
    frequency: "Daily",
    lastCompleted: "Jan 10, 2026",
    nextDue: "Jan 11, 2026",
    assignee: "Mike Johnson",
    status: "on_track",
  },
];

const getStatusVariant = (status: string) => {
  switch (status) {
    case "on_track":
      return "success";
    case "due_soon":
      return "warning";
    case "overdue":
      return "error";
    default:
      return "default";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "on_track":
      return "On Track";
    case "due_soon":
      return "Due Soon";
    case "overdue":
      return "Overdue";
    default:
      return status;
  }
};

export default function PreventiveMaintenancePage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSchedules = pmSchedules.filter((pm) =>
    pm.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pm.asset.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Preventive Maintenance"
        description="Schedule and track recurring maintenance tasks"
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New PM Schedule
        </Button>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">On Track</p>
                <p className="text-2xl font-bold text-success">2</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Due Soon</p>
                <p className="text-2xl font-bold text-warning">2</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-destructive">1</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search schedules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* PM Schedules Table */}
      <Card>
        <CardContent className="p-0">
          {filteredSchedules.length === 0 ? (
            <EmptyState
              title="No schedules found"
              description="Try adjusting your search criteria"
              icon={Calendar}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Schedule</TableHead>
                  <TableHead className="hidden md:table-cell">Asset</TableHead>
                  <TableHead className="hidden lg:table-cell">Frequency</TableHead>
                  <TableHead className="hidden sm:table-cell">Next Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchedules.map((pm) => (
                  <TableRow key={pm.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{pm.id}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{pm.title}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {pm.asset}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {pm.frequency}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {pm.nextDue}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={getStatusLabel(pm.status)}
                        variant={getStatusVariant(pm.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Play className="mr-2 h-4 w-4" /> Generate Work Order
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
