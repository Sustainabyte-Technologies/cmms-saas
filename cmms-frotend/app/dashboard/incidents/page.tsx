"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/ui-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  fetchIncidents,
  deleteIncident,
  updateIncidentStatus,
  Incident,
  IncidentType,
  IncidentSeverity,
  IncidentStatus,
} from "@/lib/api/incidents-api";
import {
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  MoreVertical,
  Eye,
  Edit,
  ArrowUpDown,
  ShieldAlert,
  BarChart3,
  RefreshCw,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";

export default function IncidentListPage() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Selection & Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string>("");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Sorting
  const [sortField, setSortField] = useState<keyof Incident>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const res = await fetchIncidents({
        page,
        limit,
        search: search.trim() || undefined,
        incidentType: selectedType !== "ALL" ? (selectedType as IncidentType) : undefined,
        severity: selectedSeverity !== "ALL" ? (selectedSeverity as IncidentSeverity) : undefined,
        status: selectedStatus !== "ALL" ? (selectedStatus as IncidentStatus) : undefined,
      });

      setIncidents(res.incidents);
      if (res.pagination) {
        setTotalPages(res.pagination.totalPages);
        setTotalCount(res.pagination.total);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load incidents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, [page, limit, selectedType, selectedSeverity, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadIncidents();
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(incidents.map((i) => i.id));
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

  const handleDeleteOne = async (id: string) => {
    if (!confirm("Are you sure you want to delete this incident record?")) return;
    try {
      await deleteIncident(id);
      toast.success("Incident deleted successfully");
      loadIncidents();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete incident");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} selected incident records?`)) return;

    try {
      await Promise.all(selectedIds.map((id) => deleteIncident(id)));
      toast.success(`${selectedIds.length} incidents deleted`);
      setSelectedIds([]);
      loadIncidents();
    } catch (error: any) {
      toast.error(error.message || "Failed during bulk deletion");
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (selectedIds.length === 0 || !bulkStatus) return;
    try {
      await Promise.all(
        selectedIds.map((id) =>
          updateIncidentStatus(id, { status: bulkStatus as IncidentStatus })
        )
      );
      toast.success(`Updated status for ${selectedIds.length} incidents`);
      setSelectedIds([]);
      setBulkStatus("");
      loadIncidents();
    } catch (error: any) {
      toast.error(error.message || "Failed bulk status update");
    }
  };

  const handleExportCSV = () => {
    if (incidents.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = [
      "Incident Number",
      "Title",
      "Type",
      "Severity",
      "Status",
      "Date",
      "Location",
      "Customer",
      "Site",
      "Department",
    ];

    const rows = incidents.map((inc) => [
      inc.incidentNumber,
      `"${inc.title.replace(/"/g, '""')}"`,
      inc.incidentType,
      inc.severity,
      inc.status,
      new Date(inc.incidentDate).toLocaleDateString(),
      `"${inc.location.replace(/"/g, '""')}"`,
      `"${inc.customer?.name || ""}"`,
      `"${inc.site?.name || ""}"`,
      `"${inc.department?.name || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Incidents_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV report exported successfully");
  };

  const getSeverityBadge = (sev: IncidentSeverity) => {
    switch (sev) {
      case "CRITICAL":
        return <Badge className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30">CRITICAL</Badge>;
      case "HIGH":
        return <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30">HIGH</Badge>;
      case "MEDIUM":
        return <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30">MEDIUM</Badge>;
      case "LOW":
      default:
        return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">LOW</Badge>;
    }
  };

  const getStatusBadge = (st: IncidentStatus) => {
    switch (st) {
      case "OPEN":
        return <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-500/10">OPEN</Badge>;
      case "UNDER_INVESTIGATION":
        return <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-500/10">INVESTIGATING</Badge>;
      case "CORRECTIVE_ACTION":
        return <Badge variant="outline" className="border-purple-500 text-purple-600 bg-purple-500/10">CORRECTIVE ACTION</Badge>;
      case "RESOLVED":
        return <Badge variant="outline" className="border-emerald-500 text-emerald-600 bg-emerald-500/10">RESOLVED</Badge>;
      case "CLOSED":
        return <Badge variant="outline" className="border-gray-500 text-gray-600 bg-gray-500/10">CLOSED</Badge>;
    }
  };

  // Sorted Incidents
  const sortedIncidents = [...incidents].sort((a, b) => {
    const valA = a[sortField] || "";
    const valB = b[sortField] || "";
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const toggleSort = (field: keyof Incident) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Incident Management"
        description="Record, investigate, and track Safety, Environmental, Security, and Operational incidents."
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/incidents/dashboard">
              <BarChart3 className="mr-2 h-4 w-4" />
              Incident Dashboard
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/incidents/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Incident
            </Link>
          </Button>
        </div>
      </PageHeader>

      {/* Enterprise Filter & Search Bar */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-auto flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by INC#, title, description, location..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button type="submit" variant="secondary">
                Search
              </Button>
            </form>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
              {/* Type Filter */}
              <Select value={selectedType} onValueChange={(val) => { setSelectedType(val); setPage(1); }}>
                <SelectTrigger className="w-[140px] text-xs">
                  <SelectValue placeholder="Incident Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="SAFETY">Safety</SelectItem>
                  <SelectItem value="ENVIRONMENTAL">Environmental</SelectItem>
                  <SelectItem value="SECURITY">Security</SelectItem>
                  <SelectItem value="OPERATIONAL">Operational</SelectItem>
                  <SelectItem value="FIRE">Fire</SelectItem>
                  <SelectItem value="CHEMICAL">Chemical</SelectItem>
                  <SelectItem value="NEAR_MISS">Near Miss</SelectItem>
                  <SelectItem value="ELECTRICAL">Electrical</SelectItem>
                  <SelectItem value="PROPERTY_DAMAGE">Property Damage</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>

              {/* Severity Filter */}
              <Select value={selectedSeverity} onValueChange={(val) => { setSelectedSeverity(val); setPage(1); }}>
                <SelectTrigger className="w-[130px] text-xs">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Severities</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={selectedStatus} onValueChange={(val) => { setSelectedStatus(val); setPage(1); }}>
                <SelectTrigger className="w-[140px] text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="UNDER_INVESTIGATION">Under Investigation</SelectItem>
                  <SelectItem value="CORRECTIVE_ACTION">Corrective Action</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" onClick={handleExportCSV} title="Export CSV">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>

              <Button variant="ghost" size="icon" onClick={() => loadIncidents()} title="Refresh Data">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Bulk Action Controls */}
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between p-2.5 bg-muted/60 rounded-lg border text-xs">
              <span className="font-semibold text-primary">
                {selectedIds.length} item(s) selected
              </span>

              <div className="flex items-center gap-2">
                <Select value={bulkStatus} onValueChange={setBulkStatus}>
                  <SelectTrigger className="w-[150px] h-8 text-xs">
                    <SelectValue placeholder="Change Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="UNDER_INVESTIGATION">Under Investigation</SelectItem>
                    <SelectItem value="CORRECTIVE_ACTION">Corrective Action</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                  </SelectContent>
                </Select>

                <Button size="sm" variant="secondary" className="h-8" onClick={handleBulkStatusUpdate} disabled={!bulkStatus}>
                  Update Status
                </Button>

                <Button size="sm" variant="destructive" className="h-8" onClick={handleBulkDelete}>
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Delete Selected
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enterprise Data Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-2">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              Loading incidents database...
            </div>
          ) : incidents.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <ShieldAlert className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="text-base font-semibold">No Incidents Found</h3>
              <p className="text-sm text-muted-foreground">
                No incidents match your filter criteria. Create a new incident or clear filters.
              </p>
              <Button asChild variant="outline">
                <Link href="/dashboard/incidents/new">
                  <Plus className="mr-2 h-4 w-4" /> Create Incident
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={selectedIds.length === incidents.length && incidents.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort("incidentNumber")}>
                      <div className="flex items-center gap-1 font-bold">
                        Incident # <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort("title")}>
                      <div className="flex items-center gap-1 font-bold">
                        Title <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort("incidentDate")}>
                      <div className="flex items-center gap-1 font-bold">
                        Incident Date <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Work Order</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedIncidents.map((inc) => {
                    const isSelected = selectedIds.includes(inc.id);
                    return (
                      <TableRow key={inc.id} className={isSelected ? "bg-muted/40" : ""}>
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleSelectOne(inc.id, !!checked)}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-xs font-bold text-primary">
                          <Link href={`/dashboard/incidents/${inc.id}`} className="hover:underline">
                            {inc.incidentNumber}
                          </Link>
                        </TableCell>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          <Link href={`/dashboard/incidents/${inc.id}`} className="hover:underline">
                            {inc.title}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted">
                            {inc.incidentType}
                          </span>
                        </TableCell>
                        <TableCell>{getSeverityBadge(inc.severity)}</TableCell>
                        <TableCell>{getStatusBadge(inc.status)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(inc.incidentDate).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </TableCell>
                        <TableCell className="text-xs truncate max-w-[120px]">
                          {inc.location}
                        </TableCell>
                        <TableCell className="text-xs">
                          {inc.reporter?.fullName || "—"}
                        </TableCell>
                        <TableCell>
                          {inc.isWorkOrderCreated && inc.workOrder ? (
                            <Badge variant="secondary" className="font-mono text-[10px]">
                              {inc.workOrder.workOrderNumber}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/incidents/${inc.id}`}>
                                  <Eye className="mr-2 h-4 w-4" /> View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/incidents/${inc.id}/edit`}>
                                  <Edit className="mr-2 h-4 w-4" /> Edit Incident
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteOne(inc.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Record
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination Footer */}
          {!loading && incidents.length > 0 && (
            <div className="flex items-center justify-between p-4 border-t text-xs">
              <div className="text-muted-foreground">
                Showing {incidents.length} of {totalCount} incidents (Page {page} of {totalPages})
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span>Per page:</span>
                  <Select value={limit.toString()} onValueChange={(val) => { setLimit(Number(val)); setPage(1); }}>
                    <SelectTrigger className="w-[70px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    disabled={page >= totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
