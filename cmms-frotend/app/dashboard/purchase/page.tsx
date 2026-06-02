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
import { Plus, Search, MoreHorizontal, ShoppingCart, Eye, Edit, Trash2, CheckCircle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data
const purchaseOrders = [
  {
    id: "PO-001",
    poNumber: "PO-2026-001",
    vendor: "Industrial Supplies Co.",
    status: "approved",
    totalAmount: "$4,250.00",
    orderDate: "Jan 10, 2026",
    expectedDelivery: "Jan 20, 2026",
  },
  {
    id: "PO-002",
    poNumber: "PO-2026-002",
    vendor: "Tech Parts Inc.",
    status: "pending_approval",
    totalAmount: "$1,875.00",
    orderDate: "Jan 12, 2026",
    expectedDelivery: "Jan 25, 2026",
  },
  {
    id: "PO-003",
    poNumber: "PO-2026-003",
    vendor: "Safety Equipment Ltd.",
    status: "ordered",
    totalAmount: "$650.00",
    orderDate: "Jan 8, 2026",
    expectedDelivery: "Jan 18, 2026",
  },
  {
    id: "PO-004",
    poNumber: "PO-2026-004",
    vendor: "Lubricants Direct",
    status: "received",
    totalAmount: "$2,100.00",
    orderDate: "Jan 5, 2026",
    expectedDelivery: "Jan 15, 2026",
  },
  {
    id: "PO-005",
    poNumber: "PO-2026-005",
    vendor: "Electrical Solutions",
    status: "draft",
    totalAmount: "$3,450.00",
    orderDate: "Jan 14, 2026",
    expectedDelivery: "-",
  },
];

const getStatusVariant = (status: string) => {
  switch (status) {
    case "received":
      return "success";
    case "approved":
      return "info";
    case "ordered":
      return "info";
    case "pending_approval":
      return "warning";
    case "draft":
      return "default";
    case "cancelled":
      return "error";
    default:
      return "default";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "pending_approval":
      return "Pending Approval";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

export default function PurchasePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredOrders = purchaseOrders.filter((po) => {
    const matchesSearch =
      po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.vendor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "pending" && po.status === "pending_approval") ||
      (activeTab === "approved" && (po.status === "approved" || po.status === "ordered")) ||
      (activeTab === "received" && po.status === "received");
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Orders"
        description="Manage procurement and purchase requests"
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Purchase Order
        </Button>
      </PageHeader>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">In Progress</TabsTrigger>
          <TabsTrigger value="received">Received</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search purchase orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Purchase Orders Table */}
      <Card>
        <CardContent className="p-0">
          {filteredOrders.length === 0 ? (
            <EmptyState
              title="No purchase orders found"
              description="Try adjusting your search criteria"
              icon={ShoppingCart}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO Number</TableHead>
                  <TableHead className="hidden md:table-cell">Vendor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Expected</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((po) => (
                  <TableRow key={po.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{po.poNumber}</p>
                        <p className="text-xs text-muted-foreground">{po.orderDate}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {po.vendor}
                    </TableCell>
                    <TableCell className="font-medium">{po.totalAmount}</TableCell>
                    <TableCell>
                      <StatusBadge
                        status={getStatusLabel(po.status)}
                        variant={getStatusVariant(po.status)}
                      />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {po.expectedDelivery}
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
                          {po.status === "pending_approval" && (
                            <DropdownMenuItem>
                              <CheckCircle className="mr-2 h-4 w-4" /> Approve
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Cancel
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
