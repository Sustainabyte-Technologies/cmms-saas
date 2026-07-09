"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/ui-components";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, MoreHorizontal, Package, Edit, Trash2, ArrowUpRight, Settings, Loader2 } from "lucide-react";
import {
  fetchSpareParts,
  fetchCategories,
  fetchWarehouses,
  createSparePart,
  updateSparePart,
  deleteSparePart,
  receiveStock,
  adjustStock,
  SparePart,
  SparePartCategory,
  Warehouse,
} from "@/lib/api/inventory-api";
import { useToast } from "@/hooks/use-toast";

export default function SparePartsPage() {
  const [parts, setParts] = useState<SparePart[]>([]);
  const [categories, setCategories] = useState<SparePartCategory[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Modal Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<SparePart | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form Field states
  const [formData, setFormData] = useState({
    partCode: "",
    partName: "",
    description: "",
    unit: "PCS",
    categoryId: "",
    warehouseId: "",
    minimumStock: 0,
    maximumStock: 0,
    unitCost: 0,
    manufacturer: "",
    currentStock: 0,
  });

  const [receiveData, setReceiveData] = useState({
    quantity: 1,
    notes: "",
    referenceNumber: "",
    warehouseId: "",
  });

  const [adjustData, setAdjustData] = useState({
    quantity: 0,
    notes: "",
    warehouseId: "",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const partsData = await fetchSpareParts(
        search,
        categoryFilter === "all" ? undefined : categoryFilter,
        warehouseFilter === "all" ? undefined : warehouseFilter
      );
      setParts(partsData);

      const cats = await fetchCategories();
      setCategories(cats);

      const whs = await fetchWarehouses();
      setWarehouses(whs);
    } catch (err: any) {
      toast({
        title: "Error Loading Data",
        description: err.message || "Failed to load parts or setup resources.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, categoryFilter, warehouseFilter]);

  const handleOpenCreate = () => {
    setSelectedPart(null);
    setFormData({
      partCode: "",
      partName: "",
      description: "",
      unit: "PCS",
      categoryId: "",
      warehouseId: "",
      minimumStock: 0,
      maximumStock: 0,
      unitCost: 0,
      manufacturer: "",
      currentStock: 0,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (part: SparePart) => {
    setSelectedPart(part);
    setFormData({
      partCode: part.partCode,
      partName: part.partName,
      description: part.description || "",
      unit: part.unit,
      categoryId: part.categoryId || "",
      warehouseId: part.warehouseId || "",
      minimumStock: part.minimumStock,
      maximumStock: part.maximumStock,
      unitCost: part.unitCost,
      manufacturer: part.manufacturer || "",
      currentStock: part.currentStock,
    });
    setIsFormOpen(true);
  };

  const handleOpenReceive = (part: SparePart) => {
    setSelectedPart(part);
    setReceiveData({
      quantity: 1,
      notes: "",
      referenceNumber: "",
      warehouseId: part.warehouseId || "",
    });
    setIsReceiveOpen(true);
  };

  const handleOpenAdjust = (part: SparePart) => {
    setSelectedPart(part);
    setAdjustData({
      quantity: part.currentStock,
      notes: "",
      warehouseId: part.warehouseId || "",
    });
    setIsAdjustOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (selectedPart) {
        await updateSparePart(selectedPart.id, formData);
        toast({
          title: "Part Updated",
          description: `Spare part ${formData.partName} has been successfully updated.`,
        });
      } else {
        await createSparePart(formData);
        toast({
          title: "Part Created",
          description: `Spare part ${formData.partName} has been added to the catalog.`,
        });
      }
      setIsFormOpen(false);
      loadData();
    } catch (err: any) {
      toast({
        title: "Operation Failed",
        description: err.message || "Failed to save the spare part.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReceiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPart) return;
    setActionLoading(true);
    try {
      await receiveStock({
        sparePartId: selectedPart.id,
        warehouseId: receiveData.warehouseId,
        quantity: Number(receiveData.quantity),
        notes: receiveData.notes,
        referenceNumber: receiveData.referenceNumber,
      });
      setIsReceiveOpen(false);
      loadData();
      toast({
        title: "Stock Received",
        description: `Successfully received ${receiveData.quantity} units for ${selectedPart.partName}.`,
      });
    } catch (err: any) {
      toast({
        title: "Receipt Failed",
        description: err.message || "Failed to receive stock.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPart) return;
    setActionLoading(true);
    try {
      await adjustStock({
        sparePartId: selectedPart.id,
        warehouseId: adjustData.warehouseId,
        quantity: Number(adjustData.quantity),
        notes: adjustData.notes,
      });
      setIsAdjustOpen(false);
      loadData();
      toast({
        title: "Stock Adjusted",
        description: `Successfully adjusted stock for ${selectedPart.partName} to ${adjustData.quantity}.`,
      });
    } catch (err: any) {
      toast({
        title: "Adjustment Failed",
        description: err.message || "Failed to adjust stock level.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (part: SparePart) => {
    if (confirm(`Are you sure you want to delete ${part.partName}?`)) {
      setActionLoading(true);
      try {
        await deleteSparePart(part.id);
        toast({
          title: "Part Deleted",
          description: `${part.partName} has been successfully deleted.`,
        });
        loadData();
      } catch (err: any) {
        toast({
          title: "Delete Failed",
          description: err.message || "Could not delete spare part.",
          variant: "destructive",
        });
      } finally {
        setActionLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Spare Parts Catalog"
        description="View and manage the replacement parts catalog, prices, and properties."
      >
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Spare Part
        </Button>
      </PageHeader>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search parts catalog..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Warehouse" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Warehouses</SelectItem>
              {warehouses.map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Spare Parts Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
              Loading parts list...
            </div>
          ) : parts.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No spare parts found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Part Info</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Unit Cost</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parts.map((part) => (
                  <TableRow key={part.id}>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{part.partName}</p>
                        <p className="text-xs text-muted-foreground font-mono">{part.partCode}</p>
                      </div>
                    </TableCell>
                    <TableCell>{part.category?.name || "Uncategorized"}</TableCell>
                    <TableCell>{part.warehouse?.name || "None"}</TableCell>
                    <TableCell>
                      <span className={part.currentStock < part.minimumStock ? "text-destructive font-bold" : ""}>
                        {part.currentStock} {part.unit}
                      </span>
                    </TableCell>
                    <TableCell>${part.unitCost.toFixed(2)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild disabled={actionLoading}>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenReceive(part)}>
                            <ArrowUpRight className="mr-2 h-4 w-4" /> Receive Stock
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenAdjust(part)}>
                            <Settings className="mr-2 h-4 w-4" /> Adjust Stock
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenEdit(part)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(part)}>
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

      {/* CRUD Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <form onSubmit={handleFormSubmit}>
            <DialogHeader>
              <DialogTitle>{selectedPart ? "Edit Spare Part" : "Add Spare Part"}</DialogTitle>
              <DialogDescription>Define part identifiers, parameters, and minimum alert thresholds.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="partCode">Part Code *</Label>
                  <Input
                    id="partCode"
                    value={formData.partCode}
                    onChange={(e) => setFormData({ ...formData, partCode: e.target.value })}
                    required
                    disabled={actionLoading}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="partName">Part Name *</Label>
                  <Input
                    id="partName"
                    value={formData.partName}
                    onChange={(e) => setFormData({ ...formData, partName: e.target.value })}
                    required
                    disabled={actionLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Category</Label>
                  <Select
                    value={formData.categoryId || "none"}
                    onValueChange={(val) => setFormData({ ...formData, categoryId: val === "none" ? "" : val })}
                    disabled={actionLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Default Warehouse</Label>
                  <Select
                    value={formData.warehouseId || "none"}
                    onValueChange={(val) => setFormData({ ...formData, warehouseId: val === "none" ? "" : val })}
                    disabled={actionLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {warehouses.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="currentStock">Initial Stock *</Label>
                  <Input
                    id="currentStock"
                    type="number"
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })}
                    disabled={actionLoading}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    disabled={actionLoading}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="unitCost">Unit Cost ($)</Label>
                  <Input
                    id="unitCost"
                    type="number"
                    step="0.01"
                    value={formData.unitCost}
                    onChange={(e) => setFormData({ ...formData, unitCost: Number(e.target.value) })}
                    disabled={actionLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input
                    id="manufacturer"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    disabled={actionLoading}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="minimumStock">Min Stock Alert</Label>
                  <Input
                    id="minimumStock"
                    type="number"
                    value={formData.minimumStock}
                    onChange={(e) => setFormData({ ...formData, minimumStock: Number(e.target.value) })}
                    disabled={actionLoading}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="maximumStock">Max Stock Level</Label>
                  <Input
                    id="maximumStock"
                    type="number"
                    value={formData.maximumStock}
                    onChange={(e) => setFormData({ ...formData, maximumStock: Number(e.target.value) })}
                    disabled={actionLoading}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={actionLoading}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={actionLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={actionLoading}>
                {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Receive Stock Dialog */}
      <Dialog open={isReceiveOpen} onOpenChange={setIsReceiveOpen}>
        <DialogContent>
          <form onSubmit={handleReceiveSubmit}>
            <DialogHeader>
              <DialogTitle>Receive Stock</DialogTitle>
              <DialogDescription>
                Record incoming restock values for <strong>{selectedPart?.partName}</strong>.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-1">
                <Label htmlFor="recQty">Receive Quantity *</Label>
                <Input
                  id="recQty"
                  type="number"
                  min="1"
                  value={receiveData.quantity}
                  onChange={(e) => setReceiveData({ ...receiveData, quantity: Number(e.target.value) })}
                  required
                  disabled={actionLoading}
                />
              </div>
              <div className="space-y-1">
                <Label>Warehouse *</Label>
                <Select
                  value={receiveData.warehouseId}
                  onValueChange={(val) => setReceiveData({ ...receiveData, warehouseId: val })}
                  disabled={actionLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="refNum">Reference Number (PO/Receipt)</Label>
                <Input
                  id="refNum"
                  value={receiveData.referenceNumber}
                  onChange={(e) => setReceiveData({ ...receiveData, referenceNumber: e.target.value })}
                  disabled={actionLoading}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="recNotes">Notes</Label>
                <Input
                  id="recNotes"
                  value={receiveData.notes}
                  onChange={(e) => setReceiveData({ ...receiveData, notes: e.target.value })}
                  disabled={actionLoading}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsReceiveOpen(false)} disabled={actionLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={actionLoading}>
                {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Record Receipt
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Adjust Stock Dialog */}
      <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
        <DialogContent>
          <form onSubmit={handleAdjustSubmit}>
            <DialogHeader>
              <DialogTitle>Adjust Stock</DialogTitle>
              <DialogDescription>
                Manually override the current stock quantity for <strong>{selectedPart?.partName}</strong>.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-1">
                <Label htmlFor="adjQty">New Actual Stock *</Label>
                <Input
                  id="adjQty"
                  type="number"
                  min="0"
                  value={adjustData.quantity}
                  onChange={(e) => setAdjustData({ ...adjustData, quantity: Number(e.target.value) })}
                  required
                  disabled={actionLoading}
                />
              </div>
              <div className="space-y-1">
                <Label>Warehouse *</Label>
                <Select
                  value={adjustData.warehouseId}
                  onValueChange={(val) => setAdjustData({ ...adjustData, warehouseId: val })}
                  disabled={actionLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="adjNotes">Reason for Adjustment *</Label>
                <Input
                  id="adjNotes"
                  value={adjustData.notes}
                  onChange={(e) => setAdjustData({ ...adjustData, notes: e.target.value })}
                  placeholder="e.g. Audit correction, damage write-off"
                  required
                  disabled={actionLoading}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAdjustOpen(false)} disabled={actionLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={actionLoading}>
                {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Apply Adjustment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
