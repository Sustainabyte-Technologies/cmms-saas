"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { PageHeader, StatusBadge } from "@/components/shared/ui-components";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  ClipboardList,
  Eye,
  Edit,
  Trash2,
  ListChecks,
  CircleCheck,
  CheckCircle,
  Calendar,
  User,
  Clock,
  Send,
  Paperclip,
  Smile,
  Users,
  ChevronLeft,
  Wrench,
  Check,
  TrendingUp,
  MessageSquare,
  FileText,
  DollarSign,
  AlertTriangle,
  ChevronRight,
  FolderSync,
  Activity,
  Play,
  UserCheck,
  Loader2,
  Upload,
  X,
  ImageIcon
} from "lucide-react";
import {
  assignWorkOrderTechnician,
  createChecklistTemplate,
  createChecklistTemplateItem,
  createWorkOrder,
  deleteWorkOrder,
  fetchWorkOrderById,
  fetchWorkOrders,
  updateWorkOrder,
  fetchChecklistTemplates,
  deleteChecklistTemplate,
  type ApiWorkOrderPriority,
  type ApiWorkOrderType,
  type CreateWorkOrderPayload,
  type WorkOrderResponse,
  type ChecklistTemplate,
  type WorkOrderAttachment,
  uploadWorkOrderAttachment,
  fetchWorkOrderAttachments,
  type WorkOrderAsset,
} from "@/lib/api/work-orders-api";
import { fetchAssets, type Asset } from "@/lib/api/assets-api";
import { fetchUsers, fetchTechnicianWorkload } from "@/lib/api/users-api";

// Detailed interface definitions
interface ActivityItem {
  id: string;
  type: "created" | "assigned" | "accepted" | "status_change" | "comment";
  title: string;
  description: string;
  user: string;
  time: string;
}

interface ChatMessage {
  id: string;
  sender: string;
  avatar: string;
  time: string;
  message: string;
  isMe: boolean;
}

interface PartCost {
  name: string;
  qty: number;
  cost: number;
}

interface ChecklistItem {
  id: string;
  title: string;
  isRequired: boolean;
  sortOrder: number;
}

interface WorkOrderChecklist {
  id: string;
  name: string;
  description?: string;
  items: ChecklistItem[];
}

interface WorkOrder {
  backendId?: string;
  id: string;
  title: string;
  status: "open" | "in_progress" | "on_hold" | "completed" | "overdue";
  priority: "critical" | "high" | "medium" | "low";
  asset: string;
  location: string;
  assignedTo: {
    name: string;
    role: string;
    avatar: string;
    initials: string;
  };
  dueDate: string;
  dueWarning?: string;
  createdBy: {
    name: string;
    date: string;
    avatar: string;
    initials: string;
  };
  workType: string;
  description: string;
  activities: ActivityItem[];
  chat: ChatMessage[];
  parts: PartCost[];
  checklist?: WorkOrderChecklist | null;
  assignedTechnicianId?: string | null;
  checklistTemplateId?: string | null;
  estimatedHours?: number | null;
  attachments?: WorkOrderAttachment[];
  assetDetails?: WorkOrderAsset | null;
}

interface TechnicianOption {
  id: string;
  name: string;
  activeWorkOrders?: number;
}

