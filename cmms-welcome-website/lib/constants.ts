// CMMS Application Constants

export const APP_NAME = "Fixbyte";
export const APP_SUBTITLE = "";
export const APP_DESCRIPTION = "Reliable Assets. Sustainable Operations.";

// Navigation Links
export const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Features", href: "/features" },
  { name: "How It Works", href: "/how-it-works" },
  { name: "Pricing", href: "/pricing" },
  { name: "Roles", href: "/roles" },
  { name: "Contact", href: "/contact" },
] as const; 

// Features
export const FEATURES = [
  {
    title: "Asset Management",
    description: "Track and manage all your assets with detailed records, maintenance history, and lifecycle tracking.",
    icon: "Server",
  },
  {
    title: "Work Orders",
    description: "Create, assign, and track work orders with priority levels, deadlines, and real-time status updates.",
    icon: "ClipboardList",
  },
  {
    title: "Preventive Maintenance",
    description: "Schedule automated maintenance tasks to prevent equipment failures and extend asset lifespan.",
    icon: "Calendar",
  },
  {
    title: "Inventory Management",
    description: "Monitor spare parts, track stock levels, and automate reorder points for seamless operations.",
    icon: "Package",
  },
  {
    title: "Purchase Management",
    description: "Streamline procurement with purchase requests, vendor management, and approval workflows.",
    icon: "ShoppingCart",
  },
  {
    title: "Reporting & Analytics",
    description: "Gain insights with comprehensive reports, KPIs, and customizable dashboards.",
    icon: "BarChart3",
  },
] as const;

// Role-Based Access
export const ROLES = [
  {
    title: "Admin",
    description: "Full system access with user management, settings configuration, and complete oversight.",
    icon: "Shield",
  },
  {
    title: "Maintenance Manager",
    description: "Oversee all maintenance operations, approve work orders, and manage team performance.",
    icon: "Users",
  },
  {
    title: "Supervisor",
    description: "Assign tasks to technicians, monitor progress, and ensure quality standards.",
    icon: "UserCheck",
  },
  {
    title: "Technician",
    description: "Execute assigned work orders, log time, and update maintenance records.",
    icon: "Wrench",
  },
  {
    title: "Inventory Manager",
    description: "Manage stock levels, process requisitions, and coordinate with vendors.",
    icon: "Boxes",
  },
  {
    title: "Purchase Manager",
    description: "Handle procurement, vendor negotiations, and purchase order approvals.",
    icon: "CreditCard",
  },
] as const;

// How It Works Steps
export const STEPS = [
  { step: 1, title: "Register Company", description: "Set up your organization profile and structure" },
  { step: 2, title: "Add Assets", description: "Import or create your asset database" },
  { step: 3, title: "Create Maintenance Plans", description: "Define preventive maintenance schedules" },
  { step: 4, title: "Assign Work Orders", description: "Distribute tasks to your maintenance team" },
  { step: 5, title: "Track Inventory", description: "Monitor spare parts and supplies" },
  { step: 6, title: "Analyze Reports", description: "Review performance and optimize operations" },
] as const;

