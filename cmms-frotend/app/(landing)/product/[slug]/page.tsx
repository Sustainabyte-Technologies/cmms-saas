"use client";

import { use } from "react";
import Link from "next/link";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingFooter } from "@/components/landing/landing-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Box,
  Wrench,
  CalendarCheck,
  Package,
  ShieldAlert,
  FileCheck,
  Bot,
  Truck,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export default function ProductModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const productData: Record<string, any> = {
    assets: {
      title: "Asset Management & Master Directory",
      subtitle: "Unified asset lifecycle management, parent-child hierarchies, and QR code tracking.",
      icon: Box,
      features: [
        "Single Source of Truth: Centralized equipment specs, manuals, and warranty dates",
        "Multi-Tier Asset Tree: Unlimited parent-child component mapping",
        "QR Code & Barcode Scanning: Instant lookup on mobile devices",
        "Asset Criticality Matrix: Automated Risk Priority Number (RPN) scoring",
      ],
    },
    "work-orders": {
      title: "Work Order Management & Mobile Execution",
      subtitle: "Dispatch, track, and complete reactive and preventive work orders seamlessly.",
      icon: Wrench,
      features: [
        "Real-Time Dispatching: Auto-assign tasks to technicians based on skill & availability",
        "Mobile App: Technicians log labor hours, spare parts, and photos directly on site",
        "Multi-Tier Approval Engine: Automated sign-offs for high-cost repairs",
        "Audit Trail: Complete history of work order events and timestamped logs",
      ],
    },
    pm: {
      title: "Preventive Maintenance Automation",
      subtitle: "Eliminate unexpected breakdowns with automated calendar & meter-based triggers.",
      icon: CalendarCheck,
      features: [
        "Calendar & Meter Triggers: Schedule PM by days, running hours, or sensor data",
        "Interactive Checklists: Standard operating procedures with mandatory photo verification",
        "Work Order Auto-Generation: Zero human lag in dispatching recurring tasks",
        "Compliance Reporting: Track PM completion rates across all facilities",
      ],
    },
    inventory: {
      title: "Inventory & Spare Parts Management",
      subtitle: "Track inventory across warehouses, set min/max thresholds, and automate POs.",
      icon: Package,
      features: [
        "Multi-Warehouse Stock: Real-time inventory tracking by bin location",
        "Auto-Stock Update via GRN: Stock increases automatically when Goods Receipt is logged",
        "Low Stock Alerts: Instant notification when inventory drops below safety stock",
        "Stock Transaction Audits: Full ledger of material consumption per work order",
      ],
    },
    reliability: {
      title: "Reliability Engineering & Root Cause Analysis",
      subtitle: "Advanced MTTR, MTBF, 5-Why RCA, FMECA, and RCM strategy analytics.",
      icon: ShieldAlert,
      features: [
        "Automated MTTR & MTBF: Calculated directly from Asset master data",
        "Root Cause Analysis (RCA): Interactive 5-Why & Fishbone diagram tools",
        "FMECA Matrix: Severity, Occurrence, and Detection scoring",
        "Reliability Centered Maintenance (RCM): Condition-based strategy mapping",
      ],
    },
    amc: {
      title: "Annual Maintenance Contract (AMC) Module",
      subtitle: "Track AMC contracts, renewal alerts, vendor SLAs, and PDF certificates.",
      icon: FileCheck,
      features: [
        "Contract Lifecycle Directory: Master database of active, pending, and expired AMCs",
        "Auto PM Generation: Automatically schedule PM visits per AMC terms",
        "Professional PDF Reports: Download audit-ready AMC certificates in landscape/portrait",
        "Vendor Performance Metrics: Track response time and contract fulfillment",
      ],
    },
    ai: {
      title: "Artificial Intelligence & Anomaly Detection",
      subtitle: "Predictive failure alerts, Asset Health Scores (0-100), and AI chat assistant.",
      icon: Bot,
      features: [
        "14-Day Predictive Window: Identify friction and bearing wear before breakdown",
        "Asset Health Score (0-100): Composite rating calculated from real-time parameters",
        "Natural Language Assistant: Ask questions and receive instant data summaries",
        "Smart Work Order Drafting: AI drafts repair procedures and required parts",
      ],
    },
    vendors: {
      title: "Vendor & Procurement Management",
      subtitle: "Complete vendor directory, performance ratings, POs, and Goods Receipts (GRN).",
      icon: Truck,
      features: [
        "Vendor Master Profiles: Tax IDs, payment terms, contact details, and ratings",
        "Purchase Order Workflow: Issue, approve, and track purchase orders",
        "Goods Receipt Notes (GRN): Inspect received & rejected goods with stock sync",
        "Vendor Invoicing: Track invoice due dates, payments, and financial logs",
      ],
    },
  };

  const moduleInfo = productData[slug] || productData["assets"];
  const Icon = moduleInfo.icon;

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
      <LandingNavbar />

      <main className="flex-1 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Header */}
          <div className="max-w-3xl space-y-6">
            <Badge className="bg-[#54EC46]/10 text-[#54EC46] border-[#54EC46]/30 text-xs px-3 py-1 font-bold">
              PRODUCT MODULE
            </Badge>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-[#54EC46]">
                <Icon className="h-8 w-8" />
              </div>
              <h1 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">{moduleInfo.title}</h1>
            </div>
            <p className="text-slate-300 text-lg leading-relaxed">{moduleInfo.subtitle}</p>

            <div className="flex gap-4 pt-2">
              <Button asChild size="lg" className="bg-[#54EC46] text-slate-950 font-bold hover:bg-[#54EC46]/90 px-8">
                <Link href="/register">
                  Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-slate-700 bg-slate-900 text-white hover:bg-slate-800">
                <Link href="/book-demo">Book Demo</Link>
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid gap-6 sm:grid-cols-2">
            {moduleInfo.features.map((feat: string, idx: number) => {
              const [title, desc] = feat.split(": ");
              return (
                <Card key={idx} className="border-slate-800 bg-slate-900/60 p-6 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#54EC46]" />
                    <h3 className="text-base font-bold text-white">{title}</h3>
                  </div>
                  <p className="text-xs text-slate-400 pl-7 leading-relaxed">{desc}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
