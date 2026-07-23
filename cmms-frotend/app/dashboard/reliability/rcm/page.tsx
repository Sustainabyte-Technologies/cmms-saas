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
import { Plus, Search, Trash2, Edit, RefreshCw, Settings, ChevronLeft, ChevronRight } from "lucide-react";
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
  fetchRcmAnalyses,
  createRcmAnalysis,
  updateRcmAnalysis,
  deleteRcmAnalysis,
  RcmAnalysisItem,
  RcmStrategy,
} from "@/lib/api/reliability-api";
import { fetchAssets } from "@/lib/api/assets-api";

export default function RcmPage() {
  const [items, setItems] = useState<RcmAnalysisItem[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [strategyFilter, setStrategyFilter] = useState("ALL");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RcmAnalysisItem | null>(null);
  const [formAssetId, setFormAssetId] = useState("");
  const [assetFunction, setAssetFunction] = useState("");
  const [functionalFailure, setFunctionalFailure] = useState("");
  const [modeText, setModeText] = useState("");
  const [strategy, setStrategy] = useState<RcmStrategy>("PREVENTIVE_MAINTENANCE");
  const [tasks, setTasks] = useState("");
  const [interval, setInterval] = useState(30);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchRcmAnalyses({ search, strategy: strategyFilter });
      setItems(res || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch RCM strategies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    fetchAssets(1, 1000).then((res: any) => setAssets(res?.data || (Array.isArray(res) ? res : res?.assets || []))).catch(() => {});
  }, [strategyFilter]);

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
    setAssetFunction("");
    setFunctionalFailure("");
    setModeText("");
    setStrategy("PREVENTIVE_MAINTENANCE");
    setTasks("");
    setInterval(30);
    setIsOpen(true);
  };

  const handleOpenEdit = (item: RcmAnalysisItem) => {
    setEditingItem(item);
    setFormAssetId(item.assetId);
    setAssetFunction(item.assetFunction);
    setFunctionalFailure(item.functionalFailure);
    setModeText(item.failureModeText);
    setStrategy(item.maintenanceStrategy);
    setTasks(item.tasksDescription || "");
    setInterval(item.intervalDays || 30);
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!formAssetId || !assetFunction || !functionalFailure || !modeText) {
      toast.error("Please fill Asset, Asset Function, Functional Failure, and Failure Mode");
      return;
    }

    try {
      if (editingItem) {
        await updateRcmAnalysis(editingItem.id, {
          assetFunction,
          functionalFailure,
          failureModeText: modeText,
          maintenanceStrategy: strategy,
          tasksDescription: tasks,
          intervalDays: Number(interval),
        });
        toast.success("RCM strategy updated");
      } else {
        await createRcmAnalysis({
          assetId: formAssetId,
          assetFunction,
          functionalFailure,
          failureModeText: modeText,
          maintenanceStrategy: strategy,
          tasksDescription: tasks,
          intervalDays: Number(interval),
        });
        toast.success("RCM strategy created");
      }
      setIsOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save RCM strategy");
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
      await deleteRcmAnalysis(deleteTargetId);
      toast.success("RCM strategy mapping deleted");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete RCM strategy");
    } finally {
      setDeleteOpen(false);
      setDeleteTargetId(null);
    }
  };

  const renderStrategyBadge = (strat: RcmStrategy) => {
    switch (strat) {
      case "PREVENTIVE_MAINTENANCE":
        return <Badge className="bg-blue-600 text-white">Preventive (PM)</Badge>;
      case "PREDICTIVE_MAINTENANCE":
        return <Badge className="bg-purple-600 text-white">Predictive (PdM)</Badge>;
      case "CONDITION_MONITORING":
        return <Badge className="bg-emerald-600 text-white">Condition Monitored</Badge>;
      case "INSPECTION":
        return <Badge className="bg-amber-600 text-white">Inspection Only</Badge>;
      case "RUN_TO_FAILURE":
        return <Badge variant="secondary">Run To Failure</Badge>;
      default:
        return <Badge variant="outline">{strat}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reliability Centered Maintenance (RCM)"
        description="Define optimal maintenance strategies (PM, PdM, Condition Monitoring, Run-to-Failure) based on functional failures."
      >
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add RCM Strategy Mapping
        </Button>
      </PageHeader>

      {/* Filter */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search asset, function, or strategy..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select value={strategyFilter} onValueChange={setStrategyFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Maintenance Strategy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Strategies</SelectItem>
                <SelectItem value="PREVENTIVE_MAINTENANCE">Preventive Maintenance</SelectItem>
                <SelectItem value="PREDICTIVE_MAINTENANCE">Predictive Maintenance</SelectItem>
                <SelectItem value="CONDITION_MONITORING">Condition Monitoring</SelectItem>
                <SelectItem value="INSPECTION">Inspection</SelectItem>
                <SelectItem value="RUN_TO_FAILURE">Run To Failure</SelectItem>
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
                <TableHead>Asset</TableHead>
                <TableHead>Asset Function</TableHead>
                <TableHead>Functional Failure</TableHead>
                <TableHead>Failure Mode</TableHead>
                <TableHead>Maintenance Strategy</TableHead>
                <TableHead>Task Interval</TableHead>
                <TableHead className="text-right pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Loading RCM strategies...
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No RCM strategies found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-xs">{item.asset?.assetName || "Asset"}</TableCell>
                    <TableCell className="max-w-xs text-xs text-muted-foreground truncate">{item.assetFunction}</TableCell>
                    <TableCell className="max-w-xs text-xs font-semibold">{item.functionalFailure}</TableCell>
                    <TableCell className="text-xs font-medium text-primary">{item.failureModeText}</TableCell>
                    <TableCell>{renderStrategyBadge(item.maintenanceStrategy)}</TableCell>
                    <TableCell className="text-xs font-semibold">{item.intervalDays || 30} days</TableCell>
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
                Page {currentPage} of {totalPages} ({items.length} total strategies)
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
            <DialogTitle>{editingItem ? "Edit RCM Strategy Mapping" : "Add RCM Strategy Mapping"}</DialogTitle>
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

            <div className="space-y-1">
              <Label className="text-xs">Asset Function</Label>
              <Input placeholder="Primary operational function of asset..." value={assetFunction} onChange={(e) => setAssetFunction(e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Functional Failure</Label>
              <Input placeholder="Inability to fulfill required function..." value={functionalFailure} onChange={(e) => setFunctionalFailure(e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Failure Mode</Label>
              <Input placeholder="Specific cause / failure mode..." value={modeText} onChange={(e) => setModeText(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">Maintenance Strategy</Label>
                <Select value={strategy} onValueChange={(v: RcmStrategy) => setStrategy(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PREVENTIVE_MAINTENANCE">Preventive Maintenance</SelectItem>
                    <SelectItem value="PREDICTIVE_MAINTENANCE">Predictive Maintenance</SelectItem>
                    <SelectItem value="CONDITION_MONITORING">Condition Monitoring</SelectItem>
                    <SelectItem value="INSPECTION">Inspection</SelectItem>
                    <SelectItem value="RUN_TO_FAILURE">Run To Failure</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Task Interval (Days)</Label>
                <Input type="number" value={interval} onChange={(e) => setInterval(Number(e.target.value))} />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Tasks Description</Label>
              <Textarea placeholder="Specific maintenance task procedures..." value={tasks} onChange={(e) => setTasks(e.target.value)} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save Strategy</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Popup Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete RCM Strategy Mapping</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this RCM strategy mapping? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Strategy
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
