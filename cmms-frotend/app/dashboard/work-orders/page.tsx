"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { io } from "socket.io-client";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Pencil,
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
  ImageIcon,
  CheckCircle2,
  XCircle
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
  approveWorkOrder,
  rejectWorkOrderSupervisor,
} from "@/lib/api/work-orders-api";
import { fetchAssets, type Asset } from "@/lib/api/assets-api";
import { fetchUsers, fetchTechnicianWorkload } from "@/lib/api/users-api";
import { useRole } from "@/contexts/role-context";
import { Skeleton } from "@/components/ui/skeleton";
import { getJwtTokenFromServer } from "@/app/actions/auth-actions";

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
  status: "open" | "in_progress" | "on_hold" | "completed" | "overdue" | "under_review";
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
    role?: {
      name: string;
    };
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
  rawStatus?: string;
  actualHours?: number | null;
  resolutionNotes?: string | null;
  breakdownStartedAt?: string | null;
  assetRestoredAt?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  reviewResult?: string | null;
  reviewNotes?: string | null;
  createdAtRaw?: string;
  dueDateRaw?: string | null;
  activitiesRaw?: any[];
  commentsRaw?: any[];
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
    case "UNDER_REVIEW":
    case "COMPLETED":
      return "under_review";
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
      role: apiWorkOrder.createdBy?.role,
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
    rawStatus: apiWorkOrder.status,
    actualHours: apiWorkOrder.actualHours || null,
    resolutionNotes: apiWorkOrder.resolutionNotes || null,
    breakdownStartedAt: apiWorkOrder.breakdownStartedAt || null,
    assetRestoredAt: apiWorkOrder.assetRestoredAt || null,
    reviewedBy: (apiWorkOrder as any).reviewedBy?.fullName || null,
    reviewedAt: (apiWorkOrder as any).reviewedAt || null,
    reviewResult: (apiWorkOrder as any).reviewResult || null,
    reviewNotes: (apiWorkOrder as any).reviewNotes || null,
    createdAtRaw: apiWorkOrder.createdAt,
    dueDateRaw: apiWorkOrder.dueDate || null,
    activitiesRaw: apiWorkOrder.activities || [],
    commentsRaw: apiWorkOrder.comments || [],
  };
};

function canModifyItem(
  userRole: string | undefined | null,
  createdBy?: { role?: { name: string } } | null
): boolean {
  if (!userRole) return false;
  const normalizedUserRole = userRole.toLowerCase();

  // Only admin, customer_manager, maintenance_manager, site_incharge, and supervisor can edit/delete work orders
  if (
    normalizedUserRole !== "admin" &&
    normalizedUserRole !== "customer_manager" &&
    normalizedUserRole !== "maintenance_manager" &&
    normalizedUserRole !== "site_incharge" &&
    normalizedUserRole !== "supervisor"
  ) {
    return false;
  }

  // If the logged-in user is ADMIN, they can always edit/delete
  if (normalizedUserRole === "admin") return true;

  // If the item has no creator (legacy data), allow modification
  if (!createdBy) return true;

  const creatorRole = createdBy.role?.name?.toLowerCase();

  // 1. If created by admin, customer_manager/maintenance_manager cannot edit/delete
  if (
    creatorRole === "admin" &&
    (normalizedUserRole === "customer_manager" || normalizedUserRole === "maintenance_manager")
  ) {
    return false;
  }

  // 2. If created by admin or customer_manager/maintenance_manager, site_incharge cannot edit/delete
  if (
    (creatorRole === "admin" || creatorRole === "customer_manager" || creatorRole === "maintenance_manager") &&
    normalizedUserRole === "site_incharge"
  ) {
    return false;
  }

  // 3. If created by admin, customer_manager/maintenance_manager, or site_incharge, supervisor cannot edit/delete
  if (
    (creatorRole === "admin" ||
      creatorRole === "customer_manager" ||
      creatorRole === "maintenance_manager" ||
      creatorRole === "site_incharge") &&
    normalizedUserRole === "supervisor"
  ) {
    return false;
  }

  return true;
}

// ─── Work Orders Skeleton Loaders ─────────────────────────────────────────────
function SkeletonWorkOrderList() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="flex flex-col gap-2 p-3.5 rounded-xl border border-border bg-card"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-14 rounded" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4.5 w-3/4 rounded" />
          <Skeleton className="h-3.5 w-1/2 rounded" />
          <div className="flex justify-end mt-1">
            <Skeleton className="h-4 w-12 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonActivities() {
  return (
    <div className="relative border-l border-border pl-6 ml-3 space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="relative">
          <Skeleton className="absolute -left-[37px] top-0.5 h-6.5 w-6.5 rounded-full" />
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-3 w-16 rounded" />
            </div>
            <Skeleton className="h-3.5 w-2/3 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonChecklist() {
  return (
    <div className="space-y-4">
      <div className="bg-muted/20 border border-border rounded-xl p-4 flex items-center gap-2.5">
        <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-3 w-48 rounded" />
        </div>
      </div>

      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3.5 border border-border rounded-xl bg-card"
          >
            <Skeleton className="h-6 w-6 rounded-md shrink-0" />
            <Skeleton className="h-4 w-3/4 rounded flex-1" />
            {i % 2 === 0 && <Skeleton className="h-4 w-14 rounded-full shrink-0" />}
          </div>
        ))}
      </div>

      <div className="bg-muted/20 border border-border rounded-xl p-4 flex items-center justify-between">
        <Skeleton className="h-4 w-20 rounded" />
        <Skeleton className="h-5 w-6 rounded" />
      </div>
    </div>
  );
}

