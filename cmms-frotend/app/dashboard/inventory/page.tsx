"use client";

import { useState } from "react";
import { PageHeader, StatusBadge, EmptyState } from "@/components/shared/ui-components";
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
import { Plus, Search, MoreHorizontal, Package, Eye, Edit, Trash2, AlertTriangle } from "lucide-react";

// Mock data
const inventory = [
  {
    id: "INV-001",
    name: "Hydraulic Filter",
    sku: "HF-2024",
    category: "Filters",
    quantity: 15,
    minQuantity: 20,
    unitCost: "$45.00",
    location: "Warehouse A",
    status: "low_stock",
  },
  {
    id: "INV-002",
    name: "Bearing Assembly",
    sku: "BA-1055",
    category: "Mechanical",
    quantity: 48,
    minQuantity: 25,
    unitCost: "$125.00",
    location: "Warehouse A",
    status: "in_stock",
  },
  {
    id: "INV-003",
    name: "Electrical Relay",
    sku: "ER-3300",
    category: "Electrical",
    quantity: 5,
    minQuantity: 30,
    unitCost: "$35.00",
    location: "Warehouse B",
    status: "critical",
  },
  {
    id: "INV-004",
    name: "Lubricant Oil (5L)",
    sku: "LO-500",
    category: "Lubricants",
    quantity: 120,
    minQuantity: 50,
    unitCost: "$28.00",
    location: "Warehouse A",
    status: "in_stock",
  },
  {
    id: "INV-005",
    name: "Safety Gloves",
    sku: "SG-100",
    category: "Safety",
    quantity: 200,
    minQuantity: 100,
    unitCost: "$12.00",
    location: "Warehouse C",
    status: "in_stock",
  },
];

const getStatusVariant = (status: string) => {
  switch (status) {
    case "in_stock":
      return "success";
    case "low_stock":
      return "warning";
    case "critical":
      return "error";
    case "out_of_stock":
      return "error";
    default:
      return "default";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "in_stock":
      return "In Stock";
    case "low_stock":
      return "Low Stock";
    case "critical":
      return "Critical";
    case "out_of_stock":
      return "Out of Stock";
    default:
      return status;
  }
};

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockItems = inventory.filter(
    (item) => item.status === "low_stock" || item.status === "critical"
  ).length;

  const totalValue = inventory.reduce(
    (acc, item) => acc + item.quantity * parseFloat(item.unitCost.replace("$", "")),
    0
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Track spare parts and supplies"
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{inventory.length}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock Alerts</p>
                <p className="text-2xl font-bold text-warning">{lowStockItems}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardContent className="p-0">
          {filteredInventory.length === 0 ? (
            <EmptyState
              title="No items found"
              description="Try adjusting your search criteria"
              icon={Package}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead className="hidden lg:table-cell">Unit Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Package className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.sku}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {item.category}
                    </TableCell>
                    <TableCell>
                      <span className={item.quantity < item.minQuantity ? "text-destructive font-medium" : ""}>
                        {item.quantity}
                      </span>
                      <span className="text-muted-foreground">/{item.minQuantity}</span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {item.unitCost}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={getStatusLabel(item.status)}
                        variant={getStatusVariant(item.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
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
    </div>
  );
}
