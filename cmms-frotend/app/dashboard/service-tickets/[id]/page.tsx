"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/ui-components";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchServiceTicketById,
  updateServiceTicketStatus,
  createWorkOrderFromTicket,
  ServiceTicket,
  TicketStatus,
} from "@/lib/api/service-tickets-api";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Ticket,
  Wrench,
  UserCheck,
  Building2,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  ExternalLink,
  ShieldCheck,
  FileText,
} from "lucide-react";

export default function ServiceTicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [ticket, setTicket] = useState<ServiceTicket | null>(null);
  const [loading, setLoading] = useState(true);

  // Status Dialog State
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<TicketStatus>("RESOLVED");
  const [resolutionText, setResolutionText] = useState("");
  const [remarksText, setRemarksText] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Work Order Modal State
  const [woDialogOpen, setWoDialogOpen] = useState(false);
  const [woTitle, setWoTitle] = useState("");
  const [woDescription, setWoDescription] = useState("");
  const [woPriority, setWoPriority] = useState("HIGH");
  const [creatingWO, setCreatingWO] = useState(false);

  const loadTicket = async () => {
    setLoading(true);
    try {
      const data = await fetchServiceTicketById(id);
      setTicket(data);
      setWoTitle(`Work Order for ${data.ticketNumber}: ${data.title}`);
      setWoDescription(data.description);
    } catch (error: any) {
      toast.error(error.message || "Failed to load service ticket");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadTicket();
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!ticket) return;
    setUpdatingStatus(true);
    try {
      await updateServiceTicketStatus(ticket.id, {
        status: newStatus,
        resolution: resolutionText || undefined,
        remarks: remarksText || undefined,
      });
      toast.success(`Ticket status updated to ${newStatus}`);
      setStatusDialogOpen(false);
      loadTicket();
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCreateWorkOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket) return;
    setCreatingWO(true);
    try {
      const res = await createWorkOrderFromTicket(ticket.id, {
        title: woTitle,
        description: woDescription,
        priority: woPriority,
      });
      toast.success(`Work Order ${res.workOrder.workOrderNumber} created successfully!`);
      setWoDialogOpen(false);
      loadTicket();
    } catch (error: any) {
      toast.error(error.message || "Failed to create Work Order");
    } finally {
      setCreatingWO(false);
    }
  };

  const renderStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case "NEW":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">New</Badge>;
      case "ASSIGNED":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Assigned</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">In Progress</Badge>;
      case "ON_HOLD":
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">On Hold</Badge>;
      case "RESOLVED":
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Resolved</Badge>;
      case "CLOSED":
        return <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300">Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const renderPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return <Badge className="bg-red-600 text-white font-semibold">Urgent</Badge>;
      case "HIGH":
        return <Badge className="bg-amber-500 text-white font-medium">High</Badge>;
      case "MEDIUM":
        return <Badge className="bg-blue-500 text-white font-medium">Medium</Badge>;
      case "LOW":
        return <Badge className="bg-slate-500 text-white font-normal">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-2">
        <Clock className="h-8 w-8 animate-spin text-primary" />
        Loading service ticket details...
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-bold">Service Ticket Not Found</h2>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/dashboard/service-tickets">Back to Service Tickets</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <PageHeader
        title={`${ticket.ticketNumber}: ${ticket.title}`}
        description={`Logged on ${new Date(ticket.createdAt).toLocaleString()} • ${ticket.location}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/service-tickets">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Link>
          </Button>

          <Button variant="outline" asChild>
            <Link href={`/dashboard/service-tickets/${ticket.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Link>
          </Button>

          {/* Status Update Trigger */}
          <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary">
                <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" /> Update Status
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Ticket Status</DialogTitle>
                <DialogDescription>Change status or record resolution details for {ticket.ticketNumber}.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={newStatus} onValueChange={(val) => setNewStatus(val as TicketStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEW">New</SelectItem>
                      <SelectItem value="ASSIGNED">Assigned</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="ON_HOLD">On Hold</SelectItem>
                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Resolution Notes (Optional)</Label>
                  <Textarea
                    rows={3}
                    placeholder="Provide details on how the issue was resolved..."
                    value={resolutionText}
                    onChange={(e) => setResolutionText(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Remarks</Label>
                  <Input
                    placeholder="Additional notes..."
                    value={remarksText}
                    onChange={(e) => setRemarksText(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdateStatus} disabled={updatingStatus}>
                  {updatingStatus ? "Updating..." : "Save Status"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Create Work Order Modal */}
          {!ticket.isWorkOrderCreated && !ticket.workOrder ? (
            <Dialog open={woDialogOpen} onOpenChange={setWoDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <PlusCircle className="mr-2 h-4 w-4" /> Create Work Order
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <form onSubmit={handleCreateWorkOrder}>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Wrench className="h-5 w-5 text-primary" />
                      Generate Work Order from Service Ticket
                    </DialogTitle>
                    <DialogDescription>
                      This will convert {ticket.ticketNumber} into an active Work Order for maintenance execution.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="woTitle">Work Order Title</Label>
                      <Input
                        id="woTitle"
                        value={woTitle}
                        onChange={(e) => setWoTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="woPriority">Work Order Priority</Label>
                      <Select value={woPriority} onValueChange={setWoPriority}>
                        <SelectTrigger id="woPriority">
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

                    <div className="space-y-1.5">
                      <Label htmlFor="woDescription">Work Description</Label>
                      <Textarea
                        id="woDescription"
                        rows={3}
                        value={woDescription}
                        onChange={(e) => setWoDescription(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => setWoDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={creatingWO}>
                      {creatingWO ? "Creating Work Order..." : "Create Work Order"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          ) : (
            <Button variant="outline" disabled title="Work Order already created for this ticket">
              <Wrench className="mr-2 h-4 w-4 text-emerald-600" /> Work Order Created
            </Button>
          )}
        </div>
      </PageHeader>

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: General & Details */}
        <div className="md:col-span-2 space-y-6">
          {/* General Information Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-primary" /> General Ticket Information
                </CardTitle>
                <CardDescription>Comprehensive details of the logged service request.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {renderPriorityBadge(ticket.priority)}
                {renderStatusBadge(ticket.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-muted/30 p-3.5 rounded-lg text-sm">
                <div>
                  <span className="text-xs text-muted-foreground block">Ticket Number</span>
                  <span className="font-bold text-primary">{ticket.ticketNumber}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Category</span>
                  <span className="font-medium">{ticket.category.replace("_", " ")}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Request Date</span>
                  <span className="font-medium">{new Date(ticket.requestDate).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Location</span>
                  <span className="font-medium">{ticket.location}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Customer / Site</span>
                  <span className="font-medium">{ticket.customer?.name} ({ticket.site?.code})</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Department</span>
                  <span className="font-medium">{ticket.department?.name}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground uppercase">Description</Label>
                <p className="text-sm bg-background border p-3 rounded-md whitespace-pre-wrap">
                  {ticket.description}
                </p>
              </div>

              {ticket.resolution && (
                <div className="space-y-1.5 border-t pt-3">
                  <Label className="text-xs font-bold text-emerald-600 uppercase flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Resolution Details
                  </Label>
                  <p className="text-sm bg-emerald-50/50 border border-emerald-200 p-3 rounded-md">
                    {ticket.resolution}
                  </p>
                </div>
              )}

              {ticket.remarks && (
                <div className="space-y-1.5 border-t pt-3">
                  <Label className="text-xs font-bold text-muted-foreground uppercase">Remarks</Label>
                  <p className="text-sm text-muted-foreground italic">
                    {ticket.remarks}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Personnel Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" /> Personnel Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div className="border p-3.5 rounded-lg space-y-1">
                <span className="text-xs font-bold text-muted-foreground block uppercase">Requested By</span>
                <p className="font-semibold text-foreground">{ticket.requester?.fullName || "—"}</p>
                <p className="text-xs text-muted-foreground">{ticket.requester?.email}</p>
                <Badge variant="outline" className="mt-1 text-xs">
                  {ticket.requester?.role?.name?.replace("_", " ") || "Active User"}
                </Badge>
              </div>

              <div className="border p-3.5 rounded-lg space-y-1">
                <span className="text-xs font-bold text-muted-foreground block uppercase">Assigned To</span>
                <p className="font-semibold text-foreground">{ticket.assignee?.fullName || "Unassigned"}</p>
                <p className="text-xs text-muted-foreground">{ticket.assignee?.email || "No assignee assigned"}</p>
                {ticket.assignee && (
                  <Badge variant="outline" className="mt-1 text-xs">
                    {ticket.assignee?.role?.name?.replace("_", " ") || "Technician"}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Asset, Work Order & Activity Timeline */}
        <div className="space-y-6">
          {/* Associated Work Order */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Wrench className="h-5 w-5 text-primary" /> Associated Work Order
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ticket.workOrder ? (
                <div className="bg-muted/40 p-4 rounded-lg space-y-2 border">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">{ticket.workOrder.workOrderNumber}</span>
                    <Badge variant="outline">{ticket.workOrder.status}</Badge>
                  </div>
                  <p className="text-xs font-medium text-foreground line-clamp-2">{ticket.workOrder.title}</p>
                  {ticket.workOrder.assignedTechnician && (
                    <p className="text-xs text-muted-foreground">
                      Technician: {ticket.workOrder.assignedTechnician.fullName}
                    </p>
                  )}
                  <Button variant="default" size="sm" className="w-full mt-2" asChild>
                    <Link href={`/dashboard/work-orders?id=${ticket.workOrder.id}`}>
                      <ExternalLink className="mr-2 h-3.5 w-3.5" /> Open Work Order
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6 border border-dashed rounded-lg space-y-3 bg-muted/10">
                  <Wrench className="h-8 w-8 text-muted-foreground mx-auto" />
                  <div>
                    <p className="text-sm font-medium">No Work Order Created</p>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                      This service ticket has not been converted into a work order yet.
                    </p>
                  </div>
                  <Button size="sm" onClick={() => setWoDialogOpen(true)}>
                    <PlusCircle className="mr-1.5 h-4 w-4" /> Create Work Order
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Related Asset Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" /> Related Asset
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ticket.asset ? (
                <div className="border p-3 rounded-lg space-y-1.5 bg-muted/20">
                  <p className="font-bold text-sm text-primary">{ticket.asset.assetName}</p>
                  <p className="text-xs font-mono text-muted-foreground">{ticket.asset.assetCode}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {ticket.asset.location}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">No specific asset associated with this ticket.</p>
              )}
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" /> Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="relative border-l border-muted ml-3 space-y-4">
                <li className="ml-4">
                  <div className="absolute w-3 h-3 bg-primary rounded-full -left-1.5 border border-background" />
                  <p className="text-xs font-bold">Ticket Logged</p>
                  <p className="text-xs text-muted-foreground">{new Date(ticket.createdAt).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">By {ticket.creator?.fullName || "System"}</p>
                </li>

                {ticket.workOrder && (
                  <li className="ml-4">
                    <div className="absolute w-3 h-3 bg-emerald-500 rounded-full -left-1.5 border border-background" />
                    <p className="text-xs font-bold">Work Order Generated</p>
                    <p className="text-xs text-muted-foreground">{ticket.workOrder.workOrderNumber}</p>
                  </li>
                )}

                {ticket.closedAt && (
                  <li className="ml-4">
                    <div className="absolute w-3 h-3 bg-slate-500 rounded-full -left-1.5 border border-background" />
                    <p className="text-xs font-bold">Ticket Closed / Resolved</p>
                    <p className="text-xs text-muted-foreground">{new Date(ticket.closedAt).toLocaleString()}</p>
                  </li>
                )}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
