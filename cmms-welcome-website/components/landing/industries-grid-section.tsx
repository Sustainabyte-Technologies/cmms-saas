"use client";

import { Badge } from "@/components/ui/badge";
import { Factory, Stethoscope, Building, Plane, Zap, HardHat, Truck, ArrowRight } from "lucide-react";
import Link from "next/link";

export function IndustriesGridSection() {
  const industriesList = [
    { title: "Manufacturing & Heavy Equipment", slug: "manufacturing", icon: Factory, desc: "Minimize line stoppages, manage OEE, and streamline spare parts availability." },
    { title: "Hospitals & BioPharma", slug: "healthcare", icon: Stethoscope, desc: "Strict ISO compliance, medical asset calibration, and sterile facility management." },
    { title: "Commercial Real Estate & FM", slug: "facility-management", icon: Building, desc: "Manage multi-tenant sites, HVAC PM schedules, and tenant work requests." },
    { title: "Airports & Transportation", slug: "airports", icon: Plane, desc: "24/7 runway lighting, baggage conveyor reliability, and terminal assets." },
    { title: "Power Plants & Utilities", slug: "energy", icon: Zap, desc: "High-voltage grid assets, turbine maintenance, and regulatory audits." },
    { title: "Construction & Fleet Management", slug: "construction", icon: HardHat, desc: "Track heavy machinery, fuel consumption, and mobile work orders." },
  ];

  return (
    <section id="industries" className="bg-white py-24 text-slate-900 border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge className="bg-[#54EC46]/20 text-emerald-800 border-[#54EC46]/40 text-xs px-3 py-1 font-bold">
            INDUSTRY SOLUTIONS
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Engineered For Mission-Critical Sectors
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            FixByte is built with compliance standards, regulatory protocols, and operational models tailored to your industry.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {industriesList.map((ind) => {
            const Icon = ind.icon;
            return (
              <div
                key={ind.slug}
                className="group rounded-2xl border border-slate-200 bg-slate-50/80 p-6 space-y-4 hover:border-emerald-500/50 hover:bg-white hover:shadow-lg transition-all shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#54EC46]/20 text-emerald-700 group-hover:scale-110 transition-transform">
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{ind.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{ind.desc}</p>

                <Link
                  href={`/industries/${ind.slug}`}
                  className="inline-flex items-center text-xs font-bold text-emerald-700 hover:underline pt-2"
                >
                  Explore Industry Features <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
