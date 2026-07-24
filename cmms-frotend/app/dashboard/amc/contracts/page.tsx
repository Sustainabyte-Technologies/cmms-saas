"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Search,
  Download,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Building,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchAMCContracts, deleteAMCContract, AMCContract, ContractType, AMCStatus } from "@/lib/api/amc-api";
import { toast } from "sonner";

export default function AMCContractsPage() {
  const [contracts, setContracts] = useState<AMCContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadContracts();
  }, [page, statusFilter, typeFilter]);

  const loadContracts = async () => {
    setLoading(true);
    try {
      const res = await fetchAMCContracts({
        search: search || undefined,
        status: statusFilter === "ALL" ? undefined : (statusFilter as AMCStatus),
        contractType: typeFilter === "ALL" ? undefined : (typeFilter as ContractType),
        page,
        limit: 10,
      });
      setContracts(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
      setTotalCount(res.meta?.total || 0);
    } catch (err: any) {
      toast.error(err.message || "Failed to load contracts");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadContracts();
  };

  const handleDelete = async (id: string, contractNumber: string) => {
    if (!confirm(`Are you sure you want to delete contract ${contractNumber}?`)) return;
    try {
      await deleteAMCContract(id);
      toast.success(`Contract ${contractNumber} deleted`);
      loadContracts();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete contract");
    }
  };

  const exportCSV = () => {
    if (!contracts.length) {
      toast.error("No contracts to export");
      return;
    }
    const headers = ["Contract Number", "Contract Name", "Customer", "Type", "Status", "Start Date", "End Date", "Value", "Visits"];
    const rows = contracts.map((c) => [
      c.contractNumber,
      `"${c.contractName.replace(/"/g, '""')}"`,
      `"${(c.customer?.name || "").replace(/"/g, '""')}"`,
      c.contractType,
      c.status,
      new Date(c.startDate).toLocaleDateString(),
      new Date(c.endDate).toLocaleDateString(),
      c.contractValue,
      c.numberOfVisits,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `amc_contracts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Exported AMC Contracts CSV");
  };

  const getStatusBadge = (status: AMCStatus) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">Active</Badge>;
      case "EXPIRED":
        return <Badge variant="secondary" className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20">Expired</Badge>;
      case "DRAFT":
        return <Badge variant="outline" className="text-muted-foreground">Draft</Badge>;
      case "RENEWED":
        return <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20">Renewed</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">AMC Contracts Directory</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage customer maintenance contracts, SLA bounds, and asset coverage models
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button size="sm" asChild>
            <Link href="/dashboard/amc/contracts/new">
              <Plus className="h-4 w-4 mr-2" />
              Create AMC Contract
            </Link>
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contract number, title, customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                  <SelectItem value="RENEWED">Renewed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={(val) => { setTypeFilter(val); setPage(1); }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Contract Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="COMPREHENSIVE">Comprehensive</SelectItem>
                  <SelectItem value="NON_COMPREHENSIVE">Non-Comprehensive</SelectItem>
                  <SelectItem value="LABOUR_ONLY">Labour Only</SelectItem>
                  <SelectItem value="PREVENTIVE_ONLY">Preventive Only</SelectItem>
                </SelectContent>
              </Select>

              <Button type="submit" variant="secondary" size="sm">
                Filter
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card className="shadow-sm">
        <CardHeader className="p-4 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase">
            Showing {contracts.length} of {totalCount} Contracts
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-bold">Contract No.</TableHead>
                  <TableHead className="font-bold">Contract Name</TableHead>
                  <TableHead className="font-bold">Customer & Site</TableHead>
                  <TableHead className="font-bold">Type</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="font-bold">Validity</TableHead>
                  <TableHead className="font-bold text-right">Value</TableHead>
                  <TableHead className="font-bold text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                      Loading AMC contracts...
                    </TableCell>
                  </TableRow>
                ) : contracts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      No AMC contracts found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  contracts.map((c) => (
                    <TableRow key={c.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="font-mono text-xs font-bold text-primary">
                        {c.contractNumber}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-foreground text-sm">{c.contractName}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {c._count?.assets || c.assets?.length || 0} covered assets • {c.serviceFrequency}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium text-foreground">{c.customer?.name || "N/A"}</div>
                        <div className="text-xs text-muted-foreground">{c.site?.name || "N/A"}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs font-mono">
                          {c.contractType.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(c.status)}</TableCell>
                      <TableCell>
                        <div className="text-xs font-medium">
                          {new Date(c.startDate).toLocaleDateString()} - {new Date(c.endDate).toLocaleDateString()}
                        </div>
                        {c.remainingDays !== undefined && (
                          <div className={`text-[10px] font-bold mt-0.5 ${c.remainingDays < 0 ? "text-destructive" : c.remainingDays <= 30 ? "text-amber-500" : "text-emerald-600"}`}>
                            {c.remainingDays < 0 ? "Expired" : `${c.remainingDays} days remaining`}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-sm">
                        ${c.contractValue.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="View Details">
                            <Link href={`/dashboard/amc/contracts/${c.id}`}>
                              <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="Edit Contract">
                            <Link href={`/dashboard/amc/contracts/${c.id}/edit`}>
                              <Edit className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(c.id, c.contractNumber)}
                            title="Delete Contract"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="p-4 border-t flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
