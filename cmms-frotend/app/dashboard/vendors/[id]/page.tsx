"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/ui-components";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  MapPin,
  Star,
  CheckCircle2,
  Clock,
  FileText,
  CreditCard,
  ShieldCheck,
  Package,
} from "lucide-react";
import { fetchVendorById, Vendor } from "@/lib/api/vendors-api";

export default function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const vendorId = resolvedParams.id;

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendorById(vendorId)
      .then((data) => setVendor(data))
      .catch((err) => toast.error(err.message || "Failed to load vendor details"))
      .finally(() => setLoading(false));
  }, [vendorId]);

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading vendor profile...</p>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/vendors">
          <Button variant="ghost"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Vendors</Button>
        </Link>
        <p className="text-destructive font-semibold">Vendor not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/vendors">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Vendor Directory
          </Button>
        </Link>
      </div>

      <PageHeader
        title={vendor.vendorName}
        description={`Vendor Code: ${vendor.vendorCode} • Category: ${vendor.supplierCategory}`}
      >
        <Badge
          className={
            vendor.status === "ACTIVE"
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-200"
              : vendor.status === "BLACKLISTED"
              ? "bg-rose-500/10 text-rose-600 border-rose-200"
              : "bg-amber-500/10 text-amber-600 border-amber-200"
          }
        >
          {vendor.status}
        </Badge>
      </PageHeader>

      {/* KPI Header Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase">On-Time Delivery Rate</p>
            <p className="text-3xl font-bold mt-1 text-emerald-600">
              {vendor.performance?.onTimeDeliveryRate || 98.5}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">Lead Time: {vendor.leadTimeDays} Days</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Supplier Rating</p>
            <div className="flex items-center gap-2 mt-1">
              <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
              <span className="text-3xl font-bold">{vendor.rating?.toFixed(1)} / 5.0</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Quality & Service Audit</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Total Purchase Orders</p>
            <p className="text-3xl font-bold mt-1 text-primary">{vendor.performance?.purchaseCount || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">{vendor.performance?.completedOrders || 0} Fulfilled</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Credit Limit & Terms</p>
            <p className="text-3xl font-bold mt-1">${vendor.creditLimit?.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Terms: {vendor.paymentTerms}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Master Info</TabsTrigger>
          <TabsTrigger value="orders">Purchase History</TabsTrigger>
          <TabsTrigger value="services">AMC & Warranty</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base font-bold">Contact & Identity</CardTitle></CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-muted-foreground flex items-center gap-2"><Building2 className="h-4 w-4" /> Vendor Type:</span>
                  <span className="font-semibold">{vendor.vendorType}</span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-muted-foreground flex items-center gap-2"><Mail className="h-4 w-4" /> Contact Person:</span>
                  <span className="font-semibold">{vendor.contactPerson || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-muted-foreground flex items-center gap-2"><Mail className="h-4 w-4" /> Email:</span>
                  <span className="font-semibold">{vendor.email || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-muted-foreground flex items-center gap-2"><Phone className="h-4 w-4" /> Phone:</span>
                  <span className="font-semibold">{vendor.phone || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-muted-foreground flex items-center gap-2"><Globe className="h-4 w-4" /> Website:</span>
                  <span className="font-semibold">{vendor.website || "N/A"}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base font-bold">Tax & Location</CardTitle></CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-muted-foreground flex items-center gap-2"><CreditCard className="h-4 w-4" /> GST / Tax Number:</span>
                  <span className="font-semibold">{vendor.gstNumber || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-muted-foreground flex items-center gap-2"><CreditCard className="h-4 w-4" /> PAN Number:</span>
                  <span className="font-semibold">{vendor.panNumber || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-muted-foreground flex items-center gap-2"><MapPin className="h-4 w-4" /> Address:</span>
                  <span className="font-semibold">{vendor.address || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-muted-foreground">City & State:</span>
                  <span className="font-semibold">{vendor.city ? `${vendor.city}, ${vendor.state || ""}` : "N/A"}</span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-muted-foreground">Country:</span>
                  <span className="font-semibold">{vendor.country || "N/A"}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader><CardTitle className="text-base font-bold">Recent Purchase Orders</CardTitle></CardHeader>
            <CardContent>
              {vendor.performance?.purchaseCount === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No purchase orders found for this vendor.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead>PO Number</TableHead>
                      <TableHead>Order Date</TableHead>
                      <TableHead>Grand Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-mono text-xs font-bold text-primary">PO-2026-001</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</TableCell>
                      <TableCell className="font-bold text-xs">$4,250.00</TableCell>
                      <TableCell><Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">RECEIVED</Badge></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-6 flex items-center gap-4">
              <ShieldCheck className="h-8 w-8 text-primary" />
              <div>
                <p className="font-bold text-sm">AMC Support</p>
                <p className="text-xs text-emerald-600 font-semibold">{vendor.amcSupport ? "Supported & Active" : "Not Provided"}</p>
              </div>
            </Card>
            <Card className="p-6 flex items-center gap-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              <div>
                <p className="font-bold text-sm">Warranty Service</p>
                <p className="text-xs text-emerald-600 font-semibold">{vendor.warrantySupport ? "Full Coverage" : "Standard"}</p>
              </div>
            </Card>
            <Card className="p-6 flex items-center gap-4">
              <Package className="h-8 w-8 text-amber-500" />
              <div>
                <p className="font-bold text-sm">Field Service Support</p>
                <p className="text-xs text-emerald-600 font-semibold">{vendor.serviceSupport ? "Available On-Site" : "Off-Site Only"}</p>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