// Pricing Plans
export const PRICING_PLANS = [
  {
    name: "Starter",
    price: "$49",
    period: "/month",
    description: "Perfect for small teams getting started",
    features: [
      "Up to 100 assets",
      "5 user accounts",
      "Basic work orders",
      "Email support",
      "Mobile app access",
    ],
    highlighted: false,
  },
  {
    name: "Professional",
    price: "$149",
    period: "/month",
    description: "For growing maintenance teams",
    features: [
      "Up to 1,000 assets",
      "25 user accounts",
      "Preventive maintenance",
      "Inventory management",
      "Priority support",
      "Custom reports",
      "API access",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations",
    features: [
      "Unlimited assets",
      "Unlimited users",
      "Multi-site support",
      "Advanced analytics",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee",
      "On-premise option",
    ],
    highlighted: false,
  },
] as const;

// Testimonials
export const TESTIMONIALS = [
  {
    quote: "FixByte transformed our maintenance operations. We reduced downtime by 40% in the first quarter.",
    author: "Sarah Johnson",
    role: "Operations Director",
    company: "Tech Manufacturing Inc.",
  },
  {
    quote: "The intuitive interface made adoption easy. Our technicians were productive from day one.",
    author: "Michael Chen",
    role: "Maintenance Manager",
    company: "Global Logistics Corp.",
  },
  {
    quote: "Finally, a CMMS that understands enterprise needs. The reporting capabilities are exceptional.",
    author: "Emily Rodriguez",
    role: "VP of Operations",
    company: "Healthcare Systems Ltd.",
  },
] as const;

// FAQ
export const FAQ_ITEMS = [
  {
    question: "How long does implementation take?",
    answer: "Most organizations are up and running within 2-4 weeks. Our team provides hands-on support throughout the onboarding process.",
  },
  {
    question: "Can I import data from my existing system?",
    answer: "Yes, we support data migration from most major CMMS platforms. Our team will help you transfer your assets, work orders, and maintenance history.",
  },
  {
    question: "Is there a mobile app available?",
    answer: "Yes, our mobile app is available for both iOS and Android devices, allowing technicians to access work orders and update records from anywhere.",
  },
  {
    question: "What kind of support do you offer?",
    answer: "We offer email support for all plans, priority support for Professional plans, and dedicated account management for Enterprise customers.",
  },
  {
    question: "Can I customize workflows?",
    answer: "Professional and Enterprise plans include workflow customization, allowing you to tailor the system to your specific processes.",
  },
] as const;

// Dashboard Sidebar Navigation - Role Based
import { UserRole } from "@/types";

type NavItem = {
  name: string;
  href: string;
  icon: string;
};

// Admin Navigation - Full access
export const ADMIN_NAV: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { name: "Portfolio Explorer", href: "/dashboard/portfolio", icon: "Building2" },
  { name: "Portfolio Setup", href: "/dashboard/portfolio/setup", icon: "Settings" },
  { name: "User Management", href: "/dashboard/users", icon: "Users" },
  { name: "Chat", href: "/dashboard/chat", icon: "MessageSquare" },
  { name: "Role Management", href: "/dashboard/roles", icon: "Shield" },
  { name: "Assets", href: "/dashboard/assets", icon: "Server" },
  { name: "Work Orders", href: "/dashboard/work-orders", icon: "ClipboardList" },
  { name: "PM Dashboard", href: "/dashboard/preventive?view=dashboard", icon: "LayoutDashboard" },
  { name: "PM Schedules", href: "/dashboard/preventive?view=schedules", icon: "ClipboardList" },
  { name: "PM Calendar", href: "/dashboard/preventive?view=calendar", icon: "Calendar" },
  { name: "Inventory Dashboard", href: "/dashboard/inventory", icon: "LayoutDashboard" },
  { name: "Spare Parts", href: "/dashboard/inventory/spare-parts", icon: "Wrench" },
  { name: "Categories", href: "/dashboard/inventory/categories", icon: "Layers" },
  { name: "Warehouses", href: "/dashboard/inventory/warehouses", icon: "Building2" },
  { name: "Current Stock", href: "/dashboard/inventory/stock", icon: "Archive" },
  { name: "Parts Requests", href: "/dashboard/inventory/requests", icon: "ClipboardList" },
  { name: "Stock Transactions", href: "/dashboard/inventory/transactions", icon: "History" },
  { name: "Low Stock Alert", href: "/dashboard/inventory/low-stock", icon: "AlertTriangle" },
  { name: "Purchase", href: "/dashboard/purchase", icon: "ShoppingCart" },
  { name: "Vendors", href: "/dashboard/vendors", icon: "Building2" },
  { name: "Incident Management", href: "/dashboard/incidents", icon: "ShieldAlert" },
  { name: "Service Tickets", href: "/dashboard/service-tickets", icon: "Ticket" },
  { name: "AMC Dashboard", href: "/dashboard/amc", icon: "LayoutDashboard" },
  { name: "AMC Contracts", href: "/dashboard/amc/contracts", icon: "FileText" },
  { name: "AMC Renewals", href: "/dashboard/amc/renewals", icon: "RefreshCw" },
  { name: "AMC Reports", href: "/dashboard/amc/reports", icon: "FileSpreadsheet" },
  { name: "Reports", href: "/dashboard/reports", icon: "BarChart3" },
  { name: "Audit Logs", href: "/dashboard/audit-logs", icon: "FileText" },
  { name: "Settings", href: "/dashboard/settings", icon: "Settings" },
  { name: "Reliability Dashboard", href: "/dashboard/reliability", icon: "LayoutDashboard" },
  { name: "Asset Criticality", href: "/dashboard/reliability/criticality", icon: "AlertTriangle" },
  { name: "Failure Library", href: "/dashboard/reliability/failure-library", icon: "BookOpen" },
  { name: "Failure History", href: "/dashboard/reliability/failure-history", icon: "History" },
  { name: "Reliability KPIs", href: "/dashboard/reliability/kpis", icon: "BarChart3" },
  { name: "Root Cause Analysis", href: "/dashboard/reliability/rca", icon: "Search" },
  { name: "FMECA", href: "/dashboard/reliability/fmeca", icon: "Layers" },
  { name: "RCM", href: "/dashboard/reliability/rcm", icon: "FileText" },
  { name: "Reports", href: "/dashboard/reliability/reports", icon: "FileSpreadsheet" },
];