function SkeletonAttachments() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex gap-3 p-3 border border-border rounded-xl bg-card"
        >
          <Skeleton className="h-16 w-16 rounded-lg shrink-0" />
          <div className="space-y-1.5 flex-1 min-w-0 justify-center flex flex-col">
            <Skeleton className="h-4 w-3/4 rounded" />
            <Skeleton className="h-3 w-1/2 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function WorkOrdersPage() {
  const { role, userData } = useRole();

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
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectTechnicianId, setRejectTechnicianId] = useState("");
  const [isRejectingWorkOrder, setIsRejectingWorkOrder] = useState(false);
  const [isApprovingWorkOrder, setIsApprovingWorkOrder] = useState(false);
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
  const [stats, setStats] = useState<{
    open: number;
    inProgress: number;
    onHold: number;
    completed: number;
    overdue: number;
  }>({
    open: 0,
    inProgress: 0,
    onHold: 0,
    completed: 0,
    overdue: 0,
  });
  const itemsPerPage = 5;

  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const chatSocketRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  async function loadChatHistory(woId: string) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/work-order-chat/messages/${woId}`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      if (response.ok) {
        const data = await response.json();
        setChatMessages(data);
      }
    } catch (err) {
      console.error("Failed to load work order chat history:", err);
    }
  }

  const scrollToChatBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToChatBottom();
  }, [chatMessages]);

  useEffect(() => {
    if (!selectedWOId) return;

    let socket: any = null;

    async function initChatSocket() {
      const token = await getJwtTokenFromServer();
      if (!token) return;

      socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001", {
        transports: ["websocket"],
        auth: { token },
        query: { token }
      });

      chatSocketRef.current = socket;

      socket.on("connect", () => {
        console.log("[WS] Work Order Chat Socket connected");
        socket.emit("joinWorkOrder", { workOrderId: selectedWOId });
      });

      socket.on("receiveWorkOrderMessage", (message: any) => {
        setChatMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      });

      socket.on("workOrderError", (err: any) => {
        toast.error(err.error || "Work Order Chat Error");
      });
    }

    loadChatHistory(selectedWOId);
    initChatSocket();

    return () => {
      if (socket) {
        socket.emit("leaveWorkOrder", { workOrderId: selectedWOId });
        socket.disconnect();
      }
      chatSocketRef.current = null;
    };
  }, [selectedWOId]);

  useEffect(() => {
    // Connect to live updates socket
    const socket = io("http://localhost:3001");

    socket.on("connect", () => {
      console.log("[WS] Live updates WebSocket connected");
    });

    socket.on("work-order-status-updated", (data: { workOrderId: string; status: string }) => {
      console.log("[WS] Live update received:", data);
      toast.info(`Work order status updated to ${data.status.replace("_", " ")}`);
      loadWorkOrders();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

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
      else if (activeTab === "on_hold") apiStatus = "ON_HOLD";
      else if (activeTab === "under_review") apiStatus = "UNDER_REVIEW";
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

      // Fetch work orders to calculate global KPI card stats fast without blocking response
      fetchWorkOrders({ page: 1, limit: 100 })
        .then((allRes) => {
          const allMapped = allRes.workOrders.map(mapApiWorkOrder);
          const now = new Date();
          const globalStats = {
            open: allMapped.filter((wo) => wo.status === "open").length,
            inProgress: allMapped.filter((wo) => wo.status === "in_progress").length,
            onHold: allMapped.filter((wo) => wo.status === "on_hold").length,
            completed: allMapped.filter((wo) => wo.status === "completed" || wo.status === "under_review").length,
            overdue: allMapped.filter(
              (wo) => wo.status !== "completed" && wo.dueDateRaw && new Date(wo.dueDateRaw) < now
            ).length,
          };
          setStats(globalStats);
        })
        .catch((err) => console.error("Error fetching global work order stats:", err));

      if (response.pagination) {
        setTotalPages(response.pagination.totalPages || 1);
        setTotalItems(response.pagination.total || 0);
      } else {
        setTotalPages(1);
        setTotalItems(mappedWorkOrders.length);
      }

      if (mappedWorkOrders.length > 0) {
        if (selectedWOId) {
          const stillExists = mappedWorkOrders.some((wo) => (wo.backendId || wo.id) === selectedWOId);
          const targetId = stillExists ? selectedWOId : (mappedWorkOrders[0].backendId || mappedWorkOrders[0].id);
          setSelectedWOId(targetId);

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

  // Auto-selection of first template disabled to allow full-width table by default

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

  const handleApproveWorkOrder = async () => {
    if (!selectedWO || !selectedWO.backendId) return;

    try {
      setIsApprovingWorkOrder(true);
      await approveWorkOrder(selectedWO.backendId);
      const refreshedWorkOrder = await fetchWorkOrderById(selectedWO.backendId);
      replaceWorkOrder(mapApiWorkOrder(refreshedWorkOrder));
      toast.success("Work Order approved and closed successfully!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to approve work order";
      toast.error(message);
    } finally {
      setIsApprovingWorkOrder(false);
    }
  };

  const handleOpenRejectDialog = () => {
    if (!selectedWO) return;
    setRejectReason("");
    setRejectTechnicianId(selectedWO.assignedTechnicianId || "");
    setRejectDialogOpen(true);
  };

  const handleRejectWorkOrderSupervisor = async () => {
    if (!selectedWO || !selectedWO.backendId || !rejectReason.trim() || !rejectTechnicianId) {
      toast.error("Please fill in all mandatory fields.");
      return;
    }

    try {
      setIsRejectingWorkOrder(true);
      await rejectWorkOrderSupervisor(selectedWO.backendId, {
        reason: rejectReason.trim(),
        reassignTechnicianId: rejectTechnicianId,
      });
      const refreshedWorkOrder = await fetchWorkOrderById(selectedWO.backendId);
      replaceWorkOrder(mapApiWorkOrder(refreshedWorkOrder));
      setRejectDialogOpen(false);
      toast.success("Work Order rejected and reassigned successfully!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to reject work order";
      toast.error(message);
    } finally {
      setIsRejectingWorkOrder(false);
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

  const handleSendMessage = () => {
    if (!chatMessageText.trim() || !selectedWOId || !chatSocketRef.current) return;

    chatSocketRef.current.emit("sendWorkOrderMessage", {
      workOrderId: selectedWOId,
      message: chatMessageText.trim(),
    });

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
      case "under_review":
        return "border-orange-500/20 bg-orange-50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400";
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
      {!selectedWO && !selectedTemplate && (
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
            <Button 
              onClick={() => setNewWODialogOpen(true)}
              className="w-full xl:w-auto h-auto py-2.5 px-5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold flex items-center justify-center gap-2 rounded-xl transition-all shadow-md text-xs uppercase tracking-wider shrink-0"
            >
              <Plus className="h-4 w-4" />
              New Work Order
            </Button>
            <Button 
              onClick={() => setTemplateDialogOpen(true)}
              variant="outline"
              className="w-full xl:w-auto h-auto py-2.5 px-5 font-bold flex items-center justify-center gap-2 rounded-xl text-xs uppercase tracking-wider shrink-0"
            >
              <ListChecks className="h-4 w-4" />
              Create Template
            </Button>
          </div>
        </div>
      )}

      {/* 2. LAYOUT - SWITCHES BETWEEN FULL TABLE AND INDIVIDUAL DETAIL VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0 items-stretch pb-2">

        {/* ================== COLUMN 1: WORK ORDERS LIST (col-span-12) ================== */}
        <div className={`min-h-0 bg-card border border-border rounded-xl shadow-sm overflow-hidden h-full flex flex-col transition-all duration-300 lg:col-span-12 ${
          (selectedWO || selectedTemplate) ? "hidden lg:hidden" : ""
        }`}>
          {/* Table Header Controls */}
          <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center md:justify-between gap-4 shrink-0 bg-muted/5">
            <div className="flex items-center gap-3">
              {/* List Toggle Control */}
              <div className="flex bg-muted p-0.5 rounded-lg border border-border shrink-0">
                <button
                  onClick={() => setListMode("work-orders")}
                  className={`text-center py-1.5 px-4 rounded-md text-xs font-bold transition-all ${listMode === "work-orders"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  Work Orders
                </button>
                <button
                  onClick={() => setListMode("checklists")}
                  className={`text-center py-1.5 px-4 rounded-md text-xs font-bold transition-all ${listMode === "checklists"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  Checklists
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
              <input
                type="text"
                placeholder={listMode === "work-orders" ? "Search work orders..." : "Search checklists..."}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (listMode === "work-orders") {
                    setCurrentPage(1);
                  }
                }}
                className="w-full pl-9 pr-4 py-1.5 border border-border rounded-lg bg-background text-xs text-foreground placeholder-muted-foreground/60 focus:outline-hidden focus:ring-1 focus:ring-ring focus:border-ring font-medium"
              />
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-3">
              {listMode === "work-orders" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className={`h-8 px-3 text-xs font-bold text-muted-foreground relative ${priorityFilter !== "all" ? "text-primary bg-primary/10 border-primary/20" : ""}`}>
                      <Filter className="h-3.5 w-3.5 mr-1.5" />
                      Priority: {priorityFilter === "all" ? "All" : priorityFilter.charAt(0) + priorityFilter.slice(1).toLowerCase()}
                      {priorityFilter !== "all" && (
                        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background" />
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
          </div>

          {/* Sub-Header Tab Filters for Work Orders */}
          {listMode === "work-orders" && (
            <div className="p-3 border-b border-border bg-muted/10 shrink-0 flex gap-2 overflow-x-auto scrollbar-none items-center">
              {["all", "open", "assigned", "in_progress", "on_hold", "under_review", "completed"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 rounded-md text-xs font-semibold border transition-all shrink-0 capitalize ${activeTab === tab
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background text-muted-foreground border-border hover:bg-muted/50"
                    }`}
                >
                  {tab.replace("_", " ")}
                </button>
              ))}
            </div>
          )}

          {/* Scrollable Table Content */}
          <ScrollArea className="flex-1 min-h-0">
            {listMode === "work-orders" ? (
              isLoadingWorkOrders ? (
                <div className="p-6 space-y-4">
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              ) : workOrdersError ? (
                <div className="flex flex-col items-center justify-center py-20 text-center text-rose-600">
                  <AlertTriangle className="h-12 w-12 text-rose-500/60 mb-2" />
                  <p className="text-sm font-semibold">Unable to load work orders</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs">{workOrdersError}</p>
                </div>
              ) : paginatedWorkOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
                  <ClipboardList className="h-12 w-12 text-muted-foreground/40 mb-2" />
                  <p className="text-sm font-semibold">No work orders found</p>
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-xs text-left border-collapse min-w-[1000px]">
                    <thead>
                      <tr className="border-b border-border bg-muted/30 font-bold text-muted-foreground">
                        <th className="py-3 px-4">WO Number</th>
                        <th className="py-3 px-4">Asset</th>
                        <th className="py-3 px-4">Priority</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Assigned To</th>
                        <th className="py-3 px-4">Due Date</th>
                        <th className="py-3 px-4">Work Type</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedWorkOrders.map((wo) => {
                        const workOrderKey = wo.backendId || wo.id;
                        return (
                          <tr
                            key={workOrderKey}
                            onClick={() => handleSelectWorkOrder(wo)}
                            className="border-b border-border/50 hover:bg-muted/20 cursor-pointer transition-colors"
                          >
                            <td className="py-3.5 px-4 font-bold text-primary">{wo.id}</td>
                            <td className="py-3.5 px-4 text-muted-foreground">{wo.asset}</td>
                            <td className="py-3.5 px-4">
                              <span className={`text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-full border uppercase ${getPriorityBadgeStyles(wo.priority)}`}>
                                {wo.priority}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-full border uppercase ${getStatusBadgeStyles(wo.status)}`}>
                                {wo.status.replace("_", " ")}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-medium text-foreground">{wo.assignedTo?.name || "Unassigned"}</td>
                            <td className="py-3.5 px-4 text-muted-foreground">{wo.dueDate}</td>
                            <td className="py-3.5 px-4 font-semibold text-muted-foreground">{wo.workType}</td>
                            <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10"
                                  onClick={() => {
                                    handleSelectWorkOrder(wo);
                                    setMiddleTab("chat");
                                  }}
                                  title="Chat about work order"
                                >
                                  <MessageSquare className="h-3.5 w-3.5" />
                                </Button>
                                {canModifyItem(role, wo.createdBy) && (
                                  <>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => { setSelectedWOId(wo.backendId || wo.id); handleOpenEditDialog(); }}>
                                      <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => { setSelectedWOId(wo.backendId || wo.id); handleDeleteWorkOrder(); }}>
                                      <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            ) : filteredTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
                <ListChecks className="h-12 w-12 text-muted-foreground/40 mb-2" />
                <p className="text-sm font-semibold">No templates found</p>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-xs text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 font-bold text-muted-foreground">
                      <th className="py-3 px-4">Template Name</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4">Total Items</th>
                      <th className="py-3 px-4">Created Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTemplates.map((template) => (
                      <tr
                        key={template.id}
                        onClick={() => setSelectedTemplateId(template.id)}
                        className="border-b border-border/50 hover:bg-muted/20 cursor-pointer transition-colors"
                      >
                        <td className="py-3.5 px-4 font-bold text-primary">{template.name}</td>
                        <td className="py-3.5 px-4 text-muted-foreground max-w-sm truncate">{template.description || "No description provided."}</td>
                        <td className="py-3.5 px-4">
                          <span className="text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-full border border-indigo-500/20 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400 uppercase">
                            {template.items?.length || 0} {template.items?.length === 1 ? "Item" : "Items"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground">{new Date(template.createdAt).toLocaleDateString()}</td>
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => setSelectedTemplateId(template.id)}>
                              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => { setSelectedTemplateId(template.id); handleDeleteChecklistTemplate(); }}>
                              <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </ScrollArea>

          {/* Pagination Controls */}
          {listMode === "work-orders" && (
            <div className="p-3 border-t border-border flex items-center justify-between bg-muted/10 text-xs text-muted-foreground shrink-0">
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
          !(selectedWO || selectedTemplate) ? "hidden lg:hidden" : "lg:col-span-12"
        }`}>
          {/* Header Actions */}
          <div className="p-4 border-b border-border flex items-center justify-between shrink-0 bg-muted/5">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedWOId(null);
                  setSelectedTemplateId(null);
                }}
                className="text-muted-foreground hover:text-foreground font-semibold flex items-center gap-1.5 px-3 h-8.5 rounded-lg border border-border bg-background hover:bg-muted/50 transition-all shadow-xs"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
            </div>
            {listMode === "work-orders" ? (
              selectedWO && (
                <div className="flex items-center gap-2">
                  {canModifyItem(role, selectedWO.createdBy) && (
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
                  )}
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
                    Select a work order from the list to view its detailed specifications, activities, checklist, and attachments.
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

                  {/* Horizontal Progress Timeline */}
                  {(() => {
                    const getLifecycleSteps = (wo: any) => {
                      const activities = wo.activitiesRaw || [];
                      const getStepTime = (status: string) => {
                        const act = activities.find((a: any) => 
                          a.action === "STATUS_CHANGED" && a.remarks?.toUpperCase().includes(status)
                        ) || activities.find((a: any) => a.action === "WORK_ORDER_CREATED" && status === "OPEN");
                        return act ? new Date(act.createdAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : null;
                      };
                      
                      return [
                        { label: "OPEN", time: getStepTime("OPEN") || (wo.createdBy?.date ? new Date(wo.createdAtRaw || "").toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : null) },
                        { label: "IN PROGRESS", time: getStepTime("IN_PROGRESS") || getStepTime("IN PROGRESS") },
                        { label: "ON HOLD", time: getStepTime("ON_HOLD") || getStepTime("ON HOLD") },
                        { label: "COMPLETED", time: getStepTime("COMPLETED") || getStepTime("CLOSED") },
                        { label: "UNDER REVIEW", time: getStepTime("UNDER_REVIEW") }
                      ];
                    };

                    const steps = getLifecycleSteps(selectedWO);
                    const getActiveStepIndex = (status: string) => {
                      if (status === "open") return 0;
                      if (status === "in_progress") return 1;
                      if (status === "on_hold") return 2;
                      if (status === "completed") return 3;
                      if (status === "under_review") return 4;
                      return 0;
                    };
                    const activeIdx = getActiveStepIndex(selectedWO.status);

                    return (
                      <div className="bg-muted/10 border border-border rounded-xl p-4 flex items-center justify-between overflow-x-auto gap-4">
                        {steps.map((step, idx) => {
                          const isCompleted = idx <= activeIdx;
                          const isActive = idx === activeIdx;
                          return (
                            <div key={idx} className="flex items-center gap-3 shrink-0">
                              <div className="flex items-center gap-2">
                                <div className={`h-7 w-7 rounded-full flex items-center justify-center border font-bold text-xs ${
                                  isActive ? "bg-orange-500 border-orange-600 text-white animate-pulse" :
                                  isCompleted ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" :
                                  "bg-muted border-border text-muted-foreground"
                                }`}>
                                  {idx + 1}
                                </div>
                                <div className="text-left">
                                  <span className={`text-[10px] font-bold block uppercase tracking-wide ${isActive ? "text-orange-600" : "text-foreground"}`}>
                                    {step.label}
                                  </span>
                                  <span className="text-[9px] text-muted-foreground font-semibold block">
                                    {step.time || "—"}
                                  </span>
                                </div>
                              </div>
                              {idx < steps.length - 1 && (
                                <span className="text-muted-foreground/30 text-xs font-bold pl-4">→</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {selectedWO.status === "under_review" && (
                    <div className="bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 p-4 rounded-xl space-y-3">
                      <div className="flex items-center gap-2 font-semibold">
                        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500 animate-bounce" />
                        <span>Waiting for Supervisor Review</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-normal">
                        This work order has been completed by the technician and is awaiting supervisor verification.
                      </p>
                      {(role?.toUpperCase() === "SUPERVISOR" || role?.toUpperCase() === "ADMIN" || role?.toUpperCase() === "CUSTOMER_MANAGER" || role?.toUpperCase() === "MAINTENANCE_MANAGER" || role?.toUpperCase() === "SITE_INCHARGE") && (
                        <div className="flex items-center gap-2.5 pt-1.5">
                          <Button
                            onClick={handleApproveWorkOrder}
                            disabled={isApprovingWorkOrder}
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            {isApprovingWorkOrder ? "Approving..." : "Approve Work"}
                          </Button>
                          <Button
                            onClick={handleOpenRejectDialog}
                            variant="outline"
                            size="sm"
                            className="border-rose-200 hover:bg-rose-50 text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1.5"
                          >
                            <XCircle className="h-4 w-4" />
                            Reject & Reassign
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Inner Details Tabs */}
                  <div className="mt-4">
                    <Tabs value={middleTab} onValueChange={setMiddleTab} className="w-full">
                      <TabsList className="flex w-full justify-start gap-8 border-b border-border bg-transparent p-0 rounded-none h-auto shrink-0 overflow-x-auto scrollbar-none">
                        <TabsTrigger
                          value="details"
                          className="bg-transparent border-b-2 border-transparent rounded-none px-1 pb-2.5 text-xs font-bold text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none shadow-none hover:text-foreground transition-all"
                        >
                          Overview
                        </TabsTrigger>
                        <TabsTrigger
                          value="history"
                          className="bg-transparent border-b-2 border-transparent rounded-none px-1 pb-2.5 text-xs font-bold text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none shadow-none hover:text-foreground transition-all"
                        >
                          History
                        </TabsTrigger>
                        <TabsTrigger
                          value="checklist"
                          className="bg-transparent border-b-2 border-transparent rounded-none px-1 pb-2.5 text-xs font-bold text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none shadow-none hover:text-foreground transition-all"
                        >
                          Checklist
                        </TabsTrigger>
                        <TabsTrigger
                          value="attachments"
                          className="bg-transparent border-b-2 border-transparent rounded-none px-1 pb-2.5 text-xs font-bold text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none shadow-none hover:text-foreground transition-all"
                        >
                          Attachments
                        </TabsTrigger>
                        <TabsTrigger
                          value="parts"
                          className="bg-transparent border-b-2 border-transparent rounded-none px-1 pb-2.5 text-xs font-bold text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none shadow-none hover:text-foreground transition-all"
                        >
                          Parts & Cost
                        </TabsTrigger>
                        <TabsTrigger
                          value="chat"
                          className="bg-transparent border-b-2 border-transparent rounded-none px-1 pb-2.5 text-xs font-bold text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none shadow-none hover:text-foreground transition-all"
                        >
                          Chat {selectedWO.chat?.length ? `(${selectedWO.chat.length})` : ""}
                        </TabsTrigger>
                        <TabsTrigger
                          value="review"
                          className="bg-transparent border-b-2 border-transparent rounded-none px-1 pb-2.5 text-xs font-bold text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none shadow-none hover:text-foreground transition-all"
                        >
                          Review
                        </TabsTrigger>
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
                                <p className={`font-bold mt-0.5 ${selectedWO.assetDetails.status === "ACTIVE" ? "text-emerald-500" :
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

                      {/* History Tab */}
                      <TabsContent value="history" className="pt-4 space-y-6">
                        {isLoadingDetails ? (
                          <div className="space-y-4">
                            <Skeleton className="h-20 w-full rounded-xl" />
                            <Skeleton className="h-40 w-full rounded-xl" />
                            <Skeleton className="h-40 w-full rounded-xl" />
                          </div>
                        ) : (
                          (() => {
                            // Helpers
                            const getHoldsInfo = (wo: any) => {
                              const activities = wo.activitiesRaw || [];
                              const holdActivities = activities.filter((a: any) => 
                                a.remarks?.toUpperCase().includes("ON_HOLD") || 
                                a.remarks?.toUpperCase().includes("ON HOLD") ||
                                a.action?.toUpperCase().includes("HOLD")
                              );
                              const holdCount = holdActivities.length;
                              const holdReasons = holdActivities
                                .map((a: any) => {
                                  const parts = a.remarks.split("Reason:");
                                  return parts.length > 1 ? parts[1].trim() : a.remarks;
                                });
                              
                              let totalHoldDurationMs = 0;
                              const sortedActs = [...activities].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                              
                              for (let i = 0; i < sortedActs.length; i++) {
                                const act = sortedActs[i];
                                const isHold = act.remarks?.toUpperCase().includes("ON_HOLD") || act.remarks?.toUpperCase().includes("ON HOLD");
                                if (isHold) {
                                  const holdStart = new Date(act.createdAt);
                                  let holdEnd: Date | null = null;
                                  for (let j = i + 1; j < sortedActs.length; j++) {
                                    const nextAct = sortedActs[j];
                                    const isResume = nextAct.remarks?.toUpperCase().includes("IN_PROGRESS") || nextAct.remarks?.toUpperCase().includes("IN PROGRESS");
                                    if (isResume) {
                                      holdEnd = new Date(nextAct.createdAt);
                                      break;
                                    }
                                  }
                                  if (holdStart && holdEnd) {
                                    totalHoldDurationMs += (holdEnd.getTime() - holdStart.getTime());
                                  } else if (holdStart && wo.status === "on_hold") {
                                    totalHoldDurationMs += (new Date().getTime() - holdStart.getTime());
                                  }
                                }
                              }
                              
                              const holdDurationHours = totalHoldDurationMs > 0 
                                ? (totalHoldDurationMs / (1000 * 60 * 60)).toFixed(1) + " hrs" 
                                : "—";
                              
                              return {
                                count: holdCount,
                                reasons: holdReasons.length > 0 ? holdReasons : ["—"],
                                duration: holdCount > 0 ? holdDurationHours : "—"
                              };
                            };

                            const getWorkDuration = (wo: any) => {
                              const start = wo.breakdownStartedAt ? new Date(wo.breakdownStartedAt) : null;
                              const end = wo.assetRestoredAt ? new Date(wo.assetRestoredAt) : null;
                              if (start && end) {
                                const diffMs = end.getTime() - start.getTime();
                                return (diffMs / (1000 * 60 * 60)).toFixed(1) + " hrs";
                              }
                              return "—";
                            };

                            const getAttachmentsCount = (wo: any) => {
                              const attachments = wo.attachments || [];
                              const images = attachments.filter((a: any) => a.fileType?.startsWith("image/") || /\.(jpg|jpeg|png|gif)$/i.test(a.fileName)).length;
                              const videos = attachments.filter((a: any) => a.fileType?.startsWith("video/") || /\.(mp4|mov|avi)$/i.test(a.fileName)).length;
                              const documents = attachments.length - images - videos;
                              return { images, videos, documents };
                            };

                            const getTimelineHistory = (wo: any) => {
                              const activities = [...(wo.activitiesRaw || [])].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                              return activities.map((act) => {
                                const time = new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                const date = new Date(act.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' });
                                return {
                                  time: `${date} ${time}`,
                                  title: toTitleCase(act.action.replace(/_/g, ' ')),
                                  remarks: act.remarks || ""
                                };
                              });
                            };

                            const holds = getHoldsInfo(selectedWO);
                            const duration = getWorkDuration(selectedWO);
                            const attachments = getAttachmentsCount(selectedWO);
                            const timeline = getTimelineHistory(selectedWO);

                            const totalChecklistItems = selectedWO.checklist?.items?.length || 0;
                            const isCompletedOrReview = selectedWO.status === "under_review" || selectedWO.status === "completed";
                            const completedChecklistItems = selectedWO.checklist ? (isCompletedOrReview ? totalChecklistItems : 0) : 0;
                            const pendingChecklistItems = selectedWO.checklist ? (isCompletedOrReview ? 0 : totalChecklistItems) : 0;
                            const checklistPercentage = totalChecklistItems > 0 ? Math.round((completedChecklistItems / totalChecklistItems) * 100) : 0;

                            const submitActivity = (selectedWO.activitiesRaw || []).find((a: any) => a.action === "WORK_ORDER_SUBMITTED_FOR_REVIEW");
                            const submittedAt = submitActivity ? new Date(submitActivity.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "—";

                            const totalStatusChanges = (selectedWO.activitiesRaw || []).filter((a: any) => a.action === "STATUS_CHANGED").length;

                            return (
                              <div className="space-y-6 max-h-[calc(100vh-240px)] overflow-y-auto pr-2 scrollbar-thin">
                                {/* Section 12 — Related Information / KPI CARDS */}
                                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                                  <div className="bg-primary/5 border border-primary/10 rounded-xl p-3.5 space-y-1">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Total Activities</span>
                                    <p className="text-xl font-bold text-foreground">{selectedWO.activities?.length || 0}</p>
                                  </div>
                                  <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-3.5 space-y-1">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Total Chat Messages</span>
                                    <p className="text-xl font-bold text-foreground">{selectedWO.chat?.length || 0}</p>
                                  </div>
                                  <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3.5 space-y-1">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Total Attachments</span>
                                    <p className="text-xl font-bold text-foreground">{selectedWO.attachments?.length || 0}</p>
                                  </div>
                                  <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3.5 space-y-1">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Checklist Progress</span>
                                    <p className="text-xl font-bold text-foreground">{selectedWO.checklist ? `${checklistPercentage}%` : "—"}</p>
                                  </div>
                                  <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-3.5 space-y-1 col-span-2 lg:col-span-1">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Total Status Changes</span>
                                    <p className="text-xl font-bold text-foreground">{totalStatusChanges}</p>
                                  </div>
                                </div>

                                {/* Main Report Layout */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                  {/* Left Column (2/3 width) - Detailed Reports */}
                                  <div className="md:col-span-2 space-y-5">
                                    {/* Section 1 — Work Order Summary */}
                                    <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
                                      <h4 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border pb-2 flex items-center gap-2">
                                        <FileText className="h-4.5 w-4.5" />
                                        Section 1 — Work Order Summary
                                      </h4>
                                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                                        <div>
                                          <span className="text-muted-foreground block font-medium">Work Order Number</span>
                                          <span className="font-bold text-foreground block mt-0.5">{selectedWO.id}</span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground block font-medium">Title</span>
                                          <span className="font-bold text-foreground block mt-0.5">{selectedWO.title}</span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground block font-medium">Description</span>
                                          <span className="font-semibold text-foreground block mt-0.5 line-clamp-2" title={selectedWO.description}>{selectedWO.description}</span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground block font-medium">Asset</span>
                                          <span className="font-bold text-foreground block mt-0.5">{selectedWO.asset}</span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground block font-medium">Customer</span>
                                          <span className="font-semibold text-foreground block mt-0.5">—</span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground block font-medium">Site</span>
                                          <span className="font-bold text-foreground block mt-0.5">{selectedWO.location}</span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground block font-medium">Department</span>
                                          <span className="font-semibold text-foreground block mt-0.5">—</span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground block font-medium">System</span>
                                          <span className="font-semibold text-foreground block mt-0.5">—</span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground block font-medium">Priority</span>
                                          <span className="font-bold text-foreground block mt-0.5 capitalize">{selectedWO.priority}</span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground block font-medium">Work Type</span>
                                          <span className="font-bold text-foreground block mt-0.5">{selectedWO.workType}</span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground block font-medium">Current Status</span>
                                          <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border mt-0.5 ${getStatusBadgeStyles(selectedWO.status)}`}>
                                            {selectedWO.status.replace("_", " ")}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground block font-medium">Assigned Technician</span>
                                          <span className="font-bold text-foreground block mt-0.5">{selectedWO.assignedTo?.name || "—"}</span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground block font-medium">Created By</span>
                                          <span className="font-bold text-foreground block mt-0.5">{selectedWO.createdBy?.name || "—"}</span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground block font-medium">Supervisor</span>
                                          <span className="font-bold text-foreground block mt-0.5">{selectedWO.reviewedBy || "—"}</span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground block font-medium">Created Date</span>
                                          <span className="font-semibold text-foreground block mt-0.5">{selectedWO.createdBy?.date || "—"}</span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground block font-medium">Due Date</span>
                                          <span className="font-semibold text-foreground block mt-0.5">{selectedWO.dueDate || "—"}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Section 3 — Work Duration */}
                                    <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
                                      <h4 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border pb-2 flex items-center gap-2">
                                        <Clock className="h-4.5 w-4.5" />
                                        Section 3 — Work Duration
                                      </h4>
                                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs">
                                        <div>
                                          <span className="text-muted-foreground block font-medium">Start Time</span>
                                          <span className="font-semibold text-foreground block mt-0.5">
                                            {selectedWO.breakdownStartedAt ? new Date(selectedWO.breakdownStartedAt).toLocaleString() : "—"}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground block font-medium">Completion Time</span>
                                          <span className="font-semibold text-foreground block mt-0.5">
                                            {selectedWO.assetRestoredAt ? new Date(selectedWO.assetRestoredAt).toLocaleString() : "—"}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground block font-medium">Estimated Hours</span>
                                          <span className="font-bold text-foreground block mt-0.5">{selectedWO.estimatedHours || "—"}</span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground block font-medium">Actual Hours</span>
                                          <span className="font-bold text-foreground block mt-0.5">{selectedWO.actualHours || "—"}</span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground block font-medium">Total Work Duration</span>
                                          <span className="font-bold text-foreground block mt-0.5 text-primary">{duration}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Section 4 — Hold Information */}
                                    <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
                                      <h4 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border pb-2 flex items-center gap-2">
                                        <AlertTriangle className="h-4.5 w-4.5" />
                                        Section 4 — Hold Information
                                      </h4>
                                      {holds.count === 0 ? (
                                        <div className="text-xs text-muted-foreground font-semibold py-2">
                                          No Hold Recorded
                                        </div>
                                      ) : (
                                        <div className="space-y-3.5">
                                          <div className="grid grid-cols-2 gap-4 text-xs">
                                            <div>
                                              <span className="text-muted-foreground block font-medium">Total Hold Count</span>
                                              <span className="font-bold text-foreground block mt-0.5">{holds.count}</span>
                                            </div>
                                            <div>
                                              <span className="text-muted-foreground block font-medium">Total Hold Duration</span>
                                              <span className="font-bold text-rose-500 block mt-0.5">{holds.duration}</span>
                                            </div>
                                          </div>
                                          <div className="space-y-1.5">
                                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">Hold Reasons</span>
                                            <ul className="list-disc pl-4 text-xs space-y-1 text-foreground/80 leading-normal">
                                              {holds.reasons.map((r: string, i: number) => (
                                                <li key={i}>{r}</li>
                                              ))}
                                            </ul>
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    {/* Section 5 — Technician Summary */}
                                    <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
                                      <h4 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border pb-2 flex items-center gap-2">
                                        <User className="h-4.5 w-4.5" />
                                        Section 5 — Technician Summary
                                      </h4>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                        <div className="space-y-2">
                                          <div>
                                            <span className="text-muted-foreground block font-medium">Assigned Technician</span>
                                            <span className="font-bold text-foreground block mt-0.5">{selectedWO.assignedTo?.name || "—"}</span>
                                          </div>
                                          <div>
                                            <span className="text-muted-foreground block font-medium">Accepted At</span>
                                            <span className="font-semibold text-foreground block mt-0.5">
                                              {(() => {
                                                const act = (selectedWO.activitiesRaw || []).find((a: any) => a.action === "WORK_ORDER_ACCEPTED");
                                                return act ? new Date(act.createdAt).toLocaleString() : "—";
                                              })()}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-muted-foreground block font-medium">Started At</span>
                                            <span className="font-semibold text-foreground block mt-0.5">
                                              {selectedWO.breakdownStartedAt ? new Date(selectedWO.breakdownStartedAt).toLocaleString() : "—"}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-muted-foreground block font-medium">Completed At</span>
                                            <span className="font-semibold text-foreground block mt-0.5">
                                              {selectedWO.assetRestoredAt ? new Date(selectedWO.assetRestoredAt).toLocaleString() : "—"}
                                            </span>
                                          </div>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground block font-medium">Resolution Notes</span>
                                          <p className="text-xs font-medium text-foreground bg-muted/20 border border-border rounded-xl p-3 mt-1.5 min-h-[90px] leading-relaxed">
                                            {selectedWO.resolutionNotes || "Not Available"}
                                          </p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Section 6 — Checklist Summary */}
                                    <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
                                      <h4 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border pb-2 flex items-center gap-2">
                                        <ListChecks className="h-4.5 w-4.5" />
                                        Section 6 — Checklist Summary
                                      </h4>
                                      {!selectedWO.checklist ? (
                                        <div className="text-xs text-muted-foreground font-semibold py-2">
                                          Checklist Not Available
                                        </div>
                                      ) : (
                                        <div className="space-y-4 text-xs">
                                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            <div>
                                              <span className="text-muted-foreground block font-medium">Total Checklist Items</span>
                                              <span className="font-bold text-foreground block mt-0.5">{totalChecklistItems}</span>
                                            </div>
                                            <div>
                                              <span className="text-muted-foreground block font-medium">Completed Items</span>
                                              <span className="font-bold text-emerald-500 block mt-0.5">{completedChecklistItems}</span>
                                            </div>
                                            <div>
                                              <span className="text-muted-foreground block font-medium">Pending Items</span>
                                              <span className="font-bold text-amber-500 block mt-0.5">{pendingChecklistItems}</span>
                                            </div>
                                            <div>
                                              <span className="text-muted-foreground block font-medium">Completion Percentage</span>
                                              <span className="font-bold text-primary block mt-0.5">{checklistPercentage}%</span>
                                            </div>
                                          </div>
                                          <div className="space-y-1.5">
                                            <div className="w-full bg-muted rounded-full h-2">
                                              <div 
                                                className="bg-primary h-2 rounded-full transition-all duration-500" 
                                                style={{ width: `${checklistPercentage}%` }} 
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    {/* Section 8 — Spare Parts Summary */}
                                    <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
                                      <h4 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border pb-2 flex items-center gap-2">
                                        <Wrench className="h-4.5 w-4.5" />
                                        Section 8 — Spare Parts Summary
                                      </h4>
                                      <div className="space-y-3">
                                        <div className="overflow-x-auto">
                                          <table className="w-full text-xs text-left border-collapse">
                                            <thead>
                                              <tr className="border-b border-border bg-muted/40 font-bold text-muted-foreground">
                                                <th className="py-2 px-3">Part Name</th>
                                                <th className="py-2 px-3 text-center">Quantity</th>
                                                <th className="py-2 px-3 text-right">Unit Cost</th>
                                                <th className="py-2 px-3 text-right">Total Cost</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              <tr className="border-b border-border/60">
                                                <td className="py-2.5 px-3 font-semibold text-foreground/70">—</td>
                                                <td className="py-2.5 px-3 text-center font-semibold text-foreground/70">—</td>
                                                <td className="py-2.5 px-3 text-right font-semibold text-foreground/70">—</td>
                                                <td className="py-2.5 px-3 text-right font-semibold text-foreground/70">—</td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground font-semibold italic text-right">
                                          Parts Consumption: No Parts Consumed (Inventory module integration pending)
                                        </p>
                                      </div>
                                    </div>

                                    {/* Section 9 — Cost Summary */}
                                    <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
                                      <h4 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border pb-2 flex items-center gap-2">
                                        <DollarSign className="h-4.5 w-4.5" />
                                        Section 9 — Cost Summary
                                      </h4>
                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                        <div className="bg-muted/30 border border-border/80 rounded-xl p-3.5 space-y-1">
                                          <span className="text-muted-foreground block font-medium">Parts Cost</span>
                                          <span className="font-bold text-foreground block text-sm">—</span>
                                        </div>
                                        <div className="bg-muted/30 border border-border/80 rounded-xl p-3.5 space-y-1">
                                          <span className="text-muted-foreground block font-medium">Labor Cost</span>
                                          <span className="font-bold text-foreground block text-sm">—</span>
                                        </div>
                                        <div className="bg-primary/5 border border-primary/10 rounded-xl p-3.5 space-y-1">
                                          <span className="text-primary block font-bold">Total Cost</span>
                                          <span className="font-black text-primary block text-sm">Not Available</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Section 10 — Downtime Summary */}
                                    <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
                                      <h4 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border pb-2 flex items-center gap-2">
                                        <Activity className="h-4.5 w-4.5" />
                                        Section 10 — Downtime Summary
                                      </h4>
                                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                                        <div>
                                          <span className="text-muted-foreground block font-medium">Breakdown Started</span>
                                          <span className="font-semibold text-foreground block mt-0.5">
                                            {selectedWO.breakdownStartedAt ? new Date(selectedWO.breakdownStartedAt).toLocaleString() : "—"}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground block font-medium">Asset Restored</span>
                                          <span className="font-semibold text-foreground block mt-0.5">
                                            {selectedWO.assetRestoredAt ? new Date(selectedWO.assetRestoredAt).toLocaleString() : "—"}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground block font-medium">Total Downtime</span>
                                          <span className="font-bold text-rose-500 block mt-0.5">
                                            {selectedWO.breakdownStartedAt && selectedWO.assetRestoredAt ? duration : "Not Available"}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Right Column (1/3 width) - Status Timeline & Reviews */}
                                  <div className="space-y-5">
                                    {/* Section 11 — Review Summary */}
                                    <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
                                      <h4 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border pb-2 flex items-center gap-2">
                                        <CheckCircle className="h-4.5 w-4.5" />
                                        Section 11 — Review Summary
                                      </h4>
                                      <div className="space-y-4 text-xs">
                                        <div>
                                          <span className="text-muted-foreground block font-medium">Submitted For Review At</span>
                                          <span className="font-semibold text-foreground block mt-0.5">{submittedAt}</span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground block font-medium">Reviewed By</span>
                                          <span className="font-bold text-foreground block mt-0.5">{selectedWO.reviewedBy || "—"}</span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground block font-medium">Reviewed At</span>
                                          <span className="font-semibold text-foreground block mt-0.5">
                                            {selectedWO.reviewedAt ? new Date(selectedWO.reviewedAt).toLocaleString() : "—"}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground block font-medium">Review Status</span>
                                          <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border mt-0.5 ${
                                            selectedWO.reviewResult === "APPROVED" ? "border-emerald-500/20 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400" :
                                            selectedWO.reviewResult === "REJECTED" ? "border-rose-500/20 bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400" :
                                            "border-amber-500/20 bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400"
                                          }`}>
                                            {selectedWO.reviewResult || "Waiting For Supervisor Review"}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground block font-medium">Review Notes</span>
                                          <p className="text-xs font-medium text-foreground bg-muted/20 border border-border rounded-xl p-3 mt-1.5 leading-relaxed min-h-[50px]">
                                            {selectedWO.reviewNotes || "—"}
                                          </p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Section 2 — Work Timeline */}
                                    <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
                                      <h4 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border pb-2 flex items-center gap-2">
                                        <TrendingUp className="h-4.5 w-4.5" />
                                        Section 2 — Work Timeline
                                      </h4>
                                      {timeline.length === 0 ? (
                                        <div className="text-xs text-muted-foreground font-semibold py-2">
                                          No Timeline Activities Found
                                        </div>
                                      ) : (
                                        <div className="relative pl-6 border-l border-border/80 ml-2 space-y-6 py-2">
                                          {timeline.map((item: any, index: number) => (
                                            <div key={index} className="relative">
                                              {/* Circular Timeline Node */}
                                              <div className="absolute -left-[30px] top-0.5 h-4.5 w-4.5 rounded-full border border-primary/20 bg-background flex items-center justify-center">
                                                <div className="h-2 w-2 rounded-full bg-primary" />
                                              </div>
                                              <div className="space-y-0.5 text-xs">
                                                <div className="flex items-center justify-between">
                                                  <span className="font-bold text-foreground">{item.title}</span>
                                                  <span className="text-[10px] text-muted-foreground font-medium">{item.time}</span>
                                                </div>
                                                {item.remarks && (
                                                  <p className="text-[11px] text-muted-foreground leading-normal mt-0.5">{item.remarks}</p>
                                                )}
                                              </div>
                                              {index < timeline.length - 1 && (
                                                <div className="text-center text-muted-foreground/30 text-[10px] font-bold my-1 flex justify-center -left-[28px] absolute w-3.5">
                                                  ↓
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>

                                    {/* Section 7 — Attachments Summary */}
                                    <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
                                      <h4 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border pb-2 flex items-center gap-2">
                                        <Paperclip className="h-4.5 w-4.5" />
                                        Section 7 — Attachments Summary
                                      </h4>
                                      {attachments.images === 0 && attachments.documents === 0 && attachments.videos === 0 ? (
                                        <div className="text-xs text-muted-foreground font-semibold py-2">
                                          No Attachments Uploaded
                                        </div>
                                      ) : (
                                        <div className="space-y-3.5 text-xs">
                                          <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                                            <span className="text-muted-foreground font-medium flex items-center gap-2">
                                              <ImageIcon className="h-4 w-4 text-emerald-500" />
                                              Images Uploaded
                                            </span>
                                            <span className="font-bold text-foreground">{attachments.images}</span>
                                          </div>
                                          <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                                            <span className="text-muted-foreground font-medium flex items-center gap-2">
                                              <FileText className="h-4 w-4 text-blue-500" />
                                              Documents Uploaded
                                            </span>
                                            <span className="font-bold text-foreground">{attachments.documents}</span>
                                          </div>
                                          <div className="flex items-center justify-between py-1.5">
                                            <span className="text-muted-foreground font-medium flex items-center gap-2">
                                              <Play className="h-4 w-4 text-red-500" />
                                              Videos Uploaded
                                            </span>
                                            <span className="font-bold text-foreground">{attachments.videos}</span>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })()
                        )}
                      </TabsContent>

                      {/* Checklist Tab */}
                      <TabsContent value="checklist" className="pt-4 space-y-4">
                        {isLoadingDetails ? (
                          <SkeletonChecklist />
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
                          <SkeletonAttachments />
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

                      {/* Chat Content (visible on all screen sizes) */}
                      <TabsContent value="chat" className="pt-4">
                        <div className="flex flex-col h-[450px] border border-border rounded-xl overflow-hidden bg-background">
                          {/* Live Messages List */}
                          <ScrollArea className="flex-1 p-4 bg-muted/5">
                            {chatMessages.length === 0 ? (
                              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-6">
                                <MessageSquare className="h-8 w-8 text-muted-foreground/30 mb-1" />
                                <p className="text-xs font-semibold">No chat history. Start typing below to chat.</p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {chatMessages.map((msg) => {
                                  if (msg.messageType === "SYSTEM") {
                                    return (
                                      <div key={msg.id} className="flex items-center justify-center my-3">
                                        <div className="flex items-center gap-2 px-3 py-1 bg-muted/60 border border-border rounded-full text-[10px] text-muted-foreground font-bold shadow-2xs">
                                          <Activity className="h-3 w-3 text-primary animate-pulse shrink-0" />
                                          <span className="uppercase tracking-wider">System Activity</span>
                                          <span className="text-foreground/30">•</span>
                                          <span>{msg.message}</span>
                                          <span className="text-foreground/30">•</span>
                                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                        </div>
                                      </div>
                                    );
                                  }

                                  const isMe = msg.senderId === userData?.id;
                                  return (
                                    <div
                                      key={msg.id}
                                      className={`flex items-start gap-2.5 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                                    >
                                      <Avatar className="h-7 w-7 border border-border">
                                        <AvatarFallback className="text-[10px] font-bold">
                                          {getInitials(msg.sender?.fullName || "User")}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="space-y-1 max-w-[80%]">
                                        <div className={`flex items-center gap-1.5 ${isMe ? "justify-end" : "justify-start"}`}>
                                          <span className="text-[10px] font-bold text-foreground">{msg.sender?.fullName || "User"}</span>
                                          <span className="text-[9px] text-muted-foreground">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                          </span>
                                        </div>
                                        <div className={`p-2.5 rounded-xl text-xs leading-relaxed ${isMe
                                          ? "bg-primary text-primary-foreground rounded-tr-none"
                                          : "bg-muted text-foreground rounded-tl-none"
                                          }`}>
                                          {msg.message}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                                <div ref={chatEndRef} />
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

        {/* ================== COLUMN 3: LIVE WORK ORDER CHAT (col-span-4, COLLAPSIBLE) - DEACTIVATED AND HIDDEN TO CHAT TAB PANEL ================== */}
        <div className="hidden lg:hidden">
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
            {chatMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-6">
                <MessageSquare className="h-10 w-10 text-muted-foreground/30 mb-2" />
                <p className="text-sm font-semibold">No chats started yet</p>
                <p className="text-xs text-muted-foreground/75 mt-1">Send a message below to start the conversation.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {chatMessages.map((msg) => {
                  if (msg.messageType === "SYSTEM") {
                    return (
                      <div key={msg.id} className="flex items-center justify-center my-3">
                        <div className="flex items-center gap-2 px-3 py-1 bg-muted/60 border border-border rounded-full text-[10px] text-muted-foreground font-bold shadow-2xs">
                          <Activity className="h-3 w-3 text-primary animate-pulse shrink-0" />
                          <span className="uppercase tracking-wider">System Activity</span>
                          <span className="text-foreground/30">•</span>
                          <span>{msg.message}</span>
                          <span className="text-foreground/30">•</span>
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      </div>
                    );
                  }

                  const isMe = msg.senderId === userData?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-2.5 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                    >
                      <Avatar className="h-8 w-8 border border-border shrink-0">
                        <AvatarFallback className="text-xs font-bold bg-muted-foreground/10 text-muted-foreground">
                          {getInitials(msg.sender?.fullName || "User")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="space-y-1 max-w-[80%]">
                        <div className={`flex items-center gap-1.5 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                          <span className="text-[11px] font-bold text-foreground leading-none">{msg.sender?.fullName || "User"}</span>
                          <span className="text-[9px] text-muted-foreground leading-none">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>

                        <div className={`p-3 rounded-2xl text-xs leading-relaxed ${isMe
                          ? "bg-primary text-primary-foreground rounded-tr-none shadow-sm font-medium"
                          : "bg-background border border-border text-foreground rounded-tl-none shadow-xs"
                          }`}>
                          {msg.message}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
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

      {/* Create Work Order Dialog */}
      <Dialog open={newWODialogOpen} onOpenChange={setNewWODialogOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[92vh] overflow-y-auto p-0 bg-background">
          {/* Header */}
          <div className="px-8 pt-8 pb-4 border-b bg-muted/30">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <ClipboardList className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-xl">Create New Work Order</DialogTitle>
                  <DialogDescription className="mt-0.5">
                    Create a new maintenance task and assign it to a technician. Fields marked with <span className="text-red-500">*</span> are required.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="px-8 py-6 space-y-8">
            {/* Section: Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="new-title">Title *</Label>
                  <Input
                    id="new-title"
                    placeholder="Work Order Title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="new-desc">Description</Label>
                  <Textarea
                    id="new-desc"
                    placeholder="Detailed description of the task..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-priority">Priority</Label>
                  <Select
                    value={newPriority}
                    onValueChange={(val: any) => setNewPriority(val)}
                  >
                    <SelectTrigger id="new-priority">
                      <SelectValue placeholder="Select Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-worktype">Work Type</Label>
                  <Select
                    value={newWorkType}
                    onValueChange={(val) => setNewWorkType(val)}
                  >
                    <SelectTrigger id="new-worktype">
                      <SelectValue placeholder="Select Work Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BREAKDOWN">Reactive (Breakdown)</SelectItem>
                      <SelectItem value="PREVENTIVE">Preventive</SelectItem>
                      <SelectItem value="INSPECTION">Inspection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Section: Assignment & Scheduling */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Assignment & Scheduling</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-asset">Linked Asset</Label>
                  <Select
                    value={newAsset}
                    onValueChange={(val) => setNewAsset(val)}
                  >
                    <SelectTrigger id="new-asset">
                      <SelectValue placeholder="Select Asset" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=" ">— None —</SelectItem>
                      {assets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          {asset.assetName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-location">Location / Site</Label>
                  <Input
                    id="new-location"
                    placeholder="e.g. Building A, Floor 2"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-assignee">Assignee</Label>
                  <Select
                    value={newAssignee}
                    onValueChange={(val) => setNewAssignee(val)}
                  >
                    <SelectTrigger id="new-assignee">
                      <SelectValue placeholder="Select Technician" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=" ">— Unassigned —</SelectItem>
                      {technicians.map((tech) => (
                        <SelectItem key={tech.id} value={tech.id}>
                          {tech.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-hours">Estimated Hours</Label>
                  <Input
                    id="new-hours"
                    type="number"
                    placeholder="Estimated time in hours"
                    value={newEstimatedHours}
                    onChange={(e) => setNewEstimatedHours(e.target.value)}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="new-template">Checklist Template</Label>
                  <Select
                    value={newChecklistTemplateId}
                    onValueChange={(val) => setNewChecklistTemplateId(val)}
                  >
                    <SelectTrigger id="new-template">
                      <SelectValue placeholder="Select Template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=" ">— None —</SelectItem>
                      {checklistTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Section: Attachment */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Attachment</h3>
              <div className="space-y-2">
                <Label>Attachments</Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setNewAttachmentFile(file);
                        setNewAttachmentPreviewUrl(URL.createObjectURL(file));
                      }
                    }}
                    className="cursor-pointer bg-transparent"
                  />
                </div>
                {newAttachmentPreviewUrl && (
                  <div className="relative w-28 h-28 border rounded-lg overflow-hidden mt-2">
                    <img src={newAttachmentPreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setNewAttachmentFile(null);
                        setNewAttachmentPreviewUrl(null);
                      }}
                      className="absolute top-1 right-1 bg-destructive hover:bg-destructive/95 text-destructive-foreground p-1 rounded-full shadow-md"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-5 border-t bg-muted/30 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setNewWODialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateWorkOrder} disabled={isCreatingWorkOrder || !newTitle.trim()}>
              {isCreatingWorkOrder ? "Creating..." : "Create Work Order"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Work Order Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[92vh] overflow-y-auto p-0 bg-background">
          {/* Header */}
          <div className="px-8 pt-8 pb-4 border-b bg-muted/30">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Pencil className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-xl">Edit Work Order</DialogTitle>
                  <DialogDescription className="mt-0.5">
                    Modify work order details and configurations. Fields marked with <span className="text-red-500">*</span> are required.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="px-8 py-6 space-y-8">
            {/* Section: Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="edit-title">Title *</Label>
                  <Input
                    id="edit-title"
                    placeholder="Work Order Title"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="edit-desc">Description</Label>
                  <Textarea
                    id="edit-desc"
                    placeholder="Detailed description of the task..."
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select
                    value={editPriority}
                    onValueChange={(val: any) => setEditPriority(val)}
                  >
                    <SelectTrigger id="edit-priority">
                      <SelectValue placeholder="Select Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-worktype">Work Type</Label>
                  <Select
                    value={editWorkType}
                    onValueChange={(val) => setEditWorkType(val)}
                  >
                    <SelectTrigger id="edit-worktype">
                      <SelectValue placeholder="Select Work Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BREAKDOWN">Reactive (Breakdown)</SelectItem>
                      <SelectItem value="PREVENTIVE">Preventive</SelectItem>
                      <SelectItem value="INSPECTION">Inspection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Section: Assignment & Scheduling */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Assignment & Scheduling</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-asset">Linked Asset</Label>
                  <Select
                    value={editAsset}
                    onValueChange={(val) => setEditAsset(val)}
                  >
                    <SelectTrigger id="edit-asset">
                      <SelectValue placeholder="Select Asset" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=" ">— None —</SelectItem>
                      {assets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          {asset.assetName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-location">Location / Site</Label>
                  <Input
                    id="edit-location"
                    placeholder="e.g. Building A, Floor 2"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-assignee">Assignee</Label>
                  <Select
                    value={editAssignee}
                    onValueChange={(val) => setEditAssignee(val)}
                  >
                    <SelectTrigger id="edit-assignee">
                      <SelectValue placeholder="Select Technician" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=" ">— Unassigned —</SelectItem>
                      {technicians.map((tech) => (
                        <SelectItem key={tech.id} value={tech.id}>
                          {tech.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-hours">Estimated Hours</Label>
                  <Input
                    id="edit-hours"
                    type="number"
                    placeholder="Estimated time in hours"
                    value={editEstimatedHours}
                    onChange={(e) => setEditEstimatedHours(e.target.value)}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="edit-template">Checklist Template</Label>
                  <Select
                    value={editChecklistTemplateId}
                    onValueChange={(val) => setEditChecklistTemplateId(val)}
                  >
                    <SelectTrigger id="edit-template">
                      <SelectValue placeholder="Select Template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=" ">— None —</SelectItem>
                      {checklistTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-5 border-t bg-muted/30 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateWorkOrder} disabled={isUpdatingWorkOrder || !editTitle.trim()}>
              {isUpdatingWorkOrder ? "Updating..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Checklist Template Dialog */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto bg-background">
          <DialogHeader>
            <DialogTitle>Create Checklist Template</DialogTitle>
            <DialogDescription>
              Create a new checklist template with predefined items.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name *</Label>
              <Input
                id="template-name"
                placeholder="e.g. Fire Extinguisher Inspection"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-desc">Description</Label>
              <Textarea
                id="template-desc"
                placeholder="Describe the purpose of this checklist..."
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
              />
            </div>
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between border-b pb-2">
                <Label className="font-bold text-sm">Checklist Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addTemplateItem}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                {templateItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-xl bg-muted/20">
                    <span className="text-xs font-bold text-muted-foreground w-4">{index + 1}</span>
                    <Input
                      placeholder="Task item description"
                      value={item.title}
                      onChange={(e) =>
                        setTemplateItems((prev) =>
                          prev.map((it, idx) => (idx === index ? { ...it, title: e.target.value } : it))
                        )
                      }
                      className="flex-1 h-9 text-xs"
                    />
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Checkbox
                        id={`req-${index}`}
                        checked={item.isRequired}
                        onCheckedChange={(checked) =>
                          setTemplateItems((prev) =>
                            prev.map((it, idx) => (idx === index ? { ...it, isRequired: !!checked } : it))
                          )
                        }
                      />
                      <label htmlFor={`req-${index}`} className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground cursor-pointer">
                        Required
                      </label>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTemplateItem(index)}
                      className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateChecklistTemplate} disabled={isCreatingTemplate || !templateName.trim()}>
              {isCreatingTemplate ? "Creating..." : "Create Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Technician Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-md bg-background">
          <DialogHeader>
            <DialogTitle>Assign Technician</DialogTitle>
            <DialogDescription>
              Choose a technician to assign to this work order.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="assign-tech">Technician *</Label>
              <Select
                value={assignTechnicianId}
                onValueChange={(val) => setAssignTechnicianId(val)}
              >
                <SelectTrigger id="assign-tech">
                  <SelectValue placeholder="Select Technician" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">— Unassigned —</SelectItem>
                  {technicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id}>
                      {tech.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignTechnician} disabled={isAssigningTechnician}>
              {isAssigningTechnician ? "Assigning..." : "Assign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmDialogOpen} onOpenChange={setDeleteConfirmDialogOpen}>
        <DialogContent className="max-w-md bg-background">
          <DialogHeader>
            <DialogTitle>Delete Work Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this work order? This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteWorkOrder} disabled={isDeletingWorkOrder}>
              {isDeletingWorkOrder ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="max-w-md bg-background">
          <DialogHeader>
            <DialogTitle>Reject Work Order Completion</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting the completed work and returning it to the technician.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reject-reason">Reason *</Label>
              <Textarea
                id="reject-reason"
                placeholder="Explain what needs to be fixed..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectWorkOrderSupervisor} disabled={isRejectingWorkOrder || !rejectReason.trim()}>
              {isRejectingWorkOrder ? "Rejecting..." : "Reject Work Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
