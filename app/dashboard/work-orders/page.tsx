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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Filter, MoreHorizontal, ClipboardList, Eye, Edit, Trash2, CheckCircle } from "lucide-react";

// Mock data
const workOrders = [
  {
    id: "WO-1234",
    title: "Replace HVAC Filter",
    asset: "HVAC Unit #3",
    assignee: "Mike Johnson",
    priority: "high",
    status: "completed",
    dueDate: "Jan 15, 2026",
  },
  {
    id: "WO-1235",
    title: "Inspect Conveyor Belt",
    asset: "Conveyor #7",
    assignee: "Sarah Chen",
    priority: "medium",
    status: "in_progress",
    dueDate: "Jan 18, 2026",
  },
  {
    id: "WO-1236",
    title: "Calibrate CNC Machine",
    asset: "CNC Machine #2",
    assignee: "John Smith",
    priority: "high",
    status: "open",
    dueDate: "Jan 20, 2026",
  },
  {
    id: "WO-1237",
    title: "Lubricate Assembly Line",
    asset: "Assembly Line A",
    assignee: "Emily Davis",
    priority: "low",
    status: "completed",
    dueDate: "Jan 12, 2026",
  },
  {
    id: "WO-1238",
    title: "Check Generator Fuel Levels",
    asset: "Backup Generator",
    assignee: "Mike Johnson",
    priority: "critical",
    status: "open",
    dueDate: "Jan 16, 2026",
  },
];

const getStatusVariant = (status: string) => {
  switch (status) {
    case "completed":
      return "success";
    case "in_progress":
      return "info";
    case "open":
      return "warning";
    case "on_hold":
      return "default";
    default:
      return "default";
  }
};

const getPriorityVariant = (priority: string) => {
  switch (priority) {
    case "critical":
      return "error";
    case "high":
      return "error";
    case "medium":
      return "warning";
    case "low":
      return "success";
    default:
      return "default";
  }
};

export default function WorkOrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  const filteredWorkOrders = workOrders.filter((wo) => {
    const matchesSearch =
      wo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || wo.status === statusFilter;
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "open" && wo.status === "open") ||
      (activeTab === "in_progress" && wo.status === "in_progress") ||
      (activeTab === "completed" && wo.status === "completed");
    return matchesSearch && matchesStatus && matchesTab;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Work Orders"
        description="Create and manage maintenance work orders"
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Work Order
        </Button>
      </PageHeader>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search work orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Work Orders Table */}
      <Card>
        <CardContent className="p-0">
          {filteredWorkOrders.length === 0 ? (
            <EmptyState
              title="No work orders found"
              description="Try adjusting your search or filter criteria"
              icon={ClipboardList}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Work Order</TableHead>
                  <TableHead className="hidden md:table-cell">Asset</TableHead>
                  <TableHead className="hidden lg:table-cell">Assignee</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Due Date</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkOrders.map((wo) => (
                  <TableRow key={wo.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{wo.id}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{wo.title}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {wo.asset}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {wo.assignee}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={wo.priority} variant={getPriorityVariant(wo.priority)} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={wo.status.replace("_", " ")}
                        variant={getStatusVariant(wo.status)}
                      />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {wo.dueDate}
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
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <CheckCircle className="mr-2 h-4 w-4" /> Mark Complete
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