// Customer Manager Navigation
export const CUSTOMER_MANAGER_NAV: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { name: "Portfolio Explorer", href: "/dashboard/portfolio", icon: "Building2" },
  { name: "Portfolio Setup", href: "/dashboard/portfolio/setup", icon: "Settings" },
  { name: "Maintenance Planning", href: "/dashboard/maintenance-planning", icon: "CalendarClock" },
  { name: "Assets", href: "/dashboard/assets", icon: "Server" },
  { name: "Work Orders", href: "/dashboard/work-orders", icon: "ClipboardList" },
  { name: "PM Dashboard", href: "/dashboard/preventive?view=dashboard", icon: "LayoutDashboard" },
  { name: "PM Schedules", href: "/dashboard/preventive?view=schedules", icon: "ClipboardList" },
  { name: "PM Calendar", href: "/dashboard/preventive?view=calendar", icon: "Calendar" },
  { name: "Inventory Dashboard", href: "/dashboard/inventory", icon: "LayoutDashboard" },
  { name: "Spare Parts", href: "/dashboard/inventory/spare-parts", icon: "Wrench" },
  { name: "Parts Requests", href: "/dashboard/inventory/requests", icon: "ClipboardList" },
  { name: "Users", href: "/dashboard/users", icon: "Users" },
  { name: "Incident Management", href: "/dashboard/incidents", icon: "ShieldAlert" },
  { name: "Service Tickets", href: "/dashboard/service-tickets", icon: "Ticket" },
  { name: "AMC Dashboard", href: "/dashboard/amc", icon: "LayoutDashboard" },
  { name: "AMC Contracts", href: "/dashboard/amc/contracts", icon: "FileText" },
  { name: "AMC Renewals", href: "/dashboard/amc/renewals", icon: "RefreshCw" },
  { name: "AMC Reports", href: "/dashboard/amc/reports", icon: "FileSpreadsheet" },
  { name: "Reports", href: "/dashboard/reports", icon: "BarChart3" },
  { name: "Settings", href: "/dashboard/settings", icon: "Settings" },
  { name: "Reliability Dashboard", href: "/dashboard/reliability", icon: "LayoutDashboard" },
  { name: "Asset Criticality", href: "/dashboard/reliability/criticality", icon: "AlertTriangle" },
  { name: "Failure Library", href: "/dashboard/reliability/failure-library", icon: "BookOpen" },
  { name: "Failure History", href: "/dashboard/reliability/failure-history", icon: "History" },
  { name: "Reliability KPIs", href: "/dashboard/reliability/kpis", icon: "BarChart3" },
  { name: "Root Cause Analysis", href: "/dashboard/reliability/rca", icon: "Search" },
  { name: "FMECA", href: "/dashboard/reliability/fmeca", icon: "Layers" },
  { name: "RCM", href: "/dashboard/reliability/rcm", icon: "FileText" },
  { name: "Reports", href: "/dashboard/reliability/reports", icon: "FileSpreadsheet" },
];

