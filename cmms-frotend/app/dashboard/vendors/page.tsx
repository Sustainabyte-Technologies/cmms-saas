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
  MoreHorizontal,
  Building2,
  Eye,
  Edit,
  Trash2,
  Star,
  RefreshCw,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
} from "lucide-react";
import {
  fetchVendors,
  fetchVendorDashboard,
  createVendor,
  updateVendor,
  deleteVendor,
  Vendor,
  VendorDashboardStats,
} from "@/lib/api/vendors-api";

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [stats, setStats] = useState<VendorDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  // Form Fields
  const [vendorName, setVendorName] = useState("");
  const [vendorCode, setVendorCode] = useState("");
  const [vendorType, setVendorType] = useState("SUPPLIER");
  const [supplierCategory, setSupplierCategory] = useState("General");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [taxRegistration, setTaxRegistration] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("NET_30");
  const [creditLimit, setCreditLimit] = useState(50000);
  const [leadTimeDays, setLeadTimeDays] = useState(7);
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE" | "BLACKLISTED">("ACTIVE");
  const [rating, setRating] = useState(5.0);
  const [remarks, setRemarks] = useState("");

  // Delete Modal
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [vData, sData] = await Promise.all([
        fetchVendors({
          search,
          status: statusFilter === "ALL" ? undefined : statusFilter,
          category: categoryFilter === "ALL" ? undefined : categoryFilter,
        }),
        fetchVendorDashboard(),
      ]);
      setVendors(vData || []);
      setStats(sData || null);
    } catch (err: any) {
      toast.error(err.message || "Failed to load vendor data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, categoryFilter]);

  useEffect(() => {
    setCurrentPage(1);
    const timer = setTimeout(loadData, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenCreate = () => {
    setEditingVendor(null);
    setVendorName("");
    setVendorCode(`VND-${Math.floor(1000 + Math.random() * 9000)}`);
    setVendorType("SUPPLIER");
    setSupplierCategory("General");
    setContactPerson("");
    setPhone("");
    setMobile("");
    setEmail("");
    setWebsite("");
    setGstNumber("");
    setPanNumber("");
    setTaxRegistration("");
    setAddress("");
    setCity("");
    setState("");
    setCountry("");
    setPostalCode("");
    setPaymentTerms("NET_30");
    setCreditLimit(50000);
    setLeadTimeDays(7);
    setStatus("ACTIVE");
    setRating(5.0);
    setRemarks("");
    setIsOpen(true);
  };

  const handleOpenEdit = (v: Vendor) => {
    setEditingVendor(v);
    setVendorName(v.vendorName);
    setVendorCode(v.vendorCode);
    setVendorType(v.vendorType || "SUPPLIER");
    setSupplierCategory(v.supplierCategory || "General");
    setContactPerson(v.contactPerson || "");
    setPhone(v.phone || "");
    setMobile(v.mobile || "");
    setEmail(v.email || "");
    setWebsite(v.website || "");
    setGstNumber(v.gstNumber || "");
    setPanNumber(v.panNumber || "");
    setTaxRegistration(v.taxRegistration || "");
    setAddress(v.address || "");
    setCity(v.city || "");
    setState(v.state || "");
    setCountry(v.country || "");
    setPostalCode(v.postalCode || "");
    setPaymentTerms(v.paymentTerms || "NET_30");
    setCreditLimit(v.creditLimit || 0);
    setLeadTimeDays(v.leadTimeDays || 7);
    setStatus(v.status);
    setRating(v.rating || 5.0);
    setRemarks(v.remarks || "");
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!vendorName) {
      toast.error("Vendor Name is required");
      return;
    }
    try {
      const payload = {
        vendorName,
        vendorCode,
        vendorType,
        supplierCategory,
        contactPerson,
        phone,
        mobile,
        email,
        website,
        gstNumber,
        panNumber,
        taxRegistration,
        address,
        city,
        state,
        country,
        postalCode,
        paymentTerms,
        creditLimit: Number(creditLimit),
        leadTimeDays: Number(leadTimeDays),
        status,
        rating: Number(rating),
        remarks,
      };

      if (editingVendor) {
        await updateVendor(editingVendor.id, payload);
        toast.success("Vendor updated successfully");
      } else {
        await createVendor(payload);
        toast.success("Vendor created successfully");
      }
      setIsOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save vendor");
    }
  };

  const handleDelete = (id: string) => {
    setDeleteTargetId(id);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteVendor(deleteTargetId);
      toast.success("Vendor deleted successfully");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete vendor");
    } finally {
      setDeleteOpen(false);
      setDeleteTargetId(null);
    }
  };

  const handleExportCSV = () => {
    if (vendors.length === 0) {
      toast.error("No vendors to export");
      return;
    }
    const headers = ["Vendor Code", "Vendor Name", "Type", "Category", "Contact Person", "Email", "Phone", "Status", "Rating"];
    const rows = vendors.map((v) => [
      v.vendorCode,
      `"${v.vendorName}"`,
      v.vendorType,
      v.supplierCategory,
      `"${v.contactPerson || ""}"`,
      v.email || "",
      v.phone || "",
      v.status,
      v.rating,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Vendor_Master_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Vendor report exported");
  };

  const totalPages = Math.max(1, Math.ceil(vendors.length / rowsPerPage));
  const paginatedVendors = vendors.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const renderStatusBadge = (s: string) => {
    switch (s) {
      case "ACTIVE":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">Active</Badge>;
      case "INACTIVE":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200">Inactive</Badge>;
      case "BLACKLISTED":
        return <Badge className="bg-rose-500/10 text-rose-600 border-rose-200">Blacklisted</Badge>;
      default:
        return <Badge variant="outline">{s}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enterprise Vendor Management"
        description="Comprehensive supplier directory, vendor performance tracking, and procurement network."
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Vendor
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
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Total Vendors</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalVendors}</p>
                  <p className="text-xs text-emerald-600 mt-1">{stats.activeVendors} Active Suppliers</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Top Rated Suppliers</p>
                  <p className="text-3xl font-bold mt-1 text-amber-600">{stats.topRatedVendors}</p>
                  <p className="text-xs text-muted-foreground mt-1">Rating ≥ 4.5 Stars</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Pending Deliveries</p>
                  <p className="text-3xl font-bold mt-1 text-blue-600">{stats.pendingDeliveries}</p>
                  <p className="text-xs text-muted-foreground mt-1">Open Purchase Orders</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Purchase Volume</p>
                  <p className="text-3xl font-bold mt-1 text-emerald-600">${stats.totalPurchaseVolume.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stats.totalCompletedOrders} Completed POs</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters & Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search vendor name, code, contact person, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active Only</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="BLACKLISTED">Blacklisted</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Electrical">Electrical</SelectItem>
                  <SelectItem value="Mechanical">Mechanical</SelectItem>
                  <SelectItem value="Lubricants">Lubricants</SelectItem>
                  <SelectItem value="Safety">Safety</SelectItem>
                  <SelectItem value="OEM Parts">OEM Parts</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vendors Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Vendor Code & Name</TableHead>
                <TableHead>Category & Type</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Payment Terms</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Loading vendors...
                  </TableCell>
                </TableRow>
              ) : vendors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No vendors found. Click "Add Vendor" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedVendors.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary text-xs">
                          {v.vendorCode.slice(-4)}
                        </div>
                        <div>
                          <Link href={`/dashboard/vendors/${v.id}`} className="font-semibold hover:underline text-sm">
                            {v.vendorName}
                          </Link>
                          <p className="text-xs text-muted-foreground font-mono">{v.vendorCode}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <span className="font-medium block">{v.supplierCategory}</span>
                      <span className="text-muted-foreground block text-[11px]">{v.vendorType}</span>
                    </TableCell>
                    <TableCell className="text-xs">
                      {v.contactPerson && <p className="font-medium">{v.contactPerson}</p>}
                      {v.email && (
                        <p className="text-muted-foreground flex items-center gap-1 text-[11px]">
                          <Mail className="h-3 w-3" /> {v.email}
                        </p>
                      )}
                      {v.phone && (
                        <p className="text-muted-foreground flex items-center gap-1 text-[11px]">
                          <Phone className="h-3 w-3" /> {v.phone}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      <span className="font-medium">{v.paymentTerms}</span>
                      <span className="block text-muted-foreground text-[11px]">Limit: ${v.creditLimit?.toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-xs">{v.rating?.toFixed(1)}</span>
                      </div>
                    </TableCell>
                    <TableCell>{renderStatusBadge(v.status)}</TableCell>
                    <TableCell className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/dashboard/vendors/${v.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit(v)}>
                          <Edit className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(v.id)}>
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
          {vendors.length > 0 && (
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
                Page {currentPage} of {totalPages} ({vendors.length} total vendors)
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

      {/* Create / Edit Vendor Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingVendor ? "Edit Vendor Details" : "Create Master Vendor Record"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold">Vendor Code (Auto)</Label>
                <Input value={vendorCode} onChange={(e) => setVendorCode(e.target.value)} placeholder="VND-1001" />
              </div>

              <div>
                <Label className="text-xs font-semibold">Vendor Name *</Label>
                <Input value={vendorName} onChange={(e) => setVendorName(e.target.value)} placeholder="e.g. Industrial Supplies Co." />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-xs font-semibold">Vendor Type</Label>
                <Select value={vendorType} onValueChange={setVendorType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUPPLIER">Supplier</SelectItem>
                    <SelectItem value="SERVICE_PROVIDER">Service Provider</SelectItem>
                    <SelectItem value="OEM">OEM Manufacturer</SelectItem>
                    <SelectItem value="DISTRIBUTOR">Distributor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Supplier Category</Label>
                <Select value={supplierCategory} onValueChange={setSupplierCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Electrical">Electrical</SelectItem>
                    <SelectItem value="Mechanical">Mechanical</SelectItem>
                    <SelectItem value="Lubricants">Lubricants</SelectItem>
                    <SelectItem value="Safety">Safety</SelectItem>
                    <SelectItem value="OEM Parts">OEM Parts</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Status</Label>
                <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="BLACKLISTED">Blacklisted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-xs font-semibold">Contact Person</Label>
                <Input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} placeholder="Full Name" />
              </div>

              <div>
                <Label className="text-xs font-semibold">Email Address</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vendor@domain.com" />
              </div>

              <div>
                <Label className="text-xs font-semibold">Phone Number</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555-0192" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-xs font-semibold">GST / Tax ID</Label>
                <Input value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} placeholder="GSTIN / TAX-1234" />
              </div>

              <div>
                <Label className="text-xs font-semibold">Payment Terms</Label>
                <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IMMEDIATE">Immediate</SelectItem>
                    <SelectItem value="NET_15">Net 15 Days</SelectItem>
                    <SelectItem value="NET_30">Net 30 Days</SelectItem>
                    <SelectItem value="NET_60">Net 60 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Credit Limit ($)</Label>
                <Input type="number" value={creditLimit} onChange={(e) => setCreditLimit(Number(e.target.value))} />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Address</Label>
              <Textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full street address..." />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-xs font-semibold">City</Label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs font-semibold">State / Province</Label>
                <Input value={state} onChange={(e) => setState(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs font-semibold">Country</Label>
                <Input value={country} onChange={(e) => setCountry(e.target.value)} />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save Vendor Record</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Popup */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vendor Master Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this vendor from the database? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Vendor
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
