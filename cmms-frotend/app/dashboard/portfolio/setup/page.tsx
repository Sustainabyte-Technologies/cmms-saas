"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Customer, Site, Department, System,
  AssignableUser,
  getCustomers, getSites, getDepartments, getSystems,
  createCustomer, updateCustomer, deleteCustomer, CreateCustomerDto,
  createSite, updateSite, deleteSite, CreateSiteDto,
  createDepartment, updateDepartment, deleteDepartment, CreateDepartmentDto,
  createSystem, updateSystem, deleteSystem, CreateSystemDto,
  uploadCustomerImage, uploadSiteImage, uploadSystemImage,
  getCustomerImageUrl, getSiteImageUrl, getSystemImageUrl,
  getAssignableManagers, getAssignableSupervisors, getAssignableDeptSupervisors,
  fetchCustomers, fetchSites, fetchDepartments, fetchSystems,
} from "@/lib/api/customers-api";
import { useRole } from "@/contexts/role-context";
import { getDecodedTokenFromCookies } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2, MapPin, FolderTree, Cpu,
  Plus, Pencil, Trash2, X, ChevronDown, AlertCircle,
  Check, Loader2, Search, ArrowLeft, Upload, ImageIcon,
} from "lucide-react";
import Link from "next/link";

type Tab = "customers" | "sites" | "departments" | "systems";

type ModalState =
  | { kind: "closed" }
  | { kind: "create-customer" }
  | { kind: "edit-customer"; item: Customer }
  | { kind: "delete-customer"; item: Customer }
  | { kind: "create-site" }
  | { kind: "edit-site"; item: Site }
  | { kind: "delete-site"; item: Site }
  | { kind: "create-department" }
  | { kind: "edit-department"; item: Department }
  | { kind: "delete-department"; item: Department }
  | { kind: "create-system" }
  | { kind: "edit-system"; item: System }
  | { kind: "delete-system"; item: System };