export const MAINTENANCE_MANAGER_NAV = CUSTOMER_MANAGER_NAV;

// Site In-Charge Navigation
export const SITE_INCHARGE_NAV: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { name: "Portfolio Explorer", href: "/dashboard/portfolio", icon: "Building2" },
  { name: "Portfolio Setup", href: "/dashboard/portfolio/setup", icon: "Settings" },
  { name: "Assets", href: "/dashboard/assets", icon: "Server" },
  { name: "Users", href: "/dashboard/users", icon: "Users" },
  { name: "Work Orders", href: "/dashboard/work-orders", icon: "ClipboardList" },
  { name: "PM Dashboard", href: "/dashboard/preventive?view=dashboard", icon: "LayoutDashboard" },
  { name: "PM Schedules", href: "/dashboard/preventive?view=schedules", icon: "ClipboardList" },
  { name: "PM Calendar", href: "/dashboard/preventive?view=calendar", icon: "Calendar" },
  { name: "Inventory Dashboard", href: "/dashboard/inventory", icon: "LayoutDashboard" },
  { name: "Spare Parts", href: "/dashboard/inventory/spare-parts", icon: "Wrench" },
  { name: "Categories", href: "/dashboard/inventory/categories", icon: "Layers" },
  { name: "Warehouses", href: "/dashboard/inventory/warehouses", icon: "Building2" },
  { name: "Current Stock", href: "/dashboard/inventory/stock", icon: "Archive" },
  { name: "Parts Requests", href: "/dashboard/inventory/requests", icon: "ClipboardList" },
  { name: "Stock Transactions", href: "/dashboard/inventory/transactions", icon: "History" },
  { name: "Low Stock Alert", href: "/dashboard/inventory/low-stock", icon: "AlertTriangle" },
  { name: "Incident Management", href: "/dashboard/incidents", icon: "ShieldAlert" },
  { name: "Service Tickets", href: "/dashboard/service-tickets", icon: "Ticket" },
  { name: "AMC Dashboard", href: "/dashboard/amc", icon: "LayoutDashboard" },
  { name: "AMC Contracts", href: "/dashboard/amc/contracts", icon: "FileText" },
  { name: "AMC Renewals", href: "/dashboard/amc/renewals", icon: "RefreshCw" },
  { name: "AMC Reports", href: "/dashboard/amc/reports", icon: "FileSpreadsheet" },
  { name: "Reports", href: "/dashboard/reports", icon: "BarChart3" },
];

// Supervisor Navigation
export const SUPERVISOR_NAV: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { name: "Portfolio Explorer", href: "/dashboard/portfolio", icon: "Building2" },
  { name: "Portfolio Setup", href: "/dashboard/portfolio/setup", icon: "Settings" },
  { name: "Asset Monitoring", href: "/dashboard/assets", icon: "Server" },
  { name: "Work Order Monitoring", href: "/dashboard/work-orders", icon: "ClipboardList" },
  { name: "Parts Requests", href: "/dashboard/inventory/requests", icon: "ClipboardList" },
  { name: "Team Management", href: "/dashboard/users", icon: "Users" },
  { name: "Incident Management", href: "/dashboard/incidents", icon: "ShieldAlert" },
  { name: "Service Tickets", href: "/dashboard/service-tickets", icon: "Ticket" },
  { name: "Settings", href: "/dashboard/settings", icon: "Settings" },
];

