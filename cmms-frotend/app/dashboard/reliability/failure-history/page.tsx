"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/ui-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, RefreshCw, Wrench, Calendar, DollarSign, ChevronLeft, ChevronRight } from "lucide-react";
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
  fetchFailureHistory,
  createFailureHistoryItem,
  syncFailureHistory,
  deleteFailureHistoryItem,
  FailureHistoryItem,
} from "@/lib/api/reliability-api";
import { fetchAssets } from "@/lib/api/assets-api";

export default function FailureHistoryPage() {
  const [items, setItems] = useState<FailureHistoryItem[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [formAssetId, setFormAssetId] = useState("");
  const [modeText, setModeText] = useState("");
  const [cause, setCause] = useState("");
  const [effect, setEffect] = useState("");
  const [start, setStart] = useState(new Date().toISOString().slice(0, 16));
  const [end, setEnd] = useState(new Date().toISOString().slice(0, 16));
  const [downtime, setDowntime] = useState(2);
  const [cost, setCost] = useState(150);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchFailureHistory({ search });
      setItems(res || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch failure history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    fetchAssets(1, 1000).then((res: any) => setAssets(res?.data || (Array.isArray(res) ? res : res?.assets || []))).catch(() => {});
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    const timer = setTimeout(loadData, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(items.length / rowsPerPage));
  const paginatedItems = items.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleSyncWorkOrders = async () => {
    setSyncing(true);
    try {
      const res = await syncFailureHistory();
      toast.success(`Synced ${res.synced || 0} completed work order failure record(s)`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to sync work orders");
    } finally {
      setSyncing(false);
    }
  };

  const handleOpenCreate = () => {
    setFormAssetId(assets[0]?.id || "");
    setModeText("");
    setCause("");
    setEffect("");
    setStart(new Date().toISOString().slice(0, 16));
    setEnd(new Date().toISOString().slice(0, 16));
    setDowntime(2);
    setCost(150);
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!formAssetId || !modeText || !cause) {
      toast.error("Please fill Asset, Failure Mode, and Cause");
      return;
    }

    try {
      await createFailureHistoryItem({
        assetId: formAssetId,
        failureModeText: modeText,
        failureCause: cause,
        failureEffect: effect,
        breakdownStart: new Date(start).toISOString(),
        breakdownEnd: new Date(end).toISOString(),
        downtimeHours: Number(downtime),
        repairTimeHours: Number(downtime * 0.8),
        repairCost: Number(cost),
      });
      toast.success("Failure history record logged");
      setIsOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create failure record");
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
      await deleteFailureHistoryItem(deleteTargetId);
      toast.success("Failure history record deleted");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete record");
    } finally {
      setDeleteOpen(false);
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Failure History Log"
        description="Historical log of asset breakdown events, downtime durations, failure causes, and repair costs."
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSyncWorkOrders} disabled={syncing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} /> Sync Work Orders
          </Button>
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" /> Log Breakdown Event
          </Button>
        </div>
      </PageHeader>

      {/* Filter */}
      <Card>
        <CardContent className="p-4 flex items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search asset, mode, or cause..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="ghost" size="icon" onClick={loadData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Asset Code & Name</TableHead>
                <TableHead>Failure Mode</TableHead>
                <TableHead>Root Cause & Effect</TableHead>
                <TableHead>Breakdown Period</TableHead>
                <TableHead>Downtime</TableHead>
                <TableHead>Repair Cost</TableHead>
                <TableHead className="text-right pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Loading failure history...
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No breakdown events logged yet. Click "Sync Work Orders" or "Log Breakdown Event".
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-xs">
                      {item.asset?.assetName || "Asset"}
                      <span className="block text-muted-foreground">{item.asset?.assetCode}</span>
                    </TableCell>
                    <TableCell className="text-xs font-semibold">{item.failureModeText}</TableCell>
                    <TableCell className="max-w-xs text-xs">
                      <span className="block truncate">{item.failureCause}</span>
                      {item.failureEffect && <span className="text-muted-foreground truncate block">{item.failureEffect}</span>}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(item.breakdownStart).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                        {item.downtimeHours} hrs
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-emerald-700">${item.repairCost}</TableCell>
                    <TableCell className="text-right pr-4">
                      <Button variant="ghost" size="sm" className="text-destructive h-8" onClick={() => handleDelete(item.id)}>
                        Delete
                      </Button>
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
                Page {currentPage} of {totalPages} ({items.length} total records)
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
            <DialogTitle>Log Breakdown Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
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

            <div className="space-y-1">
              <Label className="text-xs">Failure Mode</Label>
              <Input placeholder="e.g. Pump Mechanical Seal Leakage" value={modeText} onChange={(e) => setModeText(e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Failure Cause</Label>
              <Textarea placeholder="Root cause of breakdown..." value={cause} onChange={(e) => setCause(e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Failure Effect</Label>
              <Input placeholder="Impact on line / process..." value={effect} onChange={(e) => setEffect(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">Breakdown Start</Label>
                <Input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Breakdown End</Label>
                <Input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">Downtime (Hours)</Label>
                <Input type="number" step="0.1" value={downtime} onChange={(e) => setDowntime(Number(e.target.value))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Repair Cost ($)</Label>
                <Input type="number" value={cost} onChange={(e) => setCost(Number(e.target.value))} />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save Breakdown Event</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Popup Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Breakdown Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this failure history record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Record
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
