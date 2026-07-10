"use client";

import { useEffect, useState } from "react";
import { PageHeader, StatusBadge } from "@/components/shared/ui-components";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, PackageCheck, Eye, Loader2 } from "lucide-react";
import {
  fetchPartsRequests,
  approvePartsRequest,
  rejectPartsRequest,
  issuePartsRequest,
  PartsRequest,
} from "@/lib/api/inventory-api";
import { useToast } from "@/hooks/use-toast";

export default function PartsRequestsPage() {
  const [requests, setRequests] = useState<PartsRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  // Details Dialog state
  const [selectedReq, setSelectedReq] = useState<PartsRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Reject action state
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await fetchPartsRequests(
        undefined,
        statusFilter === "all" ? undefined : statusFilter
      );
      setRequests(data);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to load parts requests.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  const handleOpenDetails = (req: PartsRequest) => {
    setSelectedReq(req);
    setRejectReason("");
    setShowRejectForm(false);
    setIsDetailsOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedReq) return;
    setActionLoading(true);
    try {
      const updated = await approvePartsRequest(selectedReq.id);
      setIsDetailsOpen(false);
      loadRequests();
      toast({
        title: "Request Approved",
        description: `Request ${updated.requestNumber} has been approved.`,
      });
    } catch (err: any) {
      toast({
        title: "Approval Failed",
        description: err.message || "Could not approve the request.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedReq || !rejectReason.trim()) return;
    setActionLoading(true);
    try {
      const updated = await rejectPartsRequest(selectedReq.id, rejectReason);
      setIsDetailsOpen(false);
      loadRequests();
      toast({
        title: "Request Rejected",
        description: `Request ${updated.requestNumber} has been rejected.`,
      });
    } catch (err: any) {
      toast({
        title: "Rejection Failed",
        description: err.message || "Could not reject the request.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleIssue = async () => {
    if (!selectedReq) return;
    setActionLoading(true);
    try {
      const updated = await issuePartsRequest(selectedReq.id);
      setIsDetailsOpen(false);
      loadRequests();
      toast({
        title: "Materials Issued",
        description: `Materials issued for request ${updated.requestNumber}. Stock levels updated.`,
      });
    } catch (err: any) {
      toast({
        title: "Issuance Failed",
        description: err.message || "Could not issue parts.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case "CRITICAL": return "text-red-600 font-bold bg-red-100 px-2 py-0.5 rounded";
      case "HIGH": return "text-orange-600 font-bold bg-orange-100 px-2 py-0.5 rounded";
      case "MEDIUM": return "text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded";
      default: return "text-green-600 bg-green-100 px-2 py-0.5 rounded";
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Parts Requests"
        description="Verify and approve spare parts requested by on-site maintenance technicians."
      />

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b pb-2">
        {["all", "PENDING", "APPROVED", "REJECTED", "ISSUED"].map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? "default" : "ghost"}
            size="sm"
            onClick={() => setStatusFilter(status)}
          >
            {status === "all" ? "All Requests" : status}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
              Loading parts requests...
            </div>
          ) : requests.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No requests found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="text-sm font-semibold text-foreground pl-6">Request No.</TableHead>
                  <TableHead className="text-sm font-semibold text-foreground">Work Order</TableHead>
                  <TableHead className="text-sm font-semibold text-foreground">Technician</TableHead>
                  <TableHead className="text-sm font-semibold text-foreground">Request Date</TableHead>
                  <TableHead className="text-sm font-semibold text-foreground">Priority</TableHead>
                  <TableHead className="text-sm font-semibold text-foreground">Status</TableHead>
                  <TableHead className="w-[80px] text-sm font-semibold text-foreground text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono font-bold text-sm py-4 pl-6 text-foreground">{req.requestNumber}</TableCell>
                    <TableCell className="py-4">
                      <div>
                        <p className="font-medium text-sm text-foreground truncate max-w-[200px]">{req.workOrder.title}</p>
                        <p className="text-xs text-muted-foreground font-mono">{req.workOrder.workOrderNumber}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground py-4">{req.requestedBy?.fullName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground py-4">{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="py-4 text-xs">
                      <span className={getPriorityColor(req.priority)}>
                        {req.priority}
                      </span>
                    </TableCell>
                    <TableCell className="py-4">
                      <StatusBadge
                        status={req.status}
                        variant={
                          req.status === "PENDING"
                            ? "warning"
                            : req.status === "APPROVED"
                            ? "info"
                            : req.status === "ISSUED"
                            ? "success"
                            : req.status === "REJECTED"
                            ? "error"
                            : "default"
                        }
                      />
                    </TableCell>
                    <TableCell className="py-4 pr-6">
                      <div className="flex justify-end">
                        <Button size="icon" variant="ghost" className="h-8 w-8 p-0 hover:bg-muted" onClick={() => handleOpenDetails(req)}>
                          <Eye className="h-4 w-4" />
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

      {/* Details & Action Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-xl">
          {selectedReq && (
            <div>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <DialogTitle>Request {selectedReq.requestNumber}</DialogTitle>
                  <StatusBadge
                    status={selectedReq.status}
                    variant={
                      selectedReq.status === "PENDING"
                        ? "warning"
                        : selectedReq.status === "APPROVED"
                        ? "info"
                        : selectedReq.status === "ISSUED"
                        ? "success"
                        : "error"
                    }
                  />
                </div>
                <DialogDescription>
                  Created on {new Date(selectedReq.createdAt).toLocaleString()}
                </DialogDescription>
              </DialogHeader>

              <div className="py-4 space-y-4">
                {/* Meta details */}
                <div className="grid grid-cols-2 gap-4 text-sm bg-muted/40 p-3 rounded-lg border">
                  <div>
                    <Label className="text-xs text-muted-foreground">Work Order</Label>
                    <p className="font-semibold">{selectedReq.workOrder.title}</p>
                    <p className="text-xs font-mono">{selectedReq.workOrder.workOrderNumber}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Requested By</Label>
                    <p className="font-semibold">{selectedReq.requestedBy?.fullName}</p>
                    <p className="text-xs text-muted-foreground">{selectedReq.requestedBy?.email}</p>
                  </div>
                  {selectedReq.reason && (
                    <div className="col-span-2">
                      <Label className="text-xs text-muted-foreground">Technician Remarks / Reason</Label>
                      <p className="text-xs mt-0.5">{selectedReq.reason}</p>
                    </div>
                  )}
                  {selectedReq.rejectionReason && (
                    <div className="col-span-2 bg-red-50 text-red-700 p-2 rounded text-xs">
                      <strong>Supervisor Remarks:</strong> {selectedReq.rejectionReason}
                    </div>
                  )}
                </div>

                {/* Items List */}
                <div>
                  <h4 className="text-sm font-bold mb-2">Requested Spare Parts</h4>
                  <Table className="border rounded-lg overflow-hidden">
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="text-xs font-semibold text-foreground pl-4 py-2">Part Code / Name</TableHead>
                        <TableHead className="text-right text-xs font-semibold text-foreground py-2">Requested Qty</TableHead>
                        <TableHead className="text-right text-xs font-semibold text-foreground pr-4 py-2">Warehouse Stock</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedReq.items.map((item) => (
                        <TableRow key={item.id} className="hover:bg-muted/10 transition-colors">
                          <TableCell className="pl-4 py-3">
                            <p className="font-semibold text-xs text-foreground">{item.sparePart.partName}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{item.sparePart.partCode}</p>
                          </TableCell>
                          <TableCell className="text-right font-bold text-xs py-3">{item.requestedQty} {item.sparePart.unit}</TableCell>
                          <TableCell className="text-right text-xs pr-4 py-3">
                            <span className={item.sparePart.currentStock < item.requestedQty ? "text-destructive font-bold" : "text-green-600 font-semibold"}>
                              {item.sparePart.currentStock} {item.sparePart.unit} ({item.sparePart.warehouse?.name || "No Wh"})
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Actions Footer */}
              <DialogFooter className="flex justify-end gap-2 border-t pt-4">
                {selectedReq.status === "PENDING" && !showRejectForm && (
                  <div className="flex gap-2">
                    <Button variant="destructive" onClick={() => setShowRejectForm(true)} disabled={actionLoading}>
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                    <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700 text-white" disabled={actionLoading}>
                      {actionLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                      )}
                      Approve
                    </Button>
                  </div>
                )}

                {selectedReq.status === "APPROVED" && (
                  <Button onClick={handleIssue} className="bg-blue-600 hover:bg-blue-700 text-white" disabled={actionLoading}>
                    {actionLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <PackageCheck className="mr-2 h-4 w-4" />
                    )}
                    Issue Parts
                  </Button>
                )}

                {showRejectForm && (
                  <div className="w-full space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="rejReason" className="text-destructive font-semibold text-xs">Reason for Rejection *</Label>
                      <Input
                        id="rejReason"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Provide details on why this request is rejected..."
                        required
                        disabled={actionLoading}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" onClick={() => setShowRejectForm(false)} disabled={actionLoading}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim() || actionLoading}>
                        {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm Rejection
                      </Button>
                    </div>
                  </div>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
