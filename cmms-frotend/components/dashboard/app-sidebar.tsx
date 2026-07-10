"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { getNavByRole, getNavItemCategory, getCategoryFromPath } from "@/lib/constants";
import { useRole, roleConfig } from "@/contexts/role-context";
import {
  LayoutDashboard, Server, ClipboardList, Calendar, Package, ShoppingCart,
  Building2, BarChart3, Settings, Wrench, ChevronLeft, ChevronRight,
  Users, Shield, FileText, CalendarClock, CheckSquare, History,
  Archive, FileInput, CheckCircle, MapPin, FolderTree, Cpu, ChevronDown,
  ArrowLeft, Layers, MessageSquare, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
  getCustomers, getSites, getDepartments,
  Customer, Site, Department, getCustomerImageUrl,
} from "@/lib/api/customers-api";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, Server, ClipboardList, Calendar, Package, ShoppingCart,
  Building2, BarChart3, Settings, Users, Shield, FileText, CalendarClock,
  CheckSquare, History, Wrench, Archive, FileInput, CheckCircle, MessageSquare,
  Layers, AlertTriangle,
};

interface AppSidebarProps { className?: string; }

export function AppSidebar({ className }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [collapsed, setCollapsed] = useState(false);
  const { role, userName } = useRole();
  const config = roleConfig[role];

  // URL state
  const companyId = searchParams.get("companyId");
  const siteId = searchParams.get("siteId");

  // Explorer data
  const [companies, setCompanies] = useState<Customer[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);

  // Expanded state for sites tree
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);
  const [expandedSite, setExpandedSite] = useState<string | null>(null);

  const navItems = getNavByRole(role);
  const activeCategory = getCategoryFromPath(pathname);
  const filteredNavItems = navItems.filter(i => getNavItemCategory(i) === activeCategory);

  const isPortfolioExplorer = pathname.startsWith("/dashboard/portfolio") && pathname !== "/dashboard/portfolio/setup";

  useEffect(() => {
    if (!isPortfolioExplorer) return;
    let mounted = true;
    setLoading(true);
    Promise.all([getCustomers(), getSites(), getDepartments()])
      .then(([c, s, d]) => {
        if (!mounted) return;
        setCompanies(c);
        setSites(s);
        setDepartments(d);
      })
      .catch(console.error)
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [isPortfolioExplorer]);

  // Sync expanded company/site with URL params
  useEffect(() => {
    if (companyId && companyId !== "all") setExpandedCompany(companyId);
    if (siteId) setExpandedSite(siteId);
  }, [companyId, siteId]);

  const push = (params: Record<string, string | null>) => {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([k, v]) => {
      if (v === null || v === "all") p.delete(k); else p.set(k, v);
    });
    router.push(`${pathname}?${p.toString()}`);
  };

  // ── Explorer sidebar for /dashboard ──────────────────────────────────
  const renderExplorer = () => {
    if (loading) {
      return (
        <div className="space-y-2 px-2 py-4">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-8 bg-sidebar-accent/40 animate-pulse rounded-lg" />
          ))}
        </div>
      );
    }

    if (!companyId || companyId === "all") {
      return null;
    }

    const selectedCompany = companies.find(c => c.id === companyId);
    if (!selectedCompany) return null;

    const companySites = sites.filter(s => s.customerId === selectedCompany.id);

    return (
      <div className="flex flex-col min-h-0 flex-1">
        {/* Back to List Link */}
        <div className="px-3 pt-3 pb-2 shrink-0">
          <button
            onClick={() => push({ companyId: null, siteId: null })}
            className="flex items-center gap-1.5 text-xs font-semibold text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {!collapsed && <span>Back to System Overview</span>}
          </button>
        </div>

        {/* Selected Company Header Card (Facilio-style dropdown) */}
        <div 
          onClick={() => push({ companyId: null, siteId: null })}
          className="mx-2 my-2 p-2.5 rounded-xl border border-sidebar-border bg-card shadow-sm shrink-0 flex items-center justify-between hover:bg-sidebar-accent/50 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 shrink-0 rounded-lg overflow-hidden border border-sidebar-border bg-muted flex items-center justify-center font-bold text-xs text-foreground">
              {selectedCompany.imageUrl ? (
                <img
                  src={`${getCustomerImageUrl(selectedCompany.id)}?t=${encodeURIComponent(selectedCompany.imageUrl)}`}
                  alt={selectedCompany.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as any).style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.innerText = selectedCompany.name.slice(0, 2).toUpperCase();
                    fallback.className = "flex h-full w-full items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold";
                    e.currentTarget.parentElement?.appendChild(fallback);
                  }}
                />
              ) : (
                selectedCompany.name.slice(0, 2).toUpperCase()
              )}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-sidebar-foreground truncate">{selectedCompany.name}</p>
                <p className="text-[9px] font-mono text-sidebar-foreground/50 mt-0.5">{selectedCompany.code}</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <ChevronDown className="h-4 w-4 text-sidebar-foreground/45 shrink-0" />
          )}
        </div>

        {/* Divider + label */}
        {!collapsed && (
          <div className="px-5 pb-1 pt-2 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/45">
              SITES & DEPARTMENTS
            </span>
          </div>
        )}

        {/* Sites → Departments tree */}
        <div className="px-2 space-y-0.5 overflow-y-auto flex-1 pb-4">
          {companySites.length === 0 ? (
            <p className="px-3 py-2 text-xs text-sidebar-foreground/40">No sites registered</p>
          ) : (
            companySites.map(site => {
              const siteDepts = departments.filter(d => d.siteId === site.id);
              const isSiteOpen   = expandedSite === site.id;
              const isSiteActive = siteId === site.id;

              return (
                <div key={site.id}>
                  {/* Site row */}
                  <div
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors cursor-pointer",
                      isSiteActive
                        ? "bg-sidebar-primary/15 text-sidebar-primary font-semibold"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                    onClick={() => {
                      const opening = !isSiteOpen;
                      setExpandedSite(opening ? site.id : null);
                      push({ companyId: selectedCompany.id, siteId: site.id });
                    }}
                  >
                    <MapPin className={cn(
                      "h-3.5 w-3.5 shrink-0",
                      isSiteActive ? "text-sidebar-primary" : "text-sidebar-foreground/40"
                    )} />
                    {!collapsed && <span className="flex-1 truncate">{site.name}</span>}
                    {!collapsed && siteDepts.length > 0 && (
                      <ChevronDown className={cn(
                        "h-3 w-3 text-sidebar-foreground/30 transition-transform shrink-0",
                        isSiteOpen && "rotate-180"
                      )} />
                    )}
                  </div>

                  {/* Departments under site */}
                  {isSiteOpen && !collapsed && (
                    <div className="ml-4 border-l border-sidebar-border/40 pl-2 space-y-0.5 mt-0.5">
                      {siteDepts.length === 0 ? (
                        <p className="px-2 py-1 text-xs text-sidebar-foreground/30">No departments</p>
                      ) : (
                        siteDepts.map(dept => (
                          <div
                            key={dept.id}
                            className="flex items-center gap-2 px-2 py-1 rounded text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors cursor-default"
                          >
                            <FolderTree className="h-3 w-3 shrink-0 text-blue-400" />
                            <span className="truncate">{dept.name}</span>
                          </div>
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
    );
  };

  return (
    <aside
      className={cn(
        "sticky top-20 z-20 flex h-[calc(100vh-80px)] flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
        collapsed ? "w-[60px]" : "w-[260px]",
        className
      )}
    >
      {/* Header */}
      <div className={cn(
        "flex h-12 items-center px-4 border-b border-sidebar-border shrink-0",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && (
          <span className="text-xs font-bold uppercase tracking-wider text-sidebar-foreground/60">
            {isPortfolioExplorer ? "Portfolio" : activeCategory}
          </span>
        )}
        <Button
          variant="ghost" size="icon"
          onClick={() => setCollapsed(c => !c)}
          className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Role badge — hide when explorer mode */}
      {!collapsed && !(isPortfolioExplorer && companyId && companyId !== "all") && (
        <div className="border-b border-sidebar-border px-4 py-3 shrink-0">
          <div className="rounded-lg bg-sidebar-accent/50 px-3 py-2">
            <p className="text-xs font-medium text-sidebar-foreground/60">Current Role</p>
            <p className="text-sm font-semibold text-sidebar-primary">{config.label}</p>
          </div>
        </div>
      )}

      {/* Nav Content */}
      {isPortfolioExplorer ? (
        <div className="flex-1 flex flex-col min-h-0">
          <nav className="space-y-1 px-3 py-4 shrink-0">
            {filteredNavItems.map(item => {
              const Icon = iconMap[item.icon];
              const itemUrl = item.href.includes("?") ? new URL(item.href, "http://localhost") : null;
              const isActive = itemUrl 
                ? pathname === itemUrl.pathname && (searchParams.get("view") || "dashboard") === (itemUrl.searchParams.get("view") || "dashboard")
                : pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  {Icon && <Icon className="h-5 w-5 shrink-0" />}
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
      ) : (
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {filteredNavItems.map(item => {
            const Icon = iconMap[item.icon];
            const itemUrl = item.href.includes("?") ? new URL(item.href, "http://localhost") : null;
            const isActive = itemUrl 
              ? pathname === itemUrl.pathname && (searchParams.get("view") || "dashboard") === (itemUrl.searchParams.get("view") || "dashboard")
              : pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                {Icon && <Icon className="h-5 w-5 shrink-0" />}
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      )}

      {/* User Footer */}
      <div className="border-t border-sidebar-border p-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sidebar-accent">
            <span className="text-sm font-medium text-sidebar-accent-foreground">{config.initials}</span>
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-sidebar-foreground">{userName}</p>
              <p className="truncate text-xs text-sidebar-foreground/60">{config.label}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
