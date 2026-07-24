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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Plus,
  Search,
  ShoppingCart,
  Eye,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Package,
  FileCheck,
  Truck,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Building2,
} from "lucide-react";
import {
  fetchPurchaseDashboard,
  fetchPurchaseRequests,
  createPurchaseRequest,
  updatePRStatus,
  fetchPurchaseOrders,
  createPurchaseOrder,
  updatePOStatus,
  fetchGoodsReceipts,
  createGoodsReceipt,
  fetchVendorInvoices,
  createVendorInvoice,
  updateInvoicePayment,
  PurchaseDashboardStats,
  PurchaseRequest,
  PurchaseOrder,
  GoodsReceipt,
  VendorInvoice,
} from "@/lib/api/purchase-api";
import { fetchVendors, Vendor } from "@/lib/api/vendors-api";
import { fetchSpareParts, SparePart } from "@/lib/api/inventory-api";

export default function PurchasePage() {
  const [activeTab, setActiveTab] = useState("orders");
  const [stats, setStats] = useState<PurchaseDashboardStats | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [loading, setLoading] = useState(true);

  // Data lists
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
  const [goodsReceipts, setGoodsReceipts] = useState<GoodsReceipt[]>([]);
  const [invoices, setInvoices] = useState<VendorInvoice[]>([]);

  // Search & Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialog States
  const [createPrOpen, setCreatePrOpen] = useState(false);
  const [createPoOpen, setCreatePoOpen] = useState(false);
  const [createGrnOpen, setCreateGrnOpen] = useState(false);
  const [createInvoiceOpen, setCreateInvoiceOpen] = useState(false);

  // Form Fields - Purchase Request
  const [prReason, setPrReason] = useState("");
  const [prPriority, setPrPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [prPartId, setPrPartId] = useState("");
  const [prPartDesc, setPrPartDesc] = useState("");
  const [prQty, setPrQty] = useState(10);
  const [prUnitPrice, setPrUnitPrice] = useState(25);

  // Form Fields - Purchase Order
  const [poVendorId, setPoVendorId] = useState("");
  const [poPartId, setPoPartId] = useState("");
  const [poDesc, setPoDesc] = useState("");
  const [poQty, setPoQty] = useState(10);
  const [poPrice, setPoPrice] = useState(50);
  const [poShipping, setPoShipping] = useState(15);
  const [poNotes, setPoNotes] = useState("");

  // Form Fields - Goods Receipt
  const [grnPoId, setGrnPoId] = useState("");
  const [grnVendorId, setGrnVendorId] = useState("");
  const [grnPartId, setGrnPartId] = useState("");
  const [grnReceivedQty, setGrnReceivedQty] = useState(10);
  const [grnRejectedQty, setGrnRejectedQty] = useState(0);
  const [grnRemarks, setGrnRemarks] = useState("");

  // Form Fields - Invoice
  const [invNumber, setInvNumber] = useState("");
  const [invVendorId, setInvVendorId] = useState("");
  const [invAmount, setInvAmount] = useState(500);
  const [invRemarks, setInvRemarks] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [sData, vData, spData, poData, prData, grnData, invData] = await Promise.all([
        fetchPurchaseDashboard(),
        fetchVendors(),
        fetchSpareParts(),
        fetchPurchaseOrders({ search }),
        fetchPurchaseRequests({ search }),
        fetchGoodsReceipts(),
        fetchVendorInvoices(),
      ]);
      setStats(sData);
      setVendors(vData || []);
      setSpareParts(spData || []);
      setPurchaseOrders(poData || []);
      setPurchaseRequests(prData || []);
      setGoodsReceipts(grnData || []);
      setInvoices(invData || []);

      if (vData?.length > 0) {
        setPoVendorId(vData[0].id);
        setGrnVendorId(vData[0].id);
        setInvVendorId(vData[0].id);
      }
      if (spData?.length > 0) {
        setPrPartId(spData[0].id);
        setPrPartDesc(spData[0].partName);
        setPoPartId(spData[0].id);
        setPoDesc(spData[0].partName);
        setGrnPartId(spData[0].id);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load purchase data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    const timer = setTimeout(loadData, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Handle Create PR
  const handleCreatePR = async () => {
    if (!prPartDesc) {
      toast.error("Item description is required");
      return;
    }
    try {
      await createPurchaseRequest({
        reason: prReason,
        priority: prPriority,
        items: [
          {
            sparePartId: prPartId || undefined,
            partDescription: prPartDesc,
            quantity: Number(prQty),
            unit: "Pcs",
            estimatedUnitPrice: Number(prUnitPrice),
          },
        ],
      });
      toast.success("Purchase Request created and submitted for approval");
      setCreatePrOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create PR");
    }
  };

  // Handle Approve PR
  const handleApprovePR = async (prId: string) => {
    try {
      await updatePRStatus(prId, "APPROVED", undefined, "APPROVED");
      toast.success("Purchase Request approved successfully!");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to approve PR");
    }
  };

  // Handle Create PO
  const handleCreatePO = async () => {
    if (!poVendorId || !poDesc) {
      toast.error("Vendor and description are required");
      return;
    }
    try {
      await createPurchaseOrder({
        vendorId: poVendorId,
        shipping: Number(poShipping),
        notes: poNotes,
        items: [
          {
            sparePartId: poPartId || undefined,
            description: poDesc,
            quantity: Number(poQty),
            unitPrice: Number(poPrice),
            unit: "Pcs",
          },
        ],
      });
      toast.success("Purchase Order issued successfully!");
      setCreatePoOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create PO");
    }
  };

  // Handle Log GRN (Receive Goods)
  const handleCreateGRN = async () => {
    if (!grnPoId || !grnVendorId) {
      toast.error("Please select a Purchase Order");
      return;
    }
    try {
      await createGoodsReceipt({
        purchaseOrderId: grnPoId,
        vendorId: grnVendorId,
        remarks: grnRemarks,
        items: [
          {
            sparePartId: grnPartId || undefined,
            receivedQty: Number(grnReceivedQty),
            rejectedQty: Number(grnRejectedQty),
          },
        ],
      });
      toast.success("Goods Receipt logged! Inventory stock has been automatically updated.");
      setCreateGrnOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to log Goods Receipt");
    }
  };

  // Handle Create Invoice
  const handleCreateInvoice = async () => {
    if (!invNumber || !invVendorId) {
      toast.error("Invoice number and vendor are required");
      return;
    }
    try {
      await createVendorInvoice({
        invoiceNumber: invNumber,
        vendorId: invVendorId,
        invoiceAmount: Number(invAmount),
        remarks: invRemarks,
      });
      toast.success("Vendor invoice recorded!");
      setCreateInvoiceOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create invoice");
    }
  };

  // Handle Log Payment
  const handlePayInvoice = async (invId: string, amount: number) => {
    try {
      await updateInvoicePayment(invId, "PAID", amount);
      toast.success("Invoice payment marked as PAID");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update payment status");
    }
  };

  const renderPOBadge = (s: string) => {
    switch (s) {
      case "RECEIVED":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">RECEIVED</Badge>;
      case "APPROVED":
      case "SENT":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-200">{s}</Badge>;
      case "PARTIALLY_RECEIVED":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200">PARTIAL</Badge>;
      default:
        return <Badge variant="outline">{s}</Badge>;
    }
  };

  const renderPRBadge = (s: string) => {
    switch (s) {
      case "APPROVED":
      case "CONVERTED_TO_PO":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">{s}</Badge>;
      case "PENDING":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200">PENDING</Badge>;
      case "REJECTED":
        return <Badge className="bg-rose-500/10 text-rose-600 border-rose-200">REJECTED</Badge>;
      default:
        return <Badge variant="outline">{s}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enterprise Purchase & Procurement"
        description="End-to-end procurement workflow: Requisitions, Multi-stage Approvals, Purchase Orders, Goods Receipt (GRN), and Invoices."
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button variant="outline" onClick={() => setCreatePrOpen(true)}>
            <ClipboardList className="mr-2 h-4 w-4" /> New Requisition (PR)
          </Button>
          <Button onClick={() => setCreatePoOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Purchase Order
          </Button>
        </div>
      </PageHeader>

      {/* Metrics Dashboard */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Pending Approval PRs</p>
                  <p className="text-3xl font-bold mt-1 text-amber-600">{stats.pendingApprovalPRs}</p>
                  <p className="text-xs text-muted-foreground mt-1">Out of {stats.totalPurchaseRequests} Total PRs</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <ClipboardList className="h-6 w-6 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Open Purchase Orders</p>
                  <p className="text-3xl font-bold mt-1 text-blue-600">{stats.openPurchaseOrders}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stats.approvedOrders} Approved Orders</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Today's Receipts (GRN)</p>
                  <p className="text-3xl font-bold mt-1 text-emerald-600">{stats.todayReceipts}</p>
                  <p className="text-xs text-emerald-600 mt-1">Stock Automatically Updated</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Truck className="h-6 w-6 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Monthly Procurement</p>
                  <p className="text-3xl font-bold mt-1 text-purple-600">${stats.monthlyPurchaseCost.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stats.pendingInvoicesCount} Pending Invoices</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="orders">Purchase Orders (PO)</TabsTrigger>
            <TabsTrigger value="requests">Requisitions (PR)</TabsTrigger>
            <TabsTrigger value="grn">Goods Receipt (GRN)</TabsTrigger>
            <TabsTrigger value="invoices">Invoices & Payments</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            {activeTab === "grn" && (
              <Button size="sm" onClick={() => setCreateGrnOpen(true)}>
                <Truck className="mr-2 h-4 w-4" /> Log Goods Receipt
              </Button>
            )}
            {activeTab === "invoices" && (
              <Button size="sm" onClick={() => setCreateInvoiceOpen(true)}>
                <DollarSign className="mr-2 h-4 w-4" /> Record Invoice
              </Button>
            )}
          </div>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search PO number, PR number, vendor name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tab 1: Purchase Orders */}
        <TabsContent value="orders">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead>PO Number</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Grand Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expected Delivery</TableHead>
                    <TableHead className="text-right pr-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading orders...</TableCell></TableRow>
                  ) : purchaseOrders.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No purchase orders found.</TableCell></TableRow>
                  ) : (
                    purchaseOrders.map((po) => (
                      <TableRow key={po.id}>
                        <TableCell className="font-mono text-xs font-bold text-primary">{po.poNumber}</TableCell>
                        <TableCell className="text-xs font-medium">{po.vendor?.vendorName || "Vendor"}</TableCell>
                        <TableCell className="font-bold text-xs">${po.grandTotal?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell>{renderPOBadge(po.status)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {po.expectedDelivery ? new Date(po.expectedDelivery).toLocaleDateString() : "—"}
                        </TableCell>
                        <TableCell className="text-right pr-4">
                          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => {
                            setGrnPoId(po.id);
                            setGrnVendorId(po.vendorId);
                            setCreateGrnOpen(true);
                          }}>
                            Receive Goods
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Purchase Requests */}
        <TabsContent value="requests">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead>PR Number</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Total Est.</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right pr-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading requests...</TableCell></TableRow>
                  ) : purchaseRequests.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No purchase requests found.</TableCell></TableRow>
                  ) : (
                    purchaseRequests.map((pr) => (
                      <TableRow key={pr.id}>
                        <TableCell className="font-mono text-xs font-bold text-primary">{pr.prNumber}</TableCell>
                        <TableCell><Badge variant="outline" className="text-xs">{pr.priority}</Badge></TableCell>
                        <TableCell className="text-xs">{pr.requestedBy?.fullName || "User"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-xs truncate">{pr.reason || "—"}</TableCell>
                        <TableCell className="font-bold text-xs">${pr.totalAmount?.toLocaleString()}</TableCell>
                        <TableCell>{renderPRBadge(pr.status)}</TableCell>
                        <TableCell className="text-right pr-4">
                          {pr.status === "PENDING" && (
                            <Button size="sm" variant="outline" className="h-8 text-emerald-600 border-emerald-200" onClick={() => handleApprovePR(pr.id)}>
                              <CheckCircle className="mr-1 h-3.5 w-3.5" /> Approve
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Goods Receipts (GRN) */}
        <TabsContent value="grn">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead>GRN #</TableHead>
                    <TableHead>PO Reference</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Received Qty</TableHead>
                    <TableHead>Rejected Qty</TableHead>
                    <TableHead>Received Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading GRNs...</TableCell></TableRow>
                  ) : goodsReceipts.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No Goods Receipts logged yet.</TableCell></TableRow>
                  ) : (
                    goodsReceipts.map((grn) => (
                      <TableRow key={grn.id}>
                        <TableCell className="font-mono text-xs font-bold text-emerald-700">{grn.grnNumber}</TableCell>
                        <TableCell className="font-mono text-xs text-primary">{grn.purchaseOrder?.poNumber || "—"}</TableCell>
                        <TableCell className="text-xs font-medium">{grn.vendor?.vendorName || "Vendor"}</TableCell>
                        <TableCell className="font-bold text-xs text-emerald-600">{grn.receivedQuantity} Pcs</TableCell>
                        <TableCell className="text-xs text-rose-500 font-semibold">{grn.rejectedQuantity} Pcs</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(grn.receivedDate).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Invoices */}
        <TabsContent value="invoices">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Paid Amount</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead className="text-right pr-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading invoices...</TableCell></TableRow>
                  ) : invoices.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No invoices recorded.</TableCell></TableRow>
                  ) : (
                    invoices.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell className="font-mono text-xs font-bold">{inv.invoiceNumber}</TableCell>
                        <TableCell className="text-xs font-medium">{inv.vendor?.vendorName || "Vendor"}</TableCell>
                        <TableCell className="font-bold text-xs">${inv.invoiceAmount?.toLocaleString()}</TableCell>
                        <TableCell className="text-xs font-semibold text-emerald-600">${inv.paidAmount?.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={inv.paymentStatus === "PAID" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}>
                            {inv.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-4">
                          {inv.paymentStatus !== "PAID" && (
                            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handlePayInvoice(inv.id, inv.invoiceAmount)}>
                              Mark Paid
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog: Create PR */}
      <Dialog open={createPrOpen} onOpenChange={setCreatePrOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>New Requisition (Purchase Request)</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-xs font-semibold">Priority</Label>
              <Select value={prPriority} onValueChange={(v: any) => setPrPriority(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low Priority</SelectItem>
                  <SelectItem value="MEDIUM">Medium Priority</SelectItem>
                  <SelectItem value="HIGH">High Priority</SelectItem>
                  <SelectItem value="URGENT">Urgent Breakdown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Link Spare Part (Optional)</Label>
              <Select value={prPartId} onValueChange={(val) => {
                setPrPartId(val);
                const sp = spareParts.find((s) => s.id === val);
                if (sp) {
                  setPrPartDesc(sp.partName);
                  setPrUnitPrice(sp.unitCost || 25);
                }
              }}>
                <SelectTrigger><SelectValue placeholder="Select spare part..." /></SelectTrigger>
                <SelectContent>
                  {spareParts.map((sp) => (
                    <SelectItem key={sp.id} value={sp.id}>{sp.partCode} - {sp.partName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Item Description *</Label>
              <Input value={prPartDesc} onChange={(e) => setPrPartDesc(e.target.value)} placeholder="e.g. Centrifugal Pump Seals" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold">Required Quantity</Label>
                <Input type="number" value={prQty} onChange={(e) => setPrQty(Number(e.target.value))} />
              </div>
              <div>
                <Label className="text-xs font-semibold">Est. Unit Price ($)</Label>
                <Input type="number" value={prUnitPrice} onChange={(e) => setPrUnitPrice(Number(e.target.value))} />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Reason for Request</Label>
              <Textarea value={prReason} onChange={(e) => setPrReason(e.target.value)} placeholder="Why is this material required?" />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setCreatePrOpen(false)}>Cancel</Button>
              <Button onClick={handleCreatePR}>Submit Requisition</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Create PO */}
      <Dialog open={createPoOpen} onOpenChange={setCreatePoOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Issue Purchase Order (PO)</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-xs font-semibold">Select Vendor *</Label>
              <Select value={poVendorId} onValueChange={setPoVendorId}>
                <SelectTrigger><SelectValue placeholder="Choose vendor..." /></SelectTrigger>
                <SelectContent>
                  {vendors.map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.vendorCode} - {v.vendorName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Item Description *</Label>
              <Input value={poDesc} onChange={(e) => setPoDesc(e.target.value)} placeholder="Item description" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-xs font-semibold">Quantity</Label>
                <Input type="number" value={poQty} onChange={(e) => setPoQty(Number(e.target.value))} />
              </div>
              <div>
                <Label className="text-xs font-semibold">Unit Price ($)</Label>
                <Input type="number" value={poPrice} onChange={(e) => setPoPrice(Number(e.target.value))} />
              </div>
              <div>
                <Label className="text-xs font-semibold">Shipping ($)</Label>
                <Input type="number" value={poShipping} onChange={(e) => setPoShipping(Number(e.target.value))} />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Order Notes</Label>
              <Textarea value={poNotes} onChange={(e) => setPoNotes(e.target.value)} placeholder="Delivery terms or notes..." />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setCreatePoOpen(false)}>Cancel</Button>
              <Button onClick={handleCreatePO}>Issue Purchase Order</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Goods Receipt (GRN) */}
      <Dialog open={createGrnOpen} onOpenChange={setCreateGrnOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Goods Receipt Note (GRN) - Auto Stock Update</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-xs font-semibold">Select Purchase Order *</Label>
              <Select value={grnPoId} onValueChange={(val) => {
                setGrnPoId(val);
                const po = purchaseOrders.find((p) => p.id === val);
                if (po) setGrnVendorId(po.vendorId);
              }}>
                <SelectTrigger><SelectValue placeholder="Choose PO..." /></SelectTrigger>
                <SelectContent>
                  {purchaseOrders.map((po) => (
                    <SelectItem key={po.id} value={po.id}>{po.poNumber} - {po.vendor?.vendorName || "Vendor"}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Link Spare Part to Update Stock *</Label>
              <Select value={grnPartId} onValueChange={setGrnPartId}>
                <SelectTrigger><SelectValue placeholder="Select spare part..." /></SelectTrigger>
                <SelectContent>
                  {spareParts.map((sp) => (
                    <SelectItem key={sp.id} value={sp.id}>{sp.partCode} - {sp.partName} (Current Stock: {sp.currentStock})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold">Received Quantity *</Label>
                <Input type="number" value={grnReceivedQty} onChange={(e) => setGrnReceivedQty(Number(e.target.value))} />
              </div>
              <div>
                <Label className="text-xs font-semibold">Rejected Quantity</Label>
                <Input type="number" value={grnRejectedQty} onChange={(e) => setGrnRejectedQty(Number(e.target.value))} />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Inspection Remarks</Label>
              <Textarea value={grnRemarks} onChange={(e) => setGrnRemarks(e.target.value)} placeholder="Condition upon receipt..." />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setCreateGrnOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateGRN}>Log Receipt & Update Stock</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Create Invoice */}
      <Dialog open={createInvoiceOpen} onOpenChange={setCreateInvoiceOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Record Vendor Invoice</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold">Invoice Number *</Label>
                <Input value={invNumber} onChange={(e) => setInvNumber(e.target.value)} placeholder="INV-2026-901" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Invoice Amount ($) *</Label>
                <Input type="number" value={invAmount} onChange={(e) => setInvAmount(Number(e.target.value))} />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Select Vendor *</Label>
              <Select value={invVendorId} onValueChange={setInvVendorId}>
                <SelectTrigger><SelectValue placeholder="Choose vendor..." /></SelectTrigger>
                <SelectContent>
                  {vendors.map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.vendorCode} - {v.vendorName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Remarks</Label>
              <Textarea value={invRemarks} onChange={(e) => setInvRemarks(e.target.value)} placeholder="Payment notes..." />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setCreateInvoiceOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateInvoice}>Record Invoice</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
