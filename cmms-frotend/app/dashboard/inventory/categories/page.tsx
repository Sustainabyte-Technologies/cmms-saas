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
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  SparePartCategory,
} from "@/lib/api/inventory-api";
import { useToast } from "@/hooks/use-toast";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<SparePartCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<SparePartCategory | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to load categories.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenCreate = () => {
    setSelectedCategory(null);
    setFormData({ name: "", description: "" });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (c: SparePartCategory) => {
    setSelectedCategory(c);
    setFormData({
      name: c.name,
      description: c.description || "",
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (selectedCategory) {
        await updateCategory(selectedCategory.id, formData);
        toast({
          title: "Category Updated",
          description: `Category ${formData.name} was successfully updated.`,
        });
      } else {
        await createCategory(formData);
        toast({
          title: "Category Created",
          description: `Category ${formData.name} was successfully created.`,
        });
      }
      setIsFormOpen(false);
      loadCategories();
    } catch (err: any) {
      toast({
        title: "Operation Failed",
        description: err.message || "Failed to save category.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (cat: SparePartCategory) => {
    if (confirm(`Are you sure you want to delete ${cat.name}?`)) {
      setActionLoading(true);
      try {
        await deleteCategory(cat.id);
        toast({
          title: "Category Deleted",
          description: `Category ${cat.name} was successfully deleted.`,
        });
        loadCategories();
      } catch (err: any) {
        toast({
          title: "Delete Failed",
          description: err.message || "Could not delete category.",
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
        title="Part Categories"
        description="Organize spare parts by categorizing items into Mechanical, Electrical, etc."
      >
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
              Loading categories...
            </div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No categories registered.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="text-sm font-semibold text-foreground pl-6">Category Name</TableHead>
                  <TableHead className="text-sm font-semibold text-foreground">Description</TableHead>
                  <TableHead className="w-[100px] text-sm font-semibold text-foreground text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((c) => (
                  <TableRow key={c.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium text-sm py-4 pl-6">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm py-4">{c.description || "—"}</TableCell>
                    <TableCell className="py-4 pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="icon" variant="ghost" className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600" onClick={() => handleOpenEdit(c)} disabled={actionLoading}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600" onClick={() => handleDelete(c)} disabled={actionLoading}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
              <DialogTitle>{selectedCategory ? "Edit Category" : "Add Category"}</DialogTitle>
              <DialogDescription>Create a new classification category for your stock inventory.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-1">
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
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
                Save Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
