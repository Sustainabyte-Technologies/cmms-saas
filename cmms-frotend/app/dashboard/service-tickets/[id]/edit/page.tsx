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
  fetchServiceTicketById,
  updateServiceTicket,
  TicketCategory,
  TicketPriority,
} from "@/lib/api/service-tickets-api";
import { fetchUsers, User } from "@/lib/api/users-api";
import { ArrowLeft, Save, Ticket, Clock } from "lucide-react";

export default function EditServiceTicketPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TicketCategory>("MAINTENANCE");
  const [priority, setPriority] = useState<TicketPriority>("MEDIUM");
  const [requestDate, setRequestDate] = useState("");
  const [location, setLocation] = useState("");
  const [assignedToId, setAssignedToId] = useState("");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [ticket, uRes] = await Promise.all([
          fetchServiceTicketById(id),
          fetchUsers({ limit: 1000 }),
        ]);

        const fetchedUsers = uRes?.data || uRes?.users || (Array.isArray(uRes) ? uRes : []);
        setUsers(fetchedUsers);

        setTitle(ticket.title);
        setDescription(ticket.description);
        setCategory(ticket.category);
        setPriority(ticket.priority);
        setRequestDate(new Date(ticket.requestDate).toISOString().slice(0, 16));
        setLocation(ticket.location);
        setAssignedToId(ticket.assignedToId || "");
        setRemarks(ticket.remarks || "");
      } catch (error: any) {
        toast.error(error.message || "Failed to load service ticket");
      } finally {
        setLoading(false);
      }
    }
    if (id) loadData();
  }, [id]);

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
    setSubmitting(true);
    try {
      await updateServiceTicket(id, {
        title,
        description,
        category,
        priority,
        requestDate: new Date(requestDate).toISOString(),
        location,
        assignedToId: assignedToId || undefined,
        remarks: remarks || undefined,
      });

      toast.success("Service ticket updated successfully!");
      router.push(`/dashboard/service-tickets/${id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to update service ticket");
    } finally {
      setSubmitting(false);
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="Edit Service Ticket"
        description="Update ticket category, priority, description, or assigned personnel."
      >
        <Button variant="outline" asChild>
          <Link href={`/dashboard/service-tickets/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Cancel & View
          </Link>
        </Button>
      </PageHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Ticket className="h-5 w-5 text-primary" /> General Information
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
              <Label htmlFor="category">Category</Label>
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
              <Label htmlFor="priority">Priority</Label>
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
              <Label htmlFor="requestDate">Request Date & Time</Label>
              <Input
                id="requestDate"
                type="datetime-local"
                value={requestDate}
                onChange={(e) => setRequestDate(e.target.value)}
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
            <CardTitle className="text-base font-semibold">Personnel & Remarks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="assignedTo">Assigned To</Label>
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
            <Link href={`/dashboard/service-tickets/${id}`}>Cancel</Link>
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
