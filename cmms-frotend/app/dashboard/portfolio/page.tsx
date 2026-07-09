"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useRole } from "@/contexts/role-context";
import {
  getCustomers,
  extractFromCustomers,
  Customer,
  Site,
  Department,
  System,
} from "@/lib/api/customers-api";
import { CompanyOverview } from "@/components/dashboard/company-site-explorer";
import { SiteDashboard } from "@/components/dashboard/site-dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  MapPin,
  FolderTree,
  Cpu,
  ChevronRight,
  Settings,
  Search,
  ArrowLeft,
  LayoutGrid,
} from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function PageSkeleton() {
  return (
    <div className="flex h-[calc(100vh-64px)] bg-background -m-4 lg:-m-6 overflow-hidden animate-pulse">
      {/* Left sidebar skeleton */}
      <div className="w-72 border-r border-border bg-card flex flex-col shrink-0 h-full p-4 space-y-4">
        <Skeleton className="h-6 w-32 rounded" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <div className="space-y-2 mt-4">
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
        <div className="space-y-2 mt-4">
          <Skeleton className="h-3 w-32 rounded" />
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-8 w-[calc(100%-12px)] ml-3 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Right main panel skeleton */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Header Banner Skeleton */}
        <div className="rounded-2xl border border-border bg-card p-6 flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-7 w-[200px]" />
            <Skeleton className="h-4 w-[400px]" />
          </div>
          <Skeleton className="h-9 w-[120px] rounded-lg" />
        </div>

        {/* KPI Stats Row Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-md" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-9 w-12 rounded" />
            </div>
          ))}
        </div>

        {/* Search Input Skeleton */}
        <Skeleton className="h-10 w-full rounded-xl" />

        {/* Companies Grid Skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-14" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <Skeleton className="h-5 w-5 rounded" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-[80%]" />
              </div>
              <div className="border-t border-border/50 pt-3 flex justify-between items-center">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3.5 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Portfolio Explorer Root View ─────────────────────────────────────────────
interface ExplorerRootProps {
  companies: Customer[];
  sites: Site[];
  totalDepts: number;
  totalSystems: number;
}
function ExplorerRoot({ companies, sites, totalDepts, totalSystems }: ExplorerRootProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");

  const selectCompany = (id: string) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set("companyId", id);
    router.push(`${pathname}?${p.toString()}`);
  };

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Portfolio Explorer</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Select a customer in the sidebar or search below to explore sites, departments and systems
          </p>
        </div>
        <Link href="/dashboard/portfolio/setup">
          <Button variant="outline" className="gap-2 border-border hover:bg-accent">
            <Settings className="h-4 w-4" />
            Portfolio Setup
          </Button>
        </Link>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-1 shadow-sm">
          <div className="flex items-center gap-2 text-blue-500"><Building2 className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-wider">Customers</span></div>
          <p className="text-4xl font-bold text-foreground">{companies.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-1 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-500"><MapPin className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-wider">Total Sites</span></div>
          <p className="text-4xl font-bold text-foreground">{sites.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-1 shadow-sm">
          <div className="flex items-center gap-2 text-violet-500"><FolderTree className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-wider">Departments</span></div>
          <p className="text-4xl font-bold text-foreground">{totalDepts}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-1 shadow-sm">
          <div className="flex items-center gap-2 text-amber-500"><Cpu className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-wider">Systems</span></div>
          <p className="text-4xl font-bold text-foreground">{totalSystems}</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search customers to explore…"
          className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm"
        />
      </div>

      {/* Companies Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(c => {
          const compSites = sites.filter(s => s.customerId === c.id);
          return (
            <button
              key={c.id}
              onClick={() => selectCompany(c.id)}
              className="group text-left rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-200 p-5 overflow-hidden shadow-sm"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-md shadow-primary/10">
                    {c.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <Badge variant="secondary" className="font-mono text-[9px] mb-0.5">{c.code}</Badge>
                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {c.name}
                    </h3>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary transition-colors shrink-0 mt-1" />
              </div>
              <p className="text-xs text-muted-foreground mb-4 line-clamp-2 h-8">
                {c.description || "No description provided."}
              </p>
              <div className="flex items-center justify-between border-t border-border/50 pt-3 text-xs text-muted-foreground">
                <span>Total Sites: <strong className="text-foreground">{compSites.length}</strong></span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-primary opacity-0 group-hover:opacity-100 transition-opacity">Explore &rarr;</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Inner Content ────────────────────────────────────────────────────────────
function PortfolioContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const companyId = searchParams.get("companyId");
  const siteId = searchParams.get("siteId");
  const view = searchParams.get("view");
  const { role, userData } = useRole();
  const currentUserId = userData?.id;

  const [companies, setCompanies] = useState<Customer[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [systems, setSystems] = useState<System[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getCustomers()
      .then((customers) => {
        if (!mounted) return;
        const { sites, departments, systems } = extractFromCustomers(customers);
        setCompanies(customers);
        setSites(sites);
        setDepartments(departments);
        setSystems(systems);
      })
      .catch(console.error)
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  if (loading) return <PageSkeleton />;

  // Case 0: Site In-Charge → show their assigned Site Dashboard directly
  if (role === "site_incharge") {
    const assignedSite = sites.find((s) => s.assignedSupervisorId === currentUserId);
    const company = companies.find((c) => c.id === assignedSite?.customerId);
    if (assignedSite && company) {
      return (
        <SiteDashboard
          site={assignedSite}
          customer={company}
          allDepartments={departments}
          allSystems={systems}
          allSites={sites}
          onBack={undefined}
        />
      );
    }
    return (
      <div className="flex h-[calc(100vh-64px)] bg-background -m-4 lg:-m-6 overflow-hidden items-center justify-center p-6">
        <Card className="max-w-md w-full border-border">
          <CardContent className="pt-6 text-center space-y-4">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-bold text-foreground">No Site Assigned</h2>
            <p className="text-sm text-muted-foreground">
              You do not currently have a site assigned to you. Please contact an administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Case 1: Site selected → Site Dashboard renders its own sidebar
  if (companyId && companyId !== "all" && siteId) {
    const company = companies.find(c => c.id === companyId);
    const site = sites.find(s => s.id === siteId);
    if (company && site) {
      return (
        <SiteDashboard
          site={site}
          customer={company}
          allDepartments={departments}
          allSystems={systems}
          allSites={sites}
          onBack={() => {
            const p = new URLSearchParams(searchParams.toString());
            p.delete("siteId");
            router.push(`${pathname}?${p.toString()}`);
          }}
        />
      );
    }
  }

  // Helper variables for root and customer view sidebars
  const selectedCompany = companies.find(c => c.id === companyId);

  // Determine Sidebar Element
  let sidebarElement = null;
  if (role === "supervisor") {
    sidebarElement = (
      <div className="w-72 border-r border-border bg-card flex flex-col shrink-0 h-full">
        <div className="p-4 border-b border-border bg-muted/10 shrink-0">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            Portfolio Explorer
          </h3>
        </div>
        <div className="p-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3 w-full p-2.5 rounded-xl border border-border bg-background shadow-xs">
            <div className="h-10 w-10 rounded-lg overflow-hidden border bg-muted shrink-0 flex items-center justify-center text-primary font-bold">
              SV
            </div>
            <div className="flex-1 min-w-0 pr-1">
              <h4 className="font-bold text-xs text-foreground line-clamp-1">
                Supervisor Space
              </h4>
              <p className="text-[10px] font-semibold text-muted-foreground mt-0.5">
                Overview & Explorer
              </p>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-3 space-y-1">
          <div className="px-5 py-2 text-[10px] font-bold text-muted-foreground/85 tracking-wider uppercase flex items-center gap-1.5 select-none">
            <LayoutGrid className="h-3.5 w-3.5 opacity-70" />
            PORTFOLIO EXPLORER
          </div>
          <button
            onClick={() => {
              const p = new URLSearchParams(searchParams.toString());
              p.set("view", "departments");
              router.push(`${pathname}?${p.toString()}`);
            }}
            className={`w-[calc(100%-24px)] mx-3 px-3 py-2 rounded-xl flex items-center gap-2.5 text-xs font-bold transition-all text-left ${
              view !== "systems"
                ? "bg-primary/10 text-primary font-bold"
                : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
            }`}
          >
            <FolderTree className="h-4 w-4 shrink-0" />
            <span>Departments</span>
          </button>
          <button
            onClick={() => {
              const p = new URLSearchParams(searchParams.toString());
              p.set("view", "systems");
              router.push(`${pathname}?${p.toString()}`);
            }}
            className={`w-[calc(100%-24px)] mx-3 px-3 py-2 rounded-xl flex items-center gap-2.5 text-xs font-bold transition-all text-left ${
              view === "systems"
                ? "bg-primary/10 text-primary font-bold"
                : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
            }`}
          >
            <Cpu className="h-4 w-4 shrink-0" />
            <span>Systems</span>
          </button>
        </div>
      </div>
    );
  } else {
    if (!companyId) {
      // Root portfolio sidebar showing Customers list
      sidebarElement = (
        <div className="w-72 border-r border-border bg-card flex flex-col shrink-0 h-full">
          <div className="p-4 border-b border-border bg-muted/10 shrink-0">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              Portfolio Explorer
            </h3>
          </div>
          <div className="p-4 border-b border-border shrink-0">
            <div className="flex items-center gap-3 w-full p-2.5 rounded-xl border border-border bg-background shadow-xs">
              <div className="h-10 w-10 rounded-lg overflow-hidden border bg-muted shrink-0 flex items-center justify-center text-primary font-bold">
                PE
              </div>
              <div className="flex-1 min-w-0 pr-1">
                <h4 className="font-bold text-xs text-foreground line-clamp-1">
                  All Customers
                </h4>
                <p className="text-[10px] font-semibold text-muted-foreground mt-0.5">
                  Portfolio Overview
                </p>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-3 space-y-1">
            <div className="px-5 py-2 text-[10px] font-bold text-muted-foreground/85 tracking-wider uppercase flex items-center gap-1.5 select-none">
              <LayoutGrid className="h-3.5 w-3.5 opacity-70" />
              CUSTOMERS LIST
            </div>
            {companies.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  const p = new URLSearchParams(searchParams.toString());
                  p.set("companyId", c.id);
                  p.delete("siteId");
                  router.push(`${pathname}?${p.toString()}`);
                }}
                className="w-[calc(100%-24px)] mx-3 px-3 py-2 rounded-xl flex items-center gap-2.5 text-xs font-bold text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-all text-left"
              >
                <Building2 className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                <span className="line-clamp-1">{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      );
    } else {
      // Customer selected view sidebar showing Sites list
      sidebarElement = (
        <div className="w-72 border-r border-border bg-card flex flex-col shrink-0 h-full">
          <div className="p-3 border-b border-border bg-muted/10 shrink-0">
            <button
              onClick={() => {
                const p = new URLSearchParams(searchParams.toString());
                p.delete("companyId");
                p.delete("siteId");
                router.push(`${pathname}?${p.toString()}`);
              }}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-bold px-2.5 py-1.5 rounded-lg hover:bg-muted/40"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Customers
            </button>
          </div>
          <div className="p-4 border-b border-border shrink-0">
            <div className="flex items-center gap-3 w-full p-2.5 rounded-xl border border-border bg-background shadow-xs">
              <div className="h-10 w-10 rounded-lg overflow-hidden border bg-primary text-primary-foreground shrink-0 flex items-center justify-center font-bold text-sm">
                {selectedCompany?.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 pr-1">
                <h4 className="font-bold text-xs text-foreground line-clamp-1">
                  {selectedCompany?.name}
                </h4>
                <p className="text-[10px] font-semibold text-muted-foreground mt-0.5 font-mono">
                  Code: {selectedCompany?.code}
                </p>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-3 space-y-1">
            <div className="px-5 py-2 text-[10px] font-bold text-muted-foreground/85 tracking-wider uppercase flex items-center gap-1.5 select-none">
              <LayoutGrid className="h-3.5 w-3.5 opacity-70" />
              CUSTOMER EXPLORER
            </div>
            <button className="w-[calc(100%-24px)] mx-3 px-3 py-2 rounded-xl flex items-center gap-2.5 text-xs font-bold bg-primary/10 text-primary transition-all text-left">
              <Building2 className="h-4 w-4 shrink-0 text-primary" />
              <span>Overview</span>
            </button>
            <div className="mt-2 space-y-1">
              <div className="px-5 py-1 text-[9px] font-extrabold text-muted-foreground/60 tracking-wider uppercase select-none">
                REGISTERED SITES
              </div>
              {sites
                .filter((s) => s.customerId === companyId)
                .map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      const p = new URLSearchParams(searchParams.toString());
                      p.set("companyId", companyId);
                      p.set("siteId", s.id);
                      router.push(`${pathname}?${p.toString()}`);
                    }}
                    className="w-[calc(100%-36px)] ml-6 mr-3 px-3 py-1.5 rounded-lg flex items-center text-xs text-muted-foreground hover:bg-muted/40 hover:text-foreground font-medium transition-all text-left"
                  >
                    <ChevronRight className="h-3 w-3 shrink-0 mr-1.5 opacity-60" />
                    <span className="line-clamp-1">{s.name}</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      );
    }
  }

  // Determine Main Content Element
  let mainContentElement = null;
  if (role === "supervisor") {
    const myDepts = departments.filter((d) => d.assignedSupervisorId === currentUserId);
    const mySystems = systems.filter((sys) => myDepts.some((d) => d.id === sys.departmentId));

    if (view === "systems") {
      mainContentElement = (
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Systems</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                View and monitor systems within your assigned departments
              </p>
            </div>
            <Link href="/dashboard/portfolio/setup">
              <Button variant="outline" className="gap-2 border-border hover:bg-accent">
                <Settings className="h-4 w-4" />
                Portfolio Setup
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-1 shadow-sm">
              <div className="flex items-center gap-2 text-amber-500">
                <Cpu className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Total Systems</span>
              </div>
              <p className="text-4xl font-bold text-foreground">{mySystems.length}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-1 shadow-sm">
              <div className="flex items-center gap-2 text-violet-500">
                <FolderTree className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Parent Departments</span>
              </div>
              <p className="text-4xl font-bold text-foreground">{myDepts.length}</p>
            </div>
          </div>

          <Card className="border-border">
            <CardContent className="p-0">
              {mySystems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                  <Cpu className="h-10 w-10 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground font-semibold">No systems registered in your departments.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  <div className="grid grid-cols-12 px-5 py-3 bg-secondary/10 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                    <div className="col-span-5">System Name</div>
                    <div className="col-span-2 text-center">Code</div>
                    <div className="col-span-3 text-center">Department</div>
                    <div className="col-span-2 text-right">Status</div>
                  </div>
                  {mySystems.map((sys) => {
                    const dept = myDepts.find((d) => d.id === sys.departmentId);
                    return (
                      <div
                        key={sys.id}
                        className="grid grid-cols-12 px-5 py-3.5 items-center hover:bg-secondary/20 transition-colors text-xs font-semibold"
                      >
                        <div className="col-span-5">
                          <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Cpu className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <span className="font-bold text-foreground">{sys.name}</span>
                          </div>
                        </div>
                        <div className="col-span-2 text-center text-muted-foreground font-mono">{sys.code}</div>
                        <div className="col-span-3 text-center text-muted-foreground">
                          {dept ? dept.name : "—"}
                        </div>
                        <div className="col-span-2 text-right">
                          <Badge className={`text-[10px] font-bold py-0.5 px-2 ${sys.status ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground"}`}>
                            {sys.status ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    } else {
      // Default view: "departments"
      mainContentElement = (
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Departments</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                View and monitor your assigned departments
              </p>
            </div>
            <Link href="/dashboard/portfolio/setup">
              <Button variant="outline" className="gap-2 border-border hover:bg-accent">
                <Settings className="h-4 w-4" />
                Portfolio Setup
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-1 shadow-sm">
              <div className="flex items-center gap-2 text-violet-500">
                <FolderTree className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Assigned Departments</span>
              </div>
              <p className="text-4xl font-bold text-foreground">{myDepts.length}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-1 shadow-sm">
              <div className="flex items-center gap-2 text-amber-500">
                <Cpu className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Total Systems</span>
              </div>
              <p className="text-4xl font-bold text-foreground">{mySystems.length}</p>
            </div>
          </div>

          <Card className="border-border">
            <CardContent className="p-0">
              {myDepts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                  <FolderTree className="h-10 w-10 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground font-semibold">No departments assigned to you.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  <div className="grid grid-cols-12 px-5 py-3 bg-secondary/10 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                    <div className="col-span-5">Department Name</div>
                    <div className="col-span-2 text-center">Code</div>
                    <div className="col-span-2 text-center">Systems</div>
                    <div className="col-span-3 text-right">Status</div>
                  </div>
                  {myDepts.map((dept) => {
                    const deptSystems = mySystems.filter((s) => s.departmentId === dept.id);
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
            </CardContent>
          </Card>
        </div>
      );
    }
  } else if (companyId && companyId !== "all") {
    const company = companies.find(c => c.id === companyId);
    if (company) {
      mainContentElement = (
        <CompanyOverview
          company={company}
          companyId={companyId}
          sites={sites}
          departments={departments}
          systems={systems}
        />
      );
    }
  } else {
    // Total counts for stats
    const totalDeptsCount = departments.length;
    const totalSystemsCount = systems.length;
    mainContentElement = (
      <ExplorerRoot
        companies={companies}
        sites={sites}
        totalDepts={totalDeptsCount}
        totalSystems={totalSystemsCount}
      />
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-background -m-4 lg:-m-6 overflow-hidden">
      {/* Sidebar Panel */}
      {sidebarElement}

      {/* Main Panel Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {mainContentElement}
      </div>
    </div>
  );
}

// ─── Page Export ──────────────────────────────────────────────────────────────
export default function PortfolioPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PortfolioContent />
    </Suspense>
  );
}