interface ChecklistTemplateItemForm {
  title: string;
  isRequired: boolean;
  sortOrder: string;
}
const formatDate = (date?: string | null) => {
  if (!date) return "Not scheduled";

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getInitials = (name?: string | null) => {
  if (!name) return "NA";

  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const toUiStatus = (status?: string): WorkOrder["status"] => {
  switch (status) {
    case "IN_PROGRESS":
    case "ACCEPTED":
      return "in_progress";
    case "ON_HOLD":
      return "on_hold";
    case "COMPLETED":
    case "CLOSED":
      return "completed";
    default:
      return "open";
  }
};

const toUiPriority = (priority?: string): WorkOrder["priority"] => {
  switch (priority) {
    case "CRITICAL":
      return "critical";
    case "HIGH":
      return "high";
    case "LOW":
      return "low";
    default:
      return "medium";
  }
};

const toApiPriority = (priority: WorkOrder["priority"]): ApiWorkOrderPriority =>
  priority.toUpperCase() as ApiWorkOrderPriority;

const toApiWorkType = (workType: string): ApiWorkOrderType => {
  const normalized = workType.toUpperCase();

  if (normalized === "CORRECTIVE") return "REACTIVE";
  if (["REACTIVE", "PREVENTIVE", "BREAKDOWN", "INSPECTION"].includes(normalized)) {
    return normalized as ApiWorkOrderType;
  }

  return "REACTIVE";
};

const toTitleCase = (value?: string | null) => {
  if (!value) return "Reactive";

  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const mapApiWorkOrder = (apiWorkOrder: WorkOrderResponse): WorkOrder => {
  const assignedName = apiWorkOrder.assignedTechnician?.fullName || "Unassigned";
  const createdByName = apiWorkOrder.createdBy?.fullName || "System";

  return {
    backendId: apiWorkOrder.id,
    id: apiWorkOrder.workOrderNumber || apiWorkOrder.id,
    title: apiWorkOrder.title,
    status: toUiStatus(apiWorkOrder.status),
    priority: toUiPriority(apiWorkOrder.priority),
    asset: apiWorkOrder.asset?.assetName || "No asset linked",
    location: apiWorkOrder.location || apiWorkOrder.asset?.location || "Location not set",
    assignedTo: {
      name: assignedName,
      role: apiWorkOrder.assignedTechnician ? "Technician" : "Not assigned",
      avatar: "",
      initials: getInitials(assignedName),
    },
    dueDate: formatDate(apiWorkOrder.dueDate),
    createdBy: {
      name: createdByName,
      date: formatDate(apiWorkOrder.createdAt),
      avatar: "",
      initials: getInitials(createdByName),
    },
    workType: toTitleCase(apiWorkOrder.workType),
    description: apiWorkOrder.description || "No description provided.",
    activities: (apiWorkOrder.activities || []).map((activity) => ({
      id: activity.id,
      type: activity.action === "WORK_ORDER_CREATED" ? "created" : "status_change",
      title: toTitleCase(activity.action),
      description: activity.remarks || "Work order activity",
      user: activity.performedBy?.fullName || "System",
      time: new Date(activity.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }),
    })),
    chat: (apiWorkOrder.comments || []).map((comment) => ({
      id: comment.id,
      sender: comment.createdBy?.fullName || "System",
      avatar: getInitials(comment.createdBy?.fullName),
      time: new Date(comment.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      message: comment.comment,
      isMe: false,
    })),
    parts: [],
    checklist: apiWorkOrder.checklistTemplate
      ? {
        id: apiWorkOrder.checklistTemplate.id,
        name: apiWorkOrder.checklistTemplate.name,
        description: apiWorkOrder.checklistTemplate.description,
        items: (apiWorkOrder.checklistTemplate.items || []).map((item: any) => ({
          id: item.id,
          title: item.title,
          isRequired: item.isRequired ?? false,
          sortOrder: item.sortOrder ?? 0,
        })),
      }
      : null,
    assignedTechnicianId: apiWorkOrder.assignedTechnicianId || null,
    checklistTemplateId: apiWorkOrder.checklistTemplate?.id || null,
    estimatedHours: apiWorkOrder.estimatedHours || null,
    attachments: (apiWorkOrder as any).attachments || [],
    assetDetails: apiWorkOrder.asset || null,
  };
};

export default function WorkOrdersPage() {
  const [listMode, setListMode] = useState<"work-orders" | "checklists">("work-orders");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [isDeletingTemplate, setIsDeletingTemplate] = useState<boolean>(false);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [selectedWOId, setSelectedWOId] = useState<string | null>(null);
  const [isLoadingWorkOrders, setIsLoadingWorkOrders] = useState<boolean>(true);
  const [workOrdersError, setWorkOrdersError] = useState<string | null>(null);
  const [isCreatingWorkOrder, setIsCreatingWorkOrder] = useState<boolean>(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [technicians, setTechnicians] = useState<TechnicianOption[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);
  const [isUpdatingWorkOrder, setIsUpdatingWorkOrder] = useState(false);
  const [isAssigningTechnician, setIsAssigningTechnician] = useState(false);
  const [isDeletingWorkOrder, setIsDeletingWorkOrder] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [middleTab, setMiddleTab] = useState<string>("details");
  const [chatMessageText, setChatMessageText] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);
  const itemsPerPage = 5;

  // New Work Order Form State
  const [newWODialogOpen, setNewWODialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newAsset, setNewAsset] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newPriority, setNewPriority] = useState<"critical" | "high" | "medium" | "low">("medium");
  const [newWorkType, setNewWorkType] = useState("BREAKDOWN");
  const [newAssignee, setNewAssignee] = useState("");
  const [newEstimatedHours, setNewEstimatedHours] = useState("4");
  const [newChecklistTemplateId, setNewChecklistTemplateId] = useState("");
  const [newAttachmentFile, setNewAttachmentFile] = useState<File | null>(null);
  const [newAttachmentType, setNewAttachmentType] = useState<string>("BEFORE_PHOTO");
  const [checklistTemplates, setChecklistTemplates] = useState<ChecklistTemplate[]>([]);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [templateItems, setTemplateItems] = useState<ChecklistTemplateItemForm[]>([
    { title: "", isRequired: true, sortOrder: "1" },
  ]);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editAsset, setEditAsset] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editPriority, setEditPriority] = useState<"critical" | "high" | "medium" | "low">("medium");
  const [editWorkType, setEditWorkType] = useState("BREAKDOWN");
  const [editEstimatedHours, setEditEstimatedHours] = useState("4");
  const [editAssignee, setEditAssignee] = useState("");
  const [editChecklistTemplateId, setEditChecklistTemplateId] = useState("");
  const [assignTechnicianId, setAssignTechnicianId] = useState("");
  const [editAttachmentFile, setEditAttachmentFile] = useState<File | null>(null);
  const [editAttachmentType, setEditAttachmentType] = useState<string>("BEFORE_PHOTO");
  const [selectedAttachmentFile, setSelectedAttachmentFile] = useState<File | null>(null);
  const [selectedAttachmentType, setSelectedAttachmentType] = useState<string>("BEFORE_PHOTO");
  const [isUploadingAttachment, setIsUploadingAttachment] = useState<boolean>(false);

  const editFileInputRef = useRef<HTMLInputElement>(null);
  const newFileInputRef = useRef<HTMLInputElement>(null);
  const [editAttachmentPreviewUrl, setEditAttachmentPreviewUrl] = useState<string | null>(null);
  const [newAttachmentPreviewUrl, setNewAttachmentPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (editAttachmentFile) {
      if (editAttachmentFile.type.startsWith("image/")) {
        const url = URL.createObjectURL(editAttachmentFile);
        setEditAttachmentPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
      } else {
        setEditAttachmentPreviewUrl(null);
      }
    } else {
      setEditAttachmentPreviewUrl(null);
    }
  }, [editAttachmentFile]);

  useEffect(() => {
    if (newAttachmentFile) {
      if (newAttachmentFile.type.startsWith("image/")) {
        const url = URL.createObjectURL(newAttachmentFile);
        setNewAttachmentPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
      } else {
        setNewAttachmentPreviewUrl(null);
      }
    }
  }, [newAttachmentFile]);

  useEffect(() => {
    if (newWODialogOpen) {
      setNewTitle("");
      setNewDescription("");
      setNewAsset("");
      setNewLocation("");
      setNewPriority("medium");
      setNewWorkType("BREAKDOWN");
      setNewAssignee("");
      setNewEstimatedHours("4");
      setNewChecklistTemplateId("");
      setNewAttachmentFile(null);
      setNewAttachmentType("BEFORE_PHOTO");
    }
  }, [newWODialogOpen]);

  const handleUploadAttachment = async () => {
    if (!selectedWO || !selectedWO.backendId) {
      toast.error("No active work order found on the server");
      return;
    }
    if (!selectedAttachmentFile) {
      toast.error("Please select a file to upload");
      return;
    }

    try {
      setIsUploadingAttachment(true);
      const newAttachment = await uploadWorkOrderAttachment(
        selectedWO.backendId,
        selectedAttachmentFile,
        selectedAttachmentType
      );

      // Update work orders state
      setWorkOrders((prev) =>
        prev.map((wo) => {
          const key = wo.backendId || wo.id;
          const targetKey = selectedWO.backendId || selectedWO.id;
          if (key === targetKey) {
            return {
              ...wo,
              attachments: [newAttachment, ...(wo.attachments || [])],
            };
          }
          return wo;
        })
      );

      // Reset file selection
      setSelectedAttachmentFile(null);
      toast.success("Attachment uploaded successfully");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to upload attachment";
      toast.error(msg);
    } finally {
      setIsUploadingAttachment(false);
    }
  };

  const loadWorkOrders = async () => {
    try {
      setIsLoadingWorkOrders(true);
      setWorkOrdersError(null);

      let apiStatus: string | undefined = undefined;
      if (activeTab === "open") apiStatus = "OPEN";
      else if (activeTab === "in_progress") apiStatus = "IN_PROGRESS";
      else if (activeTab === "completed") apiStatus = "COMPLETED";

      const apiPriority = priorityFilter === "all" ? undefined : priorityFilter.toUpperCase();

      const response = await fetchWorkOrders({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchQuery || undefined,
        status: apiStatus,
        priority: apiPriority,
      });

      const mappedWorkOrders = response.workOrders.map(mapApiWorkOrder);

      setWorkOrders(mappedWorkOrders);

      if (response.pagination) {
        setTotalPages(response.pagination.totalPages || 1);
        setTotalItems(response.pagination.total || 0);
      } else {
        setTotalPages(1);
        setTotalItems(mappedWorkOrders.length);
      }

      if (mappedWorkOrders.length > 0) {
        const stillExists = selectedWOId && mappedWorkOrders.some((wo) => (wo.backendId || wo.id) === selectedWOId);
        const targetId = stillExists ? selectedWOId : (mappedWorkOrders[0].backendId || mappedWorkOrders[0].id);
        setSelectedWOId(targetId);

        // Fetch details for the selected work order
        const targetWO = mappedWorkOrders.find((wo) => (wo.backendId || wo.id) === targetId);
        if (targetWO?.backendId) {
          try {
            setIsLoadingDetails(true);
            const fullWO = await fetchWorkOrderById(targetWO.backendId);
            const fullMapped = mapApiWorkOrder(fullWO);
            setWorkOrders((prev) =>
              prev.map((wo) => ((wo.backendId || wo.id) === targetId ? fullMapped : wo))
            );
          } catch (err) {
            console.error("Error loading work order details:", err);
          } finally {
            setIsLoadingDetails(false);
          }
        }
      } else {
        setSelectedWOId(null);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load work orders";
      setWorkOrdersError(message);
      console.error("Error loading work orders:", error);
    } finally {
      setIsLoadingWorkOrders(false);
    }
  };

  const loadCreateOptions = async () => {
    try {
      const [assetData, userData, workloadData, templatesData] = await Promise.all([
        fetchAssets(1, 1000),
        fetchUsers(),
        fetchTechnicianWorkload(),
        fetchChecklistTemplates(),
      ]);

      setAssets(assetData.data || []);
      setChecklistTemplates(templatesData);

      // Extract users array from API response (handle both array and object responses)
      const usersArray = Array.isArray(userData) ? userData : (userData?.data as any[]) || [];

      // Create a workload map for quick lookup
      const workloadMap = new Map(
        workloadData.map((tech: any) => [tech.id, tech.activeWorkOrders])
      );

      setTechnicians(
        usersArray
          .filter((user: any) => String(user.roleName || user.role?.name || "").toUpperCase() === "TECHNICIAN")
          .map((user: any) => ({
            id: user.id,
            name: user.fullName || user.name || user.email || user.id,
            activeWorkOrders: workloadMap.get(user.id) || 0,
          }))
      );
    } catch (error) {
      console.error("Error loading work order form options:", error);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  useEffect(() => {
    loadWorkOrders();
  }, [currentPage, debouncedSearchQuery, activeTab, priorityFilter]);

  useEffect(() => {
    loadCreateOptions();
  }, []);

  // Selected work order details
  const selectedWO = selectedWOId
    ? workOrders.find((wo) => (wo.backendId || wo.id) === selectedWOId) || null
    : null;

  const filteredTemplates = checklistTemplates.filter((template) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      template.name.toLowerCase().includes(query) ||
      (template.description || "").toLowerCase().includes(query)
    );
  });

  const selectedTemplate = selectedTemplateId
    ? checklistTemplates.find((t) => t.id === selectedTemplateId) || null
    : null;

  useEffect(() => {
    if (listMode === "checklists" && !selectedTemplateId && filteredTemplates.length > 0) {
      setSelectedTemplateId(filteredTemplates[0].id);
    }
  }, [listMode, selectedTemplateId, filteredTemplates]);

  // Stats Calculations
  const stats = {
    open: workOrders.filter((wo) => wo.status === "open").length,
    inProgress: workOrders.filter((wo) => wo.status === "in_progress").length,
    onHold: workOrders.filter((wo) => wo.status === "on_hold").length,
    completed: workOrders.filter((wo) => wo.status === "completed").length,
    overdue: workOrders.filter((wo) => wo.status === "overdue").length,
  };

  // Filter logic: Handled server-side.
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedWorkOrders = workOrders;

  const handleSelectWorkOrder = async (workOrder: WorkOrder) => {
    const id = workOrder.backendId || workOrder.id;

    // Immediately show the already-loaded data (no delay)
    setSelectedWOId(id);

    // Then refresh in the background for latest data
    if (!workOrder.backendId) return;

    try {
      setIsLoadingDetails(true);
      const apiWorkOrder = await fetchWorkOrderById(workOrder.backendId);
      const mappedWorkOrder = mapApiWorkOrder(apiWorkOrder);

      setWorkOrders((prev) =>
        prev.map((wo) => ((wo.backendId || wo.id) === id ? mappedWorkOrder : wo))
      );
    } catch (error) {
      console.error("Error loading work order details:", error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleOpenEditDialog = () => {
    if (!selectedWO) return;
    setEditTitle(selectedWO.title);
    setEditDescription(selectedWO.description);
    setEditAsset("");
    setEditLocation(selectedWO.location);
    setEditPriority(selectedWO.priority);
    setEditWorkType(toApiWorkType(selectedWO.workType));
    setEditEstimatedHours(selectedWO.estimatedHours ? String(selectedWO.estimatedHours) : "4");
    setEditAssignee(selectedWO.assignedTechnicianId || "");
    setEditChecklistTemplateId(selectedWO.checklistTemplateId || "");
    setEditAttachmentFile(null);
    setEditAttachmentType("BEFORE_PHOTO");
    setEditDialogOpen(true);
  };

  const handleOpenAssignDialog = () => {
    setAssignTechnicianId("");
    setAssignDialogOpen(true);
  };

  const replaceWorkOrder = (updatedWorkOrder: WorkOrder) => {
    const updatedKey = updatedWorkOrder.backendId || updatedWorkOrder.id;

    setWorkOrders((prev) =>
      prev.map((wo) => ((wo.backendId || wo.id) === updatedKey ? updatedWorkOrder : wo))
    );
    setSelectedWOId(updatedKey);
  };

  const handleUpdateWorkOrder = async () => {
    if (!selectedWO || !selectedWO.backendId || !editTitle.trim()) return;

    try {
      setIsUpdatingWorkOrder(true);

      const payload: CreateWorkOrderPayload = {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        location: editLocation.trim() || undefined,
        priority: toApiPriority(editPriority),
        workType: toApiWorkType(editWorkType),
        estimatedHours: Number(editEstimatedHours) || undefined,
        assignedTechnicianId: editAssignee || undefined,
        checklistTemplateId: editChecklistTemplateId || undefined,
      };

      if (editAsset.trim()) {
        payload.assetId = editAsset.trim();
      }

      await updateWorkOrder(selectedWO.backendId, payload);

      if (editAttachmentFile) {
        try {
          await uploadWorkOrderAttachment(
            selectedWO.backendId,
            editAttachmentFile,
            editAttachmentType
          );
        } catch (uploadError) {
          console.error("Error uploading work order attachment during edit:", uploadError);
          toast.error("Work order updated, but attachment upload failed.");
        }
      }

      const refreshedWorkOrder = await fetchWorkOrderById(selectedWO.backendId);
      replaceWorkOrder(mapApiWorkOrder(refreshedWorkOrder));
      setEditDialogOpen(false);
      setEditAttachmentFile(null);
      setEditAttachmentType("BEFORE_PHOTO");
      toast.success("Updated successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update work order";
      setWorkOrdersError(message);
      console.error("Error updating work order:", error);
      toast.error(message);
    } finally {
      setIsUpdatingWorkOrder(false);
    }
  };

  const handleAssignTechnician = async () => {
    if (!selectedWO || !selectedWO.backendId || !assignTechnicianId) return;

    try {
      setIsAssigningTechnician(true);
      await assignWorkOrderTechnician(selectedWO.backendId, assignTechnicianId);
      const refreshedWorkOrder = await fetchWorkOrderById(selectedWO.backendId);
      replaceWorkOrder(mapApiWorkOrder(refreshedWorkOrder));
      setAssignDialogOpen(false);
      toast.success("Technician assigned successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to assign technician";
      setWorkOrdersError(message);
      console.error("Error assigning technician:", error);
      toast.error(message);
    } finally {
      setIsAssigningTechnician(false);
    }
  };

  const handleDeleteWorkOrder = async () => {
    if (!selectedWO) return;
    const selectedKey = selectedWO.backendId || selectedWO.id;

    try {
      setIsDeletingWorkOrder(true);

      if (selectedWO.backendId) {
        await deleteWorkOrder(selectedWO.backendId);
      }

      const remainingWorkOrders = workOrders.filter((wo) => (wo.backendId || wo.id) !== selectedKey);
      setWorkOrders(remainingWorkOrders);
      setSelectedWOId(remainingWorkOrders[0] ? remainingWorkOrders[0].backendId || remainingWorkOrders[0].id : null);
      setShowDetails(false);
      setDeleteConfirmDialogOpen(false);
      toast.success("Deleted successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete work order";
      setWorkOrdersError(message);
      console.error("Error deleting work order:", error);
      toast.error(message);
    } finally {
      setIsDeletingWorkOrder(false);
    }
  };

  const handleDeleteChecklistTemplate = async () => {
    if (!selectedTemplate) return;
    try {
      setIsDeletingTemplate(true);
      await deleteChecklistTemplate(selectedTemplate.id);

      const remainingTemplates = checklistTemplates.filter((t) => t.id !== selectedTemplate.id);
      setChecklistTemplates(remainingTemplates);

      if (remainingTemplates.length > 0) {
        setSelectedTemplateId(remainingTemplates[0].id);
      } else {
        setSelectedTemplateId(null);
      }

      toast.success("Checklist template deleted successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete template";
      console.error("Error deleting checklist template:", error);
      toast.error(message);
    } finally {
      setIsDeletingTemplate(false);
    }
  };

  // Send message
  const handleSendMessage = () => {
    if (!chatMessageText.trim()) return;

    const newMsg: ChatMessage = {
      id: `c-user-${Date.now()}`,
      sender: "Kumar Tech",
      avatar: "KT",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      message: chatMessageText,
      isMe: true,
    };

    const newActivity: ActivityItem = {
      id: `act-user-${Date.now()}`,
      type: "comment",
      title: "Comment added",
      description: chatMessageText,
      user: "Kumar Tech",
      time: new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
    };

    setWorkOrders(prev => prev.map(wo => {
      if ((wo.backendId || wo.id) === selectedWOId) {
        return {
          ...wo,
          chat: [...wo.chat, newMsg],
          activities: [newActivity, ...wo.activities]
        };
      }
      return wo;
    }));

    setChatMessageText("");
  };

  const resetChecklistTemplateForm = () => {
    setTemplateName("");
    setTemplateDescription("");
    setTemplateItems([{ title: "", isRequired: true, sortOrder: "1" }]);
  };

  const updateTemplateItem = (
    index: number,
    field: keyof ChecklistTemplateItemForm,
    value: string | boolean
  ) => {
    setTemplateItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  };

  const addTemplateItem = () => {
    setTemplateItems((prev) => [
      ...prev,
      { title: "", isRequired: true, sortOrder: String(prev.length + 1) },
    ]);
  };

  const removeTemplateItem = (index: number) => {
    setTemplateItems((prev) =>
      prev.length === 1
        ? [{ title: "", isRequired: true, sortOrder: "1" }]
        : prev.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const handleCreateChecklistTemplate = async () => {
    const validItems = templateItems
      .map((item, index) => ({
        title: item.title.trim(),
        isRequired: item.isRequired,
        sortOrder: Number(item.sortOrder) || index + 1,
      }))
      .filter((item) => item.title);

    if (!templateName.trim()) {
      toast.error("Checklist template name is required");
      return;
    }

    if (validItems.length === 0) {
      toast.error("Add at least one checklist item");
      return;
    }

    try {
      setIsCreatingTemplate(true);

      const createdTemplate = await createChecklistTemplate({
        name: templateName.trim(),
        description: templateDescription.trim() || undefined,
      });

      for (const item of validItems) {
        await createChecklistTemplateItem(createdTemplate.id, item);
      }

      const templatesData = await fetchChecklistTemplates();
      setChecklistTemplates(templatesData);
      setNewChecklistTemplateId(createdTemplate.id);
      setTemplateDialogOpen(false);
      resetChecklistTemplateForm();
      toast.success("Checklist template created successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create checklist template";
      console.error("Error creating checklist template:", error);
      toast.error(message);
    } finally {
      setIsCreatingTemplate(false);
    }
  };

  // Create work order
  const handleCreateWorkOrder = async () => {
    if (!newTitle.trim()) return;

    try {
      setIsCreatingWorkOrder(true);

      const startDate = new Date();
      const estimatedHours = Number(newEstimatedHours) || 0;
      const dueDate = new Date(startDate.getTime() + Math.max(estimatedHours, 1) * 60 * 60 * 1000);
      const payload: CreateWorkOrderPayload = {
        title: newTitle.trim(),
        description:
          newDescription.trim() ||
          `New work order created${newAsset.trim() ? ` for asset ${newAsset.trim()}` : ""}.`,
        location: newLocation.trim() || undefined,
        priority: toApiPriority(newPriority),
        workType: toApiWorkType(newWorkType),
        estimatedHours: estimatedHours || undefined,
        startDate: startDate.toISOString(),
        dueDate: dueDate.toISOString(),
      };

      if (newAsset.trim()) {
        payload.assetId = newAsset.trim();
      }

      if (newAssignee.trim()) {
        payload.assignedTechnicianId = newAssignee.trim();
      }

      if (newChecklistTemplateId) {
        payload.checklistTemplateId = newChecklistTemplateId;
      }

      const createdWorkOrder = await createWorkOrder(payload);
      let mappedWorkOrder = mapApiWorkOrder(createdWorkOrder);

      if (newAttachmentFile && createdWorkOrder.id) {
        try {
          const uploaded = await uploadWorkOrderAttachment(
            createdWorkOrder.id,
            newAttachmentFile,
            newAttachmentType
          );
          mappedWorkOrder = {
            ...mappedWorkOrder,
            attachments: [uploaded, ...(mappedWorkOrder.attachments || [])],
          };
        } catch (uploadError) {
          console.error("Error uploading work order attachment:", uploadError);
          toast.error("Work order created, but attachment upload failed.");
        }
      }

      setWorkOrders((prev) => [mappedWorkOrder, ...prev]);
      setSelectedWOId(mappedWorkOrder.backendId || mappedWorkOrder.id);
      setShowDetails(true);
      setNewWODialogOpen(false);
      toast.success("Created successfully");

      // Reset fields
      setNewTitle("");
      setNewDescription("");
      setNewAsset("");
      setNewLocation("");
      setNewPriority("medium");
      setNewWorkType("BREAKDOWN");
      setNewAssignee("");
      setNewEstimatedHours("4");
      setNewChecklistTemplateId("");
      setNewAttachmentFile(null);
      setNewAttachmentType("BEFORE_PHOTO");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create work order";
      setWorkOrdersError(message);
      console.error("Error creating work order:", error);
      toast.error(message);
    } finally {
      setIsCreatingWorkOrder(false);
    }
  };

  // Status Style utilities
  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case "in_progress":
        return "border-blue-500/20 bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400";
      case "open":
        return "border-emerald-500/20 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400";
      case "on_hold":
        return "border-purple-500/20 bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400";
      case "completed":
        return "border-slate-500/20 bg-slate-50 text-slate-600 dark:bg-slate-900/20 dark:text-slate-400";
      case "overdue":
        return "border-rose-500/20 bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400";
      default:
        return "border-muted bg-muted/50 text-muted-foreground";
    }
  };

  const getPriorityBadgeStyles = (priority: string) => {
    switch (priority) {
      case "critical":
        return "border-rose-600/30 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400";
      case "high":
        return "border-rose-400/20 bg-rose-50/50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400";
      case "medium":
        return "border-amber-400/20 bg-amber-50/50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400";
      case "low":
        return "border-emerald-400/20 bg-emerald-50/50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400";
      default:
        return "border-muted bg-muted/50 text-muted-foreground";
    }
  };

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-120px)] max-w-[1600px] mx-auto overflow-hidden animate-in fade-in duration-300">
      {/* 1. TOP METRICS DASHBOARD ROW */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between shrink-0">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 flex-1">
          {/* Card 1: Open */}
          <Card className="shadow-sm border border-border bg-card overflow-hidden">
            <CardContent className="p-3 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Open</p>
                <div className="flex items-baseline gap-1.5">
                  <p className="text-xl font-bold tracking-tight">{stats.open}</p>
                </div>
                <div className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <span>↑ 2</span>
                  <span className="text-muted-foreground font-normal">from last week</span>
                </div>
              </div>
              <div className="h-8.5 w-8.5 rounded-lg bg-blue-100/60 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <ClipboardList className="h-4.5 w-4.5" />
              </div>
            </CardContent>
          </Card>

          {/* Card 2: In Progress */}
          <Card className="shadow-sm border border-border bg-card overflow-hidden">
            <CardContent className="p-3 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">In Progress</p>
                <div className="flex items-baseline gap-1.5">
                  <p className="text-xl font-bold tracking-tight">{stats.inProgress}</p>
                </div>
                <div className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <span>↑ 1</span>
                  <span className="text-muted-foreground font-normal">from last week</span>
                </div>
              </div>
              <div className="h-8.5 w-8.5 rounded-lg bg-amber-100/60 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                <FolderSync className="h-4.5 w-4.5 animate-pulse" />
              </div>
            </CardContent>
          </Card>

          {/* Card 3: On Hold */}
          <Card className="shadow-sm border border-border bg-card overflow-hidden">
            <CardContent className="p-3 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">On Hold</p>
                <div className="flex items-baseline gap-1.5">
                  <p className="text-xl font-bold tracking-tight">{stats.onHold}</p>
                </div>
                <div className="flex items-center gap-0.5 text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                  <span>↓ 1</span>
                  <span className="text-muted-foreground font-normal">from last week</span>
                </div>
              </div>
              <div className="h-8.5 w-8.5 rounded-lg bg-purple-100/60 dark:bg-purple-950/40 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                <Clock className="h-4.5 w-4.5" />
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Completed */}
          <Card className="shadow-sm border border-border bg-card overflow-hidden">
            <CardContent className="p-3 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Completed</p>
                <div className="flex items-baseline gap-1.5">
                  <p className="text-xl font-bold tracking-tight">{stats.completed}</p>
                </div>
                <div className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <span>↑ 6</span>
                  <span className="text-muted-foreground font-normal">from last week</span>
                </div>
              </div>
              <div className="h-8.5 w-8.5 rounded-lg bg-emerald-100/60 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <CheckCircle className="h-4.5 w-4.5" />
              </div>
            </CardContent>
          </Card>

          {/* Card 5: Overdue */}
          <Card className="shadow-sm border border-border bg-card overflow-hidden">
            <CardContent className="p-3 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Overdue</p>
                <div className="flex items-baseline gap-1.5">
                  <p className="text-xl font-bold tracking-tight">{stats.overdue}</p>
                </div>
                <div className="flex items-center gap-0.5 text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                  <span>↑ 2</span>
                  <span className="text-muted-foreground font-normal">from last week</span>
                </div>
              </div>
              <div className="h-8.5 w-8.5 rounded-lg bg-rose-100/60 dark:bg-rose-950/40 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                <AlertTriangle className="h-4.5 w-4.5" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          {/* Create Work Order Modal */}
          <Dialog open={newWODialogOpen} onOpenChange={setNewWODialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full xl:w-auto h-auto py-2.5 px-5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold flex items-center justify-center gap-2 rounded-xl transition-all shadow-md text-xs uppercase tracking-wider shrink-0">
                <Plus className="h-4 w-4" />
                New Work Order
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] max-h-[92vh] overflow-y-auto p-0">
              {/* Header */}
              <div className="px-8 pt-8 pb-4 border-b bg-muted/30">
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Plus className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-bold">Create Work Order</DialogTitle>
                      <DialogDescription className="mt-0.5">
                        Add details to initiate a new work order task.
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
              </div>

              <div className="px-8 py-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">General Info</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground">Title</label>
                      <Input
                        placeholder="e.g. Chiller Repair"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground">Description</label>
                      <Input
                        placeholder="e.g. Cooling issue reported by operations team"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Schedule & Assignment</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground">Asset (optional)</label>
                      <Select
                        value={newAsset || "none"}
                        onValueChange={(value) => {
                          const assetId = value === "none" ? "" : value;
                          const asset = assets.find((item) => item.id === assetId);
                          setNewAsset(assetId);
                          if (asset?.location && !newLocation) {
                            setNewLocation(asset.location);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Asset" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No asset</SelectItem>
                          {assets.map((asset) => (
                            <SelectItem key={asset.id} value={asset.id}>
                              {asset.assetName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground">Location</label>
                      <Input
                        placeholder="e.g. Mech Room A"
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground">Priority</label>
                      <Select
                        value={newPriority}
                        onValueChange={(val: any) => setNewPriority(val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground">Work Type</label>
                      <Select value={newWorkType} onValueChange={setNewWorkType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BREAKDOWN">Breakdown</SelectItem>
                          <SelectItem value="INSPECTION">Inspection</SelectItem>
                          <SelectItem value="PREVENTIVE">Preventive</SelectItem>
                          <SelectItem value="REACTIVE">Reactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground">Technician (optional)</label>
                      <Select value={newAssignee || "none"} onValueChange={(value) => setNewAssignee(value === "none" ? "" : value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Technician" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Unassigned</SelectItem>
                          {technicians.map((technician) => (
                            <SelectItem key={technician.id} value={technician.id}>
                              {technician.name} ({technician.activeWorkOrders || 0} active)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground">Estimated Hours</label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="4"
                        value={newEstimatedHours}
                        onChange={(e) => setNewEstimatedHours(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Checklist Template (optional)</label>
                    <Select
                      value={newChecklistTemplateId || "none"}
                      onValueChange={(value) => setNewChecklistTemplateId(value === "none" ? "" : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Checklist Template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No checklist template</SelectItem>
                        {checklistTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Upload Attachment</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Attachment Type Selector */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground">Attachment Type</label>
                      <Select
                        value={newAttachmentType}
                        onValueChange={setNewAttachmentType}
                      >
                        <SelectTrigger className="w-full bg-background border border-input rounded-lg h-10 px-3">
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BEFORE_PHOTO">Before Photo</SelectItem>
                          <SelectItem value="AFTER_PHOTO">After Photo</SelectItem>
                          <SelectItem value="INSPECTION_PHOTO">Inspection Photo</SelectItem>
                          <SelectItem value="DOCUMENT">Document</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Attachment File Upload Area */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground">Select File</label>
                      
                      {/* Hidden Native File Input */}
                      <input
                        ref={newFileInputRef}
                        type="file"
                        className="hidden"
                        onChange={(e) => setNewAttachmentFile(e.target.files?.[0] || null)}
                      />

                      {/* Upload area if no file is selected */}
                      {!newAttachmentFile ? (
                        <div
                          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-5 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all duration-200 group flex flex-col items-center justify-center gap-1.5 h-[90px]"
                          onClick={() => newFileInputRef.current?.click()}
                        >
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                            <Upload className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-muted-foreground">Click to upload file</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Images or documents up to 10MB</p>
                          </div>
                        </div>
                      ) : (
                        /* Nice file preview card when selected */
                        <div className="border rounded-lg p-3 bg-muted/30 h-[90px] flex items-center">
                          <div className="flex items-center gap-3 w-full">
                            {newAttachmentPreviewUrl ? (
                              <img
                                src={newAttachmentPreviewUrl}
                                alt="Preview"
                                className="h-12 w-12 rounded-lg object-cover border shrink-0"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center border shrink-0">
                                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-foreground truncate" title={newAttachmentFile.name}>
                                {newAttachmentFile.name}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {(newAttachmentFile.size / 1024).toFixed(1)} KB · Ready to upload
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                              onClick={() => {
                                setNewAttachmentFile(null);
                                if (newFileInputRef.current) newFileInputRef.current.value = "";
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-5 border-t bg-muted/30 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setNewWODialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateWorkOrder} disabled={isCreatingWorkOrder || !newTitle.trim()}>
                  {isCreatingWorkOrder ? "Creating..." : "Create Work Order"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Create Checklist Template Modal */}
          <Dialog
            open={templateDialogOpen}
            onOpenChange={(open) => {
              setTemplateDialogOpen(open);
              if (!open && !isCreatingTemplate) {
                resetChecklistTemplateForm();
              }
            }}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full xl:w-auto h-auto py-2.5 px-5 font-bold flex items-center justify-center gap-2 rounded-xl text-xs uppercase tracking-wider shrink-0">
                <ListChecks className="h-4 w-4" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[620px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Create Checklist Template</DialogTitle>
                <DialogDescription>
                  Create a checklist template first, then add checklist items one by one.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Template Name</label>
                    <Input
                      placeholder="e.g. Monthly Chiller PM"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Description</label>
                    <Input
                      placeholder="e.g. Monthly inspection checklist"
                      value={templateDescription}
                      onChange={(e) => setTemplateDescription(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-muted-foreground">Checklist Items</label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 text-xs font-semibold"
                      onClick={addTemplateItem}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Item
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                    {templateItems.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-end border border-border rounded-xl p-3 bg-muted/10">
                        <div className="col-span-12 sm:col-span-6 space-y-1">
                          <label className="text-[11px] font-bold text-muted-foreground">Item Title</label>
                          <Input
                            placeholder="e.g. Check Oil Level"
                            value={item.title}
                            onChange={(e) => updateTemplateItem(index, "title", e.target.value)}
                          />
                        </div>
                        <div className="col-span-6 sm:col-span-2 space-y-1">
                          <label className="text-[11px] font-bold text-muted-foreground">Order</label>
                          <Input
                            type="number"
                            min="1"
                            value={item.sortOrder}
                            onChange={(e) => updateTemplateItem(index, "sortOrder", e.target.value)}
                          />
                        </div>
                        <div className="col-span-4 sm:col-span-3 flex items-center gap-2 h-10">
                          <Checkbox
                            checked={item.isRequired}
                            onCheckedChange={(checked) => updateTemplateItem(index, "isRequired", checked === true)}
                            id={`template-item-required-${index}`}
                          />
                          <label
                            htmlFor={`template-item-required-${index}`}
                            className="text-xs font-semibold text-foreground"
                          >
                            Required
                          </label>
                        </div>
                        <div className="col-span-2 sm:col-span-1 flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-muted-foreground hover:text-rose-600"
                            onClick={() => removeTemplateItem(index)}
                            title="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setTemplateDialogOpen(false);
                    resetChecklistTemplateForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateChecklistTemplate}
                  disabled={isCreatingTemplate || !templateName.trim()}
                >
                  {isCreatingTemplate ? "Creating..." : "Create Template"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[900px] max-h-[92vh] overflow-y-auto p-0">
            {/* Header */}
            <div className="px-8 pt-8 pb-4 border-b bg-muted/30">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Edit className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold">Edit Work Order</DialogTitle>
                    <DialogDescription className="mt-0.5">
                      Update work order details and save changes.
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
            </div>

            <div className="px-8 py-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">General Info</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Title</label>
                    <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Description</label>
                    <Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Schedule & Assignment</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Asset</label>
                    <Select value={editAsset || "keep"} onValueChange={(value) => setEditAsset(value === "keep" ? "" : value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Asset" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="keep">Keep current asset</SelectItem>
                        {assets.map((asset) => (
                          <SelectItem key={asset.id} value={asset.id}>
                            {asset.assetName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Location</label>
                    <Input value={editLocation} onChange={(e) => setEditLocation(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Priority</label>
                    <Select value={editPriority} onValueChange={(val: any) => setEditPriority(val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Work Type</label>
                    <Select value={editWorkType} onValueChange={setEditWorkType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BREAKDOWN">Breakdown</SelectItem>
                        <SelectItem value="INSPECTION">Inspection</SelectItem>
                        <SelectItem value="PREVENTIVE">Preventive</SelectItem>
                        <SelectItem value="REACTIVE">Reactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Technician (optional)</label>
                    <Select value={editAssignee || "none"} onValueChange={(value) => setEditAssignee(value === "none" ? "" : value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Technician" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Unassigned</SelectItem>
                        {technicians.map((technician) => (
                          <SelectItem key={technician.id} value={technician.id}>
                            {technician.name} ({technician.activeWorkOrders || 0} active)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Estimated Hours</label>
                    <Input
                      type="number"
                      min="1"
                      value={editEstimatedHours}
                      onChange={(e) => setEditEstimatedHours(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Checklist Template (optional)</label>
                  <Select
                    value={editChecklistTemplateId || "none"}
                    onValueChange={(value) => setEditChecklistTemplateId(value === "none" ? "" : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Checklist Template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No checklist template</SelectItem>
                      {checklistTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Existing Attachments Section */}
              {selectedWO?.attachments && selectedWO?.attachments.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Existing Attachments</h3>
                  <div className="space-y-4">
                    {selectedWO?.attachments?.map((att) => {
                      const isImage = att.fileType.startsWith("image/");
                      const fileProxyUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/work-orders/attachments/${att.id}`;

                      return isImage ? (
                        <div key={att.id} className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            {att.attachmentType ? att.attachmentType.replace("_", " ") : "Attachment Image"}
                          </label>
                          <div className="relative rounded-xl overflow-hidden border bg-muted/30 group h-48 w-full shadow-sm">
                            <img
                              src={fileProxyUrl}
                              alt={att.fileName}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => {
                                  setEditAttachmentType(att.attachmentType || "BEFORE_PHOTO");
                                  editFileInputRef.current?.click();
                                }}
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Change Image
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div key={att.id} className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            {att.attachmentType ? att.attachmentType.replace("_", " ") : "Attachment Document"}
                          </label>
                          <div className="relative border rounded-xl p-4 bg-muted/10 flex items-center gap-3 group hover:bg-muted/20 transition-all duration-200">
                            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center border shrink-0 text-muted-foreground">
                              <FileText className="h-6 w-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-foreground truncate" title={att.fileName}>{att.fileName}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Uploaded on {new Date(att.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="shrink-0"
                              onClick={() => {
                                setEditAttachmentType(att.attachmentType || "BEFORE_PHOTO");
                                editFileInputRef.current?.click();
                              }}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Change File
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Attachments Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Upload New Attachment</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Attachment Type Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground">Attachment Type</label>
                    <Select
                      value={editAttachmentType}
                      onValueChange={setEditAttachmentType}
                    >
                      <SelectTrigger className="w-full bg-background border border-input rounded-lg h-10 px-3">
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BEFORE_PHOTO">Before Photo</SelectItem>
                        <SelectItem value="AFTER_PHOTO">After Photo</SelectItem>
                        <SelectItem value="INSPECTION_PHOTO">Inspection Photo</SelectItem>
                        <SelectItem value="DOCUMENT">Document</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Attachment File Upload Area */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground">Select File</label>
                    
                    {/* Hidden Native File Input */}
                    <input
                      ref={editFileInputRef}
                      type="file"
                      className="hidden"
                      onChange={(e) => setEditAttachmentFile(e.target.files?.[0] || null)}
                    />

                    {/* Upload area if no file is selected */}
                    {!editAttachmentFile ? (
                      <div
                        className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-5 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all duration-200 group flex flex-col items-center justify-center gap-1.5 h-[90px]"
                        onClick={() => editFileInputRef.current?.click()}
                      >
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                          <Upload className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-muted-foreground">Click to upload file</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Images or documents up to 10MB</p>
                        </div>
                      </div>
                    ) : (
                      /* Nice file preview card when selected */
                      <div className="border rounded-lg p-3 bg-muted/30 h-[90px] flex items-center">
                        <div className="flex items-center gap-3 w-full">
                          {editAttachmentPreviewUrl ? (
                            <img
                              src={editAttachmentPreviewUrl}
                              alt="Preview"
                              className="h-12 w-12 rounded-lg object-cover border shrink-0"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center border shrink-0">
                              <ImageIcon className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-foreground truncate" title={editAttachmentFile.name}>
                              {editAttachmentFile.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {(editAttachmentFile.size / 1024).toFixed(1)} KB · Ready to upload
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                            onClick={() => {
                              setEditAttachmentFile(null);
                              if (editFileInputRef.current) editFileInputRef.current.value = "";
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t bg-muted/30 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateWorkOrder} disabled={isUpdatingWorkOrder || !editTitle.trim()}>
                {isUpdatingWorkOrder ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
          <DialogContent className="sm:max-w-[420px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Assign Technician</DialogTitle>
              <DialogDescription>
                Select a technician for this work order.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-1">
              <label className="text-xs font-bold text-muted-foreground">Technician</label>
              <Select value={assignTechnicianId} onValueChange={setAssignTechnicianId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Technician" />
                </SelectTrigger>
                <SelectContent>
                  {technicians.map((technician) => (
                    <SelectItem key={technician.id} value={technician.id}>
                      {technician.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignTechnician} disabled={isAssigningTechnician || !assignTechnicianId}>
                {isAssigningTechnician ? "Assigning..." : "Assign Technician"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* 2. THREE COLUMN LAYOUT - ALWAYS VISIBLE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0 items-stretch pb-2">

        {/* ================== COLUMN 1: WORK ORDERS LIST (col-span-3) ================== */}
        <div className="min-h-0 bg-card border border-border rounded-xl shadow-sm overflow-hidden h-full flex flex-col transition-all duration-300 lg:col-span-3">
          {/* Header */}
          <div className="p-4 border-b border-border flex flex-col gap-3 shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                {listMode === "work-orders" ? "Work Orders" : "Checklists"}
              </h3>
              {listMode === "work-orders" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className={`h-8 w-8 text-muted-foreground relative ${priorityFilter !== "all" ? "text-primary bg-primary/10" : ""}`}>
                      <Filter className="h-4 w-4" />
                      {priorityFilter !== "all" && (
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Priority Filter</div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className={priorityFilter === "all" ? "font-bold text-primary" : ""} onClick={() => { setPriorityFilter("all"); setCurrentPage(1); }}>
                      All Priorities
                    </DropdownMenuItem>
                    <DropdownMenuItem className={priorityFilter === "CRITICAL" ? "font-bold text-primary" : ""} onClick={() => { setPriorityFilter("CRITICAL"); setCurrentPage(1); }}>
                      Critical Priority
                    </DropdownMenuItem>
                    <DropdownMenuItem className={priorityFilter === "HIGH" ? "font-bold text-primary" : ""} onClick={() => { setPriorityFilter("HIGH"); setCurrentPage(1); }}>
                      High Priority
                    </DropdownMenuItem>
                    <DropdownMenuItem className={priorityFilter === "MEDIUM" ? "font-bold text-primary" : ""} onClick={() => { setPriorityFilter("MEDIUM"); setCurrentPage(1); }}>
                      Medium Priority
                    </DropdownMenuItem>
                    <DropdownMenuItem className={priorityFilter === "LOW" ? "font-bold text-primary" : ""} onClick={() => { setPriorityFilter("LOW"); setCurrentPage(1); }}>
                      Low Priority
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* List Toggle Control */}
            <div className="flex bg-muted/60 p-0.5 rounded-lg border border-border shrink-0">
              <button
                onClick={() => setListMode("work-orders")}
                className={`flex-1 text-center py-1.5 px-3 rounded-md text-xs font-bold transition-all ${
                  listMode === "work-orders"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Work Orders
              </button>
              <button
                onClick={() => setListMode("checklists")}
                className={`flex-1 text-center py-1.5 px-3 rounded-md text-xs font-bold transition-all ${
                  listMode === "checklists"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Checklists
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="p-3 border-b border-border bg-muted/20 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={listMode === "work-orders" ? "Search work orders..." : "Search checklists..."}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 bg-background border-border h-9"
              />
            </div>
          </div>

          {/* Filter pills / Label */}
          {listMode === "work-orders" ? (
            <div className="p-3 border-b border-border flex gap-1 overflow-x-auto scrollbar-none shrink-0">
              {["all", "open", "in_progress", "completed"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all shrink-0 capitalize ${activeTab === tab
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:bg-muted/50"
                    }`}
                >
                  {tab.replace("_", " ")}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-3 border-b border-border bg-muted/5 shrink-0 flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold px-1">All Templates</span>
              <Badge variant="outline" className="text-[10px] font-bold py-0.5 px-2 bg-background border-border text-muted-foreground">
                {filteredTemplates.length} {filteredTemplates.length === 1 ? "template" : "templates"}
              </Badge>
            </div>
          )}

          {/* List items */}
          <ScrollArea className="flex-1 min-h-0 p-3">
            {listMode === "work-orders" ? (
              isLoadingWorkOrders ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <ClipboardList className="h-10 w-10 text-muted-foreground/40 mb-2 animate-pulse" />
                  <p className="text-sm font-semibold">Loading work orders...</p>
                </div>
              ) : workOrdersError ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-rose-600">
                  <AlertTriangle className="h-10 w-10 text-rose-500/60 mb-2" />
                  <p className="text-sm font-semibold">Unable to load work orders</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs">{workOrdersError}</p>
                </div>
              ) : paginatedWorkOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <ClipboardList className="h-10 w-10 text-muted-foreground/40 mb-2" />
                  <p className="text-sm font-semibold">No work orders found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {paginatedWorkOrders.map((wo) => {
                    const workOrderKey = wo.backendId || wo.id;
                    const isSelected = workOrderKey === selectedWOId;
                    return (
                      <div
                        key={workOrderKey}
                        onClick={() => handleSelectWorkOrder(wo)}
                        className={`flex flex-col gap-2 p-3.5 rounded-xl border transition-all cursor-pointer relative ${isSelected
                          ? "border-primary/60 bg-primary/5 shadow-sm ring-1 ring-primary/20"
                          : "border-border bg-card hover:bg-muted/50"
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-muted-foreground tracking-wider">{wo.id}</span>
                          <span
                            className={`text-[9px] font-bold tracking-wide px-2 py-0.5 rounded-full border uppercase ${getStatusBadgeStyles(
                              wo.status
                            )}`}
                          >
                            {wo.status.replace("_", " ")}
                          </span>
                        </div>

                        <h4 className="font-semibold text-sm text-foreground line-clamp-1">
                          {wo.title}
                        </h4>

                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {wo.location}
                        </p>

                        <div className="flex justify-end mt-1">
                          <span
                            className={`text-[9px] font-bold tracking-wide px-2 py-0.5 rounded-full border uppercase ${getPriorityBadgeStyles(
                              wo.priority
                            )}`}
                          >
                            {wo.priority}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : filteredTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <ListChecks className="h-10 w-10 text-muted-foreground/40 mb-2" />
                <p className="text-sm font-semibold">No templates found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTemplates.map((template) => {
                  const isSelected = template.id === selectedTemplateId;
                  return (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplateId(template.id)}
                      className={`flex flex-col gap-2 p-3.5 rounded-xl border transition-all cursor-pointer relative ${isSelected
                        ? "border-primary/60 bg-primary/5 shadow-sm ring-1 ring-primary/20"
                        : "border-border bg-card hover:bg-muted/50"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[10px] text-muted-foreground tracking-wider uppercase">
                          TEMPLATE
                        </span>
                        <span
                          className="text-[9px] font-bold tracking-wide px-2 py-0.5 rounded-full border border-indigo-500/20 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400 uppercase"
                        >
                          {template.items?.length || 0} {template.items?.length === 1 ? "Item" : "Items"}
                        </span>
                      </div>

                      <h4 className="font-semibold text-sm text-foreground line-clamp-1">
                        {template.name}
                      </h4>

                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {template.description || "No description provided."}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {/* Pagination */}
          {listMode === "work-orders" && (
            <div className="p-3 border-t border-border flex items-center justify-between bg-muted/10 text-xs text-muted-foreground">
              <span>
                Showing {totalItems === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems}
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 rounded-md"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  <ChevronLeft className="h-4.5 w-4.5" />
                </Button>
                <span className="font-semibold text-foreground px-1">{currentPage} / {totalPages}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 rounded-md"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  <ChevronRight className="h-4.5 w-4.5" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ================== COLUMN 2: DETAILS & TIMELINE - EXPANDS WHEN CHAT IS HIDDEN ================== */}
        <div className={`min-h-0 bg-card border border-border rounded-xl shadow-sm overflow-hidden h-full flex flex-col transition-all duration-300 ${
          listMode === "work-orders" && selectedWO && showChat ? "lg:col-span-6" : "lg:col-span-9"
        }`}>
          {/* Header Actions */}
          <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
            <h3 className="font-bold text-sm text-foreground">
              {listMode === "work-orders" ? "Work Order Details" : "Checklist Details"}
            </h3>
            {listMode === "work-orders" ? (
              selectedWO && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowChat(!showChat)}
                    className="text-muted-foreground hover:text-foreground font-semibold flex items-center gap-1.5"
                    title={showChat ? "Close chat" : "Open chat"}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="font-semibold flex items-center gap-1.5">
                        Actions
                        <ChevronRight className="h-3.5 w-3.5 rotate-90" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuItem onClick={handleOpenEditDialog}>
                        <Edit className="mr-2 h-4 w-4 text-slate-500" />
                        Edit Work Order
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleOpenAssignDialog}>
                        <UserCheck className="mr-2 h-4 w-4 text-indigo-500" />
                        Assign Technician
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-rose-500 focus:text-rose-500 font-medium" onClick={handleDeleteWorkOrder} disabled={isDeletingWorkOrder}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        {isDeletingWorkOrder ? "Deleting..." : "Delete Order"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            ) : (
              selectedTemplate && (
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="font-semibold flex items-center gap-1.5">
                        Actions
                        <ChevronRight className="h-3.5 w-3.5 rotate-90" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuItem
                        className="text-rose-500 focus:text-rose-500 font-medium"
                        onClick={handleDeleteChecklistTemplate}
                        disabled={isDeletingTemplate}
                      >
                        <Trash2 className="mr-2 h-4 w-4 text-rose-500" />
                        {isDeletingTemplate ? "Deleting..." : "Delete Template"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            )}
          </div>

          {/* Scrollable details */}
          <ScrollArea className="flex-1 min-h-0 p-6">
            {listMode === "work-orders" ? (
              !selectedWO ? (
              <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground h-full">
                <ClipboardList className="h-14 w-14 text-muted-foreground/30 mb-4 animate-pulse" />
                <h3 className="text-lg font-bold text-foreground">No Work Order Selected</h3>
                <p className="text-sm max-w-sm mt-1 leading-relaxed">
                  Select a work order from the list on the left to view its detailed specifications, activities, checklist, and attachments.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
              {/* WO ID & Title */}
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
                  <span>{selectedWO.id}</span>
                  <span className="text-muted-foreground font-normal">-</span>
                  <span className="text-foreground/90">{selectedWO.title}</span>
                </h2>
              </div>

              {/* Status and Badge Properties */}
              <div className="flex flex-wrap gap-2.5 items-center">
                <span className={`text-xs font-bold tracking-wider px-3 py-1 rounded-md border uppercase ${getStatusBadgeStyles(selectedWO.status)}`}>
                  {selectedWO.status.replace("_", " ")}
                </span>
                <span className={`text-xs font-bold tracking-wider px-3 py-1 rounded-md border uppercase ${getPriorityBadgeStyles(selectedWO.priority)}`}>
                  {selectedWO.priority}
                </span>
                <span className="text-xs font-semibold px-3 py-1 rounded-md border border-border bg-muted/40 text-muted-foreground flex items-center gap-1.5">
                  <Wrench className="h-3.5 w-3.5" />
                  {selectedWO.asset}
                </span>
                <span className="text-xs font-semibold px-3 py-1 rounded-md border border-border bg-muted/40 text-muted-foreground flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5" />
                  {selectedWO.location}
                </span>
              </div>

              <hr className="border-border" />

              {/* Grid attributes (Assigned to, Due date, Created by, Work Type) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">Assigned To</span>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 border border-primary/20 bg-primary/10">
                      <AvatarFallback className="text-xs font-bold text-primary">{selectedWO.assignedTo.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-bold text-foreground leading-tight">{selectedWO.assignedTo.name}</p>
                      <p className="text-[10px] text-muted-foreground">{selectedWO.assignedTo.role}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">Due Date</span>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full border border-border bg-muted/40 flex items-center justify-center text-muted-foreground">
                      <Calendar className="h-4.5 w-4.5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground leading-tight">{selectedWO.dueDate}</p>
                      {selectedWO.dueWarning && (
                        <p className={`text-[10px] font-semibold ${selectedWO.status === "overdue" || selectedWO.dueWarning.includes("Overdue")
                          ? "text-rose-500 animate-pulse"
                          : "text-amber-500"
                          }`}>
                          {selectedWO.dueWarning}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">Created By</span>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 border border-border bg-muted/60">
                      <AvatarFallback className="text-xs font-bold text-muted-foreground">{selectedWO.createdBy.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-bold text-foreground leading-tight">{selectedWO.createdBy.name}</p>
                      <p className="text-[10px] text-muted-foreground">{selectedWO.createdBy.date}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">Work Type</span>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full border border-border bg-muted/40 flex items-center justify-center text-muted-foreground">
                      <Wrench className="h-4.5 w-4.5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground leading-tight">{selectedWO.workType}</p>
                      <p className="text-[10px] text-muted-foreground">Maintenance</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inner Details Tabs */}
              <div className="mt-4">
                <Tabs value={middleTab} onValueChange={setMiddleTab} className="w-full">
                  <TabsList className="grid grid-cols-6 lg:grid-cols-5 w-full h-10 border border-border bg-muted/10 p-0.5 rounded-lg">
                    <TabsTrigger value="details" className="text-xs font-semibold rounded-md">Details</TabsTrigger>
                    <TabsTrigger value="activities" className="text-xs font-semibold rounded-md">Activities</TabsTrigger>
                    <TabsTrigger value="checklist" className="text-xs font-semibold rounded-md">Checklist</TabsTrigger>
                    <TabsTrigger value="attachments" className="text-xs font-semibold rounded-md">Attachments</TabsTrigger>
                    <TabsTrigger value="parts" className="text-xs font-semibold rounded-md">Parts</TabsTrigger>
                    <TabsTrigger value="chat" className="text-xs font-semibold rounded-md lg:hidden">Chat</TabsTrigger>
                  </TabsList>

                  {/* Details Tab */}
                  <TabsContent value="details" className="pt-4 space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</h4>
                      <p className="text-sm text-foreground/80 leading-relaxed bg-muted/20 border border-border rounded-xl p-4">
                        {selectedWO.description}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Asset Specifications</h4>
                      {selectedWO.assetDetails ? (
                        <div className="grid grid-cols-2 gap-4 text-xs bg-muted/20 border border-border rounded-xl p-4">
                          <div>
                            <p className="text-muted-foreground font-medium">Model Number</p>
                            <p className="font-bold text-foreground mt-0.5">{selectedWO.assetDetails.modelNumber || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground font-medium">Serial Number</p>
                            <p className="font-bold text-foreground mt-0.5">{selectedWO.assetDetails.serialNumber || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground font-medium">Manufacturer</p>
                            <p className="font-bold text-foreground mt-0.5">{selectedWO.assetDetails.manufacturer || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground font-medium">Status</p>
                            <p className={`font-bold mt-0.5 ${
                              selectedWO.assetDetails.status === "ACTIVE" ? "text-emerald-500" :
                              selectedWO.assetDetails.status === "UNDER_MAINTENANCE" ? "text-amber-500" :
                              selectedWO.assetDetails.status === "BREAKDOWN" ? "text-rose-500" :
                              selectedWO.assetDetails.status === "IDLE" ? "text-blue-500" :
                              "text-muted-foreground"
                            }`}>
                              {selectedWO.assetDetails.status ? toTitleCase(selectedWO.assetDetails.status) : "N/A"}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground bg-muted/10 border border-dashed rounded-xl p-4 text-center">
                          No asset linked to this work order.
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Activities Tab (Timeline logs) */}
                  <TabsContent value="activities" className="pt-4 space-y-4">
                    {isLoadingDetails ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                        <Activity className="h-8 w-8 text-muted-foreground/40 mb-2 animate-pulse" />
                        <p className="text-xs font-semibold">Loading activities...</p>
                      </div>
                    ) : selectedWO.activities.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-xs font-semibold">
                        No recent activity recorded for this order.
                      </div>
                    ) : (
                      <div className="relative border-l border-border pl-6 ml-3 space-y-6">
                        {selectedWO.activities.map((act, idx) => {
                          let iconColor = "bg-muted text-muted-foreground border-border";
                          let icon = <Check className="h-3.5 w-3.5" />;

                          if (act.type === "created") {
                            iconColor = "bg-emerald-100 text-emerald-600 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900";
                            icon = <Plus className="h-3.5 w-3.5" />;
                          } else if (act.type === "assigned") {
                            iconColor = "bg-blue-100 text-blue-600 border-blue-300 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900";
                            icon = <UserCheck className="h-3.5 w-3.5" />;
                          } else if (act.type === "accepted") {
                            iconColor = "bg-amber-100 text-amber-600 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900";
                            icon = <Check className="h-3.5 w-3.5" />;
                          } else if (act.type === "status_change") {
                            iconColor = "bg-indigo-100 text-indigo-600 border-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900";
                            icon = <Play className="h-3.5 w-3.5" />;
                          } else if (act.type === "comment") {
                            iconColor = "bg-yellow-100 text-yellow-600 border-yellow-300 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-900";
                            icon = <MessageSquare className="h-3.5 w-3.5" />;
                          }

                          return (
                            <div key={act.id} className="relative">
                              {/* Circular icon node on timeline */}
                              <div className={`absolute -left-[37px] top-0.5 h-6.5 w-6.5 rounded-full border flex items-center justify-center ${iconColor}`}>
                                {icon}
                              </div>

                              <div className="space-y-0.5">
                                <div className="flex items-center justify-between">
                                  <h5 className="font-semibold text-sm text-foreground">
                                    {act.title}
                                  </h5>
                                  <span className="text-[10px] text-muted-foreground font-semibold">
                                    {act.time}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {act.description}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </TabsContent>

                  {/* Checklist Tab */}
                  <TabsContent value="checklist" className="pt-4 space-y-4">
                    {isLoadingDetails ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                        <ListChecks className="h-8 w-8 text-muted-foreground/40 mb-2 animate-pulse" />
                        <p className="text-xs font-semibold">Loading checklist...</p>
                      </div>
                    ) : !selectedWO.checklist ? (
                      <div className="text-center py-12 text-muted-foreground/60 border border-dashed rounded-xl bg-muted/10 p-6">
                        <ListChecks className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                        <p className="text-xs font-semibold">No checklist assigned to this work order.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Checklist Header */}
                        <div className="bg-muted/20 border border-border rounded-xl p-4">
                          <div className="flex items-center gap-2.5 mb-1">
                            <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                              <ListChecks className="h-4.5 w-4.5" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-foreground">{selectedWO.checklist.name}</h4>
                              {selectedWO.checklist.description && (
                                <p className="text-[11px] text-muted-foreground mt-0.5">{selectedWO.checklist.description}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Checklist Items */}
                        {selectedWO.checklist.items.length === 0 ? (
                          <div className="text-center py-6 text-muted-foreground text-xs font-semibold">
                            No items in this checklist template.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {selectedWO.checklist.items
                              .sort((a, b) => a.sortOrder - b.sortOrder)
                              .map((item, idx) => (
                                <div
                                  key={item.id}
                                  className="flex items-center gap-3 p-3.5 border border-border rounded-xl bg-card hover:bg-muted/30 transition-colors group"
                                >
                                  <div className="h-6 w-6 rounded-md border-2 border-muted-foreground/30 flex items-center justify-center text-muted-foreground/40 shrink-0 group-hover:border-primary/40">
                                    <span className="text-[10px] font-bold">{idx + 1}</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                                  </div>
                                  {item.isRequired && (
                                    <span className="text-[9px] font-bold tracking-wide px-2 py-0.5 rounded-full border border-rose-500/20 bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 uppercase shrink-0">
                                      Required
                                    </span>
                                  )}
                                </div>
                              ))}
                          </div>
                        )}

                        {/* Summary */}
                        <div className="bg-muted/20 border border-border rounded-xl p-4 flex items-center justify-between text-sm">
                          <span className="font-bold text-muted-foreground">Total Items</span>
                          <span className="font-extrabold text-foreground text-base">
                            {selectedWO.checklist.items.length}
                          </span>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  {/* Attachments Tab */}
                  <TabsContent value="attachments" className="pt-4 space-y-4">

                    {/* Attachments List */}
                    {isLoadingDetails ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                        <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                        <p className="text-xs font-semibold">Loading attachments...</p>
                      </div>
                    ) : !selectedWO.attachments || selectedWO.attachments.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground/60 border border-dashed rounded-xl bg-muted/10 p-6">
                        <Paperclip className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                        <p className="text-xs font-semibold">No attachments uploaded yet.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {selectedWO.attachments.map((att) => {
                          const isImage = att.fileType.startsWith("image/");
                          const fileProxyUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/work-orders/attachments/${att.id}`;

                          return (
                            <div
                              key={att.id}
                              className="flex gap-3 p-3 border border-border rounded-xl bg-card hover:bg-muted/30 transition-all duration-200 group"
                            >
                              {/* Thumbnail preview */}
                              {isImage ? (
                                <div className="h-16 w-16 rounded-lg overflow-hidden border bg-muted shrink-0 relative">
                                  <img
                                    src={fileProxyUrl}
                                    alt={att.fileName}
                                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                                  />
                                </div>
                              ) : (
                                <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center border shrink-0 text-muted-foreground">
                                  <FileText className="h-7 w-7" />
                                </div>
                              )}

                              {/* Details and Actions */}
                              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                <div className="space-y-0.5">
                                  <p className="text-xs font-bold text-foreground truncate" title={att.fileName}>
                                    {att.fileName}
                                  </p>
                                  <div className="flex items-center gap-1.5">
                                    <Badge variant="outline" className="text-[9px] font-bold py-0 px-1.5 uppercase bg-muted/40 text-muted-foreground border-border">
                                      {att.attachmentType ? att.attachmentType.replace("_", " ") : "OTHER"}
                                    </Badge>
                                    <span className="text-[9px] text-muted-foreground font-semibold">
                                      {new Date(att.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Button
                                    asChild
                                    variant="link"
                                    className="p-0 h-auto text-[10px] font-bold text-primary hover:underline justify-start"
                                  >
                                    <a href={fileProxyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                                      <Eye className="h-3 w-3" /> View / Download
                                    </a>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </TabsContent>

                  {/* Parts & Costs Tab */}
                  <TabsContent value="parts" className="pt-4 space-y-4">
                    {selectedWO.parts.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground/60 border border-dashed rounded-xl bg-muted/10 p-6">
                        <DollarSign className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                        <p className="text-xs font-semibold">No parts or costs registered yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="border border-border rounded-xl overflow-hidden">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-muted/40 border-b border-border">
                                <th className="p-3 font-semibold text-muted-foreground">Part Name</th>
                                <th className="p-3 font-semibold text-muted-foreground text-center">Qty</th>
                                <th className="p-3 font-semibold text-muted-foreground text-right">Unit Price</th>
                                <th className="p-3 font-semibold text-muted-foreground text-right">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedWO.parts.map((p, idx) => (
                                <tr key={idx} className="border-b border-border last:border-0 hover:bg-muted/10">
                                  <td className="p-3 font-semibold">{p.name}</td>
                                  <td className="p-3 text-center">{p.qty}</td>
                                  <td className="p-3 text-right">${p.cost.toFixed(2)}</td>
                                  <td className="p-3 text-right font-bold">${(p.qty * p.cost).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="bg-muted/20 border border-border rounded-xl p-4 flex items-center justify-between text-sm">
                          <span className="font-bold text-muted-foreground">Total Parts Cost</span>
                          <span className="font-extrabold text-foreground text-base">
                            ${selectedWO.parts.reduce((sum, p) => sum + p.qty * p.cost, 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  {/* Chat Mobile Content (visible only on mobile/tablet) */}
                  <TabsContent value="chat" className="pt-4 lg:hidden">
                    <div className="flex flex-col h-[450px] border border-border rounded-xl overflow-hidden bg-background">
                      {/* Live Messages List */}
                      <ScrollArea className="flex-1 p-4 bg-muted/5">
                        {selectedWO.chat.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-6">
                            <MessageSquare className="h-8 w-8 text-muted-foreground/30 mb-1" />
                            <p className="text-xs font-semibold">No chat history. Start typing below to chat.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {selectedWO.chat.map((msg) => (
                              <div
                                key={msg.id}
                                className={`flex items-start gap-2.5 ${msg.isMe ? "flex-row-reverse" : "flex-row"}`}
                              >
                                <Avatar className="h-7 w-7 border border-border">
                                  <AvatarFallback className="text-[10px] font-bold">{msg.avatar}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-1 max-w-[80%]">
                                  <div className={`flex items-center gap-1.5 ${msg.isMe ? "justify-end" : "justify-start"}`}>
                                    <span className="text-[10px] font-bold text-foreground">{msg.sender}</span>
                                    <span className="text-[9px] text-muted-foreground">{msg.time}</span>
                                  </div>
                                  <div className={`p-2.5 rounded-xl text-xs leading-relaxed ${msg.isMe
                                    ? "bg-primary text-primary-foreground rounded-tr-none"
                                    : "bg-muted text-foreground rounded-tl-none"
                                    }`}>
                                    {msg.message}
                                  </div>
                                  {msg.isMe && (
                                    <p className="text-[9px] text-right text-muted-foreground font-medium">✓ Delivered</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </ScrollArea>

                      {/* Chat Input */}
                      <div className="p-3 border-t border-border bg-card flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                          <Paperclip className="h-4.5 w-4.5" />
                        </Button>
                        <Input
                          placeholder="Type your message..."
                          value={chatMessageText}
                          onChange={(e) => setChatMessageText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSendMessage();
                          }}
                          className="flex-1 bg-muted/20 border-border h-9 text-xs"
                        />
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                          <Smile className="h-4.5 w-4.5" />
                        </Button>
                        <Button size="icon" className="h-8 w-8 bg-primary hover:bg-primary/90 rounded-lg text-primary-foreground shrink-0" onClick={handleSendMessage}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
            )
            ) : (
              !selectedTemplate ? (
                <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground h-full">
                  <ListChecks className="h-14 w-14 text-muted-foreground/30 mb-4 animate-pulse" />
                  <h3 className="text-lg font-bold text-foreground">No Checklist Selected</h3>
                  <p className="text-sm max-w-sm mt-1 leading-relaxed">
                    Select a checklist from the list on the left to view its detailed specifications and items.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Template Title */}
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
                      <span>TEMPLATE</span>
                      <span className="text-muted-foreground font-normal">-</span>
                      <span className="text-foreground/90">{selectedTemplate.name}</span>
                    </h2>
                  </div>

                  {/* Template Badge Properties */}
                  <div className="flex flex-wrap gap-2.5 items-center">
                    <span className="text-xs font-bold tracking-wider px-3 py-1 rounded-md border uppercase border-indigo-500/20 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400">
                      {selectedTemplate.items?.length || 0} {selectedTemplate.items?.length === 1 ? "Item" : "Items"}
                    </span>
                    <span className="text-xs font-semibold px-3 py-1 rounded-md border border-border bg-muted/40 text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      Created: {new Date(selectedTemplate.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <hr className="border-border" />

                  {/* Template Description */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</h4>
                    <p className="text-sm text-foreground/80 leading-relaxed bg-muted/20 border border-border rounded-xl p-4">
                      {selectedTemplate.description || "No description provided."}
                    </p>
                  </div>

                  {/* Checklist Items */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Checklist Items</h4>
                    {(!selectedTemplate.items || selectedTemplate.items.length === 0) ? (
                      <div className="text-center py-12 text-muted-foreground/60 border border-dashed rounded-xl bg-muted/10 p-6">
                        <ListChecks className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                        <p className="text-xs font-semibold">No items in this checklist template.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {selectedTemplate.items
                          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                          .map((item, idx) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 p-3.5 border border-border rounded-xl bg-card hover:bg-muted/30 transition-colors group"
                            >
                              <div className="h-6 w-6 rounded-md border-2 border-muted-foreground/30 flex items-center justify-center text-muted-foreground/40 shrink-0 group-hover:border-primary/40">
                                <span className="text-[10px] font-bold">{idx + 1}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                              </div>
                              {item.isRequired && (
                                <span className="text-[9px] font-bold tracking-wide px-2 py-0.5 rounded-full border border-rose-500/20 bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 uppercase shrink-0">
                                  Required
                                </span>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </ScrollArea>
        </div>

        {/* ================== COLUMN 3: LIVE WORK ORDER CHAT (col-span-4, COLLAPSIBLE) ================== */}
        <div className={`transition-all duration-300 min-h-0 flex-col bg-card border border-border rounded-xl shadow-sm overflow-hidden h-full ${selectedWO && showChat ? "flex lg:col-span-3 animate-in fade-in zoom-in-95 duration-200" : "hidden lg:hidden"
          }`}>
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between bg-card">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-foreground">
                Work Order Chat
              </h3>
              <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                3
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
                onClick={() => setShowChat(false)}
                title="Close chat"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Chat timelines */}
          <ScrollArea className="flex-1 min-h-0 p-4 bg-muted/5">
            {!selectedWO || (selectedWO.chat || []).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-6">
                <MessageSquare className="h-10 w-10 text-muted-foreground/30 mb-2" />
                <p className="text-sm font-semibold">No chats started yet</p>
                <p className="text-xs text-muted-foreground/75 mt-1">Send a message below to start the conversation.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(selectedWO.chat || []).map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${msg.isMe ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <Avatar className="h-8 w-8 border border-border shrink-0">
                      <AvatarFallback className="text-xs font-bold bg-muted-foreground/10 text-muted-foreground">{msg.avatar}</AvatarFallback>
                    </Avatar>

                    <div className="space-y-1 max-w-[80%]">
                      <div className={`flex items-center gap-1.5 ${msg.isMe ? "flex-row-reverse" : "flex-row"}`}>
                        <span className="text-[11px] font-bold text-foreground leading-none">{msg.sender}</span>
                        <span className="text-[9px] text-muted-foreground leading-none">{msg.time}</span>
                      </div>

                      <div className={`p-3 rounded-2xl text-xs leading-relaxed ${msg.isMe
                        ? "bg-primary text-primary-foreground rounded-tr-none shadow-sm font-medium"
                        : "bg-background border border-border text-foreground rounded-tl-none shadow-xs"
                        }`}>
                        {msg.message}
                      </div>

                      {msg.isMe && (
                        <p className="text-[9px] text-right text-muted-foreground font-semibold leading-none pt-0.5">✓ Delivered</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Message Input box */}
          <div className="p-4 border-t border-border bg-card">
            <div className="flex items-center gap-2 border border-border rounded-xl p-1.5 bg-background shadow-xs">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted rounded-lg shrink-0">
                <Paperclip className="h-4.5 w-4.5" />
              </Button>
              <Input
                placeholder="Type your message..."
                value={chatMessageText}
                onChange={(e) => setChatMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
                className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-1 shadow-none h-8 text-xs placeholder:text-muted-foreground"
              />
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted rounded-lg shrink-0">
                <Smile className="h-4.5 w-4.5" />
              </Button>
              <Button
                size="sm"
                className="h-8 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-4 rounded-lg flex items-center gap-1.5 transition-all shadow-xs shrink-0"
                onClick={handleSendMessage}
              >
                <Send className="h-3.5 w-3.5" />
                Send
              </Button>
            </div>
          </div>
        </div>

      </div>

      {/* Floating Chat Toggle Button (Bottom Right) */}
      {selectedWO && !showChat && (
        <button
          onClick={() => setShowChat(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 z-40"
          title="Open chat"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
