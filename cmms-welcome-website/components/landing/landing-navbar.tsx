"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/logo";
import { DASHBOARD_LOGIN_URL, DASHBOARD_REGISTER_URL, DASHBOARD_BOOK_DEMO_URL } from "@/lib/config";
import {
  ChevronDown,
  Menu,
  Box,
  Wrench,
  CalendarCheck,
  Package,
  ShieldAlert,
  FileCheck,
  Bot,
  Truck,
  BookOpen,
  Calculator,
  Award,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [productMenuOpen, setProductMenuOpen] = useState(false);
  const [resourcesMenuOpen, setResourcesMenuOpen] = useState(false);

  const productModules = [
    { name: "Asset Management", desc: "Single source of truth for asset lifecycle & hierarchy", href: "/product/assets", icon: Box },
    { name: "Work Orders", desc: "Streamline dispatching, tracking, and execution", href: "/product/work-orders", icon: Wrench },
    { name: "Preventive Maintenance", desc: "Automate calendar and meter-based PM schedules", href: "/product/pm", icon: CalendarCheck },
    { name: "Inventory & Spare Parts", desc: "Real-time stock, minimum thresholds, and POs", href: "/product/inventory", icon: Package },
    { name: "Reliability Engineering", desc: "MTTR, MTBF, RCA, FMECA & RCM analytics", href: "/product/reliability", icon: ShieldAlert },
    { name: "AMC Management", desc: "Contract lifecycle, service history & certificates", href: "/product/amc", icon: FileCheck },
    { name: "AI Anomaly Detection", desc: "Failure prediction, asset health, & smart search", href: "/product/ai", icon: Bot },
    { name: "Vendor Management", desc: "Supplier performance, purchase orders, & GRN", href: "/product/vendors", icon: Truck },
  ];

  const resourceLinks = [
    { name: "Resource & Knowledge Base", desc: "Articles on CMMS, AI, and maintenance best practices", href: "/blog", icon: BookOpen },
    { name: "Interactive ROI Calculator", desc: "Calculate downtime savings and platform return", href: "/#roi-calculator", icon: Calculator },
    { name: "Customer Case Studies", desc: "Before and after success stories from enterprise clients", href: "/#testimonials", icon: Award },
  ];

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70"
    >
      <nav className="flex h-20 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Logo href="/" size="lg" showSubtitle={false} />
        </motion.div>

        {/* Desktop Navigation Links & Mega Menus */}
        <div className="hidden items-center gap-6 md:flex">
          <Link href="/" className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">
            Home
          </Link>

          {/* Products Mega Menu */}
          <div
            className="relative"
            onMouseEnter={() => setProductMenuOpen(true)}
            onMouseLeave={() => setProductMenuOpen(false)}
          >
            <button className="flex items-center gap-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground py-2">
              Products
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${productMenuOpen ? "rotate-180 text-primary" : ""}`} />
            </button>

            <AnimatePresence>
              {productMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-1/2 -translate-x-1/2 top-full w-[720px] rounded-2xl border border-border/80 bg-background/95 p-6 shadow-2xl backdrop-blur-2xl grid grid-cols-2 gap-3"
                >
                  {productModules.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="group flex items-start gap-3.5 rounded-xl p-3 transition-colors hover:bg-muted/60"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{item.desc}</p>
                        </div>
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link href="/#solutions" className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">
            Solutions
          </Link>

          <Link href="/#industries" className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">
            Industries
          </Link>

          <Link href="/pricing" className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">
            Pricing
          </Link>

          {/* Resources Mega Menu */}
          <div
            className="relative"
            onMouseEnter={() => setResourcesMenuOpen(true)}
            onMouseLeave={() => setResourcesMenuOpen(false)}
          >
            <button className="flex items-center gap-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground py-2">
              Resources
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${resourcesMenuOpen ? "rotate-180 text-primary" : ""}`} />
            </button>

            <AnimatePresence>
              {resourcesMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-1/2 -translate-x-1/2 top-full w-[420px] rounded-2xl border border-border/80 bg-background/95 p-5 shadow-2xl backdrop-blur-2xl space-y-2"
                >
                  {resourceLinks.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="group flex items-start gap-3.5 rounded-xl p-3 transition-colors hover:bg-muted/60"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{item.desc}</p>
                        </div>
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link href="/about" className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">
            About Us
          </Link>
        </div>

        {/* Desktop CTA Action Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" asChild className="font-semibold text-sm">
            <a href={DASHBOARD_LOGIN_URL}>Login</a>
          </Button>

          <Button variant="outline" asChild className="font-semibold text-sm border-primary/40 text-foreground hover:bg-primary/10">
            <a href={DASHBOARD_BOOK_DEMO_URL}>Book Live Demo</a>
          </Button>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button asChild className="font-bold text-sm bg-primary text-slate-950 hover:bg-primary/90 shadow-lg shadow-primary/20">
              <a href={DASHBOARD_REGISTER_URL}>
                Start Free Trial
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </a>
            </Button>
          </motion.div>
        </div>

        {/* Mobile Toggle */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[320px] sm:w-[400px]">
            <div className="flex flex-col gap-6 pt-6">
              <Logo href="/" size="md" showSubtitle={false} />

              <div className="flex flex-col gap-3">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Product Modules</p>
                {productModules.map((m) => (
                  <Link
                    key={m.name}
                    href={m.href}
                    onClick={() => setIsOpen(false)}
                    className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {m.name}
                  </Link>
                ))}
              </div>

              <div className="flex flex-col gap-3 border-t pt-4">
                <Link href="/" onClick={() => setIsOpen(false)} className="text-sm font-semibold text-foreground">Home</Link>
                <Link href="/pricing" onClick={() => setIsOpen(false)} className="text-sm font-semibold text-foreground">Pricing</Link>
                <Link href="/blog" onClick={() => setIsOpen(false)} className="text-sm font-semibold text-foreground">Blog & Resources</Link>
                <Link href="/about" onClick={() => setIsOpen(false)} className="text-sm font-semibold text-foreground">About Us</Link>
              </div>

              <div className="flex flex-col gap-3 border-t pt-6">
                <Button variant="outline" asChild className="w-full">
                  <a href={DASHBOARD_LOGIN_URL} onClick={() => setIsOpen(false)}>Login</a>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <a href={DASHBOARD_BOOK_DEMO_URL} onClick={() => setIsOpen(false)}>Book Demo</a>
                </Button>
                <Button asChild className="w-full bg-primary text-slate-950 font-bold">
                  <a href={DASHBOARD_REGISTER_URL} onClick={() => setIsOpen(false)}>Start Free Trial</a>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </motion.header>
  );
}
