"use client";

import { motion } from "framer-motion";
import { Factory, ShieldCheck, Building, Plane, Stethoscope, Zap, HardHat, Truck } from "lucide-react";

export function TrustSection() {
  const industries = [
    { name: "Manufacturing", icon: Factory, text: "Automotive & Heavy Gear" },
    { name: "Healthcare", icon: Stethoscope, text: "Hospitals & BioPharma" },
    { name: "Facilities", icon: Building, text: "Commercial Real Estate" },
    { name: "Aviation", icon: Plane, text: "Airports & Hangers" },
    { name: "Energy & Utilities", icon: Zap, text: "Power Plants & Grid" },
    { name: "Infrastructure", icon: HardHat, text: "Civil & Construction" },
    { name: "Logistics", icon: Truck, text: "Supply Chain & Warehouses" },
  ];

  return (
    <section className="border-y border-slate-200 bg-white py-16 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">
            TRUSTED BY INDUSTRY LEADERS WORLDWIDE
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Powering Operations for Global Enterprises & Mission-Critical Infrastructure
          </h2>
        </div>

        {/* Industry Badge Marquee / Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          {industries.map((ind, idx) => {
            const Icon = ind.icon;
            return (
              <motion.div
                key={ind.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                viewport={{ once: true }}
                className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-center hover:border-emerald-500/40 hover:bg-emerald-50/30 transition-all shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#54EC46]/20 text-emerald-700 mb-2">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-slate-900">{ind.name}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{ind.text}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Big Statistics Bar */}
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-6 shadow-sm">
          <div className="text-center space-y-1">
            <p className="text-3xl font-extrabold text-emerald-600 sm:text-4xl">500+</p>
            <p className="text-xs font-medium text-slate-600">Enterprise Facilities</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-3xl font-extrabold text-blue-600 sm:text-4xl">2.5M+</p>
            <p className="text-xs font-medium text-slate-600">Critical Assets Managed</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-3xl font-extrabold text-amber-600 sm:text-4xl">99.99%</p>
            <p className="text-xs font-medium text-slate-600">Platform Availability SLA</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-3xl font-extrabold text-teal-600 sm:text-4xl">40%</p>
            <p className="text-xs font-medium text-slate-600">Average Downtime Reduction</p>
          </div>
        </div>
      </div>
    </section>
  );
}
