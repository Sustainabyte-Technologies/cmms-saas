"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ArrowRight,
  Play,
  CheckCircle2,
  ShieldAlert,
  Activity,
  Wrench,
  Package,
  Cpu,
  BarChart3,
  Zap,
} from "lucide-react";
import { useState } from "react";

export function HeroSection() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "assets" | "workOrders" | "ai">("dashboard");

  return (
    <section className="relative overflow-hidden bg-slate-950 pt-16 pb-24 lg:pt-24 lg:pb-32 text-slate-50">
      {/* Background Gradients & Animated Blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-[#54EC46]/10 blur-[140px]" />
        <div className="absolute top-1/2 -right-40 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[130px]" />
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-purple-500/10 blur-[150px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-8">
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-[#54EC46]/30 bg-[#54EC46]/10 px-4 py-1.5 text-xs font-semibold text-[#54EC46] shadow-sm backdrop-blur-md"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Next-Gen Enterprise CMMS & EAM</span>
              <span className="h-1 w-1 rounded-full bg-[#54EC46]" />
              <span className="text-slate-300 font-normal">v4.0 Live</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white leading-[1.1]"
            >
              Modern AI-Powered <br />
              <span className="bg-gradient-to-r from-[#54EC46] via-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Enterprise CMMS
              </span> Platform
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base text-slate-300 sm:text-lg lg:text-xl max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed"
            >
              Manage Assets, Preventive Maintenance, Work Orders, Inventory, Reliability, AMC, Vendors, and AI Predictions from one unified intelligent platform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <Button asChild size="lg" className="w-full sm:w-auto font-bold bg-[#54EC46] text-slate-950 hover:bg-[#54EC46]/90 shadow-xl shadow-[#54EC46]/20 text-base h-13 px-8">
                <Link href="/register">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto font-semibold border-slate-700 bg-slate-900/80 text-white hover:bg-slate-800 hover:text-white h-13 px-7">
                <Link href="/book-demo">
                  Book Live Demo
                </Link>
              </Button>

              <Button size="lg" variant="ghost" className="w-full sm:w-auto font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 h-13 px-5">
                <Play className="mr-2 h-4 w-4 fill-slate-300" /> Watch Product Tour
              </Button>
            </motion.div>

            {/* Feature Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs font-medium text-slate-400"
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#54EC46]" /> 14-Day Free Trial
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#54EC46]" /> No Credit Card Required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#54EC46]" /> ISO 27001 & SOC-2 Certified
              </span>
            </motion.div>
          </div>

          {/* Right Column: Interactive Animated Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-6 relative"
          >
            <div className="relative rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-2xl backdrop-blur-xl">
              {/* Window Bar Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 px-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 font-mono text-xs text-slate-400">fixbyte-app.com/dashboard</span>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-800/60 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab("dashboard")}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                      activeTab === "dashboard" ? "bg-[#54EC46] text-slate-950" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => setActiveTab("assets")}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                      activeTab === "assets" ? "bg-[#54EC46] text-slate-950" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Assets
                  </button>
                  <button
                    onClick={() => setActiveTab("ai")}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                      activeTab === "ai" ? "bg-[#54EC46] text-slate-950" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    AI Analytics
                  </button>
                </div>
              </div>

              {/* Main Dashboard Screen Mockup */}
              <div className="pt-4 space-y-4">
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Asset Health</p>
                    <p className="text-xl font-extrabold text-[#54EC46] mt-0.5">98.4%</p>
                    <p className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-0.5">
                      <Zap className="h-2.5 w-2.5" /> Optimal Performance
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Mean Time To Repair</p>
                    <p className="text-xl font-extrabold text-blue-400 mt-0.5">1.2 hrs</p>
                    <p className="text-[10px] text-blue-400 flex items-center gap-0.5 mt-0.5">
                      <BarChart3 className="h-2.5 w-2.5" /> -42% vs Baseline
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Annual Cost Savings</p>
                    <p className="text-xl font-extrabold text-amber-400 mt-0.5">$142,500</p>
                    <p className="text-[10px] text-amber-400 flex items-center gap-0.5 mt-0.5">
                      <CheckCircle2 className="h-2.5 w-2.5" /> Projected ROI
                    </p>
                  </div>
                </div>

                {/* Main Graph & AI Intelligence Block */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-[#54EC46]" />
                      <span className="text-xs font-bold text-slate-200">AI Anomaly & Predictive Maintenance Engine</span>
                    </div>
                    <Badge className="bg-[#54EC46]/10 text-[#54EC46] border-[#54EC46]/30 text-[10px]">Real-Time Monitoring</Badge>
                  </div>

                  {/* Simulated Sparkline / Bar Chart */}
                  <div className="flex items-end gap-1.5 h-20 pt-2 px-1">
                    {[45, 65, 80, 55, 90, 95, 70, 85, 98, 92, 88, 96, 100].map((val, idx) => (
                      <div key={idx} className="flex-1 bg-slate-800 rounded-t-sm relative group overflow-hidden" style={{ height: `${val}%` }}>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#54EC46]/20 to-[#54EC46]" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Live Alert Card 1 */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -right-6 rounded-xl border border-emerald-500/30 bg-slate-900/95 p-3.5 shadow-2xl backdrop-blur-xl hidden sm:flex items-center gap-3"
              >
                <div className="h-9 w-9 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Chiller #04 Prevented Breakdown</p>
                  <p className="text-[11px] text-slate-400">AI auto-scheduled bearing replacement</p>
                </div>
              </motion.div>

              {/* Floating Live Alert Card 2 */}
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-6 -left-6 rounded-xl border border-blue-500/30 bg-slate-900/95 p-3.5 shadow-2xl backdrop-blur-xl hidden sm:flex items-center gap-3"
              >
                <div className="h-9 w-9 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">PM Compliance 99.2%</p>
                  <p className="text-[11px] text-slate-400">142 Work Orders Auto-Dispatched</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
