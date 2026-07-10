"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Shield,
  Users,
  Building2,
  MapPin,
  Layers,
  Wrench,
  ClipboardList,
  Calendar,
  TrendingUp,
  Activity,
  CheckCircle,
  XCircle,
  Search,
  Download,
  ChevronRight,
  ChevronDown,
  Crown,
  UserCheck,
  Briefcase,
  HardHat,
  Star,
  BarChart3,
  AlertTriangle,
  Settings,
  Eye,
  UserPlus,
  FileText,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
} from "recharts";
import {
  fetchRoleDashboard,
  type RoleDashboardData,
  type RoleUserItem,
} from "@/lib/api/roles-api";

// ─── Constants ─────────────────────────────────────────────────────────────────
const ROLE_COLORS: Record<string, string> = {
  ADMIN: "#8b5cf6",
  CUSTOMER_MANAGER: "#3b82f6",
  SITE_INCHARGE: "#22c55e",
  SUPERVISOR: "#f59e0b",
  TECHNICIAN: "#ef4444",
};

const ROLE_ICONS: Record<string, React.ReactNode> = {
  ADMIN: <Crown className="h-4 w-4" />,
  CUSTOMER_MANAGER: <Briefcase className="h-4 w-4" />,
  SITE_INCHARGE: <MapPin className="h-4 w-4" />,
  SUPERVISOR: <UserCheck className="h-4 w-4" />,
  TECHNICIAN: <HardHat className="h-4 w-4" />,
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  CUSTOMER_MANAGER: "Customer Manager",
  SITE_INCHARGE: "Site In-Charge",
  SUPERVISOR: "Supervisor",
  TECHNICIAN: "Technician",
};

// ─── Permission Matrix ─────────────────────────────────────────────────────────
const MODULES = [
  "Dashboard", "Users", "Customers", "Sites", "Departments",
  "Systems", "Assets", "Checklist", "Work Orders", "Preventive Maint.",
  "Inventory", "Reports", "Settings",
];

type Permission = "create" | "read" | "update" | "delete" | "assign" | "approve" | "export";

