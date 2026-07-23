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
  fetchFailureLibrary,
  createFailureLibraryItem,
  updateFailureLibraryItem,
  deleteFailureLibraryItem,
  FailureLibraryItem,
  FailureSeverity,
} from "@/lib/api/reliability-api";

export default function FailureLibraryPage() {
  const [items, setItems] = useState<FailureLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FailureLibraryItem | null>(null);
  const [code, setCode] = useState("");
  const [mode, setMode] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("Electrical");
  const [assetCategory, setAssetCategory] = useState("Motors & Drives");
  const [severity, setSeverity] = useState<FailureSeverity>("MEDIUM");
  const [recommendedAction, setRecommendedAction] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchFailureLibrary({ search, category: selectedCategory });
      setItems(res || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch failure library");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  useEffect(() => {
    setCurrentPage(1);
    const timer = setTimeout(loadData, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(items.length / rowsPerPage));
  const paginatedItems = items.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setCode(`FAIL-${Math.floor(100 + Math.random() * 900)}`);
    setMode("");
    setDesc("");
    setCategory("Electrical");
    setAssetCategory("Motors & Drives");
    setSeverity("MEDIUM");
    setRecommendedAction("");
    setIsOpen(true);
  };

  const handleOpenEdit = (item: FailureLibraryItem) => {
    setEditingItem(item);
    setCode(item.failureCode);
    setMode(item.failureMode);
    setDesc(item.description || "");
    setCategory(item.failureCategory);
    setAssetCategory(item.assetCategory);
    setSeverity(item.severity);
    setRecommendedAction(item.recommendedAction || "");
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!code || !mode) {
      toast.error("Please fill failure code and mode");
      return;
    }

    try {
      if (editingItem) {
        await updateFailureLibraryItem(editingItem.id, {
          failureCode: code,
          failureMode: mode,
          description: desc,
          failureCategory: category,
          assetCategory,
          severity,
          recommendedAction,
        });
        toast.success("Failure library entry updated");
      } else {
        await createFailureLibraryItem({
          failureCode: code,
          failureMode: mode,
          description: desc,
          failureCategory: category,
          assetCategory,
          severity,
          recommendedAction,
        });
        toast.success("Failure library entry created");
      }
      setIsOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save entry");
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
      await deleteFailureLibraryItem(deleteTargetId);
      toast.success("Failure library entry deleted");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete entry");
    } finally {
      setDeleteOpen(false);
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Failure Library"
        description="Standardized repository of failure codes, failure modes, severity levels, and recommended preventive actions."
      >
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add Failure Mode
        </Button>
      </PageHeader>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search code, mode, or description..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                <SelectItem value="Electrical">Electrical</SelectItem>
                <SelectItem value="Mechanical">Mechanical</SelectItem>
                <SelectItem value="HVAC">HVAC</SelectItem>
                <SelectItem value="Hydraulic">Hydraulic</SelectItem>
                <SelectItem value="Pneumatic">Pneumatic</SelectItem>
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
                <TableHead>Failure Code</TableHead>
                <TableHead>Failure Mode & Description</TableHead>
                <TableHead>Failure Category</TableHead>
                <TableHead>Asset Category</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Recommended Action</TableHead>
                <TableHead className="text-right pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Loading failure library...
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No failure library entries found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs font-semibold text-primary">{item.failureCode}</TableCell>
                    <TableCell className="max-w-xs text-xs">
                      <span className="font-semibold block">{item.failureMode}</span>
                      <span className="text-muted-foreground truncate block">{item.description}</span>
                    </TableCell>
                    <TableCell className="text-xs">{item.failureCategory}</TableCell>
                    <TableCell className="text-xs">{item.assetCategory}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          item.severity === "CRITICAL"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : item.severity === "HIGH"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }
                      >
                        {item.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs text-xs text-muted-foreground truncate">
                      {item.recommendedAction || "—"}
                    </TableCell>
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
                Page {currentPage} of {totalPages} ({items.length} total entries)
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
            <DialogTitle>{editingItem ? "Edit Failure Mode" : "Add Failure Mode"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">Failure Code</Label>
                <Input value={code} onChange={(e) => setCode(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Severity</Label>
                <Select value={severity} onValueChange={(v: FailureSeverity) => setSeverity(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Failure Mode Name</Label>
              <Input placeholder="e.g., Motor Winding Overheating" value={mode} onChange={(e) => setMode(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">Failure Category</Label>
                <Input value={category} onChange={(e) => setCategory(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Asset Category</Label>
                <Input value={assetCategory} onChange={(e) => setAssetCategory(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Description</Label>
              <Textarea placeholder="Failure mode description..." value={desc} onChange={(e) => setDesc(e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Recommended Action</Label>
              <Textarea placeholder="Recommended maintenance/mitigation steps..." value={recommendedAction} onChange={(e) => setRecommendedAction(e.target.value)} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save Entry</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Popup Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Failure Library Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this failure mode entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Entry
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
