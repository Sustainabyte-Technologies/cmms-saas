"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { createIncident, IncidentType, IncidentSeverity } from "@/lib/api/incidents-api";
import { getCustomers, getSites, getDepartments, Customer, Site, Department } from "@/lib/api/customers-api";
import { fetchAssets, Asset } from "@/lib/api/assets-api";
import { fetchUsers, User } from "@/lib/api/users-api";
import { ArrowLeft, Save, ShieldAlert, Paperclip, Upload } from "lucide-react";

export default function CreateIncidentPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // Master Data State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [incidentType, setIncidentType] = useState<IncidentType>("SAFETY");
  const [severity, setSeverity] = useState<IncidentSeverity>("MEDIUM");
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().slice(0, 16));
  const [location, setLocation] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [siteId, setSiteId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [assetId, setAssetId] = useState("");
  const [reportedById, setReportedById] = useState("");
  const [assignedToId, setAssignedToId] = useState("");
  const [rootCause, setRootCause] = useState("");
  const [correctiveAction, setCorrectiveAction] = useState("");
  const [preventiveAction, setPreventiveAction] = useState("");
  const [remarks, setRemarks] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  useEffect(() => {
    async function loadFormMasterData() {
      try {
        const [cList, sList, dList, aRes, uRes] = await Promise.all([
          getCustomers(),
          getSites(),
          getDepartments(),
          fetchAssets(1, 100),
          fetchUsers({ limit: 1000 }),
        ]);

        const fetchedUsers = uRes?.data || uRes?.users || (Array.isArray(uRes) ? uRes : []);
        setCustomers(cList || []);
        setSites(sList || []);
        setDepartments(dList || []);
        setAssets(aRes?.data || (Array.isArray(aRes) ? aRes : []));
        setUsers(fetchedUsers);

        if (cList?.length > 0) setCustomerId(cList[0].id);
        if (sList?.length > 0) setSiteId(sList[0].id);
        if (dList?.length > 0) setDepartmentId(dList[0].id);
        if (fetchedUsers.length > 0) {
          setReportedById(fetchedUsers[0].id);
        }
      } catch (error) {
        console.error("Failed to load master data for incident form:", error);
      }
    }
    loadFormMasterData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachedFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Incident Title is required");
      return;
    }
    if (!description.trim()) {
      toast.error("Description is required");
      return;
    }
    if (!location.trim()) {
      toast.error("Location is required");
      return;
    }
    if (!customerId || !siteId || !departmentId) {
      toast.error("Customer, Site, and Department selections are required");
      return;
    }
    if (!reportedById) {
      toast.error("Reported By user selection is required");
      return;
    }

    setSubmitting(true);
    try {
      const incident = await createIncident({
        title,
        description,
        incidentType,
        severity,
        incidentDate: new Date(incidentDate).toISOString(),
        location,
        customerId,
        siteId,
        departmentId,
        reportedById,
        assignedToId: assignedToId || undefined,
        assetId: assetId || undefined,
        rootCause: rootCause || undefined,
        correctiveAction: correctiveAction || undefined,
        preventiveAction: preventiveAction || undefined,
        remarks: remarks || undefined,
      });

      toast.success(`Incident ${incident.incidentNumber} logged successfully`);
      router.push(`/dashboard/incidents/${incident.id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create incident");
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="Log New Incident"
        description="Create a comprehensive incident report for investigation and corrective tracking."
      >
        <Button variant="outline" asChild>
          <Link href="/dashboard/incidents">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Incidents
          </Link>
        </Button>
      </PageHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary" />
              General Incident Details
            </CardTitle>
            <CardDescription>Specify the primary details regarding the incident event.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="title">Incident Title *</Label>
              <Input
                id="title"
                placeholder="e.g. Chemical Spill near Hydraulic Station 4"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="incidentType">Incident Type *</Label>
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
              <Label htmlFor="severity">Severity Level *</Label>
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
              <Label htmlFor="incidentDate">Incident Date & Time *</Label>
              <Input
                id="incidentDate"
                type="datetime-local"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="location">Exact Location *</Label>
              <Input
                id="location"
                placeholder="e.g. Building B, Floor 2, Maintenance Bay"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="description">Incident Description *</Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Provide detailed description of what happened, environmental impact, injuries, or operational disruption..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Organizational Context & Asset */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Location & Asset Assignment</CardTitle>
            <CardDescription>Associate the incident with your organizational structure and assets.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="customer">Customer / Organization Unit *</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger id="customer">
                  <SelectValue placeholder="Select Customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="site">Site *</Label>
              <Select value={siteId} onValueChange={setSiteId}>
                <SelectTrigger id="site">
                  <SelectValue placeholder="Select Site" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="department">Department *</Label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="asset">Related Asset (Optional)</Label>
              <Select value={assetId || "NONE"} onValueChange={(val) => setAssetId(val === "NONE" ? "" : val)}>
                <SelectTrigger id="asset">
                  <SelectValue placeholder="Select Asset if applicable" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">None</SelectItem>
                  {assets.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.assetName} ({a.assetCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stakeholders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Personnel & Investigation</CardTitle>
            <CardDescription>Assign reporters and responsible investigators.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="reportedBy">Reported By *</Label>
              <Select value={reportedById} onValueChange={setReportedById}>
                <SelectTrigger id="reportedBy">
                  <SelectValue placeholder="Select Reporter" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.fullName} ({getUserRoleLabel(u)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="assignedTo">Assign Investigator (Optional)</Label>
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
          </CardContent>
        </Card>

        {/* Analysis & Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Initial Root Cause & Actions</CardTitle>
            <CardDescription>Record preliminary analysis findings and corrective measures.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="rootCause">Root Cause Analysis</Label>
              <Textarea
                id="rootCause"
                rows={2}
                placeholder="Identified root cause or contributing factors..."
                value={rootCause}
                onChange={(e) => setRootCause(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="correctiveAction">Immediate Corrective Action</Label>
              <Textarea
                id="correctiveAction"
                rows={2}
                placeholder="Immediate steps taken to mitigate harm or secure area..."
                value={correctiveAction}
                onChange={(e) => setCorrectiveAction(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="preventiveAction">Preventive Action Plan</Label>
              <Textarea
                id="preventiveAction"
                rows={2}
                placeholder="Long-term actions to prevent recurrence..."
                value={preventiveAction}
                onChange={(e) => setPreventiveAction(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="remarks">Additional Remarks</Label>
              <Input
                id="remarks"
                placeholder="Any special notes or observations..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>

            {/* File Upload */}
            <div className="space-y-2 border-t pt-4">
              <Label className="flex items-center gap-1.5">
                <Paperclip className="h-4 w-4 text-primary" /> Attachment Upload
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="max-w-md cursor-pointer"
                />
                {attachedFiles.length > 0 && (
                  <span className="text-xs text-muted-foreground font-medium">
                    {attachedFiles.length} file(s) selected
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" asChild type="button">
            <Link href="/dashboard/incidents">Cancel</Link>
          </Button>
          <Button type="submit" disabled={submitting}>
            <Save className="mr-2 h-4 w-4" />
            {submitting ? "Saving Incident..." : "Submit Incident Report"}
          </Button>
        </div>
      </form>
    </div>
  );
}
