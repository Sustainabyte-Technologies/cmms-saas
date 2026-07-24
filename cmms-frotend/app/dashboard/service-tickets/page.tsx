"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/ui-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  fetchServiceTickets,
  deleteServiceTicket,
  updateServiceTicketStatus,
  ServiceTicket,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "@/lib/api/service-tickets-api";
import {
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
  Edit,
  MoreVertical,
  ArrowUpDown,
  Ticket,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  RefreshCw,
  Wrench,
} from "lucide-react";

export default function ServiceTicketsPage() {
  const router = useRouter();

  // State
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedPriority, setSelectedPriority] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Selection & Sorting State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortField, setSortField] = useState<keyof ServiceTicket>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await fetchServiceTickets({
        page,
        limit,
        search: search || undefined,
        category: selectedCategory !== "ALL" ? (selectedCategory as TicketCategory) : undefined,
        priority: selectedPriority !== "ALL" ? (selectedPriority as TicketPriority) : undefined,
        status: selectedStatus !== "ALL" ? (selectedStatus as TicketStatus) : undefined,
      });
      setTickets(res.serviceTickets || []);
      setTotal(res.pagination?.total || 0);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch service tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [page, limit, selectedCategory, selectedPriority, selectedStatus]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadTickets();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Sorting
  const sortedTickets = useMemo(() => {
    return [...tickets].sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [tickets, sortField, sortDirection]);

  const handleSort = (field: keyof ServiceTicket) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Bulk Actions
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(tickets.map((t) => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} ticket(s)?`)) return;

    try {
      await Promise.all(selectedIds.map((id) => deleteServiceTicket(id)));
      toast.success(`${selectedIds.length} Service Ticket(s) deleted successfully`);
      setSelectedIds([]);
      loadTickets();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete selected tickets");
    }
  };

  const handleBulkStatusUpdate = async (status: TicketStatus) => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(
        selectedIds.map((id) => updateServiceTicketStatus(id, { status }))
      );
      toast.success(`Updated status for ${selectedIds.length} ticket(s)`);
      setSelectedIds([]);
      loadTickets();
    } catch (error: any) {
      toast.error(error.message || "Failed to update ticket status");
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (tickets.length === 0) {
      toast.error("No data to export");
      return;
    }
    const headers = [
      "Ticket Number",
      "Title",
      "Category",
      "Priority",
      "Status",
      "Location",
      "Requested By",
      "Assigned To",
      "Work Order",
      "Created At",
    ];
    const rows = tickets.map((t) => [
      t.ticketNumber,
      `"${t.title.replace(/"/g, '""')}"`,
      t.category,
      t.priority,
      t.status,
      `"${t.location.replace(/"/g, '""')}"`,
      t.requester?.fullName || "—",
      t.assignee?.fullName || "Unassigned",
      t.workOrder?.workOrderNumber || "None",
      new Date(t.createdAt).toLocaleDateString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `service_tickets_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV export initiated");
  };

  // Status Badge Helper
  const renderStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case "NEW":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">New</Badge>;
      case "ASSIGNED":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Assigned</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">In Progress</Badge>;
      case "ON_HOLD":
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">On Hold</Badge>;
      case "RESOLVED":
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Resolved</Badge>;
      case "CLOSED":
        return <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300">Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Priority Badge Helper
  const renderPriorityBadge = (priority: TicketPriority) => {
    switch (priority) {
      case "URGENT":
        return <Badge className="bg-red-600 text-white font-semibold">Urgent</Badge>;
      case "HIGH":
        return <Badge className="bg-amber-500 text-white font-medium">High</Badge>;
      case "MEDIUM":
        return <Badge className="bg-blue-500 text-white font-medium">Medium</Badge>;
      case "LOW":
        return <Badge className="bg-slate-500 text-white font-normal">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Service Tickets"
        description="Manage maintenance, facility, IT, and operational service requests raised by employees and customers."
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/service-tickets/dashboard">
              <Ticket className="mr-2 h-4 w-4 text-primary" /> Dashboard
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/service-tickets/analytics">
              <BarChart3Icon className="mr-2 h-4 w-4" /> Analytics
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/service-tickets/new">
              <Plus className="mr-2 h-4 w-4" /> Create Service Ticket
            </Link>
          </Button>
        </div>
      </PageHeader>

      {/* Filter & Toolbar */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ticket #, title, location..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  <SelectItem value="ELECTRICAL">Electrical</SelectItem>
                  <SelectItem value="MECHANICAL">Mechanical</SelectItem>
                  <SelectItem value="HVAC">HVAC</SelectItem>
                  <SelectItem value="PLUMBING">Plumbing</SelectItem>
                  <SelectItem value="HOUSEKEEPING">Housekeeping</SelectItem>
                  <SelectItem value="IT_SUPPORT">IT Support</SelectItem>
                  <SelectItem value="GENERAL_REQUEST">General Request</SelectItem>
                  <SelectItem value="FACILITY">Facility</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Priority</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="NEW">New</SelectItem>
                  <SelectItem value="ASSIGNED">Assigned</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="ON_HOLD">On Hold</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="ghost" size="icon" onClick={loadTickets} title="Refresh">
                <RefreshCw className="h-4 w-4" />
              </Button>

              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="mr-2 h-4 w-4" /> Export CSV
              </Button>
            </div>
          </div>

          {/* Bulk Action Bar */}
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between bg-muted/60 p-2.5 rounded-md border border-primary/20">
              <span className="text-xs font-semibold text-primary">
                {selectedIds.length} item(s) selected
              </span>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Bulk Status Update
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate("NEW")}>Set to New</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate("ASSIGNED")}>Set to Assigned</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate("IN_PROGRESS")}>Set to In Progress</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate("RESOLVED")}>Set to Resolved</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate("CLOSED")}>Set to Closed</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="mr-1.5 h-4 w-4" /> Delete Selected
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[40px] pl-4">
                    <Checkbox
                      checked={tickets.length > 0 && selectedIds.length === tickets.length}
                      onCheckedChange={(c) => handleSelectAll(!!c)}
                    />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer font-bold text-xs uppercase tracking-wider"
                    onClick={() => handleSort("ticketNumber")}
                  >
                    <div className="flex items-center gap-1">
                      Ticket # <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer font-bold text-xs uppercase tracking-wider"
                    onClick={() => handleSort("title")}
                  >
                    <div className="flex items-center gap-1">
                      Title & Description <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider">Category</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider">Priority</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider">Status</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider">Requested By</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider">Assigned To</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider">Work Order</TableHead>
                  <TableHead
                    className="cursor-pointer font-bold text-xs uppercase tracking-wider"
                    onClick={() => handleSort("createdAt")}
                  >
                    <div className="flex items-center gap-1">
                      Date <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right pr-4 font-bold text-xs uppercase tracking-wider">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-12 text-muted-foreground">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                      Loading service tickets...
                    </TableCell>
                  </TableRow>
                ) : sortedTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-12 text-muted-foreground">
                      No service tickets found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedTickets.map((t) => (
                    <TableRow key={t.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="pl-4">
                        <Checkbox
                          checked={selectedIds.includes(t.id)}
                          onCheckedChange={(c) => handleSelectOne(t.id, !!c)}
                        />
                      </TableCell>
                      <TableCell className="font-semibold text-primary whitespace-nowrap">
                        <Link href={`/dashboard/service-tickets/${t.id}`} className="hover:underline">
                          {t.ticketNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <Link href={`/dashboard/service-tickets/${t.id}`} className="font-medium text-foreground hover:text-primary block truncate">
                          {t.title}
                        </Link>
                        <span className="text-xs text-muted-foreground truncate block">
                          {t.location} • {t.site?.name || "Site"}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant="outline" className="text-xs font-normal">
                          {t.category.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{renderPriorityBadge(t.priority)}</TableCell>
                      <TableCell className="whitespace-nowrap">{renderStatusBadge(t.status)}</TableCell>
                      <TableCell className="whitespace-nowrap text-xs">
                        {t.requester?.fullName || "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {t.assignee?.fullName || "Unassigned"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs">
                        {t.workOrder ? (
                          <Badge variant="secondary" className="font-mono text-xs flex items-center gap-1 w-fit">
                            <Wrench className="h-3 w-3 text-primary" /> {t.workOrder.workOrderNumber}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">None</span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right pr-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/service-tickets/${t.id}`}>
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/service-tickets/${t.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" /> Edit Ticket
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={async () => {
                                if (confirm(`Delete ticket ${t.ticketNumber}?`)) {
                                  try {
                                    await deleteServiceTicket(t.id);
                                    toast.success("Service ticket deleted");
                                    loadTickets();
                                  } catch (err: any) {
                                    toast.error(err.message || "Failed to delete");
                                  }
                                }
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t text-sm">
            <span className="text-muted-foreground">
              Showing {tickets.length > 0 ? (page - 1) * limit + 1 : 0} to{" "}
              {Math.min(page * limit, total)} of {total} tickets
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-xs font-semibold px-2">
                Page {page} of {Math.ceil(total / limit) || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page * limit >= total}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BarChart3Icon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  );
}
