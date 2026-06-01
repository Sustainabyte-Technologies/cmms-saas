// CMMS Application Constants

export const APP_NAME = "MaintainX Pro";
export const APP_DESCRIPTION = "Modern CMMS Platform for Maintenance Excellence";

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
    quote: "MaintainX Pro transformed our maintenance operations. We reduced downtime by 40% in the first quarter.",
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
  { name: "User Management", href: "/dashboard/users", icon: "Users" },
  { name: "Role Management", href: "/dashboard/roles", icon: "Shield" },
  { name: "Assets", href: "/dashboard/assets", icon: "Server" },
  { name: "Work Orders", href: "/dashboard/work-orders", icon: "ClipboardList" },
  { name: "Preventive Maintenance", href: "/dashboard/preventive", icon: "Calendar" },
  { name: "Inventory", href: "/dashboard/inventory", icon: "Package" },
  { name: "Purchase", href: "/dashboard/purchase", icon: "ShoppingCart" },
  { name: "Vendors", href: "/dashboard/vendors", icon: "Building2" },
  { name: "Reports", href: "/dashboard/reports", icon: "BarChart3" },
  { name: "Audit Logs", href: "/dashboard/audit-logs", icon: "FileText" },
  { name: "Settings", href: "/dashboard/settings", icon: "Settings" },
];

// Maintenance Manager Navigation
export const MAINTENANCE_MANAGER_NAV: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { name: "Maintenance Planning", href: "/dashboard/maintenance-planning", icon: "CalendarClock" },
  { name: "Work Orders", href: "/dashboard/work-orders", icon: "ClipboardList" },
  { name: "Assets", href: "/dashboard/assets", icon: "Server" },
  { name: "Preventive Maintenance", href: "/dashboard/preventive", icon: "Calendar" },
  { name: "Reports", href: "/dashboard/reports", icon: "BarChart3" },
  { name: "Settings", href: "/dashboard/settings", icon: "Settings" },
];

// Supervisor Navigation
export const SUPERVISOR_NAV: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { name: "Work Order Monitoring", href: "/dashboard/work-orders", icon: "ClipboardList" },
  { name: "Asset Monitoring", href: "/dashboard/assets", icon: "Server" },
  { name: "Team Management", href: "/dashboard/team", icon: "Users" },
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
  { name: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { name: "Material Management", href: "/dashboard/materials", icon: "Package" },
  { name: "Spare Parts", href: "/dashboard/spare-parts", icon: "Wrench" },
  { name: "Inventory Tracking", href: "/dashboard/inventory", icon: "Archive" },
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
    case "maintenance_manager":
      return MAINTENANCE_MANAGER_NAV;
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
