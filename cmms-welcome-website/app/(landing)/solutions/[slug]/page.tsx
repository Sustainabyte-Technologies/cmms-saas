"use client";

import { use } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Wrench, Factory, ShieldCheck, TrendingUp, CheckCircle2, ArrowRight } from "lucide-react";
import { DASHBOARD_REGISTER_URL, DASHBOARD_BOOK_DEMO_URL } from "@/lib/config";

export default function SolutionPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const solutionData: Record<string, any> = {
    "maintenance-managers": {
      role: "Solutions for Maintenance Managers",
      headline: "Eliminate Work Order Chaos & Achieve 98% PM Compliance",
      icon: Wrench,
      benefits: [
        "Automated Work Order Dispatching to technicians on mobile",
        "Real-time visibility over spare parts inventory & stockouts",
        "Preventive Maintenance calendar automation",
        "Technician labor hour & performance tracking",
      ],
    },
    "plant-managers": {
      role: "Solutions for Plant & Operations Managers",
      headline: "Maximize Plant Availability & Reduce Downtime By 40%",
      icon: Factory,
      benefits: [
        "Single pane of glass for all facility equipment & production lines",
        "Predictive AI warnings before equipment failure occurs",
        "Increased Overall Equipment Effectiveness (OEE)",
        "Standardized safety compliance SOPs",
      ],
    },
    "reliability-engineers": {
      role: "Solutions for Reliability Engineers",
      headline: "Transform Raw Maintenance Data Into Predictive Intelligence",
      icon: ShieldCheck,
      benefits: [
        "Automated MTTR and MTBF metrics from Asset master data",
        "Root Cause Analysis (5-Why & Fishbone) workflow",
        "Failure Mode, Effects & Criticality Analysis (FMECA) matrix",
        "Condition-based RCM maintenance strategy mapping",
      ],
    },
    executives: {
      role: "Solutions for C-Suite & Finance Executives",
      headline: "Optimize Maintenance CapEx & Maximize Asset ROI",
      icon: TrendingUp,
      benefits: [
        "Clear financial metrics on total cost of asset ownership",
        "Audit-ready compliance reports for ISO 27001 & SOC-2",
        "Vendor performance analytics and AMC cost management",
        "Standardized multi-site enterprise reporting",
      ],
    },
  };

  const info = solutionData[slug] || solutionData["maintenance-managers"];
  const Icon = info.icon;

  return (
    <div className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-3xl space-y-6">
          <Badge className="bg-[#54EC46]/20 text-emerald-800 border-[#54EC46]/40 text-xs px-3 py-1 font-bold">
            ROLE-BASED SOLUTION
          </Badge>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#54EC46]/20 text-emerald-700">
              <Icon className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl lg:text-5xl">{info.role}</h1>
          </div>
          <p className="text-emerald-700 text-xl font-semibold leading-relaxed">{info.headline}</p>

          <div className="flex gap-4 pt-2">
            <Button asChild size="lg" className="bg-[#54EC46] text-slate-950 font-bold hover:bg-[#4BD63E] shadow-md shadow-emerald-500/20 px-8">
              <a href={DASHBOARD_REGISTER_URL}>
                Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-slate-300 bg-white text-slate-800 hover:bg-slate-100">
              <a href={DASHBOARD_BOOK_DEMO_URL}>Book Demo</a>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {info.benefits.map((b: string, idx: number) => (
            <Card key={idx} className="border-slate-200 bg-slate-50/80 p-6 flex items-start gap-3 shadow-sm hover:shadow-md transition-shadow">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-sm font-semibold text-slate-900 leading-relaxed">{b}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
