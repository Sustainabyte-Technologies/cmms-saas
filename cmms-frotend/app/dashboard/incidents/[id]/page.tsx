"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/ui-components";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchIncidentById,
  updateIncidentStatus,
  createWorkOrderFromIncident,
  deleteIncident,
  Incident,
  IncidentStatus,
} from "@/lib/api/incidents-api";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Wrench,
  ShieldAlert,
  Calendar,
  Clock,
  MapPin,
  UserCheck,
  Building2,
  Server,
  CheckCircle2,
  AlertTriangle,
  FileText,
  History,
  CheckSquare,
} from "lucide-react";

export default function IncidentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);

  // Status Change Modal / State
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<IncidentStatus>("UNDER_INVESTIGATION");
  const [resolution, setResolution] = useState("");
  const [rootCause, setRootCause] = useState("");
  const [correctiveAction, setCorrectiveAction] = useState("");
  const [preventiveAction, setPreventiveAction] = useState("");

  // Work Order Creation Dialog
  const [woDialogOpen, setWoDialogOpen] = useState(false);
  const [woTitle, setWoTitle] = useState("");
  const [woDescription, setWoDescription] = useState("");
  const [woPriority, setWoPriority] = useState("HIGH");
  const [creatingWo, setCreatingWo] = useState(false);

  const loadIncident = async () => {
    setLoading(true);
    try {
      const data = await fetchIncidentById(id);
      setIncident(data);
      setNewStatus(data.status);
      setResolution(data.resolution || "");
      setRootCause(data.rootCause || "");
      setCorrectiveAction(data.correctiveAction || "");
      setPreventiveAction(data.preventiveAction || "");
      setWoTitle(`Work Order for ${data.incidentNumber}: ${data.title}`);
      setWoDescription(data.description);
    } catch (error: any) {
      toast.error(error.message || "Failed to load incident details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadIncident();
  }, [id]);

  const handleUpdateStatus = async () => {
    try {
      await updateIncidentStatus(id, {
        status: newStatus,
        resolution: resolution || undefined,
        rootCause: rootCause || undefined,
        correctiveAction: correctiveAction || undefined,
        preventiveAction: preventiveAction || undefined,
      });
      toast.success(`Status updated to ${newStatus}`);
      setStatusDialogOpen(false);
      loadIncident();
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const handleCreateWorkOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingWo(true);
    try {
      const res = await createWorkOrderFromIncident(id, {
        title: woTitle,
        description: woDescription,
        priority: woPriority,
      });
      toast.success(`Work Order ${res.workOrder.workOrderNumber} created successfully!`);
      setWoDialogOpen(false);
      loadIncident();
    } catch (error: any) {
      toast.error(error.message || "Failed to create Work Order");
    } finally {
      setCreatingWo(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this incident report?")) return;
    try {
      await deleteIncident(id);
      toast.success("Incident record deleted");
      router.push("/dashboard/incidents");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete incident");
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-2">
        <Clock className="h-8 w-8 animate-spin text-primary" />
        Loading incident details...
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="p-12 text-center space-y-4">
        <ShieldAlert className="h-12 w-12 text-muted-foreground mx-auto" />
        <h3 className="text-lg font-bold">Incident Not Found</h3>
        <Button asChild variant="outline">
          <Link href="/dashboard/incidents">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
          </Link>
        </Button>
      </div>
    );
  }

  const isClosed = incident.status === "CLOSED";

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/incidents">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-primary px-2 py-0.5 bg-primary/10 rounded">
                {incident.incidentNumber}
              </span>
              <h1 className="text-xl font-bold tracking-tight">{incident.title}</h1>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Logged on {new Date(incident.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Update Dialog */}
          <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <CheckCircle2 className="mr-1.5 h-4 w-4 text-emerald-500" /> Change Status
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Update Incident Status</DialogTitle>
                <DialogDescription>
                  Advance status and record investigation or corrective notes. (Note: Only Admin, Safety Officer, and Maintenance Manager can close)
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={newStatus} onValueChange={(val) => setNewStatus(val as IncidentStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">Open</SelectItem>
                      <SelectItem value="UNDER_INVESTIGATION">Under Investigation</SelectItem>
                      <SelectItem value="CORRECTIVE_ACTION">Corrective Action</SelectItem>
                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Resolution Notes</Label>
                  <Textarea
                    rows={2}
                    placeholder="Details regarding incident resolution..."
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Root Cause</Label>
                  <Input
                    placeholder="Updated root cause findings..."
                    value={rootCause}
                    onChange={(e) => setRootCause(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateStatus}>Save Status</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Create Work Order Modal / Button */}
          <Dialog open={woDialogOpen} onOpenChange={setWoDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="default"
                size="sm"
                disabled={incident.isWorkOrderCreated || !!incident.workOrderId}
                title={
                  incident.isWorkOrderCreated
                    ? "Work Order already created for this incident"
                    : "Create a maintenance work order from this incident"
                }
              >
                <Wrench className="mr-1.5 h-4 w-4" />
                {incident.isWorkOrderCreated ? "Work Order Created" : "Create Work Order"}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Generate Work Order from Incident</DialogTitle>
                <DialogDescription>
                  This will create a new Maintenance Work Order tied directly to {incident.incidentNumber}.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateWorkOrder} className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label>Work Order Title</Label>
                  <Input
                    value={woTitle}
                    onChange={(e) => setWoTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Priority</Label>
                  <Select value={woPriority} onValueChange={setWoPriority}>
                    <SelectTrigger>
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
                  <Label>Scope / Description</Label>
                  <Textarea
                    rows={3}
                    value={woDescription}
                    onChange={(e) => setWoDescription(e.target.value)}
                    required
                  />
                </div>

                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setWoDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creatingWo}>
                    {creatingWo ? "Creating Work Order..." : "Generate Work Order"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/incidents/${incident.id}/edit`}>
              <Edit className="mr-1.5 h-4 w-4" /> Edit
            </Link>
          </Button>

          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="mr-1.5 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      {/* Incident Timeline Bar */}
      <Card className="bg-muted/30">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span>Incident Occurred:</span>
            <strong className="text-foreground font-semibold">
              {new Date(incident.incidentDate).toLocaleString()}
            </strong>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Reported Date:</span>
            <strong className="text-foreground font-semibold">
              {new Date(incident.reportedDate).toLocaleString()}
            </strong>
          </div>

          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-emerald-500" />
            <span>Status:</span>
            <Badge variant="outline" className="font-bold">
              {incident.status}
            </Badge>
          </div>

          {incident.closedAt && (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-gray-500" />
              <span>Closed Date:</span>
              <strong className="text-foreground font-semibold">
                {new Date(incident.closedAt).toLocaleString()}
              </strong>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Grid Content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Details & Investigation */}
        <div className="md:col-span-2 space-y-6">
          {/* General Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center justify-between">
                <span>General Information</span>
                <div className="flex gap-2">
                  <Badge variant="secondary">{incident.incidentType}</Badge>
                  <Badge
                    className={
                      incident.severity === "CRITICAL"
                        ? "bg-red-500 text-white"
                        : incident.severity === "HIGH"
                        ? "bg-amber-500 text-white"
                        : "bg-blue-500 text-white"
                    }
                  >
                    {incident.severity}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Location</p>
                  <p className="font-medium">{incident.location}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1">Description</p>
                <div className="p-3 bg-muted/40 rounded-lg text-foreground whitespace-pre-line text-xs leading-relaxed">
                  {incident.description}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Root Cause, Corrective Action, Preventive Action */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Investigation Findings & Action Plans
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <p className="font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Root Cause Analysis
                </p>
                <p className="p-2.5 bg-muted/40 rounded border">
                  {incident.rootCause || "No root cause documented yet."}
                </p>
              </div>

              <div>
                <p className="font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Corrective Action
                </p>
                <p className="p-2.5 bg-muted/40 rounded border">
                  {incident.correctiveAction || "No corrective action documented yet."}
                </p>
              </div>

              <div>
                <p className="font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Preventive Action
                </p>
                <p className="p-2.5 bg-muted/40 rounded border">
                  {incident.preventiveAction || "No preventive action documented yet."}
                </p>
              </div>

              {incident.resolution && (
                <div>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
                    Resolution Notes
                  </p>
                  <p className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded">
                    {incident.resolution}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Log / History */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                Incident Activity Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative border-l border-muted-foreground/20 ml-2 space-y-4 pl-4 text-xs">
                <div className="relative">
                  <span className="absolute -left-[21px] top-0.5 h-2.5 w-2.5 rounded-full bg-primary" />
                  <p className="font-semibold text-foreground">Incident Created</p>
                  <p className="text-muted-foreground">
                    Logged by {incident.creator?.fullName || "System"} on{" "}
                    {new Date(incident.createdAt).toLocaleString()}
                  </p>
                </div>

                {incident.isWorkOrderCreated && incident.workOrder && (
                  <div className="relative">
                    <span className="absolute -left-[21px] top-0.5 h-2.5 w-2.5 rounded-full bg-blue-500" />
                    <p className="font-semibold text-foreground">
                      Work Order {incident.workOrder.workOrderNumber} Generated
                    </p>
                    <p className="text-muted-foreground">
                      Tied to work order: {incident.workOrder.title}
                    </p>
                  </div>
                )}

                {incident.status === "CLOSED" && (
                  <div className="relative">
                    <span className="absolute -left-[21px] top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <p className="font-semibold text-foreground">Incident Closed</p>
                    <p className="text-muted-foreground">
                      Marked closed on{" "}
                      {incident.closedAt ? new Date(incident.closedAt).toLocaleString() : "N/A"}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Stakeholders, Related Asset & Work Order */}
        <div className="space-y-6">
          {/* Stakeholders Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-primary" /> Personnel Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="p-2.5 bg-muted/40 rounded border">
                <p className="text-muted-foreground font-medium">Reported By</p>
                <p className="font-bold text-foreground mt-0.5">
                  {incident.reporter?.fullName || "Unknown User"}
                </p>
                <p className="text-muted-foreground text-[10px]">{incident.reporter?.email}</p>
              </div>

              <div className="p-2.5 bg-muted/40 rounded border">
                <p className="text-muted-foreground font-medium">Assigned Investigator</p>
                <p className="font-bold text-foreground mt-0.5">
                  {incident.investigator?.fullName || "Unassigned"}
                </p>
                {incident.investigator?.email && (
                  <p className="text-muted-foreground text-[10px]">{incident.investigator.email}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Related Asset Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Server className="h-4 w-4 text-primary" /> Related Asset
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs">
              {incident.asset ? (
                <div className="p-3 border rounded-lg bg-card space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-foreground">{incident.asset.assetName}</p>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {incident.asset.assetCode}
                    </Badge>
                  </div>
                  {incident.asset.location && (
                    <p className="text-muted-foreground text-[11px]">
                      Location: {incident.asset.location}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground italic">No asset linked to this incident.</p>
              )}
            </CardContent>
          </Card>

          {/* Related Work Order Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Wrench className="h-4 w-4 text-primary" /> Associated Work Order
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs">
              {incident.workOrder ? (
                <div className="p-3 border rounded-lg bg-card space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-primary">
                      {incident.workOrder.workOrderNumber}
                    </span>
                    <Badge variant="secondary">{incident.workOrder.status}</Badge>
                  </div>
                  <p className="font-medium text-foreground">{incident.workOrder.title}</p>
                  <Button variant="outline" size="sm" className="w-full text-xs mt-2" asChild>
                    <Link href={`/dashboard/work-orders?id=${incident.workOrder.id}`}>
                      View Work Order Details
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center p-4 border border-dashed rounded-lg space-y-2">
                  <p className="text-muted-foreground">No Work Order generated yet.</p>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setWoDialogOpen(true)}
                  >
                    <Wrench className="mr-1.5 h-3.5 w-3.5" /> Create Work Order
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