function SkeletonTable({ tab }: { tab: Tab }) {
  const headers = 
    tab === "customers"
      ? ["#", "Customer", "Code", "Contact", "Location", "Manager", "Created By", "Status", ""]
      : tab === "sites"
      ? ["#", "Site", "Code", "Customer", "Supervisor", "Created By", "Location", "Status", ""]
      : tab === "departments"
      ? ["#", "Department", "Code", "Site", "Created By", "Description", "Status", ""]
      : ["#", "System", "Code", "Department", "Created By", "Description", "Status", ""];

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm animate-pulse">
      <table className="w-full">
        <thead className="bg-secondary/30 border-b border-border">
          <tr>
            {headers.map(h => (
              <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground/70">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {Array.from({ length: 5 }).map((_, idx) => (
            <tr key={idx} className="hover:bg-secondary/10 transition-colors">
              <td className="px-5 py-4 text-sm w-10">
                <Skeleton className="h-4 w-4 rounded" />
              </td>
              <td className="px-5 py-4 text-sm">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <Skeleton className="h-4 w-[120px] rounded" />
                    {tab === "customers" && <Skeleton className="h-3 w-[150px] rounded" />}
                  </div>
                </div>
              </td>
              <td className="px-5 py-4 text-sm">
                <Skeleton className="h-5 w-16 rounded" />
              </td>
              <td className="px-5 py-4 text-sm">
                {tab === "customers" ? (
                  <Skeleton className="h-4 w-[100px] rounded" />
                ) : tab === "sites" ? (
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded shrink-0" />
                    <Skeleton className="h-4 w-[80px] rounded" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded shrink-0" />
                    <Skeleton className="h-4 w-[80px] rounded" />
                  </div>
                )}
              </td>
              <td className="px-5 py-4 text-sm">
                {tab === "customers" || tab === "sites" ? (
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-[90px] rounded" />
                    <Skeleton className="h-3 w-[60px] rounded" />
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-[90px] rounded" />
                    <Skeleton className="h-3 w-[60px] rounded" />
                  </div>
                )}
              </td>
              <td className="px-5 py-4 text-sm">
                {tab === "customers" || tab === "sites" ? (
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-[90px] rounded" />
                    <Skeleton className="h-3 w-[60px] rounded" />
                  </div>
                ) : (
                  <Skeleton className="h-4 w-[120px] rounded" />
                )}
              </td>
              <td className="px-5 py-4 text-sm">
                {tab === "customers" || tab === "sites" ? (
                  <Skeleton className="h-4 w-[110px] rounded" />
                ) : (
                  <Skeleton className="h-6 w-14 rounded-full" />
                )}
              </td>
              <td className="px-5 py-4 text-sm">
                {tab === "customers" || tab === "sites" ? (
                  <Skeleton className="h-6 w-14 rounded-full" />
                ) : (
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
                )}
              </td>
              {(tab === "customers" || tab === "sites") && (
                <td className="px-5 py-4 text-sm">
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PortfolioSetupPage() {
  const { role } = useRole();

  // Get the current user's ID from the JWT (needed for assignment filtering)
  const currentUserId = getDecodedTokenFromCookies()?.sub ?? "";

  const isManager    = role === "customer_manager";
  const isSupervisor = role === "supervisor";
  const isSiteIncharge = role === "site_incharge";

  const [activeTab, setActiveTab]   = useState<Tab>(
    isSupervisor ? "departments" : (isManager || isSiteIncharge) ? "sites" : "customers"
  );
  const [modal,     setModal]       = useState<ModalState>({ kind: "closed" });
  
  // Search and Pagination states
  const [searchVal, setSearchVal]   = useState("");
  const [search,    setSearch]      = useState("");
  const [page,      setPage]        = useState(1);
  const [limit,     setLimit]       = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [customers,    setCustomers]    = useState<Customer[]>([]);
  const [sites,        setSites]        = useState<Site[]>([]);
  const [departments,  setDepartments]  = useState<Department[]>([]);
  const [systems,      setSystems]      = useState<System[]>([]);

  // Dropdown dependency states (full loaded lists)
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [allSites,     setAllSites]     = useState<Site[]>([]);
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [allSystems,   setAllSystems]   = useState<System[]>([]);

  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);

  // 1. Debounce Search Input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchVal);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchVal]);

  // Reset page and search value when tab changes
  useEffect(() => {
    setSearchVal("");
    setSearch("");
    setPage(1);
  }, [activeTab]);

  // 2. Load full lists for modal dropdowns and tab counts once on mount/refresh
  const loadDropdownData = useCallback(async () => {
    try {
      const [c, s, d, sys] = await Promise.all([
        getCustomers(),
        getSites(),
        getDepartments(),
        getSystems(),
      ]);
      setAllCustomers(c);
      setAllSites(s);
      setAllDepartments(d);
      setAllSystems(sys);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("Cannot connect to server") || msg.includes("Failed to fetch")) {
        console.warn("⚠️ Network warning: Failed to load dropdown dependency data. Server is offline.");
      } else {
        console.error("Failed to load dropdown dependency data:", e);
      }
    }
  }, []);

  useEffect(() => {
    loadDropdownData();
  }, [loadDropdownData]);

  // 3. Load active tab with backend search & pagination
  const loadActiveTab = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (activeTab === "customers") {
        const res = await fetchCustomers(search, page, limit);
        setCustomers(res.data);
        setTotalItems(res.total);
        setTotalPages(res.totalPages);
      } else if (activeTab === "sites") {
        const res = await fetchSites(search, page, limit);
        setSites(res.data);
        setTotalItems(res.total);
        setTotalPages(res.totalPages);
      } else if (activeTab === "departments") {
        const res = await fetchDepartments(search, page, limit);
        setDepartments(res.data);
        setTotalItems(res.total);
        setTotalPages(res.totalPages);
      } else if (activeTab === "systems") {
        const res = await fetchSystems(search, page, limit);
        setSystems(res.data);
        setTotalItems(res.total);
        setTotalPages(res.totalPages);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load active tab data");
    } finally {
      setLoading(false);
    }
  }, [activeTab, search, page, limit]);

  useEffect(() => {
    loadActiveTab();
  }, [loadActiveTab]);

  // Refresh helper
  const refreshData = async () => {
    await Promise.all([loadDropdownData(), loadActiveTab()]);
  };

  // ── Role-based visibility for active lists ──────────────────────────────────
  const visibleCustomers = isManager
    ? customers.filter(c => c.assignedManagerId === currentUserId)
    : customers;

  const visibleSites = (isSupervisor || isSiteIncharge)
    ? sites.filter(s => s.assignedSupervisorId === currentUserId)
    : sites;

  // ── Role-based visibility for dropdown/counts ────────────────────────────────
  const visibleAllCustomers = isManager
    ? allCustomers.filter(c => c.assignedManagerId === currentUserId)
    : allCustomers;

  const visibleAllSites = (isSupervisor || isSiteIncharge)
    ? allSites.filter(s => s.assignedSupervisorId === currentUserId)
    : allSites;

  // Hide "Add" button for restricted tab/role combos
  const canAddCurrent =
    !(isManager    && activeTab === "customers") &&
    !(isSiteIncharge && activeTab === "customers") &&
    !(isSupervisor && activeTab === "sites");

  // Hide tabs that this role cannot access
  const allTabs: { key: Tab; label: string; count: number; icon: React.ReactNode; color: string }[] = [
    { key: "customers",   label: "Customers",   count: visibleAllCustomers.length,   icon: <Building2 className="h-4 w-4" />,  color: "text-blue-500" },
    { key: "sites",       label: "Sites",       count: visibleAllSites.length,       icon: <MapPin className="h-4 w-4" />,     color: "text-emerald-500" },
    { key: "departments", label: "Departments", count: allDepartments.length, icon: <FolderTree className="h-4 w-4" />, color: "text-violet-500" },
    { key: "systems",     label: "Systems",     count: allSystems.length,     icon: <Cpu className="h-4 w-4" />,        color: "text-amber-500" },
  ];

  const tabs = isSupervisor
    ? allTabs.filter(t => t.key === "departments" || t.key === "systems")
    : (isManager || isSiteIncharge)
      ? allTabs.filter(t => t.key !== "customers")
      : allTabs;

  const handleAdd = () => {
    if (activeTab === "customers")   setModal({ kind: "create-customer" });
    if (activeTab === "sites")       setModal({ kind: "create-site" });
    if (activeTab === "departments") setModal({ kind: "create-department" });
    if (activeTab === "systems")     setModal({ kind: "create-system" });
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/dashboard/portfolio" className="hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Explorer
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Portfolio Setup</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Add, update, or remove customers, sites, departments, and systems
          </p>
        </div>
        {canAddCurrent && (
          <Button onClick={handleAdd} className="gap-2 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20">
            <Plus className="h-4 w-4" />
            Add {activeTab.slice(0, -1).replace(/^\w/, c => c.toUpperCase())}
          </Button>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
          <Button variant="ghost" size="sm" className="ml-auto" onClick={refreshData}>Retry</Button>
        </div>
      )}

      {/* Tab bar */}
      <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => { setActiveTab(t.key); }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
              activeTab === t.key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            <span className={activeTab === t.key ? "text-primary-foreground" : t.color}>{t.icon}</span>
            <span>{t.label}</span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
              activeTab === t.key ? "bg-white/20" : "bg-secondary"
            }`}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={searchVal}
          onChange={e => setSearchVal(e.target.value)}
          placeholder={`Search ${activeTab}…`}
          className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>

      {/* Content */}
      {loading ? (
        <SkeletonTable tab={activeTab} />
      ) : (
        <>
          {activeTab === "customers"   && <CustomerTable items={visibleCustomers} customers={allCustomers} onEdit={c => setModal({ kind: "edit-customer",   item: c })} onDelete={c => setModal({ kind: "delete-customer", item: c })} />}
          {activeTab === "sites"       && <SiteTable       items={visibleSites}       customers={allCustomers} onEdit={s => setModal({ kind: "edit-site",       item: s })} onDelete={s => setModal({ kind: "delete-site",    item: s })} />}
          {activeTab === "departments" && <DeptTable        items={departments} sites={allSites}         onEdit={d => setModal({ kind: "edit-department", item: d })} onDelete={d => setModal({ kind: "delete-department", item: d })} />}
          {activeTab === "systems"     && <SystemTable      items={systems}     departments={allDepartments} onEdit={s => setModal({ kind: "edit-system",     item: s })} onDelete={s => setModal({ kind: "delete-system",   item: s })} />}
        </>
      )}

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-4 px-2">
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{Math.min((page - 1) * limit + 1, totalItems)}</span> to{" "}
            <span className="font-semibold text-foreground">{Math.min(page * limit, totalItems)}</span> of{" "}
            <span className="font-semibold text-foreground">{totalItems}</span> entries
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="h-8 text-xs border-border"
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pNum = idx + 1;
              const isCurrent = page === pNum;
              return (
                <Button
                  key={pNum}
                  variant={isCurrent ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(pNum)}
                  className={`h-8 w-8 text-xs p-0 border-border ${
                    isCurrent ? "bg-primary text-primary-foreground font-semibold" : ""
                  }`}
                >
                  {pNum}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="h-8 text-xs border-border"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      {modal.kind === "create-customer" && (
        <CustomerFormModal title="New Customer" onClose={() => setModal({ kind: "closed" })}
          onSubmit={async (dto, imageFile) => {
            const created = await createCustomer(dto);
            if (imageFile) await uploadCustomerImage(created.id, imageFile).catch(() => null);
            await refreshData(); setModal({ kind: "closed" });
          }} />
      )}
      {modal.kind === "edit-customer" && (
        <CustomerFormModal title="Edit Customer" initial={modal.item} onClose={() => setModal({ kind: "closed" })}
          onSubmit={async (dto, imageFile) => {
            await updateCustomer(modal.item.id, dto);
            if (imageFile) await uploadCustomerImage(modal.item.id, imageFile).catch(() => null);
            await refreshData(); setModal({ kind: "closed" });
          }} />
      )}
      {modal.kind === "delete-customer" && (
        <ConfirmDelete name={modal.item.name} onClose={() => setModal({ kind: "closed" })}
          onConfirm={async () => { await deleteCustomer(modal.item.id); await refreshData(); setModal({ kind: "closed" }); }} />
      )}
      {modal.kind === "create-site" && (
        <SiteFormModal title="New Site" customers={allCustomers} onClose={() => setModal({ kind: "closed" })}
          onSubmit={async (dto, imageFile) => {
            const created = await createSite(dto);
            if (imageFile) await uploadSiteImage(created.id, imageFile).catch(() => null);
            await refreshData(); setModal({ kind: "closed" });
          }} />
      )}
      {modal.kind === "edit-site" && (
        <SiteFormModal title="Edit Site" customers={allCustomers} initial={modal.item} onClose={() => setModal({ kind: "closed" })}
          onSubmit={async (dto, imageFile) => {
            await updateSite(modal.item.id, dto);
            if (imageFile) await uploadSiteImage(modal.item.id, imageFile).catch(() => null);
            await refreshData(); setModal({ kind: "closed" });
          }} />
      )}
      {modal.kind === "delete-site" && (
        <ConfirmDelete name={modal.item.name} onClose={() => setModal({ kind: "closed" })}
          onConfirm={async () => { await deleteSite(modal.item.id); await refreshData(); setModal({ kind: "closed" }); }} />
      )}
      {modal.kind === "create-department" && (
        <DeptFormModal title="New Department" sites={allSites} onClose={() => setModal({ kind: "closed" })}
          onSubmit={async dto => { await createDepartment(dto); await refreshData(); setModal({ kind: "closed" }); }} />
      )}
      {modal.kind === "edit-department" && (
        <DeptFormModal title="Edit Department" sites={allSites} initial={modal.item} onClose={() => setModal({ kind: "closed" })}
          onSubmit={async dto => { await updateDepartment(modal.item.id, dto); await refreshData(); setModal({ kind: "closed" }); }} />
      )}
      {modal.kind === "delete-department" && (
        <ConfirmDelete name={modal.item.name} onClose={() => setModal({ kind: "closed" })}
          onConfirm={async () => { await deleteDepartment(modal.item.id); await refreshData(); setModal({ kind: "closed" }); }} />
      )}
      {modal.kind === "create-system" && (
        <SystemFormModal title="New System" departments={allDepartments} onClose={() => setModal({ kind: "closed" })}
          onSubmit={async (dto, imageFile) => {
            const created = await createSystem(dto);
            if (imageFile) await uploadSystemImage(created.id, imageFile).catch(() => null);
            await refreshData(); setModal({ kind: "closed" });
          }} />
      )}
      {modal.kind === "edit-system" && (
        <SystemFormModal title="Edit System" departments={allDepartments} initial={modal.item} onClose={() => setModal({ kind: "closed" })}
          onSubmit={async (dto, imageFile) => {
            await updateSystem(modal.item.id, dto);
            if (imageFile) await uploadSystemImage(modal.item.id, imageFile).catch(() => null);
            await refreshData(); setModal({ kind: "closed" });
          }} />
      )}
      {modal.kind === "delete-system" && (
        <ConfirmDelete name={modal.item.name} onClose={() => setModal({ kind: "closed" })}
          onConfirm={async () => { await deleteSystem(modal.item.id); await refreshData(); setModal({ kind: "closed" }); }} />
      )}
    </div>
  );
}

const TH = ({ children }: { children: React.ReactNode }) => (
  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground/70">{children}</th>
);
const TD = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <td className={`px-5 py-4 text-sm ${className ?? ""}`}>{children}</td>
);

// ─── Image Upload Field ───────────────────────────────────────────────────────
function ImageUploadField({
  existingImageUrl,
  onFileChange,
}: {
  existingImageUrl?: string | null;
  onFileChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (file: File | null) => {
    onFileChange(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const displaySrc = preview || existingImageUrl || null;

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-foreground">
        Image <span className="text-muted-foreground font-normal text-xs">(optional)</span>
      </label>
      <div
        className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/30 cursor-pointer hover:border-primary/50 hover:bg-secondary/50 transition-all overflow-hidden"
        style={{ minHeight: 120 }}
        onClick={() => inputRef.current?.click()}
      >
        {displaySrc ? (
          <>
            <img src={displaySrc} alt="Preview" className="w-full max-h-36 object-cover rounded-xl" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-xl">
              <Upload className="h-7 w-7 text-white" />
              <span className="ml-2 text-white text-sm font-medium">Change Image</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
            <ImageIcon className="h-9 w-9 text-muted-foreground/40" />
            <span className="text-xs">Click to upload image</span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => handleFile(e.target.files?.[0] ?? null)}
        />
      </div>
    </div>
  );
}


function Monogram({ name, color }: { name: string; color: string }) {
  return (
    <div className={`h-9 w-9 shrink-0 rounded-xl flex items-center justify-center text-sm font-bold text-white ${color}`}>
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

function TableImage({ src, name, color }: { src?: string | null; name: string; color: string }) {
  const [hasError, setHasError] = useState(false);
  if (src && !hasError) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setHasError(true)}
        className="h-9 w-9 shrink-0 rounded-xl object-cover border border-border bg-muted"
      />
    );
  }
  return <Monogram name={name} color={color} />;
}

function canModifyItem(
  userRole: string | undefined | null,
  createdBy?: { role: { name: string } } | null
): boolean {
  if (!userRole) return false;
  const normalizedUserRole = userRole.toLowerCase();

  // If the logged-in user is ADMIN, they can always edit/delete
  if (normalizedUserRole === "admin") return true;

  // If the item has no creator (legacy data), allow modification
  if (!createdBy) return true;

  const creatorRole = createdBy.role.name.toLowerCase();

  // 1. If created by admin, maintenance_manager/customer_manager cannot edit/delete
  if (
    creatorRole === "admin" &&
    (normalizedUserRole === "maintenance_manager" || normalizedUserRole === "customer_manager")
  ) {
    return false;
  }

  // 2. If created by admin or manager, site_incharge cannot edit/delete
  if (
    (creatorRole === "admin" || creatorRole === "maintenance_manager" || creatorRole === "customer_manager") &&
    normalizedUserRole === "site_incharge"
  ) {
    return false;
  }

  // 3. If created by admin, manager, or site_incharge, supervisor cannot edit/delete
  if (
    (creatorRole === "admin" || creatorRole === "maintenance_manager" || creatorRole === "customer_manager" || creatorRole === "site_incharge") &&
    normalizedUserRole === "supervisor"
  ) {
    return false;
  }

  return true;
}

function ActionButtons({
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
}: {
  onEdit: () => void;
  onDelete: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      {canEdit && (
        <button onClick={onEdit}   className="h-8 w-8 rounded-lg border border-border hover:border-primary hover:text-primary flex items-center justify-center transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
      )}
      {canDelete && (
        <button onClick={onDelete} className="h-8 w-8 rounded-lg border border-border hover:border-destructive hover:text-destructive flex items-center justify-center transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
      )}
    </div>
  );
}

function EmptyRow({ cols, message }: { cols: number; message: string }) {
  return (
    <tr>
      <td colSpan={cols} className="px-5 py-16 text-center text-sm text-muted-foreground">{message}</td>
    </tr>
  );
}

function TableWrap({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
      <table className="w-full">
        <thead className="bg-secondary/30 border-b border-border">
          <tr>{headers.map(h => <TH key={h}>{h}</TH>)}</tr>
        </thead>
        <tbody className="divide-y divide-border/60">{children}</tbody>
      </table>
    </div>
  );
}

function CustomerTable({ items, customers, onEdit, onDelete }: { items: Customer[]; customers: Customer[]; onEdit: (c: Customer) => void; onDelete: (c: Customer) => void }) {
  const { role } = useRole();
  return (
    <TableWrap headers={["#", "Customer", "Code", "Contact", "Location", "Manager", "Created By", "Status", ""]}>
      {items.length === 0 ? <EmptyRow cols={9} message="No customers found. Click '+ Add Customer' to create one." /> : items.map((c, i) => (
        <tr key={c.id} className="group hover:bg-secondary/20 transition-colors">
          <TD className="text-muted-foreground font-mono text-xs w-10">{i + 1}</TD>
          <TD><div className="flex items-center gap-3"><TableImage src={c.imageUrl ? `${getCustomerImageUrl(c.id)}?t=${encodeURIComponent(c.imageUrl)}` : null} name={c.name} color="bg-blue-500" /><div><p className="font-semibold text-foreground">{c.name}</p>{c.email && <p className="text-xs text-muted-foreground">{c.email}</p>}</div></div></TD>
          <TD><span className="font-mono text-xs bg-secondary px-2 py-1 rounded-md">{c.code}</span></TD>
          <TD className="text-muted-foreground">{c.contactPerson || "—"}</TD>
          <TD className="text-muted-foreground text-xs">{[c.city, c.state, c.country].filter(Boolean).join(", ") || "—"}</TD>
          <TD>
            {c.assignedManager ? (
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">{c.assignedManager.fullName}</span>
                <span className="text-[10px] text-muted-foreground">{c.assignedManager.role.name}</span>
              </div>
            ) : <span className="text-muted-foreground text-xs">—</span>}
          </TD>
          <TD>
            {c.createdBy ? (
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">{c.createdBy.fullName}</span>
                <span className="text-[10px] text-muted-foreground">{c.createdBy.role.name}</span>
              </div>
            ) : <span className="text-muted-foreground text-xs">—</span>}
          </TD>
          <TD><Badge className="bg-success/10 text-success border-success/20 text-xs">Active</Badge></TD>
          <TD>
            <ActionButtons
              onEdit={() => onEdit(c)}
              onDelete={() => onDelete(c)}
              canEdit={canModifyItem(role, c.createdBy)}
              canDelete={canModifyItem(role, c.createdBy)}
            />
          </TD>
        </tr>
      ))}
    </TableWrap>
  );
}

function SiteTable({ items, customers, onEdit, onDelete }: { items: Site[]; customers: Customer[]; onEdit: (s: Site) => void; onDelete: (s: Site) => void }) {
  const { role } = useRole();
  return (
    <TableWrap headers={["#", "Site", "Code", "Customer", "Supervisor", "Created By", "Location", "Status", ""]}>
      {items.length === 0 ? <EmptyRow cols={9} message="No sites found. Click '+ Add Site' to create one." /> : items.map((s, i) => {
        const customer = customers.find(c => c.id === s.customerId);
        return (
          <tr key={s.id} className="group hover:bg-secondary/20 transition-colors">
            <TD className="text-muted-foreground font-mono text-xs w-10">{i + 1}</TD>
            <TD><div className="flex items-center gap-3"><TableImage src={s.imageUrl ? `${getSiteImageUrl(s.id)}?t=${encodeURIComponent(s.imageUrl)}` : null} name={s.name} color="bg-emerald-500" /><p className="font-semibold text-foreground">{s.name}</p></div></TD>
            <TD><span className="font-mono text-xs bg-secondary px-2 py-1 rounded-md">{s.code}</span></TD>
            <TD>{customer ? <div className="flex items-center gap-2"><div className="h-6 w-6 rounded bg-blue-500/10 text-blue-600 text-[10px] font-bold flex items-center justify-center">{customer.name.slice(0,2).toUpperCase()}</div><span className="text-sm">{customer.name}</span></div> : <span className="text-muted-foreground">—</span>}</TD>
            <TD>
              {s.assignedSupervisor ? (
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">{s.assignedSupervisor.fullName}</span>
                  <span className="text-[10px] text-muted-foreground">{s.assignedSupervisor.role.name}</span>
                </div>
              ) : <span className="text-muted-foreground text-xs">—</span>}
            </TD>
            <TD>
              {s.createdBy ? (
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">{s.createdBy.fullName}</span>
                  <span className="text-[10px] text-muted-foreground">{s.createdBy.role.name}</span>
                </div>
              ) : <span className="text-muted-foreground text-xs">—</span>}
            </TD>
            <TD className="text-muted-foreground text-xs">{[s.address, s.city, s.state, s.country].filter(Boolean).join(", ") || "—"}</TD>
            <TD><Badge className="bg-success/10 text-success border-success/20 text-xs">Active</Badge></TD>
            <TD>
              <ActionButtons
                onEdit={() => onEdit(s)}
                onDelete={() => onDelete(s)}
                canEdit={canModifyItem(role, s.createdBy)}
                canDelete={canModifyItem(role, s.createdBy)}
              />
            </TD>
          </tr>
        );
      })}
    </TableWrap>
  );
}

function DeptTable({ items, sites, onEdit, onDelete }: { items: Department[]; sites: Site[]; onEdit: (d: Department) => void; onDelete: (d: Department) => void }) {
  const { role } = useRole();
  return (
    <TableWrap headers={["#", "Department", "Code", "Site", "Created By", "Description", "Status", ""]}>
      {items.length === 0 ? <EmptyRow cols={8} message="No departments found. Click '+ Add Department' to create one." /> : items.map((d, i) => {
        const site = sites.find(s => s.id === d.siteId);
        return (
          <tr key={d.id} className="group hover:bg-secondary/20 transition-colors">
            <TD className="text-muted-foreground font-mono text-xs w-10">{i + 1}</TD>
            <TD><div className="flex items-center gap-3"><Monogram name={d.name} color="bg-violet-500" /><p className="font-semibold text-foreground">{d.name}</p></div></TD>
            <TD><span className="font-mono text-xs bg-secondary px-2 py-1 rounded-md">{d.code}</span></TD>
            <TD>{site ? <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-emerald-500" /><span className="text-sm">{site.name}</span></div> : <span className="text-muted-foreground">—</span>}</TD>
            <TD>
              {d.createdBy ? (
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">{d.createdBy.fullName}</span>
                  <span className="text-[10px] text-muted-foreground">{d.createdBy.role.name}</span>
                </div>
              ) : <span className="text-muted-foreground text-xs">—</span>}
            </TD>
            <TD className="text-muted-foreground text-xs max-w-[200px] truncate">{d.description || "—"}</TD>
            <TD><Badge className="bg-success/10 text-success border-success/20 text-xs">Active</Badge></TD>
            <TD>
              <ActionButtons
                onEdit={() => onEdit(d)}
                onDelete={() => onDelete(d)}
                canEdit={canModifyItem(role, d.createdBy)}
                canDelete={canModifyItem(role, d.createdBy)}
              />
            </TD>
          </tr>
        );
      })}
    </TableWrap>
  );
}

function SystemTable({ items, departments, onEdit, onDelete }: { items: System[]; departments: Department[]; onEdit: (s: System) => void; onDelete: (s: System) => void }) {
  const { role } = useRole();
  return (
    <TableWrap headers={["#", "System", "Code", "Department", "Created By", "Description", "Status", ""]}>
      {items.length === 0 ? <EmptyRow cols={8} message="No systems found. Click '+ Add System' to create one." /> : items.map((s, i) => {
        const dept = departments.find(d => d.id === s.departmentId);
        return (
          <tr key={s.id} className="group hover:bg-secondary/20 transition-colors">
            <TD className="text-muted-foreground font-mono text-xs w-10">{i + 1}</TD>
            <TD><div className="flex items-center gap-3"><TableImage src={s.imageUrl ? `${getSystemImageUrl(s.id)}?t=${encodeURIComponent(s.imageUrl)}` : null} name={s.name} color="bg-amber-500" /><p className="font-semibold text-foreground">{s.name}</p></div></TD>
            <TD><span className="font-mono text-xs bg-secondary px-2 py-1 rounded-md">{s.code}</span></TD>
            <TD>{dept ? <div className="flex items-center gap-2"><FolderTree className="h-3.5 w-3.5 text-violet-500" /><span className="text-sm">{dept.name}</span></div> : <span className="text-muted-foreground">—</span>}</TD>
            <TD>
              {s.createdBy ? (
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">{s.createdBy.fullName}</span>
                  <span className="text-[10px] text-muted-foreground">{s.createdBy.role.name}</span>
                </div>
              ) : <span className="text-muted-foreground text-xs">—</span>}
            </TD>
            <TD className="text-muted-foreground text-xs max-w-[200px] truncate">{s.description || "—"}</TD>
            <TD><Badge className="bg-success/10 text-success border-success/20 text-xs">Active</Badge></TD>
            <TD>
              <ActionButtons
                onEdit={() => onEdit(s)}
                onDelete={() => onDelete(s)}
                canEdit={canModifyItem(role, s.createdBy)}
                canDelete={canModifyItem(role, s.createdBy)}
              />
            </TD>
          </tr>
        );
      })}
    </TableWrap>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-bold text-foreground">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-accent transition-colors"><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

interface FieldProps { label: string; required?: boolean; error?: string; children: React.ReactNode }
function Field({ label, required, error, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-foreground">{label}{required && <span className="text-destructive ml-0.5">*</span>}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

const inputClass = "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";
const selectClass = `${inputClass} cursor-pointer appearance-none`;

function CustomerFormModal({ title, initial, onClose, onSubmit }: {
  title: string; initial?: Customer;
  onClose: () => void;
  onSubmit: (dto: CreateCustomerDto, imageFile: File | null) => Promise<void>;
}) {
  const [name, setName]                   = useState(initial?.name ?? "");
  const [desc, setDesc]                   = useState(initial?.description ?? "");
  const [contactPerson, setContactPerson] = useState(initial?.contactPerson ?? "");
  const [email, setEmail]                 = useState(initial?.email ?? "");
  const [phone, setPhone]                 = useState(initial?.phone ?? "");
  const [address, setAddress]             = useState(initial?.address ?? "");
  const [city, setCity]                   = useState(initial?.city ?? "");
  const [state, setState]                 = useState(initial?.state ?? "");
  const [country, setCountry]             = useState(initial?.country ?? "");
  const [imageFile, setImageFile]         = useState<File | null>(null);
  const [assignedManagerId, setAssignedManagerId] = useState<string>(initial?.assignedManagerId ?? "");
  const [managers, setManagers]           = useState<AssignableUser[]>([]);
  const [saving, setSaving]               = useState(false);
  const [err,    setErr]                  = useState<string | null>(null);

  useEffect(() => {
    getAssignableManagers().then(setManagers).catch(() => setManagers([]));
  }, []);

  const save = async () => {
    if (!name.trim()) { setErr("Name is required"); return; }
    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: desc.trim() || undefined,
        contactPerson: contactPerson.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        country: country.trim() || undefined,
        assignedManagerId: assignedManagerId || null,
      }, imageFile);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
      setSaving(false);
    }
  };

  return (
    <Modal title={title} onClose={onClose}>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <ImageUploadField
          existingImageUrl={initial?.imageUrl ? getCustomerImageUrl(initial.id) : null}
          onFileChange={setImageFile}
        />
        <Field label="Company Name" required error={err ?? undefined}>
          <input className={inputClass} value={name} onChange={e => { setName(e.target.value); setErr(null); }} placeholder="e.g. Acme Industries" />
        </Field>

        <div className="border-t border-border/60 my-2 pt-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Contact Details</h3>
          <div className="space-y-3">
            <Field label="Contact Person">
              <input className={inputClass} value={contactPerson} onChange={e => setContactPerson(e.target.value)} placeholder="Full name of contact" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Email">
                <input type="email" className={inputClass} value={email} onChange={e => setEmail(e.target.value)} placeholder="email@company.com" />
              </Field>
              <Field label="Phone">
                <input className={inputClass} value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number" />
              </Field>
            </div>
          </div>
        </div>

        <div className="border-t border-border/60 my-2 pt-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Location Details</h3>
          <div className="space-y-3">
            <Field label="Address">
              <input className={inputClass} value={address} onChange={e => setAddress(e.target.value)} placeholder="Street address" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="City">
                <input className={inputClass} value={city} onChange={e => setCity(e.target.value)} placeholder="City" />
              </Field>
              <Field label="State">
                <input className={inputClass} value={state} onChange={e => setState(e.target.value)} placeholder="State / Province" />
              </Field>
              <Field label="Country">
                <input className={inputClass} value={country} onChange={e => setCountry(e.target.value)} placeholder="Country" />
              </Field>
            </div>
          </div>
        </div>

        <Field label="Description">
          <textarea className={`${inputClass} resize-none h-24`} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Short description (optional)" />
        </Field>

        <div className="border-t border-border/60 my-2 pt-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Assignment</h3>
          <Field label="Assigned Customer Manager">
            <select
              id="customer-manager-select"
              className={selectClass}
              value={assignedManagerId}
              onChange={e => setAssignedManagerId(e.target.value)}
            >
              <option value="">— None (unassigned) —</option>
              {managers.map(m => (
                <option key={m.id} value={m.id}>
                  {m.fullName} — {m.email} ({m.role.name})
                </option>
              ))}
            </select>
          </Field>
        </div>

        <ModalActions onClose={onClose} onSave={save} saving={saving} />
      </div>
    </Modal>
  );
}


function SiteFormModal({ title, initial, customers, onClose, onSubmit }: {
  title: string; initial?: Site; customers: Customer[];
  onClose: () => void;
  onSubmit: (dto: CreateSiteDto, imageFile: File | null) => Promise<void>;
}) {
  const [name,       setName]       = useState(initial?.name ?? "");
  const [customerId, setCustomerId] = useState(initial?.customerId ?? "");
  const [address,    setAddress]    = useState(initial?.address ?? "");
  const [city,       setCity]       = useState(initial?.city ?? "");
  const [state,      setState]      = useState(initial?.state ?? "");
  const [country,    setCountry]    = useState(initial?.country ?? "");
  const [imageFile, setImageFile]   = useState<File | null>(null);
  const [assignedSupervisorId, setAssignedSupervisorId] = useState<string>(initial?.assignedSupervisorId ?? "");
  const [supervisors, setSupervisors] = useState<AssignableUser[]>([]);
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState<string | null>(null);

  useEffect(() => {
    getAssignableSupervisors().then(setSupervisors).catch(() => setSupervisors([]));
  }, []);

  const save = async () => {
    if (!name.trim())       { setErr("Site name is required"); return; }
    if (!customerId)        { setErr("Please select a customer"); return; }
    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(), customerId,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        country: country.trim() || undefined,
        assignedSupervisorId: assignedSupervisorId || null,
      }, imageFile);
    } catch (e) { setErr(e instanceof Error ? e.message : "Save failed"); setSaving(false); }
  };

  return (
    <Modal title={title} onClose={onClose}>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <ImageUploadField
          existingImageUrl={initial?.imageUrl ? getSiteImageUrl(initial.id) : null}
          onFileChange={setImageFile}
        />
        <Field label="Site Name" required error={err ?? undefined}>
          <input className={inputClass} value={name} onChange={e => { setName(e.target.value); setErr(null); }} placeholder="e.g. Main Warehouse" />
        </Field>
        <Field label="Customer" required>
          <select className={selectClass} value={customerId} onChange={e => setCustomerId(e.target.value)}>
            <option value="">— Select customer —</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Address"><input className={inputClass} value={address} onChange={e => setAddress(e.target.value)} placeholder="Street address" /></Field>
          <Field label="City"><input className={inputClass} value={city} onChange={e => setCity(e.target.value)} placeholder="City" /></Field>
          <Field label="State"><input className={inputClass} value={state} onChange={e => setState(e.target.value)} placeholder="State / Province" /></Field>
          <Field label="Country"><input className={inputClass} value={country} onChange={e => setCountry(e.target.value)} placeholder="Country" /></Field>
        </div>

        <div className="border-t border-border/60 pt-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Assignment</h3>
          <Field label="Assigned Site Supervisor">
            <select
              id="site-supervisor-select"
              className={selectClass}
              value={assignedSupervisorId}
              onChange={e => setAssignedSupervisorId(e.target.value)}
            >
              <option value="">— None (unassigned) —</option>
              {supervisors.map(sv => (
                <option key={sv.id} value={sv.id}>
                  {sv.fullName} — {sv.email} ({sv.role.name})
                </option>
              ))}
            </select>
          </Field>
        </div>

        <ModalActions onClose={onClose} onSave={save} saving={saving} />
      </div>
    </Modal>
  );
}


function DeptFormModal({ title, initial, sites, onClose, onSubmit }: {
  title: string; initial?: Department; sites: Site[];
  onClose: () => void;
  onSubmit: (dto: CreateDepartmentDto) => Promise<void>;
}) {
  const [name,   setName]   = useState(initial?.name ?? "");
  const [siteId, setSiteId] = useState(initial?.siteId ?? "");
  const [desc,   setDesc]   = useState(initial?.description ?? "");
  const [assignedSupervisorId, setAssignedSupervisorId] = useState<string>(initial?.assignedSupervisorId ?? "");
  const [supervisors, setSupervisors] = useState<AssignableUser[]>([]);
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState<string | null>(null);

  useEffect(() => {
    getAssignableDeptSupervisors().then(setSupervisors).catch(() => setSupervisors([]));
  }, []);

  const save = async () => {
    if (!name.trim()) { setErr("Department name is required"); return; }
    if (!siteId)      { setErr("Please select a site"); return; }
    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        siteId,
        description: desc.trim() || undefined,
        assignedSupervisorId: assignedSupervisorId || null,
      });
    }
    catch (e) { setErr(e instanceof Error ? e.message : "Save failed"); setSaving(false); }
  };

  return (
    <Modal title={title} onClose={onClose}>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <Field label="Department Name" required error={err ?? undefined}>
          <input className={inputClass} value={name} onChange={e => { setName(e.target.value); setErr(null); }} placeholder="e.g. Maintenance" />
        </Field>
        <Field label="Site" required>
          <select className={selectClass} value={siteId} onChange={e => setSiteId(e.target.value)}>
            <option value="">— Select site —</option>
            {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </Field>
        <Field label="Description">
          <textarea className={`${inputClass} resize-none h-20`} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Optional description" />
        </Field>

        <div className="border-t border-border/60 pt-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Assignment</h3>
          <Field label="Assigned Department Supervisor">
            <select
              id="dept-supervisor-select"
              className={selectClass}
              value={assignedSupervisorId}
              onChange={e => setAssignedSupervisorId(e.target.value)}
            >
              <option value="">— None (unassigned) —</option>
              {supervisors.map(sv => (
                <option key={sv.id} value={sv.id}>
                  {sv.fullName} — {sv.email} ({sv.role.name})
                </option>
              ))}
            </select>
          </Field>
        </div>

        <ModalActions onClose={onClose} onSave={save} saving={saving} />
      </div>
    </Modal>
  );
}

function SystemFormModal({ title, initial, departments, onClose, onSubmit }: {
  title: string; initial?: System; departments: Department[];
  onClose: () => void;
  onSubmit: (dto: CreateSystemDto, imageFile: File | null) => Promise<void>;
}) {
  const [name,   setName]   = useState(initial?.name ?? "");
  const [deptId, setDeptId] = useState(initial?.departmentId ?? "");
  const [desc,   setDesc]   = useState(initial?.description ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState<string | null>(null);

  const save = async () => {
    if (!name.trim()) { setErr("System name is required"); return; }
    if (!deptId)      { setErr("Please select a department"); return; }
    setSaving(true);
    try { await onSubmit({ name: name.trim(), departmentId: deptId, description: desc.trim() || undefined }, imageFile); }
    catch (e) { setErr(e instanceof Error ? e.message : "Save failed"); setSaving(false); }
  };

  return (
    <Modal title={title} onClose={onClose}>
      <div className="space-y-4">
        <ImageUploadField
          existingImageUrl={initial?.imageUrl ? getSystemImageUrl(initial.id) : null}
          onFileChange={setImageFile}
        />
        <Field label="System Name" required error={err ?? undefined}>
          <input className={inputClass} value={name} onChange={e => { setName(e.target.value); setErr(null); }} placeholder="e.g. HVAC System" />
        </Field>
        <Field label="Department" required>
          <select className={selectClass} value={deptId} onChange={e => setDeptId(e.target.value)}>
            <option value="">— Select department —</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </Field>
        <Field label="Description">
          <textarea className={`${inputClass} resize-none h-20`} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Optional description" />
        </Field>
        <ModalActions onClose={onClose} onSave={save} saving={saving} />
      </div>
    </Modal>
  );
}


function ConfirmDelete({ name, onClose, onConfirm }: { name: string; onClose: () => void; onConfirm: () => Promise<void> }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const go = async () => {
    setLoading(true);
    try { await onConfirm(); }
    catch (e) { setErr(e instanceof Error ? e.message : "Delete failed"); setLoading(false); }
  };
  return (
    <Modal title="Confirm Delete" onClose={onClose}>
      <div className="space-y-4">
        <div className="rounded-xl bg-destructive/5 border border-destructive/20 p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-destructive">Delete "{name}"?</p>
            <p className="text-xs text-muted-foreground mt-1">This action cannot be undone. All related data may also be removed.</p>
          </div>
        </div>
        {err && <p className="text-xs text-destructive">{err}</p>}
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="destructive" onClick={go} disabled={loading} className="gap-2">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Deleting…</> : <><Trash2 className="h-4 w-4" /> Delete</>}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function ModalActions({ onClose, onSave, saving }: { onClose: () => void; onSave: () => void; saving: boolean }) {
  return (
    <div className="flex justify-end gap-3 pt-2 border-t border-border mt-2">
      <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
      <Button onClick={onSave} disabled={saving} className="gap-2 min-w-[100px]">
        {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Check className="h-4 w-4" /> Save</>}
      </Button>
    </div>
  );
}
