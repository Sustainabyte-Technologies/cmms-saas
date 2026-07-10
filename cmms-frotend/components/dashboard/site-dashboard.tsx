"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useRole } from "@/contexts/role-context";
import {
  Customer,
  Site,
  Department,
  System,
  extractFromCustomers,
  getCustomers,
} from "@/lib/api/customers-api";
import { fetchWorkOrders, WorkOrderResponse, fetchChecklistTemplates, ChecklistTemplate } from "@/lib/api/work-orders-api";
import { fetchAssets, Asset } from "@/lib/api/assets-api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/ui-components";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  MapPin,
  ClipboardList,
  FolderTree,
  Cpu,
  ArrowLeft,
  ChevronRight,
  Building2,
  ChevronsUpDown,
  LayoutGrid,
  Plus,
  Package,
  CheckSquare,
  Wrench,
} from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const getAssetImageUrl = (id: string, imageUrl: string) =>
  `${API_BASE_URL}/assets/${id}/image?t=${encodeURIComponent(imageUrl)}`;

function SafeImage({
  src,
  alt,
  fallback,
  className,
}: {
  src?: string | null;
  alt: string;
  fallback: React.ReactNode;
  className?: string;
}) {
  const [hasError, setHasError] = useState(false);
  if (src && !hasError) {
    return (
      <img
        src={src}
        alt={alt}
        onError={() => setHasError(true)}
        className={className}
      />
    );
  }
  return <>{fallback}</>;
}

interface SiteDashboardProps {
  site: Site;
  customer: Customer;
  onBack?: () => void;
  // Optional: if provided from parent (already loaded), we skip the API call
  allDepartments?: Department[];
  allSystems?: System[];
  allSites?: Site[];
}

