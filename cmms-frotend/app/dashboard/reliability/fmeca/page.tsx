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
import { Plus, Search, Trash2, Edit, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
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
  fetchFmecaAssessments,
  createFmecaAssessment,
  updateFmecaAssessment,
  deleteFmecaAssessment,
  FmecaAssessmentItem,
  CriticalityLevel,
} from "@/lib/api/reliability-api";
import { fetchAssets } from "@/lib/api/assets-api";

export default function FmecaPage() {
  const [items, setItems] = useState<FmecaAssessmentItem[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FmecaAssessmentItem | null>(null);
  const [formAssetId, setFormAssetId] = useState("");
  const [modeText, setModeText] = useState("");
  const [cause, setCause] = useState("");
  const [effect, setEffect] = useState("");
  const [sev, setSev] = useState(5);
  const [occ, setOcc] = useState(5);
  const [det, setDet] = useState(5);
  const [action, setAction] = useState("");

  const calculatedRpn = sev * occ * det;

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchFmecaAssessments({ search, risk: riskFilter });
      setItems(res || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch FMECA assessments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    fetchAssets(1, 1000).then((res: any) => setAssets(res?.data || (Array.isArray(res) ? res : res?.assets || []))).catch(() => {});
  }, [riskFilter]);

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
    setModeText("");
    setCause("");
    setEffect("");
    setSev(5);
    setOcc(5);
    setDet(5);
    setAction("");
    setIsOpen(true);
  };

  const handleOpenEdit = (item: FmecaAssessmentItem) => {
    setEditingItem(item);
    setFormAssetId(item.assetId);
    setModeText(item.failureModeText);
    setCause(item.failureCause);
    setEffect(item.failureEffect);
    setSev(item.severity);
    setOcc(item.occurrence);
    setDet(item.detection);
    setAction(item.recommendedAction || "");
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!formAssetId || !modeText || !cause || !effect) {
      toast.error("Please fill Asset, Failure Mode, Cause, and Effect");
      return;
    }

    try {
      if (editingItem) {
        await updateFmecaAssessment(editingItem.id, {
          failureModeText: modeText,
          failureCause: cause,
          failureEffect: effect,
          severity: Number(sev),
          occurrence: Number(occ),
          detection: Number(det),
          recommendedAction: action,
        });
        toast.success("FMECA assessment updated");
      } else {
        await createFmecaAssessment({
          assetId: formAssetId,
          failureModeText: modeText,
          failureCause: cause,
          failureEffect: effect,
          severity: Number(sev),
          occurrence: Number(occ),
          detection: Number(det),
          recommendedAction: action,
        });
        toast.success("FMECA assessment created");
      }
      setIsOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save FMECA assessment");
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
      await deleteFmecaAssessment(deleteTargetId);
      toast.success("FMECA assessment deleted");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete FMECA assessment");
    } finally {
      setDeleteOpen(false);
      setDeleteTargetId(null);
    }
  };

  const renderRiskBadge = (risk: CriticalityLevel) => {
    switch (risk) {
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
        title="FMECA Risk Assessments"
        description="Failure Mode, Effects, and Criticality Analysis with automated Risk Priority Number (RPN = Severity &times; Occurrence &times; Detection)."
      >
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add FMECA Assessment
        </Button>
      </PageHeader>

      {/* Filter */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search asset, failure mode, or cause..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Risk Ranking" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Risks</SelectItem>
                <SelectItem value="CRITICAL">Critical (RPN &ge; 200)</SelectItem>
                <SelectItem value="HIGH">High (RPN &ge; 120)</SelectItem>
                <SelectItem value="MEDIUM">Medium (RPN &ge; 60)</SelectItem>
                <SelectItem value="LOW">Low (RPN &lt; 60)</SelectItem>
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
                <TableHead>Failure Mode & Cause</TableHead>
                <TableHead>Failure Effect</TableHead>
                <TableHead>Sev (1-10)</TableHead>
                <TableHead>Occ (1-10)</TableHead>
                <TableHead>Det (1-10)</TableHead>
                <TableHead className="font-bold">RPN Score</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead className="text-right pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Loading FMECA assessments...
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No FMECA assessments found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-xs">{item.asset?.assetName || "Asset"}</TableCell>
                    <TableCell className="max-w-xs text-xs">
                      <span className="font-semibold block">{item.failureModeText}</span>
                      <span className="text-muted-foreground truncate block">{item.failureCause}</span>
                    </TableCell>
                    <TableCell className="max-w-xs text-xs text-muted-foreground truncate">{item.failureEffect}</TableCell>
                    <TableCell className="text-xs">{item.severity}</TableCell>
                    <TableCell className="text-xs">{item.occurrence}</TableCell>
                    <TableCell className="text-xs">{item.detection}</TableCell>
                    <TableCell className="font-bold text-xs">{item.rpn} / 1000</TableCell>
                    <TableCell>{renderRiskBadge(item.riskRanking)}</TableCell>
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
                Page {currentPage} of {totalPages} ({items.length} total FMECA assessments)
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
            <DialogTitle>{editingItem ? "Edit FMECA Assessment" : "Add FMECA Risk Assessment"}</DialogTitle>
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
              <Label className="text-xs">Failure Mode</Label>
              <Input placeholder="e.g. Shaft Seal Degradation" value={modeText} onChange={(e) => setModeText(e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Failure Cause</Label>
              <Input placeholder="e.g. Chemical corrosion & high pressure" value={cause} onChange={(e) => setCause(e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Failure Effect</Label>
              <Textarea placeholder="Process disruption & fluid leakage..." value={effect} onChange={(e) => setEffect(e.target.value)} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Severity (1-10)</Label>
                <Input type="number" min={1} max={10} value={sev} onChange={(e) => setSev(Number(e.target.value))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Occurrence (1-10)</Label>
                <Input type="number" min={1} max={10} value={occ} onChange={(e) => setOcc(Number(e.target.value))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Detection (1-10)</Label>
                <Input type="number" min={1} max={10} value={det} onChange={(e) => setDet(Number(e.target.value))} />
              </div>
            </div>

            <div className="bg-muted p-2 rounded text-xs flex justify-between items-center font-semibold">
              <span>Calculated RPN Score:</span>
              <span className="text-primary text-sm font-bold">{calculatedRpn} / 1000</span>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Recommended Action</Label>
              <Textarea placeholder="Mitigation plan & maintenance task..." value={action} onChange={(e) => setAction(e.target.value)} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save FMECA</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Popup Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete FMECA Assessment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this FMECA risk assessment? This action cannot be undone.
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