const PERMISSIONS: Record<string, Record<string, Record<Permission, boolean>>> = {
  ADMIN: {
    Dashboard: { create: true, read: true, update: true, delete: true, assign: true, approve: true, export: true },
    Users: { create: true, read: true, update: true, delete: true, assign: true, approve: true, export: true },
    Customers: { create: true, read: true, update: true, delete: true, assign: true, approve: true, export: true },
    Sites: { create: true, read: true, update: true, delete: true, assign: true, approve: true, export: true },
    Departments: { create: true, read: true, update: true, delete: true, assign: true, approve: true, export: true },
    Systems: { create: true, read: true, update: true, delete: true, assign: true, approve: true, export: true },
    Assets: { create: true, read: true, update: true, delete: true, assign: true, approve: true, export: true },
    Checklist: { create: true, read: true, update: true, delete: true, assign: true, approve: true, export: true },
    "Work Orders": { create: true, read: true, update: true, delete: true, assign: true, approve: true, export: true },
    "Preventive Maint.": { create: true, read: true, update: true, delete: true, assign: true, approve: true, export: true },
    Inventory: { create: true, read: true, update: true, delete: true, assign: true, approve: true, export: true },
    Reports: { create: true, read: true, update: true, delete: true, assign: true, approve: true, export: true },
    Settings: { create: true, read: true, update: true, delete: true, assign: true, approve: true, export: true },
  },
  CUSTOMER_MANAGER: {
    Dashboard: { create: false, read: true, update: false, delete: false, assign: false, approve: false, export: true },
    Users: { create: true, read: true, update: true, delete: false, assign: true, approve: false, export: false },
    Customers: { create: false, read: true, update: true, delete: false, assign: true, approve: false, export: true },
    Sites: { create: true, read: true, update: true, delete: false, assign: true, approve: false, export: true },
    Departments: { create: true, read: true, update: true, delete: false, assign: true, approve: false, export: false },
    Systems: { create: true, read: true, update: true, delete: false, assign: false, approve: false, export: false },
    Assets: { create: true, read: true, update: true, delete: false, assign: true, approve: false, export: true },
    Checklist: { create: true, read: true, update: true, delete: false, assign: true, approve: false, export: false },
    "Work Orders": { create: true, read: true, update: true, delete: false, assign: true, approve: true, export: true },
    "Preventive Maint.": { create: true, read: true, update: true, delete: false, assign: true, approve: false, export: true },
    Inventory: { create: false, read: true, update: false, delete: false, assign: false, approve: false, export: false },
    Reports: { create: false, read: true, update: false, delete: false, assign: false, approve: false, export: true },
    Settings: { create: false, read: false, update: false, delete: false, assign: false, approve: false, export: false },
  },
  SITE_INCHARGE: {
    Dashboard: { create: false, read: true, update: false, delete: false, assign: false, approve: false, export: false },
    Users: { create: true, read: true, update: false, delete: false, assign: true, approve: false, export: false },
    Customers: { create: false, read: true, update: false, delete: false, assign: false, approve: false, export: false },
    Sites: { create: false, read: true, update: true, delete: false, assign: false, approve: false, export: false },
    Departments: { create: true, read: true, update: true, delete: false, assign: true, approve: false, export: false },
    Systems: { create: true, read: true, update: true, delete: false, assign: false, approve: false, export: false },
    Assets: { create: true, read: true, update: true, delete: false, assign: false, approve: false, export: true },
    Checklist: { create: true, read: true, update: true, delete: false, assign: true, approve: false, export: false },
    "Work Orders": { create: true, read: true, update: true, delete: false, assign: true, approve: true, export: true },
    "Preventive Maint.": { create: true, read: true, update: true, delete: false, assign: true, approve: false, export: false },
    Inventory: { create: false, read: true, update: false, delete: false, assign: false, approve: false, export: false },
    Reports: { create: false, read: true, update: false, delete: false, assign: false, approve: false, export: false },
    Settings: { create: false, read: false, update: false, delete: false, assign: false, approve: false, export: false },
  },
  SUPERVISOR: {
    Dashboard: { create: false, read: true, update: false, delete: false, assign: false, approve: false, export: false },
    Users: { create: false, read: true, update: false, delete: false, assign: false, approve: false, export: false },
    Customers: { create: false, read: true, update: false, delete: false, assign: false, approve: false, export: false },
    Sites: { create: false, read: true, update: false, delete: false, assign: false, approve: false, export: false },
    Departments: { create: false, read: true, update: false, delete: false, assign: false, approve: false, export: false },
    Systems: { create: false, read: true, update: false, delete: false, assign: false, approve: false, export: false },
    Assets: { create: false, read: true, update: true, delete: false, assign: false, approve: false, export: false },
    Checklist: { create: false, read: true, update: true, delete: false, assign: false, approve: false, export: false },
    "Work Orders": { create: true, read: true, update: true, delete: false, assign: true, approve: false, export: true },
    "Preventive Maint.": { create: false, read: true, update: false, delete: false, assign: false, approve: false, export: false },
    Inventory: { create: false, read: true, update: false, delete: false, assign: false, approve: false, export: false },
    Reports: { create: false, read: true, update: false, delete: false, assign: false, approve: false, export: false },
    Settings: { create: false, read: false, update: false, delete: false, assign: false, approve: false, export: false },
  },
  TECHNICIAN: {
    Dashboard: { create: false, read: true, update: false, delete: false, assign: false, approve: false, export: false },
    Users: { create: false, read: false, update: false, delete: false, assign: false, approve: false, export: false },
    Customers: { create: false, read: false, update: false, delete: false, assign: false, approve: false, export: false },
    Sites: { create: false, read: true, update: false, delete: false, assign: false, approve: false, export: false },
    Departments: { create: false, read: true, update: false, delete: false, assign: false, approve: false, export: false },
    Systems: { create: false, read: true, update: false, delete: false, assign: false, approve: false, export: false },
    Assets: { create: false, read: true, update: true, delete: false, assign: false, approve: false, export: false },
    Checklist: { create: false, read: true, update: true, delete: false, assign: false, approve: false, export: false },
    "Work Orders": { create: false, read: true, update: true, delete: false, assign: false, approve: false, export: false },
    "Preventive Maint.": { create: false, read: true, update: false, delete: false, assign: false, approve: false, export: false },
    Inventory: { create: false, read: true, update: false, delete: false, assign: false, approve: false, export: false },
    Reports: { create: false, read: false, update: false, delete: false, assign: false, approve: false, export: false },
    Settings: { create: false, read: false, update: false, delete: false, assign: false, approve: false, export: false },
  },
};

const PERM_COLS: Permission[] = ["create", "read", "update", "delete", "assign", "approve", "export"];

// ─── Helper components ────────────────────────────────────────────────────────
function Tick({ v }: { v: boolean }) {
  return v
    ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500 mx-auto" />
    : <XCircle className="h-3.5 w-3.5 text-red-400/60 mx-auto" />;
}

function RoleBadge({ role }: { role: string }) {
  const color = ROLE_COLORS[role] ?? "#6b7280";
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
      style={{ color, borderColor: color + "40", background: color + "15" }}
    >
      {ROLE_LABELS[role] ?? role}
    </span>
  );
}