export function SiteDashboard({
  site,
  customer,
  onBack,
  allDepartments,
  allSystems,
  allSites,
}: SiteDashboardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { role } = useRole();

  const [customerSites, setCustomerSites] = useState<Site[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [systems, setSystems] = useState<System[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrderResponse[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [checklists, setChecklists] = useState<ChecklistTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"departments" | "workorders" | "assets" | "checklists">("departments");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);

        // ── Step 1: Resolve departments & systems ───────────────────────
        // Use props if available (parent already loaded them), else fetch once
        let siteDepts: Department[] = [];
        let siteSystems: System[] = [];
        let cSites: Site[] = [];

        if (allDepartments && allSystems && allSites) {
          siteDepts = allDepartments.filter((d) => d.siteId === site.id);
          const deptIds = new Set(siteDepts.map((d) => d.id));
          siteSystems = allSystems.filter((s) => deptIds.has(s.departmentId));
          cSites = allSites.filter((s) => s.customerId === customer.id);
        } else {
          // Fallback: load customers (single call) and extract
          const customers = await getCustomers();
          const { sites: extractedSites, departments: extractedDepts, systems: extractedSystems } = extractFromCustomers(customers);
          siteDepts = extractedDepts.filter((d) => d.siteId === site.id);
          const deptIds = new Set(siteDepts.map((d) => d.id));
          siteSystems = extractedSystems.filter((s) => deptIds.has(s.departmentId));
          cSites = extractedSites.filter((s) => s.customerId === customer.id);
        }

        if (!mounted) return;
        setDepartments(siteDepts);
        setSystems(siteSystems);
        setCustomerSites(cSites);

        // ── Step 2: Fetch assets, work orders, checklists in parallel ───
        const deptIdSet = new Set(siteDepts.map((d) => d.id));

        const [woResult, assetResult, checklistResult] = await Promise.all([
          fetchWorkOrders({ limit: 1000 }).then((r) => r.workOrders).catch(() => [] as WorkOrderResponse[]),
          fetchAssets(1, 1000).then((r) => r.data).catch(() => [] as Asset[]),
          fetchChecklistTemplates().catch(() => [] as ChecklistTemplate[]),
        ]);

        if (!mounted) return;

        // Filter work orders: by siteId on asset, or by departmentId match
        const siteWO = woResult.filter((wo) => {
          if (wo.asset?.location) {
            const loc = wo.asset.location.toLowerCase();
            if (loc.includes(site.name.toLowerCase()) || loc.includes(site.code.toLowerCase())) return true;
          }
          return false;
        });

        // Filter assets: by siteId field directly
        const siteAssets = assetResult.filter((a) => a.siteId === site.id);

        setWorkOrders(siteWO);
        setAssets(siteAssets);
        setChecklists(checklistResult);
      } catch (e) {
        console.error("SiteDashboard load error:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    setSelectedDeptId(null);
    setSelectedSystemId(null);
    return () => { mounted = false; };
  }, [site.id, customer.id]);

  const handleSiteChange = (newSiteId: string) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set("companyId", customer.id);
    p.set("siteId", newSiteId);
    setSelectedDeptId(null);
    router.push(`${pathname}?${p.toString()}`);
  };

  const handleBackToCustomer = () => {
    const p = new URLSearchParams(searchParams.toString());
    p.delete("siteId");
    router.push(`${pathname}?${p.toString()}`);
  };

  const getPriorityVariant = (p: string): "error" | "warning" | "info" | "success" | "default" => {
    switch (p?.toLowerCase()) {
      case "critical": return "error";
      case "high": return "warning";
      case "medium": return "info";
      case "low": return "success";
      default: return "default";
    }
  };

  const getStatusVariant = (s: string): "error" | "warning" | "info" | "success" | "default" => {
    switch (s?.toLowerCase()) {
      case "completed": case "closed": return "success";
      case "in_progress": case "assigned": case "accepted": return "info";
      case "open": case "reopened": return "warning";
      case "on_hold": return "default";
      default: return "default";
    }
  };

  const getAssetStatusVariant = (s?: string): "error" | "warning" | "info" | "success" | "default" => {
    switch (s?.toLowerCase()) {
      case "active": return "success";
      case "under_maintenance": return "warning";
      case "breakdown": return "error";
      case "idle": return "default";
      case "retired": return "default";
      default: return "default";
    }
  };

  const selectedDept = departments.find((d) => d.id === selectedDeptId);
  const selectedSystem = systems.find((s) => s.id === selectedSystemId);

  const displayedSystems = selectedSystemId
    ? systems.filter((sys) => sys.id === selectedSystemId)
    : selectedDeptId
    ? systems.filter((sys) => sys.departmentId === selectedDeptId)
    : systems;

  // Filter work orders by selected dept/system
  const displayedWorkOrders = selectedDeptId
    ? workOrders.filter((wo) => {
        const deptSystems = systems.filter((s) => s.departmentId === selectedDeptId);
        return deptSystems.some((s) =>
          (wo.asset?.assetName || "").toLowerCase().includes(s.name.toLowerCase())
        );
      })
    : workOrders;

  // Filter assets by selected dept/system
  const displayedAssets = selectedSystemId
    ? assets.filter((a) => a.systemId === selectedSystemId)
    : selectedDeptId
    ? assets.filter((a) => a.departmentId === selectedDeptId)
    : assets;

  const tabs = [
    { key: "departments" as const, label: `Departments (${departments.length})`, icon: FolderTree },
    { key: "workorders" as const, label: `Work Orders (${workOrders.length})`, icon: ClipboardList },
    { key: "assets" as const, label: `Assets (${assets.length})`, icon: Package },
    { key: "checklists" as const, label: `Checklists (${checklists.length})`, icon: CheckSquare },
  ];

  return (
    <div className="flex h-[calc(100vh-64px)] bg-background -m-4 lg:-m-6 overflow-hidden">
      {/* ── Left Navigation Sidebar ── */}
      <div className="w-72 border-r border-border bg-card flex flex-col shrink-0 h-full">
        {/* Back Link */}
        {onBack && role !== "site_incharge" && (
          <div className="p-3 border-b border-border bg-muted/10 shrink-0">
            <button
              onClick={handleBackToCustomer}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-bold px-2.5 py-1.5 rounded-lg hover:bg-muted/40"
            > 
              <ArrowLeft className="h-4 w-4" />
              Back to {customer.name}
            </button>
          </div>
        )}

        {/* Site Selector Dropdown */}
        <div className="p-4 border-b border-border shrink-0">
          {role === "site_incharge" || customerSites.length <= 1 ? (
            <div className="flex items-center gap-3 w-full p-2.5 rounded-xl border border-border bg-background shadow-xs text-left">
              <div className="h-10 w-10 rounded-lg overflow-hidden border bg-primary/10 shrink-0 flex items-center justify-center font-bold text-primary text-sm">
                {site.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 pr-1">
                <h4 className="font-bold text-xs text-foreground line-clamp-1">{site.name}</h4>
                <p className="text-[10px] font-semibold text-muted-foreground mt-0.5 font-mono">
                  Site ID: #{site.code}
                </p>
              </div>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 w-full p-2.5 rounded-xl border border-border bg-background hover:bg-muted/30 hover:shadow-xs transition-all text-left outline-none">
                  <div className="h-10 w-10 rounded-lg overflow-hidden border bg-primary/10 shrink-0 flex items-center justify-center font-bold text-primary text-sm">
                    {site.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0 pr-1">
                    <h4 className="font-bold text-xs text-foreground line-clamp-1">{site.name}</h4>
                    <p className="text-[10px] font-semibold text-muted-foreground mt-0.5 font-mono">
                      Site ID: #{site.code}
                    </p>
                  </div>
                  <ChevronsUpDown className="h-4 w-4 text-muted-foreground/60 shrink-0 ml-auto" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[256px] border-border bg-card max-h-[300px] overflow-y-auto">
                <div className="px-3 py-2 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">
                  Select Site
                </div>
                <DropdownMenuSeparator className="bg-border/60" />
                {customerSites.map((s) => (
                  <DropdownMenuItem
                    key={s.id}
                    onClick={() => handleSiteChange(s.id)}
                    className={`flex flex-col items-start gap-0.5 p-2.5 cursor-pointer text-xs focus:bg-primary/5 focus:text-foreground rounded-lg ${
                      s.id === site.id ? "bg-primary/5 font-semibold text-primary" : ""
                    }`}
                  >
                    <span className="font-bold">{s.name}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">#{s.code}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Tree Menu */}
        <div className="flex-1 overflow-y-auto py-3 space-y-1">
          <div className="px-5 py-2 text-[10px] font-bold text-muted-foreground/85 tracking-wider uppercase flex items-center gap-1.5 select-none">
            <LayoutGrid className="h-3.5 w-3.5 opacity-70" />
            SITE OVERVIEW
          </div>

          <button
            onClick={() => { setSelectedDeptId(null); setSelectedSystemId(null); }}
            className={`w-[calc(100%-24px)] mx-3 px-3 py-2 rounded-xl flex items-center gap-2.5 text-xs font-bold transition-all text-left ${
              selectedDeptId === null
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
            }`}
          >
            <Building2 className="h-4 w-4 shrink-0 text-primary" />
            <span>{site.name} Overview</span>
          </button>

          <div className="mt-2 space-y-1">
            <div className="px-5 py-1 text-[9px] font-extrabold text-muted-foreground/60 tracking-wider uppercase select-none">
              DEPARTMENTS &amp; SYSTEM
            </div>
            {loading ? (
              <div className="space-y-1.5 mt-1 px-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-7 w-full rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              departments.map((dept) => {
                const isDeptActive = selectedDeptId === dept.id;
                return (
                  <div key={dept.id} className="space-y-0.5">
                    <button
                      onClick={() => {
                        if (selectedDeptId === dept.id) {
                          setSelectedDeptId(null);
                          setSelectedSystemId(null);
                        } else {
                          setSelectedDeptId(dept.id);
                          setSelectedSystemId(null);
                        }
                      }}
                      className={`w-[calc(100%-36px)] ml-6 mr-3 px-3 py-1.5 rounded-lg flex items-center text-xs transition-all text-left ${
                        selectedDeptId === dept.id
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-muted-foreground/90 hover:bg-muted/40 hover:text-foreground font-medium"
                      }`}
                    >
                      <ChevronRight className={`h-3 w-3 shrink-0 mr-1.5 transition-transform ${isDeptActive ? "rotate-90" : ""}`} />
                      <span className="line-clamp-1">{dept.name}</span>
                    </button>

                    {/* Systems nested under department */}
                    {isDeptActive && (
                      <div className="ml-11 mt-1 space-y-1 border-l border-border/50 pl-2.5">
                        {systems.filter((sys) => sys.departmentId === dept.id).length === 0 ? (
                          <p className="text-[10px] text-muted-foreground/50 py-0.5 pl-2 font-medium">No systems</p>
                        ) : (
                          systems
                            .filter((sys) => sys.departmentId === dept.id)
                            .map((sys) => (
                              <button
                                key={sys.id}
                                onClick={() => setSelectedSystemId(sys.id === selectedSystemId ? null : sys.id)}
                                className={`w-full px-2 py-1 rounded-md flex items-center text-[11px] transition-all text-left ${
                                  selectedSystemId === sys.id
                                    ? "bg-primary/10 text-primary font-bold"
                                    : "text-muted-foreground/80 hover:bg-muted/40 hover:text-foreground font-semibold"
                                }`}
                              >
                                <span className="line-clamp-1">{sys.name}</span>
                              </button>
                            ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Right Dashboard Panel ── */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {loading ? (
          <RightPanelSkeleton />
        ) : (
          <>
            {/* Header Block */}
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {selectedSystem
                  ? `${site.name} · ${selectedDept?.name} · ${selectedSystem.name}`
                  : selectedDept
                  ? `${site.name} · ${selectedDept.name}`
                  : site.name}
              </h2>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2 font-semibold">
                <span>
                  Site ID:{" "}
                  <strong className="text-foreground">
                    #{selectedSystem ? selectedSystem.code : selectedDept ? selectedDept.code : site.code}
                  </strong>
                </span>
                {(site.city || site.state) && (
                  <>
                    <span className="text-border">|</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-emerald-500" />
                      {[site.city, site.state, site.country].filter(Boolean).join(", ")}
                    </span>
                  </>
                )}
              </p>
            </div>

            {/* Stats banner with Donut */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-foreground">
                    {selectedDept ? 1 : departments.length}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {departments.length === 1 ? "Floor" : "Floors"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-foreground">{displayedSystems.length}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Systems</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-foreground">{displayedAssets.length}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Assets</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-foreground">{displayedWorkOrders.length}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Work Orders</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-foreground">{checklists.length}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Checklists</p>
                </div>
              </div>

              {/* Donut Chart */}
              <div className="flex flex-col items-center justify-center border-t lg:border-t-0 lg:border-l border-border/60 pt-6 lg:pt-0 lg:pl-6 h-full min-h-[140px]">
                <div className="relative h-28 w-28 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="var(--border)" strokeWidth="2.8" />
                    {assets.length > 0 && (
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#8b5cf6" strokeWidth="2.8"
                        strokeDasharray={`${Math.min((assets.length / Math.max(assets.length + workOrders.length + checklists.length, 1)) * 100, 100)} 100`}
                        strokeDashoffset="0"
                      />
                    )}
                    {workOrders.length > 0 && (
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#38bdf8" strokeWidth="2.8"
                        strokeDasharray={`${Math.min((workOrders.length / Math.max(assets.length + workOrders.length + checklists.length, 1)) * 100, 100)} 100`}
                        strokeDashoffset={`-${Math.min((assets.length / Math.max(assets.length + workOrders.length + checklists.length, 1)) * 100, 100)}`}
                      />
                    )}
                    {checklists.length > 0 && (
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#10b981" strokeWidth="2.8"
                        strokeDasharray={`${Math.min((checklists.length / Math.max(assets.length + workOrders.length + checklists.length, 1)) * 100, 100)} 100`}
                        strokeDashoffset={`-${Math.min(((assets.length + workOrders.length) / Math.max(assets.length + workOrders.length + checklists.length, 1)) * 100, 100)}`}
                      />
                    )}
                  </svg>
                  <div className="absolute text-center">
                    <p className="text-base font-extrabold text-foreground">{systems.length}</p>
                    <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Systems</p>
                  </div>
                </div>
                <div className="flex gap-3 mt-3 flex-wrap justify-center">
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-semibold">
                    <span className="h-2 w-2 rounded-full bg-violet-500 inline-block" />Assets
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-semibold">
                    <span className="h-2 w-2 rounded-full bg-sky-400 inline-block" />WOs
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-semibold">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />Lists
                  </span>
                </div>
              </div>
            </div>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border border-border bg-card p-5 flex flex-col justify-between shadow-xs hover:shadow-sm transition-all h-28">
                <ClipboardList className="h-5 w-5 text-sky-500" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{workOrders.length}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">Work Orders</p>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 flex flex-col justify-between shadow-xs hover:shadow-sm transition-all h-28">
                <Package className="h-5 w-5 text-violet-500" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{assets.length}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">Assets</p>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 flex flex-col justify-between shadow-xs hover:shadow-sm transition-all h-28">
                <CheckSquare className="h-5 w-5 text-emerald-500" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{checklists.length}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">Checklists</p>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 flex flex-col justify-between shadow-xs hover:shadow-sm transition-all h-28">
                <Wrench className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{systems.length}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">Systems</p>
                </div>
              </div>
            </div>

            {/* Tab/Table View */}
            <Card className="border-border">
              {/* Tab Header */}
              <div className="flex items-center justify-between border-b border-border px-4 py-1 bg-muted/10 overflow-x-auto">
                <div className="flex shrink-0">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-4 py-3 text-xs font-bold capitalize transition-colors border-b-2 -mb-px whitespace-nowrap flex items-center gap-1.5 ${
                        activeTab === tab.key
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <tab.icon className="h-3.5 w-3.5" />
                      {tab.label}
                    </button>
                  ))}
                </div>
                <button className="h-7 w-7 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0 ml-2">
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <CardContent className="p-0">
                {/* ─── Departments Tab ─── */}
                {activeTab === "departments" && (
                  <div>
                    {departments.length === 0 ? (
                      <EmptyTab icon={<FolderTree className="h-10 w-10" />} message="No departments registered for this site." />
                    ) : (
                      <div className="divide-y divide-border/60">
                        <div className="grid grid-cols-12 px-5 py-3 bg-secondary/10 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                          <div className="col-span-5">Department Name</div>
                          <div className="col-span-2 text-center">Code</div>
                          <div className="col-span-2 text-center">Systems</div>
                          <div className="col-span-3 text-right">Status</div>
                        </div>
                        {departments.map((dept) => {
                          const deptSystems = systems.filter((s) => s.departmentId === dept.id);
                          return (
                            <div
                              key={dept.id}
                              className="grid grid-cols-12 px-5 py-3.5 items-center hover:bg-secondary/20 transition-colors text-xs font-semibold"
                            >
                              <div className="col-span-5">
                                <div className="flex items-center gap-2.5">
                                  <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <FolderTree className="h-3.5 w-3.5 text-primary" />
                                  </div>
                                  <span className="font-bold text-foreground">{dept.name}</span>
                                </div>
                              </div>
                              <div className="col-span-2 text-center text-muted-foreground font-mono">{dept.code}</div>
                              <div className="col-span-2 text-center">
                                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                  <Cpu className="h-3 w-3 text-violet-400" />
                                  {deptSystems.length}
                                </span>
                              </div>
                              <div className="col-span-3 text-right">
                                <Badge className={`text-[10px] font-bold py-0.5 px-2 ${dept.status ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground"}`}>
                                  {dept.status ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ─── Work Orders Tab ─── */}
                {activeTab === "workorders" && (
                  <div>
                    {displayedWorkOrders.length === 0 ? (
                      <EmptyTab icon={<ClipboardList className="h-10 w-10" />} message="No work orders found for this site." />
                    ) : (
                      <div className="divide-y divide-border/60">
                        <div className="grid grid-cols-12 px-5 py-3 bg-secondary/10 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                          <div className="col-span-2">WO #</div>
                          <div className="col-span-3">Title</div>
                          <div className="col-span-2">Type</div>
                          <div className="col-span-2">Priority</div>
                          <div className="col-span-2">Status</div>
                          <div className="col-span-1 text-right">Due</div>
                        </div>
                        {displayedWorkOrders.map((wo) => (
                          <div key={wo.id} className="grid grid-cols-12 px-5 py-3.5 items-center hover:bg-secondary/20 transition-colors text-xs font-semibold">
                            <div className="col-span-2 font-mono font-bold text-primary">{wo.workOrderNumber}</div>
                            <div className="col-span-3">
                              <p className="font-bold text-foreground line-clamp-1">{wo.title}</p>
                              {wo.asset?.assetName && (
                                <p className="text-[10px] text-muted-foreground font-medium">{wo.asset.assetName}</p>
                              )}
                            </div>
                            <div className="col-span-2">
                              <Badge variant="secondary" className="text-[10px] font-bold">
                                {wo.workType.replace("_", " ")}
                              </Badge>
                            </div>
                            <div className="col-span-2">
                              <StatusBadge status={wo.priority} variant={getPriorityVariant(wo.priority)} />
                            </div>
                            <div className="col-span-2">
                              <StatusBadge status={wo.status.replace(/_/g, " ")} variant={getStatusVariant(wo.status)} />
                            </div>
                            <div className="col-span-1 text-right text-muted-foreground font-mono text-[10px]">
                              {wo.dueDate ? new Date(wo.dueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "—"}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ─── Assets Tab ─── */}
                {activeTab === "assets" && (
                  <div>
                    {displayedAssets.length === 0 ? (
                      <EmptyTab icon={<Package className="h-10 w-10" />} message="No assets assigned to this site." />
                    ) : (
                      <div className="divide-y divide-border/60">
                        <div className="grid grid-cols-12 px-5 py-3 bg-secondary/10 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                          <div className="col-span-1">#</div>
                          <div className="col-span-3">Asset Name</div>
                          <div className="col-span-2">Code</div>
                          <div className="col-span-2">Category</div>
                          <div className="col-span-2">Location</div>
                          <div className="col-span-2 text-right">Status</div>
                        </div>
                        {displayedAssets.map((asset, idx) => (
                          <div key={asset.id} className="grid grid-cols-12 px-5 py-3.5 items-center hover:bg-secondary/20 transition-colors text-xs font-semibold">
                            <div className="col-span-1 text-muted-foreground font-mono">{idx + 1}</div>
                            <div className="col-span-3">
                              <div className="flex items-center gap-2">
                                <SafeImage
                                  src={asset.imageUrl ? getAssetImageUrl(asset.id, asset.imageUrl) : null}
                                  alt={asset.assetName}
                                  className="h-7 w-7 rounded-lg object-cover border border-border shrink-0"
                                  fallback={
                                    <div className="h-7 w-7 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                                      <Package className="h-3.5 w-3.5 text-violet-500" />
                                    </div>
                                  }
                                />
                                <div>
                                  <p className="font-bold text-foreground line-clamp-1">{asset.assetName}</p>
                                  {asset.manufacturer && (
                                    <p className="text-[10px] text-muted-foreground">{asset.manufacturer}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="col-span-2 font-mono text-muted-foreground">{asset.assetCode}</div>
                            <div className="col-span-2 text-muted-foreground">{asset.category}</div>
                            <div className="col-span-2 text-muted-foreground line-clamp-1">{asset.location || "—"}</div>
                            <div className="col-span-2 text-right">
                              <StatusBadge
                                status={(asset.status || "ACTIVE").replace(/_/g, " ")}
                                variant={getAssetStatusVariant(asset.status)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ─── Checklists Tab ─── */}
                {activeTab === "checklists" && (
                  <div>
                    {checklists.length === 0 ? (
                      <EmptyTab icon={<CheckSquare className="h-10 w-10" />} message="No checklist templates found." />
                    ) : (
                      <div className="divide-y divide-border/60">
                        <div className="grid grid-cols-12 px-5 py-3 bg-secondary/10 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                          <div className="col-span-1">#</div>
                          <div className="col-span-5">Checklist Name</div>
                          <div className="col-span-4">Description</div>
                          <div className="col-span-2 text-right">Created</div>
                        </div>
                        {checklists.map((cl, idx) => (
                          <div key={cl.id} className="grid grid-cols-12 px-5 py-3.5 items-center hover:bg-secondary/20 transition-colors text-xs font-semibold">
                            <div className="col-span-1 text-muted-foreground font-mono">{idx + 1}</div>
                            <div className="col-span-5">
                              <div className="flex items-center gap-2.5">
                                <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                  <CheckSquare className="h-3.5 w-3.5 text-emerald-500" />
                                </div>
                                <span className="font-bold text-foreground line-clamp-1">{cl.name}</span>
                              </div>
                            </div>
                            <div className="col-span-4 text-muted-foreground line-clamp-1">
                              {cl.description || "—"}
                            </div>
                            <div className="col-span-2 text-right text-muted-foreground font-mono text-[10px]">
                              {new Date(cl.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

function EmptyTab({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      <div className="text-muted-foreground/30">{icon}</div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function RightPanelSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48 rounded" />
        <Skeleton className="h-4 w-72 rounded" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 rounded-2xl border border-border bg-card p-6 items-center">
        <div className="lg:col-span-2 grid grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-7 w-12 rounded" />
              <Skeleton className="h-3.5 w-16 rounded" />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center lg:border-l border-border/60 lg:pl-6 h-full">
          <Skeleton className="h-28 w-28 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 flex flex-col justify-between h-28">
            <Skeleton className="h-5 w-5 rounded-md" />
            <div className="space-y-1.5">
              <Skeleton className="h-7 w-12 rounded" />
              <Skeleton className="h-3 w-16 rounded" />
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="h-12 bg-muted/20 border-b border-border flex items-center justify-between px-4">
          <div className="flex gap-2">
            <Skeleton className="h-7 w-28 rounded" />
            <Skeleton className="h-7 w-24 rounded" />
            <Skeleton className="h-7 w-20 rounded" />
          </div>
          <Skeleton className="h-7 w-7 rounded-lg" />
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
