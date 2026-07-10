"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChatWidget } from "@/components/dashboard/chat-widget";
import { getJwtTokenFromServer } from "@/app/actions/auth-actions";
import { io } from "socket.io-client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { getNavByRole, APP_NAME, getNavItemCategory, getCategoryFromPath, getCategoryHref, NavCategory } from "@/lib/constants";
import { useRole, roleConfig } from "@/contexts/role-context";
import { UserRole } from "@/types";
import { logoutUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import {
  Bell,
  Menu,
  User,
  Settings,
  LogOut,
  Wrench,
  MessageSquare,
  LayoutDashboard,
  Server,
  ClipboardList,
  Calendar,
  Package,
  ShoppingCart,
  Building2,
  BarChart3,
  Users,
  Shield,
  FileText,
  CalendarClock,
  CheckSquare,
  History,
  Archive,
  FileInput,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Server,
  ClipboardList,
  Calendar,
  Package,
  ShoppingCart,
  Building2,
  BarChart3,
  Settings,
  Users,
  Shield,
  FileText,
  CalendarClock,
  CheckSquare,
  History,
  Wrench,
  Archive,
  FileInput,
  CheckCircle,
};

export function AppNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { role, userName, userEmail, userData } = useRole();
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedChatTechId, setSelectedChatTechId] = useState<string | null>(null);
  const socketRef = useRef<any>(null);
  const chatOpenRef = useRef(chatOpen);

  useEffect(() => {
    chatOpenRef.current = chatOpen;
    if (chatOpen) {
      setUnreadCount(0);
    }
  }, [chatOpen]);

  useEffect(() => {
    if (role !== "admin") return;
    let socket: any = null;

    async function initBackgroundSocket() {
      const token = await getJwtTokenFromServer();
      if (!token) return;

      const socketUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      socket = io(socketUrl, {
        transports: ["websocket"],
        auth: { token },
        query: { token }
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        socket.emit("join");
      });

      socket.on("receiveMessage", (message: any) => {
        if (message.senderId === userData?.id) return;
        if (!chatOpenRef.current) {
          setUnreadCount((prev) => prev + 1);
          toast(`New message from ${message.sender?.fullName || "Technician"}`, {
            description: message.message.length > 40 ? `${message.message.substring(0, 40)}...` : message.message,
            action: {
              label: "Open Chat",
              onClick: () => {
                setSelectedChatTechId(message.senderId);
                setChatOpen(true);
              },
            },
          });
        }
      });
    }

    initBackgroundSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [role]);
  
  const navItems = getNavByRole(role);
  const config = roleConfig[role];

  // Define categories to show in top navbar
  const activeCategory = getCategoryFromPath(pathname);
  const ALL_CATEGORIES: NavCategory[] = [
    'DASHBOARD',
    'PORTFOLIO',
    'ASSETS',
    'WORK ORDERS',
    'PM',
    'INVENTORY',
    'REPORTS'
  ];
  const categories = ALL_CATEGORIES.filter(category => 
    navItems.some(item => getNavItemCategory(item) === category)
  );

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutUser();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background px-4 lg:px-6">
      <div className="flex items-center gap-6">
        {/* Mobile Menu Button */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] bg-sidebar p-0">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <div className="flex h-16 items-center border-b border-sidebar-border px-4">
              <Logo href="/dashboard" size="md" imageSize={54} showSubtitle />
            </div>
            {/* Role Badge Mobile */}
            <div className="border-b border-sidebar-border px-4 py-3">
              <div className="rounded-lg bg-sidebar-accent/50 px-3 py-2">
                <p className="text-xs font-medium text-sidebar-foreground/60">Current Role</p>
                <p className="text-sm font-semibold text-sidebar-primary">{config.label}</p>
              </div>
            </div>
            <nav className="space-y-1 px-3 py-4">
              {navItems.map((item) => {
                const Icon = iconMap[item.icon];
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    {Icon && <Icon className="h-5 w-5" />}
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <div className="hidden lg:block">
          <Logo href="/dashboard" size="md" imageSize={54} showSubtitle />
        </div>

        {/* Desktop Navbar Categories */}
        <nav className="hidden lg:flex items-center gap-1 h-full ml-6">
          {categories.map((category) => {
            const isActive = activeCategory === category;
            const href = getCategoryHref(category, navItems);
            return (
              <Link
                key={category}
                href={href}
                className={cn(
                  "relative flex items-center h-16 px-4 text-xs font-bold transition-colors uppercase tracking-wider border-b-2 border-transparent",
                  isActive
                    ? "text-primary border-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {category}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Search */}
      <div className="flex flex-1 items-center gap-4">
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Chat Drawer */}
        <Sheet open={chatOpen} onOpenChange={setChatOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative text-primary hover:text-primary hover:bg-primary/10" 
              title="Support Chat"
            >
              <MessageSquare className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-extrabold text-destructive-foreground animate-bounce shadow-md">
                  {unreadCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="right" 
            className="w-[90vw] sm:w-[600px] md:w-[750px] lg:w-[900px] sm:max-w-none p-0 flex flex-col bg-background border-l border-border h-full shadow-2xl"
          >
            <SheetTitle className="sr-only">Support Chat Widget</SheetTitle>
            <div className="flex-grow min-h-0 h-full">
              <ChatWidget initialSelectedTechId={selectedChatTechId} />
            </div>
          </SheetContent>
        </Sheet>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-[300px] overflow-y-auto">
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                <p className="text-sm font-medium">Work Order #1234 Completed</p>
                <p className="text-xs text-muted-foreground">Technician marked the work order as complete</p>
                <p className="text-xs text-muted-foreground">2 minutes ago</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                <p className="text-sm font-medium">Low Inventory Alert</p>
                <p className="text-xs text-muted-foreground">Hydraulic Filter stock is below minimum level</p>
                <p className="text-xs text-muted-foreground">15 minutes ago</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                <p className="text-sm font-medium">PM Schedule Due</p>
                <p className="text-xs text-muted-foreground">Monthly inspection for CNC Machine #3</p>
                <p className="text-xs text-muted-foreground">1 hour ago</p>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-primary">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                <span className="text-sm font-medium text-primary-foreground">{config.initials}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{userName}</span>
                <span className="text-xs font-normal text-muted-foreground">{userEmail}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {isLoggingOut ? "Logging out..." : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
