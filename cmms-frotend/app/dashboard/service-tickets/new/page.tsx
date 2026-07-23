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
import {
  createServiceTicket,
  TicketCategory,
  TicketPriority,
} from "@/lib/api/service-tickets-api";
import { getCustomers, getSites, getDepartments, Customer, Site, Department } from "@/lib/api/customers-api";
import { fetchAssets, Asset } from "@/lib/api/assets-api";
import { fetchUsers, User } from "@/lib/api/users-api";
import { ArrowLeft, Save, Ticket, Paperclip } from "lucide-react";

export default function CreateServiceTicketPage() {
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
  const [category, setCategory] = useState<TicketCategory>("MAINTENANCE");
  const [priority, setPriority] = useState<TicketPriority>("MEDIUM");
  const [requestDate, setRequestDate] = useState(new Date().toISOString().slice(0, 16));
  const [location, setLocation] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [siteId, setSiteId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [assetId, setAssetId] = useState("");
  const [requestedById, setRequestedById] = useState("");
  const [assignedToId, setAssignedToId] = useState("");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    async function loadFormMasterData() {
      try {
        const [cList, sList, dList, aRes, uRes] = await Promise.all([
          getCustomers(),
          getSites(),
          getDepartments(),
          fetchAssets(),
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
          setRequestedById(fetchedUsers[0].id);
        }
      } catch (error) {
        console.error("Failed to load master data for ticket form:", error);
      }
    }
    loadFormMasterData();
  }, []);

  const getUserRoleLabel = (u: any) => {
    const raw = u.roleName || (typeof u.role === 'object' ? u.role?.name : u.role) || '';
    if (!raw) return 'User';
    return raw
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c: string) => c.toUpperCase());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Ticket Title is required");
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
    if (!requestedById) {
      toast.error("Requested By selection is required");
      return;
    }

    setSubmitting(true);
    try {
      const ticket = await createServiceTicket({
        title,
        description,
        category,
        priority,
        requestDate: new Date(requestDate).toISOString(),
        location,
        customerId,
        siteId,
        departmentId,
        requestedById,
        assignedToId: assignedToId || undefined,
        assetId: assetId || undefined,
        remarks: remarks || undefined,
      });

      toast.success(`Service Ticket ${ticket.ticketNumber} logged successfully`);
      router.push(`/dashboard/service-tickets/${ticket.id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create service ticket");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="Log New Service Ticket"
        description="Raise a maintenance, housekeeping, IT, or facility request for prompt action."
      >
        <Button variant="outline" asChild>
          <Link href="/dashboard/service-tickets">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Service Tickets
          </Link>
        </Button>
      </PageHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Ticket className="h-5 w-5 text-primary" />
              General Request Details
            </CardTitle>
            <CardDescription>Enter the primary information for the service request.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="title">Ticket Title *</Label>
              <Input
                id="title"
                placeholder="e.g. AC Cooling Insufficient in Meeting Room 3"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="category">Request Category *</Label>
              <Select value={category} onValueChange={(val) => setCategory(val as TicketCategory)}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  <SelectItem value="ELECTRICAL">Electrical</SelectItem>
                  <SelectItem value="MECHANICAL">Mechanical</SelectItem>
                  <SelectItem value="HVAC">HVAC</SelectItem>
                  <SelectItem value="PLUMBING">Plumbing</SelectItem>
                  <SelectItem value="HOUSEKEEPING">Housekeeping</SelectItem>
                  <SelectItem value="IT_SUPPORT">IT Support</SelectItem>
                  <SelectItem value="GENERAL_REQUEST">General Request</SelectItem>
                  <SelectItem value="FACILITY">Facility</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="priority">Priority Level *</Label>
              <Select value={priority} onValueChange={(val) => setPriority(val as TicketPriority)}>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="requestDate">Request Date & Time *</Label>
              <Input
                id="requestDate"
                type="datetime-local"
                value={requestDate}
                onChange={(e) => setRequestDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="location">Exact Location *</Label>
              <Input
                id="location"
                placeholder="e.g. Main Administrative Block, Floor 2"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="description">Request Description *</Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Describe the issue or service request in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Location & Asset Assignment */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Organizational Unit & Asset</CardTitle>
            <CardDescription>Associate the service ticket with your organization structure and equipment.</CardDescription>
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
            <CardTitle className="text-base font-semibold">Personnel & Assignment</CardTitle>
            <CardDescription>Select the requester and optionally assign a responsible technician or manager.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="requestedBy">Requested By *</Label>
              <Select value={requestedById} onValueChange={setRequestedById}>
                <SelectTrigger id="requestedBy">
                  <SelectValue placeholder="Select Requester" />
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
              <Label htmlFor="assignedTo">Assign To (Optional)</Label>
              <Select value={assignedToId || "NONE"} onValueChange={(val) => setAssignedToId(val === "NONE" ? "" : val)}>
                <SelectTrigger id="assignedTo">
                  <SelectValue placeholder="Select Assignee" />
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

            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="remarks">Remarks / Special Instructions</Label>
              <Input
                id="remarks"
                placeholder="Additional notes or timing constraints..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" asChild type="button">
            <Link href="/dashboard/service-tickets">Cancel</Link>
          </Button>
          <Button type="submit" disabled={submitting}>
            <Save className="mr-2 h-4 w-4" />
            {submitting ? "Saving Service Ticket..." : "Submit Service Ticket"}
          </Button>
        </div>
      </form>
    </div>
  );
}
