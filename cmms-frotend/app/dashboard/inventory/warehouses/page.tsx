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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import {
  fetchWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  Warehouse,
} from "@/lib/api/inventory-api";
import { useToast } from "@/hooks/use-toast";

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
    description: "",
  });

  const loadWarehouses = async () => {
    setLoading(true);
    try {
      const data = await fetchWarehouses();
      setWarehouses(data);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to load warehouses.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  const handleOpenCreate = () => {
    setSelectedWarehouse(null);
    setFormData({ name: "", code: "", address: "", description: "" });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (w: Warehouse) => {
    setSelectedWarehouse(w);
    setFormData({
      name: w.name,
      code: w.code,
      address: w.address || "",
      description: w.description || "",
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (selectedWarehouse) {
        await updateWarehouse(selectedWarehouse.id, formData);
        toast({
          title: "Warehouse Updated",
          description: `Warehouse ${formData.name} was successfully updated.`,
        });
      } else {
        await createWarehouse(formData);
        toast({
          title: "Warehouse Created",
          description: `Warehouse ${formData.name} was successfully created.`,
        });
      }
      setIsFormOpen(false);
      loadWarehouses();
    } catch (err: any) {
      toast({
        title: "Operation Failed",
        description: err.message || "Failed to save warehouse.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (w: Warehouse) => {
    if (confirm(`Are you sure you want to delete ${w.name}?`)) {
      setActionLoading(true);
      try {
        await deleteWarehouse(w.id);
        toast({
          title: "Warehouse Deleted",
          description: `Warehouse ${w.name} was successfully deleted.`,
        });
        loadWarehouses();
      } catch (err: any) {
        toast({
          title: "Delete Failed",
          description: err.message || "Could not delete warehouse.",
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
        title="Warehouses & Storerooms"
        description="Configure physical storage repositories or site stores."
      >
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Warehouse
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
              Loading warehouses...
            </div>
          ) : warehouses.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No warehouses registered.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Warehouse Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warehouses.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell className="font-mono font-semibold">{w.code}</TableCell>
                    <TableCell className="font-semibold">{w.name}</TableCell>
                    <TableCell className="text-muted-foreground">{w.address || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{w.description || "—"}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleOpenEdit(w)} disabled={actionLoading}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(w)} disabled={actionLoading}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{selectedWarehouse ? "Edit Warehouse" : "Add Warehouse"}</DialogTitle>
              <DialogDescription>Define code, location name, and details for a storage site.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="code">Warehouse Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                    disabled={actionLoading}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="name">Warehouse Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={actionLoading}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={actionLoading}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="desc">Description</Label>
                <Input
                  id="desc"
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
                Save Warehouse
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
