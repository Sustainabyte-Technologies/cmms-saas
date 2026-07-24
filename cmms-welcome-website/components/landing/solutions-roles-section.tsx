"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Wrench,
  Factory,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export function SolutionsRolesSection() {
  const personas = [
    {
      role: "Maintenance Managers",
      slug: "maintenance-managers",
      desc: "Gain 360° visibility over work order backlogs, PM compliance rates, technician schedules, and spare parts availability.",
      icon: Wrench,
      metrics: "98% On-Time PM Execution",
    },
    {
      role: "Plant & Operations Managers",
      slug: "plant-managers",
      desc: "Eliminate costly production halts, extend overall equipment effectiveness (OEE), and enforce strict safety standards.",
      icon: Factory,
      metrics: "40% Downtime Reduction",
    },
    {
      role: "Reliability Engineers",
      slug: "reliability-engineers",
      desc: "Access real-time MTTR, MTBF, Root Cause Analysis (5-Why), FMECA risk scoring, and RCM strategy mappings.",
      icon: ShieldCheck,
      metrics: "Root Cause Intelligence",
    },
    {
      role: "C-Suite & Finance Executives",
      slug: "executives",
      desc: "Track total cost of asset ownership, maintenance ROI, capital expenditure budgeting, and vendor performance.",
      icon: TrendingUp,
      metrics: "35% Cost Optimization",
    },
  ];

  return (
    <section id="solutions" className="bg-slate-50/70 py-24 text-slate-900 border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge className="bg-[#54EC46]/20 text-emerald-800 border-[#54EC46]/40 text-xs px-3 py-1 font-bold">
            TAILORED SOLUTIONS
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Built For Every Role In Your Maintenance Ecosystem
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            Whether you are on the plant floor or in the boardroom, FixByte provides role-customized views and real-time data.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {personas.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.role}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-emerald-500/50 hover:shadow-lg shadow-sm"
              >
                <div className="space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#54EC46]/20 text-emerald-700 group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{p.role}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>
                </div>

                <div className="pt-6 space-y-3 border-t border-slate-100 mt-6">
                  <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 text-[11px] font-semibold">
                    {p.metrics}
                  </Badge>
                  <Link
                    href={`/solutions/${p.slug}`}
                    className="flex items-center text-xs font-bold text-emerald-700 hover:underline"
                  >
                    Learn More <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