function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (d < 60) return `${d}m ago`;
  const h = Math.floor(d / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ num, title, desc }: { num: number; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-black text-sm shrink-0">
        {num}
      </div>
      <div>
        <h2 className="text-base font-bold text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

// ─── Role Card ────────────────────────────────────────────────────────────────
function RoleCard({ role, stats, kpis }: { role: string; stats: any; kpis: any }) {
  const color = ROLE_COLORS[role] ?? "#6b7280";
  const icon = ROLE_ICONS[role];
  const label = ROLE_LABELS[role];

  const metaByRole: Record<string, Array<{ label: string; value: any; icon: React.ReactNode }>> = {
    ADMIN: [
      { label: "Users Managed", value: stats.userCount, icon: <Users className="h-3.5 w-3.5" /> },
      { label: "Customers", value: kpis.totalCustomers, icon: <Building2 className="h-3.5 w-3.5" /> },
      { label: "Sites", value: kpis.totalSites, icon: <MapPin className="h-3.5 w-3.5" /> },
      { label: "Assets", value: kpis.totalAssets, icon: <Wrench className="h-3.5 w-3.5" /> },
      { label: "Work Orders", value: kpis.totalWOs, icon: <ClipboardList className="h-3.5 w-3.5" /> },
      { label: "PM Plans", value: kpis.totalPMs, icon: <Calendar className="h-3.5 w-3.5" /> },
    ],
    CUSTOMER_MANAGER: [
      { label: "Users", value: stats.userCount, icon: <Users className="h-3.5 w-3.5" /> },
      { label: "Assigned Customers", value: stats.users.reduce((s: number, u: any) => s + u.assignedCustomers, 0), icon: <Building2 className="h-3.5 w-3.5" /> },
      { label: "Sites Managed", value: kpis.totalSites, icon: <MapPin className="h-3.5 w-3.5" /> },
      { label: "Departments", value: kpis.totalDepts, icon: <Layers className="h-3.5 w-3.5" /> },
      { label: "Work Orders", value: stats.users.reduce((s: number, u: any) => s + u.activeWOs, 0), icon: <ClipboardList className="h-3.5 w-3.5" /> },
      { label: "PM Plans", value: stats.users.reduce((s: number, u: any) => s + u.assignedPMs, 0), icon: <Calendar className="h-3.5 w-3.5" /> },
    ],
    SITE_INCHARGE: [
      { label: "Users", value: stats.userCount, icon: <Users className="h-3.5 w-3.5" /> },
      { label: "Assigned Sites", value: stats.users.reduce((s: number, u: any) => s + u.assignedSites, 0), icon: <MapPin className="h-3.5 w-3.5" /> },
      { label: "Departments", value: stats.users.reduce((s: number, u: any) => s + u.assignedDepts, 0), icon: <Layers className="h-3.5 w-3.5" /> },
      { label: "Assets", value: stats.users.reduce((s: number, u: any) => s + u.managedAssets, 0), icon: <Wrench className="h-3.5 w-3.5" /> },
      { label: "Work Orders", value: stats.users.reduce((s: number, u: any) => s + u.activeWOs, 0), icon: <ClipboardList className="h-3.5 w-3.5" /> },
      { label: "PM Plans", value: stats.users.reduce((s: number, u: any) => s + u.assignedPMs, 0), icon: <Calendar className="h-3.5 w-3.5" /> },
    ],
    SUPERVISOR: [
      { label: "Users", value: stats.userCount, icon: <Users className="h-3.5 w-3.5" /> },
      { label: "Departments", value: stats.users.reduce((s: number, u: any) => s + u.assignedDepts, 0), icon: <Layers className="h-3.5 w-3.5" /> },
      { label: "Assets Managed", value: stats.users.reduce((s: number, u: any) => s + u.managedAssets, 0), icon: <Wrench className="h-3.5 w-3.5" /> },
      { label: "Work Orders", value: stats.users.reduce((s: number, u: any) => s + u.activeWOs, 0), icon: <ClipboardList className="h-3.5 w-3.5" /> },
      { label: "PM Plans", value: stats.users.reduce((s: number, u: any) => s + u.assignedPMs, 0), icon: <Calendar className="h-3.5 w-3.5" /> },
      { label: "PM Assigned", value: stats.users.reduce((s: number, u: any) => s + u.assignedPMs, 0), icon: <Star className="h-3.5 w-3.5" /> },
    ],
    TECHNICIAN: [
      { label: "Users", value: stats.userCount, icon: <Users className="h-3.5 w-3.5" /> },
      { label: "Active Work Orders", value: stats.users.reduce((s: number, u: any) => s + u.activeWOs, 0), icon: <ClipboardList className="h-3.5 w-3.5" /> },
      { label: "Assigned PM", value: stats.users.reduce((s: number, u: any) => s + u.assignedPMs, 0), icon: <Calendar className="h-3.5 w-3.5" /> },
      { label: "Assets Assigned", value: stats.users.reduce((s: number, u: any) => s + u.managedAssets, 0), icon: <Wrench className="h-3.5 w-3.5" /> },
      { label: "Completed Jobs", value: "—", icon: <CheckCircle className="h-3.5 w-3.5" /> },
      { label: "Avg. Resolution", value: "—", icon: <TrendingUp className="h-3.5 w-3.5" /> },
    ],
  };

  const meta = metaByRole[role] ?? [];

  return (
    <Card className="overflow-hidden border-l-4" style={{ borderLeftColor: color }}>
      <CardHeader className="pb-3 pt-4 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: color + "20", color }}>
              {icon}
            </div>
            <div>
              <CardTitle className="text-sm font-bold">{label}</CardTitle>
              <CardDescription className="text-[10px]">{stats.userCount} user{stats.userCount !== 1 ? "s" : ""} assigned</CardDescription>
            </div>
          </div>
          <div className="text-2xl font-black" style={{ color }}>{stats.userCount}</div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-2">
          {meta.map((m, idx) => (
            <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 border border-border/40">
              <span style={{ color }} className="shrink-0">{m.icon}</span>
              <div>
                <p className="text-[9px] text-muted-foreground font-semibold uppercase">{m.label}</p>
                <p className="text-sm font-bold text-foreground">{m.value}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Hierarchy Node ────────────────────────────────────────────────────────────
function HierarchyNode({
  role,
  users,
  depth = 0,
}: {
  role: string;
  users: RoleUserItem[];
  depth?: number;
}) {
  const [open, setOpen] = useState(depth < 2);
  const color = ROLE_COLORS[role] ?? "#6b7280";
  const label = ROLE_LABELS[role];

  return (
    <div className={`${depth > 0 ? "ml-6 border-l-2 pl-4" : ""}`} style={{ borderColor: depth > 0 ? color + "40" : undefined }}>
      <button
        className="flex items-center gap-2 w-full text-left py-2 hover:opacity-80 transition-opacity"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: color }}>
          {ROLE_ICONS[role]}
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-foreground">{label}</p>
          <p className="text-[10px] text-muted-foreground">{users.length} user{users.length !== 1 ? "s" : ""}</p>
        </div>
        {users.length > 0 && (
          open ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>

      {open && users.length > 0 && (
        <div className="space-y-1 mb-2">
          {users.slice(0, 5).map((u) => (
            <div key={u.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border/50 bg-card/50 ml-2 text-xs">
              <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-white text-[10px] shrink-0" style={{ background: color }}>
                {u.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{u.fullName}</p>
                <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
              </div>
              <div className="text-right text-[10px] shrink-0">
                <p className="font-bold text-foreground">{u.activeWOs} WO</p>
                <p className="text-muted-foreground">{u.assignedPMs} PM</p>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            </div>
          ))}
          {users.length > 5 && (
            <p className="text-[10px] text-muted-foreground ml-2 py-1">+{users.length - 5} more users</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function RoleManagementDashboard() {
  const [data, setData] = useState<RoleDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "matrix" | "users" | "hierarchy">("overview");

  useEffect(() => {
    fetchRoleDashboard()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredUsers = useMemo(() => {
    if (!data) return [];
    const q = search.toLowerCase();
    return data.userTable.filter(
      (u) => !q || u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q),
    );
  }, [data, search]);

  const ROLES = ["ADMIN", "CUSTOMER_MANAGER", "SITE_INCHARGE", "SUPERVISOR", "TECHNICIAN"];

  const kpis = data?.kpis;

  const kpiCards = kpis
    ? [
        { label: "Total Roles", value: kpis.totalRoles, icon: <Shield className="h-5 w-5" />, color: "text-primary", bg: "bg-primary/10 text-primary" },
        { label: "Total Users", value: kpis.totalUsers, icon: <Users className="h-5 w-5" />, color: "text-foreground", bg: "bg-blue-500/10 text-blue-400" },
        { label: "Active Users", value: kpis.activeUsers, icon: <CheckCircle className="h-5 w-5" />, color: "text-emerald-500", bg: "bg-emerald-500/10 text-emerald-500" },
        { label: "Admins", value: kpis.admins, icon: <Crown className="h-5 w-5" />, color: "text-violet-500", bg: "bg-violet-500/10 text-violet-500" },
        { label: "Customer Managers", value: kpis.customerManagers, icon: <Briefcase className="h-5 w-5" />, color: "text-blue-400", bg: "bg-blue-500/10 text-blue-400" },
        { label: "Site In-Charges", value: kpis.siteInCharges, icon: <MapPin className="h-5 w-5" />, color: "text-emerald-500", bg: "bg-emerald-500/10 text-emerald-500" },
        { label: "Supervisors", value: kpis.supervisors, icon: <UserCheck className="h-5 w-5" />, color: "text-amber-500", bg: "bg-amber-500/10 text-amber-500" },
        { label: "Technicians", value: kpis.technicians, icon: <HardHat className="h-5 w-5" />, color: "text-red-400", bg: "bg-red-500/10 text-red-400" },
      ]
    : [];

  const MODULE_ACCESS = kpis
    ? [
        { module: "Assets", icon: <Wrench className="h-4 w-4" />, users: kpis.totalUsers, color: "#8b5cf6" },
        { module: "Work Orders", icon: <ClipboardList className="h-4 w-4" />, users: kpis.totalUsers - kpis.technicians, color: "#3b82f6" },
        { module: "PM Plans", icon: <Calendar className="h-4 w-4" />, users: kpis.admins + kpis.customerManagers + kpis.siteInCharges, color: "#22c55e" },
        { module: "Reports", icon: <FileText className="h-4 w-4" />, users: kpis.admins + kpis.customerManagers, color: "#f59e0b" },
        { module: "Settings", icon: <Settings className="h-4 w-4" />, users: kpis.admins, color: "#ef4444" },
      ]
    : [];

  const TAB_BUTTONS = [
    { key: "overview", label: "Overview", icon: <BarChart3 className="h-3.5 w-3.5" /> },
    { key: "matrix", label: "Permission Matrix", icon: <Shield className="h-3.5 w-3.5" /> },
    { key: "users", label: "Assigned Users", icon: <Users className="h-3.5 w-3.5" /> },
    { key: "hierarchy", label: "Hierarchy", icon: <Layers className="h-3.5 w-3.5" /> },
  ] as const;

  return (
    <div className="space-y-6">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Role Management Dashboard</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Enterprise role hierarchy, permission matrix, user assignments and workload intelligence.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
            <Download className="h-3.5 w-3.5" />
            Export Report
          </Button>
          <Button size="sm" className="h-8 text-xs gap-1.5 bg-primary text-white">
            <UserPlus className="h-3.5 w-3.5" />
            Assign User
          </Button>
        </div>
      </div>

      {/* ── Tab Nav ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-xl w-fit border border-border/60">
        {TAB_BUTTONS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === t.key
                ? "bg-background text-foreground shadow-sm border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-muted-foreground animate-pulse">Loading role intelligence…</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 text-sm">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && data && (
        <>
          {/* ════════════════════ OVERVIEW TAB ══════════════════════════ */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* 1. KPI Cards */}
              <section>
                <SectionHeader num={1} title="Executive KPI Cards" desc="Real-time snapshot of all users, roles and organizational assignments." />
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 xl:grid-cols-8">
                  {kpiCards.map((k, idx) => (
                    <Card key={idx} className="p-3 flex flex-col gap-2">
                      <div className={`w-8 h-8 rounded-lg ${k.bg} flex items-center justify-center`}>{k.icon}</div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{k.label}</p>
                        <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>

              {/* 2. Role Distribution + 11. Role Summary */}
              <section>
                <SectionHeader num={2} title="Role Distribution" desc="Donut chart showing user distribution across all system roles." />
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Donut Chart */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-bold">User Distribution by Role</CardTitle>
                      <CardDescription>Total {kpis!.totalUsers} users across {kpis!.totalRoles} system roles.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <div className="h-[200px] w-[200px] shrink-0">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={data.roleDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2} dataKey="count">
                                {data.roleDistribution.map((r, i) => (
                                  <Cell key={i} fill={ROLE_COLORS[r.role] ?? "#6b7280"} />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                                formatter={(v: any, _: any, p: any) => [v + " users", ROLE_LABELS[p.payload.role]]}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex-1 space-y-2.5">
                          {data.roleDistribution.map((r, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: ROLE_COLORS[r.role] }} />
                              <span className="text-xs flex-1 text-muted-foreground">{ROLE_LABELS[r.role]}</span>
                              <span className="text-xs font-bold">{r.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Role Summary Dashboard (section 11) */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-bold">Role Summary Dashboard</CardTitle>
                      <CardDescription>Aggregated operational metrics across all roles.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: "Total Users", value: kpis!.totalUsers, color: "text-foreground" },
                          { label: "Active Users", value: kpis!.activeUsers, color: "text-emerald-500" },
                          { label: "Customers Managed", value: kpis!.totalCustomers, color: "text-blue-400" },
                          { label: "Sites Managed", value: kpis!.totalSites, color: "text-violet-500" },
                          { label: "Departments", value: kpis!.totalDepts, color: "text-amber-500" },
                          { label: "Assets Managed", value: kpis!.totalAssets, color: "text-primary" },
                          { label: "Work Orders", value: kpis!.totalWOs, color: "text-foreground" },
                          { label: "PM Plans", value: kpis!.totalPMs, color: "text-emerald-500" },
                          { label: "Active WOs", value: kpis!.activeWOs, color: "text-amber-500" },
                          { label: "Completed WOs", value: kpis!.completedWOs, color: "text-emerald-500" },
                        ].map((s, idx) => (
                          <div key={idx} className="flex justify-between items-center p-2 rounded-lg border border-border/40 bg-muted/10">
                            <span className="text-[10px] text-muted-foreground font-semibold">{s.label}</span>
                            <span className={`text-sm font-bold ${s.color}`}>{s.value}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* 3. Role Cards */}
              <section>
                <SectionHeader num={3} title="Role Cards" desc="Detailed breakdown of responsibilities and assignments per role." />
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {ROLES.map((role) => (
                    <RoleCard key={role} role={role} stats={data.roleStats[role]} kpis={kpis!} />
                  ))}
                </div>
              </section>

              {/* 6. Role Workload */}
              <section>
                <SectionHeader num={6} title="Role Workload" desc="Active work orders and PM plans assigned per role group." />
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-bold">Workload by Role</CardTitle>
                    <CardDescription>Active work orders and PM tasks distributed across roles.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.roleWorkload}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="role" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                          <YAxis hide />
                          <Tooltip
                            contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                          />
                          <Legend iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                          <Bar dataKey="activeWOs" name="Active WOs" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                          <Bar dataKey="activePMs" name="Active PMs" fill="#22c55e" radius={[3, 3, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* 7. Module Access Overview */}
              <section>
                <SectionHeader num={7} title="Module Access Overview" desc="Number of users with access to each core module." />
                <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
                  {MODULE_ACCESS.map((m, idx) => (
                    <Card key={idx} className="p-4 text-center">
                      <div className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center mb-2" style={{ background: m.color + "20", color: m.color }}>
                        {m.icon}
                      </div>
                      <p className="text-xs font-bold text-foreground">{m.module}</p>
                      <p className="text-xl font-black mt-1" style={{ color: m.color }}>{m.users}</p>
                      <p className="text-[10px] text-muted-foreground">Users</p>
                    </Card>
                  ))}
                </div>
              </section>

              {/* 8. Recent Activities */}
              <section>
                <SectionHeader num={8} title="Recent Activities" desc="Timeline of latest role assignments and user management actions." />
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" />
                      Activity Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {data.recentActivities.length > 0 ? (
                      <div className="space-y-2">
                        {data.recentActivities.map((act, idx) => (
                          <div key={act.id} className="flex items-start gap-3 p-2.5 rounded-lg border border-border/40 bg-muted/10 hover:bg-muted/20 transition-colors">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-foreground">
                                <span className="text-primary">{act.action}</span>{" "}
                                <span className="text-muted-foreground">→</span>{" "}
                                {act.entityName}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                By: {act.performedBy} ({act.performedByRole}) • {act.entityType}
                              </p>
                            </div>
                            <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo(act.createdAt)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-6">No recent activities found.</p>
                    )}
                  </CardContent>
                </Card>
              </section>

              {/* 12. Quick Assignment Actions */}
              <section>
                <SectionHeader num={12} title="Quick Assignment Actions" desc="Rapid access to common role and assignment operations." />
                <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 xl:grid-cols-6">
                  {[
                    { label: "Assign Customer Manager", icon: <Briefcase className="h-4 w-4" />, color: "text-blue-400" },
                    { label: "Assign Site In-Charge", icon: <MapPin className="h-4 w-4" />, color: "text-emerald-500" },
                    { label: "Assign Supervisor", icon: <UserCheck className="h-4 w-4" />, color: "text-amber-500" },
                    { label: "Assign Technician", icon: <HardHat className="h-4 w-4" />, color: "text-red-400" },
                    { label: "View Assigned Assets", icon: <Wrench className="h-4 w-4" />, color: "text-violet-500" },
                    { label: "View Work Orders", icon: <ClipboardList className="h-4 w-4" />, color: "text-primary" },
                    { label: "View PM Plans", icon: <Calendar className="h-4 w-4" />, color: "text-emerald-500" },
                    { label: "View Customers", icon: <Building2 className="h-4 w-4" />, color: "text-blue-400" },
                    { label: "View Sites", icon: <MapPin className="h-4 w-4" />, color: "text-amber-500" },
                    { label: "View Departments", icon: <Layers className="h-4 w-4" />, color: "text-violet-500" },
                    { label: "Export Role Report", icon: <Download className="h-4 w-4" />, color: "text-foreground" },
                    { label: "Export Hierarchy", icon: <FileText className="h-4 w-4" />, color: "text-muted-foreground" },
                  ].map((a, idx) => (
                    <button
                      key={idx}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border/60 bg-card hover:bg-muted/20 hover:border-primary/40 transition-all text-center group"
                    >
                      <div className={`${a.color} group-hover:scale-110 transition-transform`}>{a.icon}</div>
                      <p className="text-[10px] font-semibold text-muted-foreground group-hover:text-foreground leading-tight">{a.label}</p>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* ════════════════════ PERMISSION MATRIX TAB ══════════════════ */}
          {activeTab === "matrix" && (
            <section className="space-y-4">
              <SectionHeader num={4} title="Permission Matrix" desc="Complete access control matrix showing what each role can do across all modules." />
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          <th className="text-left py-3 px-4 font-bold text-muted-foreground uppercase text-[10px] w-36 sticky left-0 bg-muted/30">Module</th>
                          {ROLES.map((role) => (
                            <th key={role} colSpan={PERM_COLS.length} className="text-center py-3 px-2 font-bold border-l border-border/40" style={{ color: ROLE_COLORS[role] }}>
                              {ROLE_LABELS[role]}
                            </th>
                          ))}
                        </tr>
                        <tr className="border-b border-border bg-muted/10">
                          <th className="text-left py-2 px-4 text-[10px] font-semibold text-muted-foreground sticky left-0 bg-muted/10">Permission</th>
                          {ROLES.map((role) => (
                            PERM_COLS.map((p) => (
                              <th key={`${role}-${p}`} className="text-center py-2 px-1 text-[10px] font-semibold text-muted-foreground capitalize border-l first:border-l border-border/20">
                                {p.slice(0, 3)}
                              </th>
                            ))
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {MODULES.map((mod, mIdx) => (
                          <tr key={mIdx} className="hover:bg-muted/10 transition-colors">
                            <td className="py-2.5 px-4 font-semibold text-foreground sticky left-0 bg-background text-xs">{mod}</td>
                            {ROLES.map((role) => (
                              PERM_COLS.map((p) => (
                                <td key={`${role}-${mod}-${p}`} className="py-2.5 px-1 text-center border-l border-border/20">
                                  <Tick v={PERMISSIONS[role]?.[mod]?.[p] ?? false} />
                                </td>
                              ))
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center gap-4 p-4 border-t border-border/40 bg-muted/10 text-[10px] text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1.5"><CheckCircle className="h-3 w-3 text-emerald-500" /> Permitted</div>
                    <div className="flex items-center gap-1.5"><XCircle className="h-3 w-3 text-red-400/60" /> Not Permitted</div>
                    <div className="ml-auto">Cols: Cre=Create · Rea=Read · Upd=Update · Del=Delete · Ass=Assign · App=Approve · Exp=Export</div>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {/* ════════════════════ ASSIGNED USERS TAB ════════════════════ */}
          {activeTab === "users" && (
            <section className="space-y-4">
              <SectionHeader num={5} title="Assigned Users" desc="Complete user table with role, assignments, and workload data." />
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1 max-w-xs">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Search users…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-8 text-xs"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{filteredUsers.length} users</p>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          {["User", "Role", "Customers", "Sites", "Departments", "Assets", "Work Orders", "PM Plans", "Status"].map((h) => (
                            <th key={h} className="text-left py-3 px-3 font-bold text-muted-foreground uppercase text-[10px] whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {filteredUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-muted/10 transition-colors">
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                                  style={{ background: ROLE_COLORS[u.role] ?? "#6b7280" }}
                                >
                                  {u.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-foreground whitespace-nowrap">{u.fullName}</p>
                                  <p className="text-[10px] text-muted-foreground">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-3"><RoleBadge role={u.role} /></td>
                            <td className="py-2.5 px-3 text-muted-foreground max-w-[100px] truncate">{u.customers}</td>
                            <td className="py-2.5 px-3 text-muted-foreground max-w-[100px] truncate">{u.sites}</td>
                            <td className="py-2.5 px-3 text-muted-foreground max-w-[100px] truncate">{u.departments}</td>
                            <td className="py-2.5 px-3 text-center font-bold">{u.assignedAssets}</td>
                            <td className="py-2.5 px-3 text-center">
                              <span className={`font-bold ${u.activeWOs > 0 ? "text-amber-500" : "text-muted-foreground"}`}>{u.activeWOs}</span>
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold text-emerald-500">{u.assignedPMs}</td>
                            <td className="py-2.5 px-3">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                                {u.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredUsers.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-10">No users match your search.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {/* ════════════════════ HIERARCHY TAB ══════════════════════════ */}
          {activeTab === "hierarchy" && (
            <div className="space-y-6">
              {/* 9. Org Role Hierarchy */}
              <section>
                <SectionHeader num={9} title="Organization Role Assignment Hierarchy" desc="Interactive expandable tree showing role assignment flow from Admin to Technician." />
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-bold">Role Hierarchy Tree</CardTitle>
                    <CardDescription>Click any role to expand and see individual user assignments.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {ROLES.map((role) => (
                        <HierarchyNode
                          key={role}
                          role={role}
                          users={data.roleStats[role]?.users ?? []}
                          depth={ROLES.indexOf(role)}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* 10. Assignment Relationship Dashboard */}
              <section>
                <SectionHeader num={10} title="Assignment Relationship Dashboard" desc="How each role connects through the organizational hierarchy." />
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {/* Admin → Everything */}
                  <Card className="border-l-4" style={{ borderLeftColor: ROLE_COLORS.ADMIN }}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-violet-500" />
                        <CardTitle className="text-sm font-bold">Admin</CardTitle>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-500 border border-violet-500/30 ml-auto">
                          {data.roleStats.ADMIN.userCount} users
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {[
                        { label: "Organization", value: 1, icon: <Shield className="h-3 w-3" /> },
                        { label: "Customer Managers", value: kpis!.customerManagers, icon: <Briefcase className="h-3 w-3" /> },
                        { label: "Total Customers", value: kpis!.totalCustomers, icon: <Building2 className="h-3 w-3" /> },
                        { label: "Total Sites", value: kpis!.totalSites, icon: <MapPin className="h-3 w-3" /> },
                        { label: "Total Assets", value: kpis!.totalAssets, icon: <Wrench className="h-3 w-3" /> },
                        { label: "Active Work Orders", value: kpis!.activeWOs, icon: <ClipboardList className="h-3 w-3" /> },
                        { label: "Active PM Plans", value: kpis!.activePMs, icon: <Calendar className="h-3 w-3" /> },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between py-1 border-b border-border/30 last:border-0">
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span className="text-violet-500">{item.icon}</span>
                            {item.label}
                          </div>
                          <span className="text-sm font-bold text-foreground">{item.value}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Customer Manager → Sites */}
                  <Card className="border-l-4" style={{ borderLeftColor: ROLE_COLORS.CUSTOMER_MANAGER }}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-blue-400" />
                        <CardTitle className="text-sm font-bold">Customer Manager</CardTitle>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 ml-auto">
                          {data.roleStats.CUSTOMER_MANAGER.userCount} users
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {[
                        { label: "Assigned Customers", value: data.roleStats.CUSTOMER_MANAGER.users.reduce((s, u) => s + u.assignedCustomers, 0) },
                        { label: "Sites Managed", value: kpis!.totalSites },
                        { label: "Site In-Charges", value: kpis!.siteInCharges },
                        { label: "Departments", value: kpis!.totalDepts },
                        { label: "Total Assets", value: kpis!.totalAssets },
                        { label: "Active WOs", value: data.roleStats.CUSTOMER_MANAGER.users.reduce((s, u) => s + u.activeWOs, 0) },
                        { label: "PM Plans", value: data.roleStats.CUSTOMER_MANAGER.users.reduce((s, u) => s + u.assignedPMs, 0) },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between py-1 border-b border-border/30 last:border-0 text-[10px]">
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className="text-sm font-bold text-foreground">{item.value}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Site In-Charge / Supervisor / Technician */}
                  <Card className="border-l-4" style={{ borderLeftColor: ROLE_COLORS.TECHNICIAN }}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <HardHat className="h-4 w-4 text-red-400" />
                        <CardTitle className="text-sm font-bold">Field Operations</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {[
                        { label: "Site In-Charges", value: kpis!.siteInCharges, color: "text-emerald-500" },
                        { label: "Sites Assigned", value: data.roleStats.SITE_INCHARGE.users.reduce((s, u) => s + u.assignedSites, 0), color: "text-emerald-500" },
                        { label: "Supervisors", value: kpis!.supervisors, color: "text-amber-500" },
                        { label: "Depts Assigned", value: data.roleStats.SUPERVISOR.users.reduce((s, u) => s + u.assignedDepts, 0), color: "text-amber-500" },
                        { label: "Technicians", value: kpis!.technicians, color: "text-red-400" },
                        { label: "Active WOs (Tech)", value: data.roleStats.TECHNICIAN.users.reduce((s, u) => s + u.activeWOs, 0), color: "text-red-400" },
                        { label: "PM Assigned (Tech)", value: data.roleStats.TECHNICIAN.users.reduce((s, u) => s + u.assignedPMs, 0), color: "text-red-400" },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between py-1 border-b border-border/30 last:border-0 text-[10px]">
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className={`text-sm font-bold ${item.color}`}>{item.value}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </section>
            </div>
          )}
        </>
      )}
    </div>
  );
}
