"use client";

import { use } from "react";
import Link from "next/link";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingFooter } from "@/components/landing/landing-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Factory, Stethoscope, Building, Plane, Zap, HardHat, CheckCircle2, ArrowRight } from "lucide-react";

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
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
      <LandingNavbar />

      <main className="flex-1 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl space-y-6">
            <Badge className="bg-[#54EC46]/10 text-[#54EC46] border-[#54EC46]/30 text-xs px-3 py-1 font-bold">
              INDUSTRY SPECIFIC CMMS
            </Badge>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-[#54EC46]">
                <Icon className="h-8 w-8" />
              </div>
              <h1 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">{info.title}</h1>
            </div>
            <p className="text-slate-300 text-lg leading-relaxed">{info.desc}</p>

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
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