// Technician Navigation
export const TECHNICIAN_NAV: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { name: "My Tasks", href: "/dashboard/my-tasks", icon: "CheckSquare" },
  { name: "Work History", href: "/dashboard/work-history", icon: "History" },
  { name: "Settings", href: "/dashboard/settings", icon: "Settings" },
];

// Inventory Manager Navigation
export const INVENTORY_MANAGER_NAV: NavItem[] = [
  { name: "Inventory Dashboard", href: "/dashboard/inventory", icon: "LayoutDashboard" },
  { name: "Spare Parts", href: "/dashboard/inventory/spare-parts", icon: "Wrench" },
  { name: "Categories", href: "/dashboard/inventory/categories", icon: "Layers" },
  { name: "Warehouses", href: "/dashboard/inventory/warehouses", icon: "Building2" },
  { name: "Current Stock", href: "/dashboard/inventory/stock", icon: "Archive" },
  { name: "Parts Requests", href: "/dashboard/inventory/requests", icon: "ClipboardList" },
  { name: "Stock Transactions", href: "/dashboard/inventory/transactions", icon: "History" },
  { name: "Low Stock Alert", href: "/dashboard/inventory/low-stock", icon: "AlertTriangle" },
  { name: "Reports", href: "/dashboard/reports", icon: "BarChart3" },
  { name: "Settings", href: "/dashboard/settings", icon: "Settings" },
];

// Purchase Manager Navigation
export const PURCHASE_MANAGER_NAV: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { name: "Purchase Requests", href: "/dashboard/purchase-requests", icon: "FileInput" },
  { name: "Vendor Management", href: "/dashboard/vendors", icon: "Building2" },
  { name: "Purchase Orders", href: "/dashboard/purchase", icon: "ShoppingCart" },
  { name: "Approvals", href: "/dashboard/approvals", icon: "CheckCircle" },
  { name: "Reports", href: "/dashboard/reports", icon: "BarChart3" },
  { name: "Settings", href: "/dashboard/settings", icon: "Settings" },
];

// Get navigation based on role
export const getNavByRole = (role: UserRole): NavItem[] => {
  switch (role) {
    case "admin":
      return ADMIN_NAV;
    case "customer_manager":
      return CUSTOMER_MANAGER_NAV;
    case "maintenance_manager" as any:
      return CUSTOMER_MANAGER_NAV;
    case "site_incharge":
      return SITE_INCHARGE_NAV;
    case "supervisor":
      return SUPERVISOR_NAV;
    case "technician":
      return TECHNICIAN_NAV;
    case "inventory_manager":
      return INVENTORY_MANAGER_NAV;
    case "purchase_manager":
      return PURCHASE_MANAGER_NAV;
    default:
      return ADMIN_NAV;
  }
};

// Legacy - Keep for backward compatibility
export const DASHBOARD_NAV = ADMIN_NAV;

// Stats for Landing Page
export const TRUST_STATS = [
  { value: "100+", label: "Companies" },
  { value: "50,000+", label: "Assets Managed" },
  { value: "98%", label: "PM Compliance" },
] as const;

export type NavCategory = 'DASHBOARD' | 'PORTFOLIO' | 'WORK ORDERS' | 'ASSETS' | 'PM' | 'INVENTORY' | 'INCIDENTS' | 'SERVICE TICKETS' | 'AMC MANAGEMENT' | 'REPORTS' | 'SETTINGS' | 'RELIABILITY';

