"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bot,
  Sparkles,
  Zap,
  Activity,
  Search,
  MessageSquare,
  TrendingDown,
  ShieldCheck,
  Cpu,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

export function AiShowcaseSection() {
  const aiCapabilities = [
    {
      title: "Predictive Failure Detection",
      desc: "Analyzes historical breakdown patterns and operating telemetry to predict component failures up to 14 days before downtime occurs.",
      icon: Activity,
    },
    {
      title: "Asset Health Score (0–100)",
      desc: "Real-time composite scoring calculated from vibration, thermal history, age, PM compliance, and work order frequency.",
      icon: Zap,
    },
    {
      title: "AI Natural Language Chat",
      desc: "Ask FixByte AI: 'Which pumps in Plant 2 are due for bearing maintenance this week?' and receive instant actionable summaries.",
      icon: MessageSquare,
    },
    {
      title: "Smart Work Order Auto-Generation",
      desc: "Automatically drafts work order tasks, required spare parts list, and safety precautions based on ISO failure modes.",
      icon: Bot,
    },
  ];

  return (
    <section className="relative overflow-hidden bg-slate-950 py-24 text-slate-50 border-b border-slate-800">
      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-[#54EC46]/10 blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Heading & Capabilities */}
          <div className="lg:col-span-6 space-y-6">
            <Badge className="bg-[#54EC46]/10 text-[#54EC46] border-[#54EC46]/30 text-xs px-3 py-1 font-bold">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              ARTIFICIAL INTELLIGENCE CORE
            </Badge>

            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl leading-tight">
              Shift From Reactive Firefighting To AI-Driven Reliability
            </h2>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              FixByte AI continuously monitors your entire equipment fleet, identifying anomalous friction, predicting MTTR/MTBF trends, and eliminating unplanned downtime before it impacts production.
            </p>

            <div className="grid gap-4 sm:grid-cols-2 pt-2">
              {aiCapabilities.map((cap) => {
                const Icon = cap.icon;
                return (
                  <div key={cap.title} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2 hover:border-[#54EC46]/40 transition-colors">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#54EC46]/10 text-[#54EC46]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-bold text-white">{cap.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{cap.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="pt-2">
              <Button asChild size="lg" className="bg-[#54EC46] text-slate-950 font-bold hover:bg-[#54EC46]/90 px-7">
                <Link href="/product/ai">
                  Explore AI Capabilities
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Column: AI Assistant Interface Mockup */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-[#54EC46]" />
                  <span className="text-sm font-bold text-white">FixByte AI Assistant</span>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]">Active Copilot</Badge>
              </div>

              {/* Chat Simulation */}
              <div className="space-y-3 font-sans text-xs">
                <div className="flex items-start gap-2.5 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                  <Bot className="h-5 w-5 text-[#54EC46] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-white">FixByte AI Alert</p>
                    <p className="text-slate-300">
                      ⚠️ Anomaly Detected on <span className="text-[#54EC46] font-semibold">Boiler #03</span>. Vibration amplitude increased by 28% over 48 hours. High probability of impeller seal degradation.
                    </p>
                  </div>
                </div>

                <div className="flex items-start justify-end gap-2.5">
                  <div className="bg-blue-600/20 text-blue-200 p-3 rounded-xl border border-blue-500/30 text-right max-w-xs">
                    <p>Auto-dispatch Work Order and reserve matching seal from inventory.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                  <Bot className="h-5 w-5 text-[#54EC46] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-[#54EC46]">Action Completed</p>
                    <p className="text-slate-300">
                      ✅ Work Order <span className="font-mono text-white">WO-2026-089</span> generated & assigned to Lead Technician. 2x Spare Seals <span className="font-mono text-white">SP-104</span> reserved from Main Warehouse.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
