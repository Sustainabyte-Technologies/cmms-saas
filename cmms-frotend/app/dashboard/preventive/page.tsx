"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Loader2,
  AlertCircle,
  Plus,
  Download,
  Building2,
  Cpu,
  Shield,
  Wrench,
} from "lucide-react";

import {
  fetchPMs,
  createPM,
  updatePM,
  deletePM,
  PreventiveMaintenance,
  generateWorkOrderFromPM,
  fetchPMHistory,
  fetchPMCalendarEvents,
  fetchPMCalendarEventDetails,
  PMCalendarEvent,
} from "@/lib/api/preventive-maintenance-api";
import { fetchAssets, Asset } from "@/lib/api/assets-api";
import { fetchChecklistTemplates, ChecklistTemplate } from "@/lib/api/work-orders-api";
import { toastService } from "@/lib/toast-service";
import { fetchTechnicianWorkload } from "@/lib/api/users-api";
import { getCustomers, Customer } from "@/lib/api/customers-api";

// Import modular sub-components
import { PMDashboard } from "@/components/dashboard/preventive/pm-dashboard";
import { PMSchedulesList } from "@/components/dashboard/preventive/pm-schedules-list";
import { PMCalendar } from "@/components/dashboard/preventive/pm-calendar";
import { PMScheduleDetails } from "@/components/dashboard/preventive/pm-schedule-details";

