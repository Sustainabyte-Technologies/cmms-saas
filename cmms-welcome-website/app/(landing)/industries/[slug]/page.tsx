"use client";

import { use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Factory, Stethoscope, Building, Plane, Zap, HardHat, CheckCircle2, ArrowRight } from "lucide-react";
import { DASHBOARD_REGISTER_URL, DASHBOARD_BOOK_DEMO_URL } from "@/lib/config";

export default function IndustryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const industryData: Record<string, any> = {
    manufacturing: { title: "FixByte for Manufacturing & Heavy Equipment", icon: Factory, desc: "Eliminate production line downtime and manage spare parts stock." },
    healthcare: { title: "FixByte for Hospitals & Healthcare Facilities", icon: Stethoscope, desc: "Ensure strict ISO compliance and biomedical calibration." },
    "facility-management": { title: "FixByte for Commercial Real Estate & FM", icon: Building, desc: "Multi-tenant asset tracking and HVAC PM schedules." },
    airports: { title: "FixByte for Airports & Aviation Infrastructure", icon: Plane, desc: "24/7 runway lighting and conveyor belt reliability." },
    energy: { title: "FixByte for Power Plants & Energy Utilities", icon: Zap, desc: "High-voltage grid compliance and turbine maintenance." },
    construction: { title: "FixByte for Construction & Heavy Fleets", icon: HardHat, desc: "Mobile work orders and heavy equipment tracking." },
  };

  const info = industryData[slug] || industryData["manufacturing"];
  const Icon = info.icon;

  return (
    <div className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-3xl space-y-6">
          <Badge className="bg-[#54EC46]/20 text-emerald-800 border-[#54EC46]/40 text-xs px-3 py-1 font-bold">
            INDUSTRY SPECIFIC CMMS
          </Badge>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#54EC46]/20 text-emerald-700">
              <Icon className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl lg:text-5xl">{info.title}</h1>
          </div>
          <p className="text-slate-600 text-lg leading-relaxed">{info.desc}</p>

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
      </div>
    </div>
  );
}
