"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/ui-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Trash2, Edit, RefreshCw, FileSearch, ChevronLeft, ChevronRight } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  fetchRootCauseAnalyses,
  createRootCauseAnalysis,
  updateRootCauseAnalysis,
  deleteRootCauseAnalysis,
  RootCauseAnalysisItem,
  RcaStatus,
} from "@/lib/api/reliability-api";
import { fetchAssets } from "@/lib/api/assets-api";

export default function RcaPage() {
  const [items, setItems] = useState<RootCauseAnalysisItem[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RootCauseAnalysisItem | null>(null);
  const [formAssetId, setFormAssetId] = useState("");
  const [rootCause, setRootCause] = useState("");
  const [causeCategory, setCauseCategory] = useState("Component Wear");
  const [investigationNotes, setInvestigationNotes] = useState("");
  const [correctiveAction, setCorrectiveAction] = useState("");
  const [preventiveAction, setPreventiveAction] = useState("");
  const [status, setStatus] = useState<RcaStatus>("DRAFT");

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchRootCauseAnalyses({ search, status: statusFilter });
      setItems(res || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch RCA cases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    fetchAssets(1, 1000).then((res: any) => setAssets(res?.data || (Array.isArray(res) ? res : res?.assets || []))).catch(() => {});
  }, [statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
    const timer = setTimeout(loadData, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(items.length / rowsPerPage));
  const paginatedItems = items.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormAssetId(assets[0]?.id || "");
    setRootCause("");
    setCauseCategory("Component Wear");
    setInvestigationNotes("");
    setCorrectiveAction("");
    setPreventiveAction("");
    setStatus("DRAFT");
    setIsOpen(true);
  };

  const handleOpenEdit = (item: RootCauseAnalysisItem) => {
    setEditingItem(item);
    setFormAssetId(item.assetId);
    setRootCause(item.rootCause);
    setCauseCategory(item.causeCategory);
    setInvestigationNotes(item.investigationNotes || "");
    setCorrectiveAction(item.correctiveAction || "");
    setPreventiveAction(item.preventiveAction || "");
    setStatus(item.status);
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!formAssetId || !rootCause) {
      toast.error("Please select an Asset and enter Root Cause");
      return;
    }

    try {
      if (editingItem) {
        await updateRootCauseAnalysis(editingItem.id, {
          rootCause,
          causeCategory,
          investigationNotes,
          correctiveAction,
          preventiveAction,
          status,
        });
        toast.success("RCA record updated");
      } else {
        await createRootCauseAnalysis({
          assetId: formAssetId,
          rootCause,
          causeCategory,
          investigationNotes,
          correctiveAction,
          preventiveAction,
          status,
        });
        toast.success("RCA record created");
      }
      setIsOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save RCA record");
    }
  };

  // Delete Modal State
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setDeleteTargetId(id);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteRootCauseAnalysis(deleteTargetId);
      toast.success("RCA record deleted");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete RCA record");
    } finally {
      setDeleteOpen(false);
      setDeleteTargetId(null);
    }
  };

  const renderStatusBadge = (st: RcaStatus) => {
    switch (st) {
      case "DRAFT":
        return <Badge variant="outline" className="bg-slate-50 text-slate-700">DRAFT</Badge>;
      case "INVESTIGATING":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">INVESTIGATING</Badge>;
      case "ACTION_REQUIRED":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">ACTION REQUIRED</Badge>;
      case "CLOSED":
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">CLOSED</Badge>;
      default:
        return <Badge variant="secondary">{st}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Root Cause Analysis (RCA)"
        description="Structured 5-Why investigation workflow connecting Incident -> Investigation -> Root Cause -> Actions -> Close."
      >
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" /> Initiate New RCA Case
        </Button>
      </PageHeader>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search RCA #, root cause, or asset..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="RCA Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="INVESTIGATING">Investigating</SelectItem>
                <SelectItem value="ACTION_REQUIRED">Action Required</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="ghost" size="icon" onClick={loadData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>RCA #</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead>Root Cause & Category</TableHead>
                <TableHead>Corrective Action</TableHead>
                <TableHead>Preventive Action</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Loading RCA cases...
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No RCA cases found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs font-semibold text-primary">{item.rcaNumber}</TableCell>
                    <TableCell className="text-xs font-medium">{item.asset?.assetName || "Asset"}</TableCell>
                    <TableCell className="max-w-xs text-xs">
                      <span className="font-semibold block">{item.rootCause}</span>
                      <span className="text-muted-foreground block">Category: {item.causeCategory}</span>
                    </TableCell>
                    <TableCell className="max-w-xs text-xs text-muted-foreground truncate">{item.correctiveAction || "—"}</TableCell>
                    <TableCell className="max-w-xs text-xs text-muted-foreground truncate">{item.preventiveAction || "—"}</TableCell>
                    <TableCell>{renderStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          {items.length > 0 && (
            <div className="flex items-center justify-between border-t border-border px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value={10}>10</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages} ({items.length} total RCA cases)
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? `Edit ${editingItem.rcaNumber}` : "Initiate Root Cause Analysis"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {!editingItem && (
              <div className="space-y-1">
                <Label className="text-xs">Asset</Label>
                <Select value={formAssetId} onValueChange={setFormAssetId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Asset" />
                  </SelectTrigger>
                  <SelectContent>
                    {assets.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.assetName} ({a.assetCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">Cause Category</Label>
                <Input value={causeCategory} onChange={(e) => setCauseCategory(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Workflow Status</Label>
                <Select value={status} onValueChange={(v: RcaStatus) => setStatus(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="INVESTIGATING">Investigating</SelectItem>
                    <SelectItem value="ACTION_REQUIRED">Action Required</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Root Cause</Label>
              <Textarea placeholder="Primary root cause identified..." value={rootCause} onChange={(e) => setRootCause(e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Investigation Notes (5-Why Analysis)</Label>
              <Textarea placeholder="Detailed 5-Why steps and findings..." value={investigationNotes} onChange={(e) => setInvestigationNotes(e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Corrective Action</Label>
              <Textarea placeholder="Immediate action taken to repair/restore..." value={correctiveAction} onChange={(e) => setCorrectiveAction(e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Preventive Action</Label>
              <Textarea placeholder="Long term preventive action to prevent recurrence..." value={preventiveAction} onChange={(e) => setPreventiveAction(e.target.value)} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save RCA Case</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Popup Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete RCA Case</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this Root Cause Analysis record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete RCA Case
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
