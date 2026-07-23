"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/ui-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Trash2, Edit, RefreshCw, ShieldAlert, ChevronLeft, ChevronRight } from "lucide-react";
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
  fetchAssetCriticalities,
  createAssetCriticality,
  updateAssetCriticality,
  deleteAssetCriticality,
  AssetCriticality,
  CriticalityLevel,
} from "@/lib/api/reliability-api";
import { fetchAssets } from "@/lib/api/assets-api";

export default function AssetCriticalityPage() {
  const [items, setItems] = useState<AssetCriticality[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AssetCriticality | null>(null);
  const [formAssetId, setFormAssetId] = useState("");
  const [safety, setSafety] = useState(1);
  const [prod, setProd] = useState(1);
  const [fin, setFin] = useState(1);
  const [env, setEnv] = useState(1);
  const [maint, setMaint] = useState(1);
  const [notes, setNotes] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchAssetCriticalities({ search, level: selectedLevel });
      setItems(res || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch asset criticalities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    fetchAssets(1, 1000).then((res: any) => setAssets(res?.data || (Array.isArray(res) ? res : res?.assets || []))).catch(() => {});
  }, [selectedLevel]);

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
    setSafety(1);
    setProd(1);
    setFin(1);
    setEnv(1);
    setMaint(1);
    setNotes("");
    setIsOpen(true);
  };

  const handleOpenEdit = (item: AssetCriticality) => {
    setEditingItem(item);
    setFormAssetId(item.assetId);
    setSafety(item.safetyImpact);
    setProd(item.productionImpact);
    setFin(item.financialImpact);
    setEnv(item.environmentalImpact);
    setMaint(item.maintenanceImpact);
    setNotes(item.reviewNotes || "");
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!formAssetId) {
      toast.error("Please select an asset");
      return;
    }

    try {
      if (editingItem) {
        await updateAssetCriticality(editingItem.id, {
          safetyImpact: safety,
          productionImpact: prod,
          financialImpact: fin,
          environmentalImpact: env,
          maintenanceImpact: maint,
          reviewNotes: notes,
        });
        toast.success("Criticality assessment updated");
      } else {
        await createAssetCriticality({
          assetId: formAssetId,
          safetyImpact: safety,
          productionImpact: prod,
          financialImpact: fin,
          environmentalImpact: env,
          maintenanceImpact: maint,
          reviewNotes: notes,
        });
        toast.success("Criticality assessment created");
      }
      setIsOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save criticality assessment");
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
      await deleteAssetCriticality(deleteTargetId);
      toast.success("Criticality assessment deleted");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete assessment");
    } finally {
      setDeleteOpen(false);
      setDeleteTargetId(null);
    }
  };

  const renderLevelBadge = (level: CriticalityLevel) => {
    switch (level) {
      case "CRITICAL":
        return <Badge className="bg-red-600 text-white font-semibold">CRITICAL</Badge>;
      case "HIGH":
        return <Badge className="bg-amber-500 text-white font-semibold">HIGH</Badge>;
      case "MEDIUM":
        return <Badge className="bg-blue-500 text-white font-medium">MEDIUM</Badge>;
      default:
        return <Badge variant="secondary">LOW</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Asset Criticality Assessment"
        description="Evaluate asset risk levels across Safety, Production, Financial, Environmental, and Maintenance impacts."
      >
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add Criticality Assessment
        </Button>
      </PageHeader>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search asset name or code..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Criticality Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Levels</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="ghost" size="icon" onClick={loadData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Asset Code & Name</TableHead>
                <TableHead>Safety (1-5)</TableHead>
                <TableHead>Production (1-5)</TableHead>
                <TableHead>Financial (1-5)</TableHead>
                <TableHead>Environmental (1-5)</TableHead>
                <TableHead>Maintenance (1-5)</TableHead>
                <TableHead className="font-bold">Total Score</TableHead>
                <TableHead>Criticality Level</TableHead>
                <TableHead className="text-right pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Loading asset criticalities...
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No criticality assessments found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-xs">
                      {item.asset?.assetName || "Asset"}
                      <span className="block text-muted-foreground">{item.asset?.assetCode}</span>
                    </TableCell>
                    <TableCell className="text-xs">{item.safetyImpact}</TableCell>
                    <TableCell className="text-xs">{item.productionImpact}</TableCell>
                    <TableCell className="text-xs">{item.financialImpact}</TableCell>
                    <TableCell className="text-xs">{item.environmentalImpact}</TableCell>
                    <TableCell className="text-xs">{item.maintenanceImpact}</TableCell>
                    <TableCell className="font-bold text-xs">{item.criticalityScore} / 25</TableCell>
                    <TableCell>{renderLevelBadge(item.criticalityLevel)}</TableCell>
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
                Page {currentPage} of {totalPages} ({items.length} total assessments)
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
            <DialogTitle>{editingItem ? "Edit Criticality Assessment" : "Create Asset Criticality Assessment"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {!editingItem && (
              <div className="space-y-2">
                <Label>Select Asset</Label>
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
                <Label className="text-xs">Safety Impact (1-5)</Label>
                <Input type="number" min={1} max={5} value={safety} onChange={(e) => setSafety(Number(e.target.value))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Production Impact (1-5)</Label>
                <Input type="number" min={1} max={5} value={prod} onChange={(e) => setProd(Number(e.target.value))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Financial Impact (1-5)</Label>
                <Input type="number" min={1} max={5} value={fin} onChange={(e) => setFin(Number(e.target.value))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Environmental Impact (1-5)</Label>
                <Input type="number" min={1} max={5} value={env} onChange={(e) => setEnv(Number(e.target.value))} />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Maintenance Impact (1-5)</Label>
              <Input type="number" min={1} max={5} value={maint} onChange={(e) => setMaint(Number(e.target.value))} />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Review Notes</Label>
              <Textarea placeholder="Notes from criticality assessment review..." value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save Assessment</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Popup Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Criticality Assessment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this criticality assessment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Assessment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