export const getNavItemCategory = (item: { href: string }): NavCategory => {
  const href = item.href;
  if (href.startsWith('/dashboard/incidents')) {
    return 'INCIDENTS';
  }
  if (href.startsWith('/dashboard/service-tickets')) {
    return 'SERVICE TICKETS';
  }
  if (href.startsWith('/dashboard/amc')) {
    return 'AMC MANAGEMENT';
  }
  if (href.startsWith('/dashboard/reliability')) {
    return 'RELIABILITY';
  }
  if (
    href === '/dashboard' ||
    href.startsWith('/dashboard/users') ||
    href.startsWith('/dashboard/roles') ||
    href.startsWith('/dashboard/chat')
  ) {
    return 'DASHBOARD';
  }
  if (
    href.startsWith('/dashboard/portfolio')
  ) {
    return 'PORTFOLIO';
  }
  if (href.startsWith('/dashboard/work-orders') || href.startsWith('/dashboard/work-history') || href.startsWith('/dashboard/my-tasks')) {
    return 'WORK ORDERS';
  }
  if (href.startsWith('/dashboard/assets')) {
    return 'ASSETS';
  }
  if (href.startsWith('/dashboard/preventive') || href.startsWith('/dashboard/maintenance-planning')) {
    return 'PM';
  }
  if (
    href.startsWith('/dashboard/inventory') ||
    href.startsWith('/dashboard/materials') ||
    href.startsWith('/dashboard/spare-parts') ||
    href.startsWith('/dashboard/purchase') ||
    href.startsWith('/dashboard/purchase-requests') ||
    href.startsWith('/dashboard/vendors')
  ) {
    return 'INVENTORY';
  }
  if (href.startsWith('/dashboard/reports') || href.startsWith('/dashboard/audit-logs')) {
    return 'REPORTS';
  }
  if (href.startsWith('/dashboard/settings') || href.startsWith('/dashboard/profile')) {
    return 'SETTINGS';
  }
  return 'DASHBOARD';
};

export const getCategoryFromPath = (pathname: string): NavCategory => {
  if (pathname.startsWith('/dashboard/incidents')) {
    return 'INCIDENTS';
  }
  if (pathname.startsWith('/dashboard/service-tickets')) {
    return 'SERVICE TICKETS';
  }
  if (pathname.startsWith('/dashboard/amc')) {
    return 'AMC MANAGEMENT';
  }
  if (pathname.startsWith('/dashboard/reliability')) {
    return 'RELIABILITY';
  }
  if (
    pathname.startsWith('/dashboard/users') ||
    pathname.startsWith('/dashboard/roles') ||
    pathname.startsWith('/dashboard/chat')
  ) {
    return 'DASHBOARD';
  }
  if (
    pathname.startsWith('/dashboard/portfolio')
  ) {
    return 'PORTFOLIO';
  }
  if (pathname.startsWith('/dashboard/work-orders') || pathname.startsWith('/dashboard/work-history') || pathname.startsWith('/dashboard/my-tasks')) {
    return 'WORK ORDERS';
  }
  if (pathname.startsWith('/dashboard/assets')) {
    return 'ASSETS';
  }
  if (pathname.startsWith('/dashboard/preventive') || pathname.startsWith('/dashboard/maintenance-planning')) {
    return 'PM';
  }
  if (
    pathname.startsWith('/dashboard/inventory') ||
    pathname.startsWith('/dashboard/materials') ||
    pathname.startsWith('/dashboard/spare-parts') ||
    pathname.startsWith('/dashboard/purchase') ||
    pathname.startsWith('/dashboard/purchase-requests') ||
    pathname.startsWith('/dashboard/vendors')
  ) {
    return 'INVENTORY';
  }
  if (pathname.startsWith('/dashboard/reports') || pathname.startsWith('/dashboard/audit-logs')) {
    return 'REPORTS';
  }
  if (pathname.startsWith('/dashboard/settings') || pathname.startsWith('/dashboard/profile')) {
    return 'SETTINGS';
  }
  return 'DASHBOARD';
};

export const getCategoryHref = (category: NavCategory, roleNavItems: { href: string }[]): string => {
  const itemsInCat = roleNavItems.filter(item => getNavItemCategory(item) === category);
  if (itemsInCat.length > 0) {
    return itemsInCat[0].href;
  }
  return '/dashboard'; // fallback
};

