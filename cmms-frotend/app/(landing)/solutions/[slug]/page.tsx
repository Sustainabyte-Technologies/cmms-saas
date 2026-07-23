"use client";

import { use } from "react";
import Link from "next/link";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingFooter } from "@/components/landing/landing-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Wrench, Factory, ShieldCheck, TrendingUp, CheckCircle2, ArrowRight } from "lucide-react";

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
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
      <LandingNavbar />

      <main className="flex-1 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl space-y-6">
            <Badge className="bg-[#54EC46]/10 text-[#54EC46] border-[#54EC46]/30 text-xs px-3 py-1 font-bold">
              ROLE-BASED SOLUTION
            </Badge>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-[#54EC46]">
                <Icon className="h-8 w-8" />
              </div>
              <h1 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">{info.role}</h1>
            </div>
            <p className="text-slate-300 text-xl font-semibold leading-relaxed text-[#54EC46]">{info.headline}</p>

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

          <div className="grid gap-4 sm:grid-cols-2">
            {info.benefits.map((b: string, idx: number) => (
              <Card key={idx} className="border-slate-800 bg-slate-900/60 p-6 flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#54EC46] shrink-0 mt-0.5" />
                <p className="text-sm font-semibold text-white leading-relaxed">{b}</p>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
