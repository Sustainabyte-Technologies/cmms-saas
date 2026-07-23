"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/ui-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  updateIncident,
  IncidentType,
  IncidentSeverity,
} from "@/lib/api/incidents-api";
import { fetchUsers, User } from "@/lib/api/users-api";
import { ArrowLeft, Save, ShieldAlert, Clock } from "lucide-react";

export default function EditIncidentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [incidentType, setIncidentType] = useState<IncidentType>("SAFETY");
  const [severity, setSeverity] = useState<IncidentSeverity>("MEDIUM");
  const [incidentDate, setIncidentDate] = useState("");
  const [location, setLocation] = useState("");
  const [assignedToId, setAssignedToId] = useState("");
  const [rootCause, setRootCause] = useState("");
  const [correctiveAction, setCorrectiveAction] = useState("");
  const [preventiveAction, setPreventiveAction] = useState("");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [inc, uRes] = await Promise.all([
          fetchIncidentById(id),
          fetchUsers({ limit: 1000 }),
        ]);

        const fetchedUsers = uRes?.data || uRes?.users || (Array.isArray(uRes) ? uRes : []);
        setUsers(fetchedUsers);
        setTitle(inc.title);
        setDescription(inc.description);
        setIncidentType(inc.incidentType);
        setSeverity(inc.severity);
        setIncidentDate(new Date(inc.incidentDate).toISOString().slice(0, 16));
        setLocation(inc.location);
        setAssignedToId(inc.assignedToId || "");
        setRootCause(inc.rootCause || "");
        setCorrectiveAction(inc.correctiveAction || "");
        setPreventiveAction(inc.preventiveAction || "");
        setRemarks(inc.remarks || "");
      } catch (error: any) {
        toast.error(error.message || "Failed to load incident");
      } finally {
        setLoading(false);
      }
    }
    if (id) loadData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateIncident(id, {
        title,
        description,
        incidentType,
        severity,
        incidentDate: new Date(incidentDate).toISOString(),
        location,
        assignedToId: assignedToId || undefined,
        rootCause: rootCause || undefined,
        correctiveAction: correctiveAction || undefined,
        preventiveAction: preventiveAction || undefined,
        remarks: remarks || undefined,
      });

      toast.success("Incident updated successfully!");
      router.push(`/dashboard/incidents/${id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to update incident");
    } finally {
      setSubmitting(false);
    }
  };

  const getUserRoleLabel = (u: any) => {
    const raw = u.roleName || (typeof u.role === 'object' ? u.role?.name : u.role) || '';
    if (!raw) return 'User';
    return raw
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c: string) => c.toUpperCase());
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-2">
        <Clock className="h-8 w-8 animate-spin text-primary" />
        Loading incident details...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="Edit Incident Report"
        description="Update incident information, root cause, or corrective actions."
      >
        <Button variant="outline" asChild>
          <Link href={`/dashboard/incidents/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Cancel & View
          </Link>
        </Button>
      </PageHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary" /> General Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="incidentType">Incident Type</Label>
              <Select value={incidentType} onValueChange={(val) => setIncidentType(val as IncidentType)}>
                <SelectTrigger id="incidentType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SAFETY">Safety</SelectItem>
                  <SelectItem value="ENVIRONMENTAL">Environmental</SelectItem>
                  <SelectItem value="SECURITY">Security</SelectItem>
                  <SelectItem value="OPERATIONAL">Operational</SelectItem>
                  <SelectItem value="FIRE">Fire</SelectItem>
                  <SelectItem value="CHEMICAL">Chemical</SelectItem>
                  <SelectItem value="NEAR_MISS">Near Miss</SelectItem>
                  <SelectItem value="ELECTRICAL">Electrical</SelectItem>
                  <SelectItem value="PROPERTY_DAMAGE">Property Damage</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="severity">Severity</Label>
              <Select value={severity} onValueChange={(val) => setSeverity(val as IncidentSeverity)}>
                <SelectTrigger id="severity">
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
              <Label htmlFor="incidentDate">Incident Date & Time</Label>
              <Input
                id="incidentDate"
                type="datetime-local"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Investigator & Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="assignedTo">Assigned Investigator</Label>
              <Select value={assignedToId || "NONE"} onValueChange={(val) => setAssignedToId(val === "NONE" ? "" : val)}>
                <SelectTrigger id="assignedTo">
                  <SelectValue placeholder="Select Investigator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">Unassigned</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.fullName} — {getUserRoleLabel(u)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rootCause">Root Cause Analysis</Label>
              <Textarea
                id="rootCause"
                rows={2}
                value={rootCause}
                onChange={(e) => setRootCause(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="correctiveAction">Corrective Action</Label>
              <Textarea
                id="correctiveAction"
                rows={2}
                value={correctiveAction}
                onChange={(e) => setCorrectiveAction(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="preventiveAction">Preventive Action Plan</Label>
              <Textarea
                id="preventiveAction"
                rows={2}
                value={preventiveAction}
                onChange={(e) => setPreventiveAction(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="remarks">Remarks</Label>
              <Input
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" asChild type="button">
            <Link href={`/dashboard/incidents/${id}`}>Cancel</Link>
          </Button>
          <Button type="submit" disabled={submitting}>
            <Save className="mr-2 h-4 w-4" />
            {submitting ? "Saving Changes..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