// Helper function to capitalize frequencies
const formatFrequency = (freq: string): string => {
  if (!freq) return "";
  const lower = freq.toLowerCase().replace(/_/g, " ");
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

// Safe date formatter
const formatDateSafely = (dateString: string | null | undefined): string => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

function PreventiveMaintenanceContent() {
  const [pms, setPms] = useState<PreventiveMaintenance[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [checklists, setChecklists] = useState<ChecklistTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Calendar States
  const [schedulesViewMode, setSchedulesViewMode] = useState<"list" | "calendar">("calendar");
  const [currentMonth, setCurrentMonth] = useState(9); // Default to September 2026
  const [currentYear, setCurrentYear] = useState(2026);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<PMCalendarEvent[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);

  // Calendar Filter States
  const [calendarCustomerFilter, setCalendarCustomerFilter] = useState("all");
  const [calendarSiteFilter, setCalendarSiteFilter] = useState("all");
  const [calendarDeptFilter, setCalendarDeptFilter] = useState("all");
  const [calendarAssetFilter, setCalendarAssetFilter] = useState("all");
  const [calendarTechFilter, setCalendarTechFilter] = useState("all");
  const [calendarStatusFilter, setCalendarStatusFilter] = useState("all");
  const [calendarFrequencyFilter, setCalendarFrequencyFilter] = useState("all");
  const [calendarSearchQuery, setCalendarSearchQuery] = useState("");

  // Calendar Event Details Sidebar States
  const [selectedCalendarEvent, setSelectedCalendarEvent] = useState<PMCalendarEvent | null>(null);
  const [eventDetailsLoading, setEventDetailsLoading] = useState(false);
  const [eventDetails, setEventDetails] = useState<any | null>(null);

  // Filter States (for list view)
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [frequencyFilter, setFrequencyFilter] = useState("all");
  const [assetFilter, setAssetFilter] = useState("all");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPm, setEditingPm] = useState<PreventiveMaintenance | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Delete Dialog States
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [pmToDelete, setPmToDelete] = useState<PreventiveMaintenance | null>(null);

  // Form Fields State
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formAssetId, setFormAssetId] = useState("");
  const [formChecklistId, setFormChecklistId] = useState("");
  const [formFrequency, setFormFrequency] = useState("MONTHLY");
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [formTechnicianId, setFormTechnicianId] = useState("");
  const [formEstimatedHours, setFormEstimatedHours] = useState("");

  // History Dialog States
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [pmHistory, setPmHistory] = useState<any | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read view parameter from URL
  const viewParam = searchParams.get("view") || "dashboard";
  const activeTab = (viewParam === "schedules" || viewParam === "calendar" ? "schedules" : "dashboard") as "dashboard" | "schedules";

  // Sync schedulesViewMode with URL view param
  useEffect(() => {
    if (viewParam === "calendar") {
      setSchedulesViewMode("calendar");
    } else if (viewParam === "schedules") {
      setSchedulesViewMode("list");
    }
  }, [viewParam]);

  // Fetch Calendar Events
  const loadCalendarEvents = async () => {
    setCalendarLoading(true);
    try {
      const events = await fetchPMCalendarEvents({
        month: currentMonth,
        year: currentYear,
        customerId: calendarCustomerFilter === "all" ? undefined : calendarCustomerFilter,
        siteId: calendarSiteFilter === "all" ? undefined : calendarSiteFilter,
        departmentId: calendarDeptFilter === "all" ? undefined : calendarDeptFilter,
        assetId: calendarAssetFilter === "all" ? undefined : calendarAssetFilter,
        technicianId: calendarTechFilter === "all" ? undefined : calendarTechFilter,
        status: calendarStatusFilter === "all" ? undefined : calendarStatusFilter,
        frequency: calendarFrequencyFilter === "all" ? undefined : calendarFrequencyFilter,
        search: calendarSearchQuery || undefined,
      });
      setCalendarEvents(events);
    } catch (err) {
      console.error("Error loading calendar events:", err);
    } finally {
      setCalendarLoading(false);
    }
  };

  // Tab & Detail view states
  const [selectedPm, setSelectedPm] = useState<PreventiveMaintenance | null>(null);

  // Load Data
  const loadData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [pmData, assetData, checklistData, techData, customerData] = await Promise.all([
        fetchPMs(),
        fetchAssets(1, 1000).then(r => r.data).catch(() => [] as Asset[]),
        fetchChecklistTemplates(),
        fetchTechnicianWorkload().catch(() => [] as any[]),
        getCustomers().catch(() => [] as Customer[]),
      ]);
      setPms(pmData);
      setAssets(assetData);
      setChecklists(checklistData);
      setTechnicians(techData);
      setCustomers(customerData);
    } catch (err) {
      console.error("Error loading PM data:", err);
      toastService.error("Failed to load page data", err instanceof Error ? err.message : "Database connection issue.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === "schedules" && schedulesViewMode === "calendar") {
      loadCalendarEvents();
    }
  }, [
    activeTab,
    schedulesViewMode,
    currentMonth,
    currentYear,
    calendarCustomerFilter,
    calendarSiteFilter,
    calendarDeptFilter,
    calendarAssetFilter,
    calendarTechFilter,
    calendarStatusFilter,
    calendarFrequencyFilter,
    calendarSearchQuery,
  ]);

  // Sync selectedPm details when pms updates (e.g. edited, paused, deleted)
  useEffect(() => {
    if (selectedPm) {
      const updated = pms.find((p) => p.id === selectedPm.id);
      if (updated) {
        setSelectedPm(updated);
      } else {
        setSelectedPm(null);
        setPmHistory(null);
      }
    }
  }, [pms]);

  // Clear selectedPm details when view parameter changes via sidebar navigation
  useEffect(() => {
    setSelectedPm(null);
    setPmHistory(null);
  }, [searchParams]);

  // Open Add Dialog
  const handleAddClick = () => {
    setEditingPm(null);
    setFormTitle("");
    setFormDescription("");
    setFormAssetId("");
    setFormChecklistId("");
    setFormFrequency("MONTHLY");
    setFormStartDate(new Date().toISOString().split("T")[0]);
    setFormTechnicianId("none");
    setFormEstimatedHours("");
    setIsDialogOpen(true);
  };

  // Open Edit Dialog
  const handleEditClick = (pm: PreventiveMaintenance) => {
    setEditingPm(pm);
    setFormTitle(pm.title);
    setFormDescription(pm.description || "");
    setFormAssetId(pm.assetId);
    setFormChecklistId(pm.checklistTemplateId || "none");
    setFormFrequency(pm.frequency);
    setFormStartDate(new Date(pm.startDate).toISOString().split("T")[0]);
    setFormTechnicianId(pm.assignedTechnicianId || "none");
    setFormEstimatedHours(pm.estimatedHours !== undefined && pm.estimatedHours !== null ? String(pm.estimatedHours) : "");
    setIsDialogOpen(true);
  };

  // Submit Add / Edit Form
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formAssetId || !formStartDate) {
      toastService.error("Required Fields Missing", "Please enter Title, Asset, and Start Date.");
      return;
    }

    setFormLoading(true);
    try {
      const payload = {
        title: formTitle,
        description: formDescription || null,
        assetId: formAssetId,
        checklistTemplateId: (!formChecklistId || formChecklistId === "none") ? null : formChecklistId,
        frequency: formFrequency,
        startDate: formStartDate,
        assignedTechnicianId: (!formTechnicianId || formTechnicianId === "none") ? null : formTechnicianId,
        estimatedHours: formEstimatedHours ? parseFloat(formEstimatedHours) : null,
      };

      if (editingPm) {
        await updatePM(editingPm.id, payload);
        toastService.success("PM Schedule Updated", `Successfully updated "${formTitle}"`);
      } else {
        await createPM(payload);
        toastService.success("PM Schedule Created", `Successfully created "${formTitle}"`);
      }
      setIsDialogOpen(false);
      loadData(true);
      loadCalendarEvents();
    } catch (err) {
      toastService.error("Save Failed", err instanceof Error ? err.message : "Error saving PM Schedule.");
    } finally {
      setFormLoading(false);
    }
  };

  // Toggle Schedule Pause / Resume
  const handleToggleStatus = async (pm: PreventiveMaintenance) => {
    try {
      const newStatus = pm.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await updatePM(pm.id, { status: newStatus } as any);
      toastService.success(
        newStatus === "ACTIVE" ? "Schedule Activated" : "Schedule Paused",
        `Successfully updated "${pm.title}"`
      );
      loadData(true);
      loadCalendarEvents();
    } catch (err) {
      toastService.error("Status Change Failed", err instanceof Error ? err.message : "Failed to toggle status.");
    }
  };

  // Delete Schedule Click
  const handleDeleteClick = (pm: PreventiveMaintenance) => {
    setPmToDelete(pm);
    setIsDeleteConfirmOpen(true);
  };

  // Perform actual deletion
  const handleConfirmDelete = async () => {
    if (!pmToDelete) return;
    try {
      await deletePM(pmToDelete.id);
      toastService.success("Schedule Deleted", `Successfully deleted "${pmToDelete.title}"`);
      setIsDeleteConfirmOpen(false);
      loadData(true);
      loadCalendarEvents();
    } catch (err) {
      toastService.error("Delete Failed", err instanceof Error ? err.message : "Failed to delete schedule.");
    }
  };

  // Manual Trigger Work Order Generation
  const handleManualTrigger = async (pm: PreventiveMaintenance) => {
    try {
      await generateWorkOrderFromPM(pm.id);
      toastService.success("Work Order Generated", `A preventive work order has been created for "${pm.title}"`);
    } catch (err) {
      toastService.error("Trigger Failed", err instanceof Error ? err.message : "Failed to generate work order.");
    }
  };

  // View PM History details & load WO history
  const handleViewDetails = async (pm: PreventiveMaintenance) => {
    setSelectedPm(pm);
    setHistoryLoading(true);
    setPmHistory({ pm: { pmNumber: pm.pmNumber, title: pm.title }, history: [] });
    try {
      const data = await fetchPMHistory(pm.id);
      setPmHistory(data);
    } catch (err) {
      console.error("Error loading PM history:", err);
      toastService.error("Failed to load history", err instanceof Error ? err.message : "Error loading PM history.");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleViewHistory = async (pm: PreventiveMaintenance) => {
    await handleViewDetails(pm);
  };

  // Calculate Schedule status dynamically
  const getDynamicStatus = (pm: PreventiveMaintenance) => {
    if (pm.status === "INACTIVE") {
      return { status: "Completed", variant: "default" as const, colorClass: "text-slate-500 bg-slate-50 border-slate-200" };
    }
    if (!pm.nextDueDate) {
      return { status: "On Track", variant: "success" as const, colorClass: "text-emerald-600 bg-emerald-50 border-emerald-200" };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(pm.nextDueDate);
    if (isNaN(dueDate.getTime())) {
      return { status: "On Track", variant: "success" as const, colorClass: "text-emerald-600 bg-emerald-50 border-emerald-200" };
    }
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: "Overdue", variant: "error" as const, colorClass: "text-rose-600 bg-rose-50 border-rose-200" };
    } else if (diffDays <= 3) {
      return { status: "Due Soon", variant: "warning" as const, colorClass: "text-amber-600 bg-amber-50 border-amber-200" };
    } else {
      return { status: "On Track", variant: "success" as const, colorClass: "text-emerald-600 bg-emerald-50 border-emerald-200" };
    }
  };

  // Calculate date subtext details
  const getDueDateSubtext = (pm: PreventiveMaintenance) => {
    if (pm.status === "INACTIVE") return "Paused";
    if (!pm.nextDueDate) return "N/A";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(pm.nextDueDate);
    if (isNaN(dueDate.getTime())) return "N/A";
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      const overdueDays = Math.abs(diffDays);
      return `${overdueDays} day${overdueDays > 1 ? "s" : ""} overdue`;
    } else if (diffDays === 0) {
      return "Due today";
    } else {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} left`;
    }
  };

  // Get dynamic category icon for list items
  const getCategoryIcon = (category?: string) => {
    const cat = category?.toLowerCase() || "";
    if (cat.includes("hvac") || cat.includes("ac") || cat.includes("ventilation")) {
      return Cpu;
    }
    if (cat.includes("fire") || cat.includes("safety") || cat.includes("alarm")) {
      return Shield;
    }
    if (cat.includes("conveyor") || cat.includes("motor") || cat.includes("belt")) {
      return Building2;
    }
    return Wrench;
  };

  // Calendar View Helpers
  const handleEventClick = async (event: PMCalendarEvent) => {
    setSelectedCalendarEvent(event);
    setEventDetailsLoading(true);
    try {
      const details = await fetchPMCalendarEventDetails(event.id);
      setEventDetails(details);
    } catch (err) {
      console.error("Error fetching event details:", err);
      toastService.error("Failed to load PM details", err instanceof Error ? err.message : "Error connecting to server");
    } finally {
      setEventDetailsLoading(false);
    }
  };

  const handleTriggerWorkOrder = async (pmId: string) => {
    try {
      await generateWorkOrderFromPM(pmId);
      toastService.success("Work Order Generated", "A preventive work order has been created successfully.");
      loadCalendarEvents();
      if (selectedCalendarEvent) {
        handleEventClick(selectedCalendarEvent);
      }
    } catch (err) {
      toastService.error("Failed to generate work order", err instanceof Error ? err.message : "Error connecting to server");
    }
  };

  const getCalendarDays = () => {
    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    const startDayOfWeek = firstDay.getDay(); // 0 is Sunday, 1 is Monday
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth - 1, 0).getDate();

    const cells: Array<{ day: number; month: "prev" | "current" | "next"; date: Date }> = [];

    // Prev month days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const date = new Date(currentYear, currentMonth - 2, d);
      cells.push({ day: d, month: "prev", date });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(currentYear, currentMonth - 1, d);
      cells.push({ day: d, month: "current", date });
    }

    // Next month days
    const totalCells = cells.length > 35 ? 42 : 35; // keep grid height consistent
    let nextDay = 1;
    while (cells.length < totalCells) {
      const date = new Date(currentYear, currentMonth, nextDay);
      cells.push({ day: nextDay, month: "next", date });
      nextDay++;
    }

    return cells;
  };

  const getEventsForDate = (date: Date) => {
    return calendarEvents.filter(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      );
    });
  };

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
    setSelectedCalendarEvent(null);
    setEventDetails(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
    setSelectedCalendarEvent(null);
    setEventDetails(null);
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth() + 1);
    setCurrentYear(today.getFullYear());
    setSelectedCalendarEvent(null);
    setEventDetails(null);
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // -------------------------------------------------------------
  // Data Filtering (for list view)
  // -------------------------------------------------------------
  const filteredPMs = pms.filter((pm) => {
    // 1. Search filter
    const matchesSearch =
      pm.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pm.pmNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pm.asset?.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pm.asset?.assetCode.toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Status filter
    const dynamicStatus = getDynamicStatus(pm).status;
    const matchesStatus =
      statusFilter === "all" || dynamicStatus.toLowerCase().replace(" ", "_") === statusFilter;

    // 3. Frequency filter
    const matchesFrequency = frequencyFilter === "all" || pm.frequency === frequencyFilter;

    // 4. Asset filter
    const matchesAsset = assetFilter === "all" || pm.assetId === assetFilter;

    return matchesSearch && matchesStatus && matchesFrequency && matchesAsset;
  });

  // Calculate Metrics dynamically from actual list
  const totalPMsCount = pms.length;
  const onTrackCount = pms.filter(pm => getDynamicStatus(pm).status === "On Track").length;
  const dueSoonCount = pms.filter(pm => getDynamicStatus(pm).status === "Due Soon").length;
  const overdueCount = pms.filter(pm => getDynamicStatus(pm).status === "Overdue").length;
  const completedCount = pms.filter(pm => getDynamicStatus(pm).status === "Completed").length;

  const onTrackPercent = totalPMsCount ? Math.round((onTrackCount / totalPMsCount) * 100) : 0;
  const dueSoonPercent = totalPMsCount ? Math.round((dueSoonCount / totalPMsCount) * 100) : 0;
  const overduePercent = totalPMsCount ? Math.round((overdueCount / totalPMsCount) * 100) : 0;
  const completedPercent = totalPMsCount ? Math.round((completedCount / totalPMsCount) * 100) : 0;

  // Donut chart details
  const donutData = [
    { name: "On Track", value: onTrackCount, color: "#16a34a" }, // Emerald 600
    { name: "Due Soon", value: dueSoonCount, color: "#d97706" }, // Amber 600
    { name: "Overdue", value: overdueCount, color: "#e11d48" },  // Rose 600
    { name: "Completed", value: completedCount, color: "#64748b" } // Slate 500
  ];

  // Upcoming Active PMs
  const upcomingPMsList = pms
    .filter(pm => pm.status === "ACTIVE" && pm.nextDueDate && !isNaN(new Date(pm.nextDueDate).getTime()) && new Date(pm.nextDueDate) >= new Date())
    .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())
    .slice(0, 3);

  // Pagination bounds
  const totalEntries = filteredPMs.length;
  const totalPages = Math.ceil(totalEntries / itemsPerPage) || 1;
  const paginatedPMs = filteredPMs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const startEntryIndex = totalEntries === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endEntryIndex = Math.min(currentPage * itemsPerPage, totalEntries);

  // Trigger export CSV
  const handleExportCSV = () => {
    if (pms.length === 0) return;
    const headers = "PM No.,Schedule Name,Asset,Frequency,Next Due Date,Status\n";
    const rows = pms.map(pm => 
      `"${pm.pmNumber}","${pm.title}","${pm.asset?.assetName || ""} (${pm.asset?.assetCode || ""})","${pm.frequency}","${pm.nextDueDate}","${pm.status}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `Preventive_Maintenance_Schedules_${new Date().toISOString().split("T")[0]}.csv`);
    a.click();
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Loading Preventive Maintenance schedules...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {selectedPm ? (
        <PMScheduleDetails
          selectedPm={selectedPm}
          onBack={() => {
            setSelectedPm(null);
            setPmHistory(null);
          }}
          getDynamicStatus={getDynamicStatus}
          getDueDateSubtext={getDueDateSubtext}
          formatFrequency={formatFrequency}
          formatDateSafely={formatDateSafely}
          checklists={checklists}
          handleEditClick={handleEditClick}
          handleToggleStatus={handleToggleStatus}
          handleManualTrigger={handleManualTrigger}
          handleDeleteClick={handleDeleteClick}
          historyLoading={historyLoading}
          pmHistory={pmHistory}
        />
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* Page Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {viewParam === "calendar" ? "PM Calendar" : viewParam === "schedules" ? "PM Schedules" : "Preventive Maintenance Dashboard"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {viewParam === "calendar"
                  ? "Home > Preventive Maintenance > PM Calendar"
                  : viewParam === "schedules"
                    ? "Home > Preventive Maintenance > PM Schedules"
                    : "Home > Preventive Maintenance"}
              </p>
            </div>
            {viewParam !== "dashboard" && (
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={handleExportCSV}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button size="sm" className="bg-[#16a34a] hover:bg-[#15803d] text-white" onClick={handleAddClick}>
                  <Plus className="mr-2 h-4 w-4" />
                  {viewParam === "calendar" ? "Create PM" : "New PM Schedule"}
                </Button>
              </div>
            )}
          </div>

          {viewParam === "dashboard" ? (
            <PMDashboard
              totalPMsCount={totalPMsCount}
              onTrackCount={onTrackCount}
              onTrackPercent={onTrackPercent}
              dueSoonCount={dueSoonCount}
              dueSoonPercent={dueSoonPercent}
              overdueCount={overdueCount}
              overduePercent={overduePercent}
              completedCount={completedCount}
              completedPercent={completedPercent}
              donutData={donutData}
              upcomingPMsList={upcomingPMsList}
              getCategoryIcon={getCategoryIcon}
              getDueDateSubtext={getDueDateSubtext}
              getDynamicStatus={getDynamicStatus}
              formatDateSafely={formatDateSafely}
              setStatusFilter={setStatusFilter}
              setSearchQuery={setSearchQuery}
            />
          ) : viewParam === "calendar" ? (
            <PMCalendar
              currentMonth={currentMonth}
              currentYear={currentYear}
              monthNames={monthNames}
              calendarEvents={calendarEvents}
              calendarLoading={calendarLoading}
              selectedCalendarEvent={selectedCalendarEvent}
              setSelectedCalendarEvent={setSelectedCalendarEvent}
              eventDetailsLoading={eventDetailsLoading}
              eventDetails={eventDetails}
              handleEventClick={handleEventClick}
              handleTriggerWorkOrder={handleTriggerWorkOrder}
              handleViewDetails={handleViewDetails}
              handlePrevMonth={handlePrevMonth}
              handleNextMonth={handleNextMonth}
              handleToday={handleToday}
              getCalendarDays={getCalendarDays}
              getEventsForDate={getEventsForDate}
              formatFrequency={formatFrequency}
              formatDateSafely={formatDateSafely}
              calendarCustomerFilter={calendarCustomerFilter}
              setCalendarCustomerFilter={setCalendarCustomerFilter}
              calendarSiteFilter={calendarSiteFilter}
              setCalendarSiteFilter={setCalendarSiteFilter}
              calendarDeptFilter={calendarDeptFilter}
              setCalendarDeptFilter={setCalendarDeptFilter}
              calendarAssetFilter={calendarAssetFilter}
              setCalendarAssetFilter={setCalendarAssetFilter}
              calendarTechFilter={calendarTechFilter}
              setCalendarTechFilter={setCalendarTechFilter}
              calendarStatusFilter={calendarStatusFilter}
              setCalendarStatusFilter={setCalendarStatusFilter}
              calendarFrequencyFilter={calendarFrequencyFilter}
              setCalendarFrequencyFilter={setCalendarFrequencyFilter}
              calendarSearchQuery={calendarSearchQuery}
              setCalendarSearchQuery={setCalendarSearchQuery}
              customers={customers}
              assets={assets}
              technicians={technicians}
            />
          ) : (
            <PMSchedulesList
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              frequencyFilter={frequencyFilter}
              setFrequencyFilter={setFrequencyFilter}
              assetFilter={assetFilter}
              setAssetFilter={setAssetFilter}
              assets={assets}
              paginatedPMs={paginatedPMs}
              getDynamicStatus={getDynamicStatus}
              getDueDateSubtext={getDueDateSubtext}
              formatFrequency={formatFrequency}
              formatDateSafely={formatDateSafely}
              handleViewDetails={handleViewDetails}
              handleManualTrigger={handleManualTrigger}
              handleViewHistory={handleViewHistory}
              handleEditClick={handleEditClick}
              handleToggleStatus={handleToggleStatus}
              handleDeleteClick={handleDeleteClick}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              startEntryIndex={startEntryIndex}
              endEntryIndex={endEntryIndex}
              totalEntries={totalEntries}
            />
          )}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[92vh] overflow-y-auto p-0">
          <div className="px-8 pt-8 pb-4 border-b bg-muted/30">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold">
                    {editingPm ? "Edit PM Schedule" : "New PM Schedule"}
                  </DialogTitle>
                  <DialogDescription className="mt-0.5">
                    Fill in the schedule details below. Work orders will be created automatically based on this.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <form onSubmit={handleFormSubmit}>
            <div className="px-8 py-6 space-y-6">
              {/* General Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">General Info</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Schedule Name *</label>
                    <Input
                      placeholder="e.g. Monthly Chiller Check"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Description</label>
                    <Input
                      placeholder="Describe details of this routine maintenance"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Schedule & Assignment */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Schedule & Assignment</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Asset Select */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Select Asset *</label>
                    <Select value={formAssetId} onValueChange={setFormAssetId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an asset..." />
                      </SelectTrigger>
                      <SelectContent>
                        {assets.map((asset) => (
                          <SelectItem key={asset.id} value={asset.id}>
                            {asset.assetName} ({asset.assetCode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Checklist Template Select */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Checklist Template</label>
                    <Select value={formChecklistId} onValueChange={setFormChecklistId}>
                      <SelectTrigger>
                        <SelectValue placeholder="No checklist template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No checklist template</SelectItem>
                        {checklists.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Frequency */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Frequency *</label>
                    <Select value={formFrequency} onValueChange={setFormFrequency}>
                      <SelectTrigger>
                        <SelectValue placeholder="Frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DAILY">Daily</SelectItem>
                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                        <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                        <SelectItem value="HALF_YEARLY">Half Yearly</SelectItem>
                        <SelectItem value="YEARLY">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Start Date */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Start Date *</label>
                    <Input
                      type="date"
                      value={formStartDate}
                      onChange={(e) => setFormStartDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Assigned Technician */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Assigned Technician</label>
                    <Select value={formTechnicianId} onValueChange={setFormTechnicianId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Technician" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Unassigned</SelectItem>
                        {technicians.map((tech) => (
                          <SelectItem key={tech.id} value={tech.id}>
                            {tech.name} {tech.activeWorkOrders !== undefined ? `(${tech.activeWorkOrders} active)` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Estimated Hours */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Estimated Hours</label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="e.g. 2.5"
                      value={formEstimatedHours}
                      onChange={(e) => setFormEstimatedHours(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="px-8 py-5 border-t bg-muted/30 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={formLoading}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#16a34a] hover:bg-[#15803d] text-white" disabled={formLoading}>
                {formLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  editingPm ? "Save Changes" : "Create Schedule"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-rose-600" />
              Confirm Delete
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600 mt-2">
              Are you sure you want to delete the schedule <strong className="text-slate-950">"{pmToDelete?.title}"</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-sm animate-fade-in"
              onClick={handleConfirmDelete}
            >
              Delete Schedule
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function PreventiveMaintenancePage() {
  return (
    <Suspense fallback={
      <div className="flex h-[80vh] flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Loading Preventive Maintenance schedules...</p>
      </div>
    }>
      <PreventiveMaintenanceContent />
    </Suspense>
  );
}
