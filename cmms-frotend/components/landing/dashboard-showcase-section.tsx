"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Box,
  Wrench,
  Package,
  ShieldAlert,
  FileCheck,
  CheckCircle2,
  TrendingUp,
  Cpu,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export function DashboardShowcaseSection() {
  const [activeModule, setActiveModule] = useState<"dashboard" | "assets" | "workOrders" | "inventory" | "reliability" | "amc">("dashboard");

  const modules = [
    { id: "dashboard", label: "Executive Dashboard", icon: LayoutDashboard },
    { id: "assets", label: "Asset Hierarchy", icon: Box },
    { id: "workOrders", label: "Work Orders", icon: Wrench },
    { id: "inventory", label: "Spare Parts", icon: Package },
    { id: "reliability", label: "Reliability & RCA", icon: ShieldAlert },
    { id: "amc", label: "AMC Contracts", icon: FileCheck },
  ];

  return (
    <section className="bg-slate-950 py-24 text-slate-50 border-b border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge className="bg-[#54EC46]/10 text-[#54EC46] border-[#54EC46]/30 text-xs px-3 py-1 font-bold">
            INTERACTIVE PRODUCT SHOWCASE
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            One Unified Operating System for All Industrial Maintenance
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Say goodbye to fragmented spreadsheets and legacy desktop software. FixByte integrates every department into a single intuitive interface.
          </p>
        </div>

        {/* Module Selector Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 border-b border-slate-800 pb-4">
          {modules.map((m) => {
            const Icon = m.icon;
            const isActive = activeModule === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setActiveModule(m.id as any)}
                className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all ${
                  isActive
                    ? "bg-[#54EC46] text-slate-950 shadow-lg shadow-[#54EC46]/20 scale-105"
                    : "bg-slate-900/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                {m.label}
              </button>
            );
          })}
        </div>

        {/* Live UI Preview Canvas */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl space-y-6">
          {activeModule === "dashboard" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Plant Operations Command Center</h3>
                  <p className="text-xs text-slate-400">Real-time telemetry, asset utilization, and work order velocity</p>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Live Data Sync</Badge>
              </div>

              <div className="grid gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-xs font-semibold text-slate-400">Active Work Orders</p>
                  <p className="text-2xl font-extrabold text-white mt-1">142</p>
                  <p className="text-[11px] text-emerald-400 mt-1">94% On-Schedule</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-xs font-semibold text-slate-400">PM Compliance</p>
                  <p className="text-2xl font-extrabold text-[#54EC46] mt-1">98.8%</p>
                  <p className="text-[11px] text-[#54EC46] mt-1">Target: &gt;95%</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-xs font-semibold text-slate-400">Inventory Stock Value</p>
                  <p className="text-2xl font-extrabold text-blue-400 mt-1">$482,900</p>
                  <p className="text-[11px] text-blue-400 mt-1">12 Low-stock alerts</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-xs font-semibold text-slate-400">Active AMC Contracts</p>
                  <p className="text-2xl font-extrabold text-amber-400 mt-1">28</p>
                  <p className="text-[11px] text-amber-400 mt-1">3 Renewals Due</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeModule === "assets" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white">Asset Master Directory & Parent-Child Tree</h3>
                <span className="text-xs text-slate-400">Includes barcode/QR, warranty, serial & specs</span>
              </div>
              <div className="space-y-2">
                {[
                  { code: "AST-001", name: "Centrifugal Water Pump 50HP #1", cat: "Pumps & Hydronics", loc: "Boiler Room 4B", status: "ACTIVE" },
                  { code: "AST-002", name: "3-Phase Induction Motor 75kW", cat: "Motors & Drives", loc: "Production Line A", status: "UNDER_MAINTENANCE" },
                  { code: "AST-003", name: "High-Pressure Steam Boiler 200HP", cat: "Boilers & Thermal", loc: "Utilities Wing", status: "ACTIVE" },
                ].map((item) => (
                  <div key={item.code} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 font-bold text-[#54EC46]">
                        {item.code.slice(-3)}
                      </div>
                      <div>
                        <p className="font-bold text-white">{item.name}</p>
                        <p className="text-[11px] text-slate-400">{item.cat} • {item.loc}</p>
                      </div>
                    </div>
                    <Badge className={item.status === "ACTIVE" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-amber-500/20 text-amber-400"}>
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeModule === "workOrders" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white">Work Order Dispatching & Mobile Execution</h3>
                <span className="text-xs text-slate-400">Auto-assigned to technicians with labor & parts logging</span>
              </div>
              <div className="space-y-2">
                {[
                  { wo: "WO-2026-0041", title: "Emergency Bearing Replacement", prio: "HIGH", tech: "John Williams", status: "IN_PROGRESS" },
                  { wo: "WO-2026-0042", title: "Monthly Preventive Inspection", prio: "MEDIUM", tech: "Sarah Miller", status: "COMPLETED" },
                ].map((w) => (
                  <div key={w.wo} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-xs">
                    <div className="flex items-center gap-3">
                      <Wrench className="h-4 w-4 text-[#54EC46]" />
                      <div>
                        <p className="font-bold text-white">{w.wo}: {w.title}</p>
                        <p className="text-[11px] text-slate-400">Assigned Tech: {w.tech}</p>
                      </div>
                    </div>
                    <Badge className="bg-[#54EC46]/10 text-[#54EC46] border-[#54EC46]/30">{w.status}</Badge>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeModule === "reliability" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white">Reliability Engineering (MTTR, MTBF, RCA, FMECA)</h3>
                <span className="text-xs text-slate-400">Calculated strictly from Asset master data</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-slate-400 font-semibold">Mean Time To Repair (MTTR)</p>
                  <p className="text-2xl font-extrabold text-[#54EC46] mt-1">1.4 hrs</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-slate-400 font-semibold">Mean Time Between Failures (MTBF)</p>
                  <p className="text-2xl font-extrabold text-blue-400 mt-1">740 hrs</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-slate-400 font-semibold">Overall Reliability Score</p>
                  <p className="text-2xl font-extrabold text-amber-400 mt-1">98 / 100</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeModule === "inventory" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white">Spare Parts Inventory & Purchase Management</h3>
                <span className="text-xs text-slate-400">Automatic Stock updates via Goods Receipt (GRN)</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3.5">
                  <div>
                    <p className="font-bold text-white">SP-104: Mechanical Shaft Seal 50mm</p>
                    <p className="text-slate-400 text-[11px]">Warehouse A • Bin 42</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#54EC46]">Current Stock: 48 Pcs</p>
                    <p className="text-slate-400 text-[11px]">Min: 10 Pcs</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeModule === "amc" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white">Annual Maintenance Contract (AMC) Management</h3>
                <span className="text-xs text-slate-400">Contract expiry warnings, covered assets & PDF certificates</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3.5">
                  <div>
                    <p className="font-bold text-white">AMC-2026-001: HVAC Annual Comprehensive Service</p>
                    <p className="text-slate-400 text-[11px]">Customer: BioHealth Labs • Value: $24,000</p>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-400">ACTIVE CONTRACT</Badge>
                </div>
              </div>
            </motion.div>
          )}

          <div className="pt-2 flex justify-end">
            <Button asChild size="sm" className="bg-[#54EC46] text-slate-950 font-bold hover:bg-[#54EC46]/90">
              <Link href="/register">
                Explore Full Platform <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
