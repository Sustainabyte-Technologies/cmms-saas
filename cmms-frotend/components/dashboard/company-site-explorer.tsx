"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Customer,
  Site,
  Department,
  System,
  getCustomerImageUrl,
  getSiteImageUrl,
} from "@/lib/api/customers-api";
import { fetchWorkOrders, WorkOrderResponse, fetchChecklistTemplates, ChecklistTemplate } from "@/lib/api/work-orders-api";
import { fetchAssets, Asset } from "@/lib/api/assets-api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/ui-components";
import {
  Building2,
  MapPin,
  FolderTree,
  Cpu,
  ChevronRight,
  Package,
  ClipboardList,
  CheckSquare,
  User,
  Mail,
  Phone,
  Plus,
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

interface CompanyOverviewProps {
  company: Customer;
  companyId: string;
  sites: Site[];
  departments: Department[];
  systems: System[];
}

export function CompanyOverview({
  company,
  companyId,
  sites,
  departments,
  systems,
}: CompanyOverviewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [workOrders, setWorkOrders] = useState<WorkOrderResponse[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [checklists, setChecklists] = useState<ChecklistTemplate[]>([]);
  const [loadingExtra, setLoadingExtra] = useState(true);
  const [activeTab, setActiveTab] = useState<"sites" | "workorders" | "assets" | "checklists">("sites");

  useEffect(() => {
    let mounted = true;
    setLoadingExtra(true);

    Promise.all([
      fetchWorkOrders({ limit: 1000 }).then((r) => r.workOrders).catch(() => [] as WorkOrderResponse[]),
      fetchAssets(1, 1000).then((r) => r.data).catch(() => [] as Asset[]),
      fetchChecklistTemplates().catch(() => [] as ChecklistTemplate[]),
    ]).then(([wos, assetList, clList]) => {
      if (!mounted) return;

      // Filter: assets where customerId matches
      const custAssets = assetList.filter((a) => a.customerId === companyId);

      // Filter: work orders linked to assets belonging to this customer
      const custAssetIds = new Set(custAssets.map((a) => a.id));
      const custWOs = wos.filter((wo) => wo.assetId && custAssetIds.has(wo.assetId));

      setAssets(custAssets);
      setWorkOrders(custWOs);
      setChecklists(clList);
    }).finally(() => {
      if (mounted) setLoadingExtra(false);
    });

    return () => { mounted = false; };
  }, [companyId]);

  const goToSite = (siteId: string) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set("companyId", companyId);
    p.set("siteId", siteId);
    router.push(`${pathname}?${p.toString()}`);
  };

  // Filter to this customer's hierarchy
  const companySites = sites.filter((s) => s.customerId === companyId);
  const companySiteIds = new Set(companySites.map((s) => s.id));
  const companyDepts = departments.filter((d) => companySiteIds.has(d.siteId));
  const companyDeptIds = new Set(companyDepts.map((d) => d.id));
  const companySystems = systems.filter((sys) => companyDeptIds.has(sys.departmentId));

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

  const tabs = [
    { key: "sites" as const, label: `Sites (${companySites.length})`, icon: MapPin },
    { key: "workorders" as const, label: `Work Orders (${workOrders.length})`, icon: ClipboardList },
    { key: "assets" as const, label: `Assets (${assets.length})`, icon: Package },
    { key: "checklists" as const, label: `Checklists (${checklists.length})`, icon: CheckSquare },
  ];

  return (
    <div className="space-y-6">
      {/* ── Customer Header Banner ── */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
          <div className="flex items-start gap-5">
            <SafeImage
              src={company.imageUrl ? `${getCustomerImageUrl(company.id)}?t=${encodeURIComponent(company.imageUrl)}` : null}
              alt={company.name}
              className="h-16 w-16 shrink-0 rounded-2xl object-cover border border-border shadow-md"
              fallback={
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-2xl shadow-lg shadow-primary/20">
                  {company.name.slice(0, 2).toUpperCase()}
                </div>
              }
            />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-foreground">{company.name}</h1>
                <Badge className={company.status ? "bg-success/10 text-success border-success/20 text-xs font-semibold" : "bg-muted text-muted-foreground text-xs"}>
                  {company.status ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-sm font-mono text-primary">{company.code}</p>
              {company.description && (
                <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{company.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Contact strip */}
        {(company.contactPerson || company.email || company.phone) && (
          <div className="border-t border-border/50 px-6 py-3 bg-secondary/20 flex flex-wrap gap-6 text-sm text-muted-foreground">
            {company.contactPerson && (
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-primary/60" />
                {company.contactPerson}
              </span>
            )}
            {company.email && (
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-primary/60" />
                {company.email}
              </span>
            )}
            {company.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-primary/60" />
                {company.phone}
              </span>
            )}
            {(company.city || company.state || company.country) && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                {[company.city, company.state, company.country].filter(Boolean).join(", ")}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── KPI Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-1 shadow-sm">
          <div className="flex items-center gap-2 text-blue-500">
            <Building2 className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Sites</span>
          </div>
          <p className="text-4xl font-bold text-foreground">{companySites.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-1 shadow-sm">
          <div className="flex items-center gap-2 text-violet-500">
            <FolderTree className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Departments</span>
          </div>
          <p className="text-4xl font-bold text-foreground">{companyDepts.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-1 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-500">
            <Cpu className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Systems</span>
          </div>
          <p className="text-4xl font-bold text-foreground">{companySystems.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-1 shadow-sm">
          <div className="flex items-center gap-2 text-amber-500">
            <Package className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Assets</span>
          </div>
          <p className="text-4xl font-bold text-foreground">{loadingExtra ? "—" : assets.length}</p>
        </div>
      </div>

      {/* ── Tabs: Sites / Work Orders / Assets / Checklists ── */}
      <Card className="border-border">
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
          {/* ─── Sites Tab ─── */}
          {activeTab === "sites" && (
            <div>
              {companySites.length === 0 ? (
                <EmptyTab icon={<Building2 className="h-10 w-10" />} message={`No sites registered for ${company.name}`} />
              ) : (
                <div className="divide-y divide-border/60">
                  <div className="grid grid-cols-12 px-5 py-3 bg-secondary/10 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                    <div className="col-span-5">Site Name</div>
                    <div className="col-span-2 text-center">Code</div>
                    <div className="col-span-2 text-center">Departments</div>
                    <div className="col-span-2 text-center">Systems</div>
                    <div className="col-span-1 text-right">Go</div>
                  </div>
                  {companySites.map((site) => {
                    const siteDepts = departments.filter((d) => d.siteId === site.id);
                    const siteDeptIds = new Set(siteDepts.map((d) => d.id));
                    const siteSystems = systems.filter((s) => siteDeptIds.has(s.departmentId));
                    return (
                      <button
                        key={site.id}
                        onClick={() => goToSite(site.id)}
                        className="w-full grid grid-cols-12 px-5 py-3.5 items-center hover:bg-secondary/20 transition-colors text-xs font-semibold text-left group"
                      >
                        <div className="col-span-5">
                          <div className="flex items-center gap-2.5">
                            <SafeImage
                              src={site.imageUrl ? `${getSiteImageUrl(site.id)}?t=${encodeURIComponent(site.imageUrl)}` : null}
                              alt={site.name}
                              className="h-8 w-8 rounded-lg object-cover border border-border shrink-0"
                              fallback={
                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                  <Building2 className="h-4 w-4 text-primary" />
                                </div>
                              }
                            />
                            <div>
                              <p className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{site.name}</p>
                              {(site.city || site.state) && (
                                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                  <MapPin className="h-2.5 w-2.5 text-emerald-500" />
                                  {[site.city, site.state, site.country].filter(Boolean).join(", ")}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="col-span-2 text-center font-mono text-muted-foreground">{site.code}</div>
                        <div className="col-span-2 text-center">
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <FolderTree className="h-3 w-3 text-violet-400" />
                            {siteDepts.length}
                          </span>
                        </div>
                        <div className="col-span-2 text-center">
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Cpu className="h-3 w-3 text-sky-400" />
                            {siteSystems.length}
                          </span>
                        </div>
                        <div className="col-span-1 text-right">
                          <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors ml-auto" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ─── Work Orders Tab ─── */}
          {activeTab === "workorders" && (
            <div>
              {loadingExtra ? (
                <LoadingRows />
              ) : workOrders.length === 0 ? (
                <EmptyTab icon={<ClipboardList className="h-10 w-10" />} message="No work orders linked to this customer's assets." />
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
                  {workOrders.map((wo) => (
                    <div key={wo.id} className="grid grid-cols-12 px-5 py-3.5 items-center hover:bg-secondary/20 transition-colors text-xs font-semibold">
                      <div className="col-span-2 font-mono font-bold text-primary">{wo.workOrderNumber}</div>
                      <div className="col-span-3">
                        <p className="font-bold text-foreground line-clamp-1">{wo.title}</p>
                        {wo.asset?.assetName && (
                          <p className="text-[10px] text-muted-foreground">{wo.asset.assetName}</p>
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
              {loadingExtra ? (
                <LoadingRows />
              ) : assets.length === 0 ? (
                <EmptyTab icon={<Package className="h-10 w-10" />} message="No assets assigned to this customer." />
              ) : (
                <div className="divide-y divide-border/60">
                  <div className="grid grid-cols-12 px-5 py-3 bg-secondary/10 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                    <div className="col-span-1">#</div>
                    <div className="col-span-3">Asset Name</div>
                    <div className="col-span-2">Code</div>
                    <div className="col-span-2">Category</div>
                    <div className="col-span-2">Site</div>
                    <div className="col-span-2 text-right">Status</div>
                  </div>
                  {assets.map((asset, idx) => (
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
                      <div className="col-span-2 text-muted-foreground line-clamp-1">
                        {asset.site?.name || asset.location || "—"}
                      </div>
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
              {loadingExtra ? (
                <LoadingRows />
              ) : checklists.length === 0 ? (
                <EmptyTab icon={<CheckSquare className="h-10 w-10" />} message="No checklist templates found." />
              ) : (
                <div className="divide-y divide-border/60">
                  <div className="grid grid-cols-12 px-5 py-3 bg-secondary/10 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                    <div className="col-span-1">#</div>
                    <div className="col-span-4">Checklist Name</div>
                    <div className="col-span-5">Description</div>
                    <div className="col-span-2 text-right">Created</div>
                  </div>
                  {checklists.map((cl, idx) => (
                    <div key={cl.id} className="grid grid-cols-12 px-5 py-3.5 items-center hover:bg-secondary/20 transition-colors text-xs font-semibold">
                      <div className="col-span-1 text-muted-foreground font-mono">{idx + 1}</div>
                      <div className="col-span-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                            <CheckSquare className="h-3.5 w-3.5 text-emerald-500" />
                          </div>
                          <span className="font-bold text-foreground line-clamp-1">{cl.name}</span>
                        </div>
                      </div>
                      <div className="col-span-5 text-muted-foreground line-clamp-1">{cl.description || "—"}</div>
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

      {/* ── Manager Info ── */}
      {company.assignedManager && (
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">{company.assignedManager.fullName}</p>
            <p className="text-[10px] text-muted-foreground">{company.assignedManager.email}</p>
          </div>
          <Badge variant="secondary" className="ml-auto text-[10px] font-bold">
            {company.assignedManager.role.name.replace(/_/g, " ")}
          </Badge>
        </div>
      )}
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

function LoadingRows() {
  return (
    <div className="divide-y divide-border/60">
      {[1, 2, 3].map((i) => (
        <div key={i} className="px-5 py-4 flex gap-4 animate-pulse">
          <div className="h-4 bg-muted rounded w-16" />
          <div className="h-4 bg-muted rounded flex-1" />
          <div className="h-4 bg-muted rounded w-20" />
          <div className="h-4 bg-muted rounded w-16" />
        </div>
      ))}
    </div>
  );
}
