"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, DollarSign, TrendingUp, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export function RoiCalculatorSection() {
  const [assetCount, setAssetCount] = useState(150);
  const [downtimeCostPerHour, setDowntimeCostPerHour] = useState(2500);
  const [annualUnplannedHours, setAnnualUnplannedHours] = useState(120);

  // ROI Math calculations
  const totalCurrentDowntimeCost = annualUnplannedHours * downtimeCostPerHour;
  const estimatedSavings = Math.round(totalCurrentDowntimeCost * 0.4); // 40% reduction
  const paybackPeriodMonths = 1.8;

  return (
    <section id="roi-calculator" className="bg-slate-950 py-24 text-slate-50 border-b border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge className="bg-[#54EC46]/10 text-[#54EC46] border-[#54EC46]/30 text-xs px-3 py-1 font-bold">
            <Calculator className="mr-1.5 h-3.5 w-3.5" />
            ENTERPRISE ROI CALCULATOR
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Calculate Your Plant's Cost Savings With FixByte
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            See how much your organization will save by eliminating unplanned equipment downtime and optimizing PM compliance.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 lg:items-center max-w-5xl mx-auto rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
          {/* Inputs Column */}
          <div className="lg:col-span-6 space-y-6">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Operational Inputs</h3>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <Label>Number of Critical Assets</Label>
                <span className="text-[#54EC46] font-bold">{assetCount} Assets</span>
              </div>
              <input
                type="range"
                min="10"
                max="2000"
                value={assetCount}
                onChange={(e) => setAssetCount(Number(e.target.value))}
                className="w-full accent-[#54EC46] bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <Label>Estimated Hourly Downtime Cost ($)</Label>
                <span className="text-[#54EC46] font-bold">${downtimeCostPerHour.toLocaleString()}/hr</span>
              </div>
              <input
                type="range"
                min="500"
                max="25000"
                step="500"
                value={downtimeCostPerHour}
                onChange={(e) => setDowntimeCostPerHour(Number(e.target.value))}
                className="w-full accent-[#54EC46] bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <Label>Annual Unplanned Downtime Hours</Label>
                <span className="text-[#54EC46] font-bold">{annualUnplannedHours} Hours / Year</span>
              </div>
              <input
                type="range"
                min="20"
                max="1000"
                step="10"
                value={annualUnplannedHours}
                onChange={(e) => setAnnualUnplannedHours(Number(e.target.value))}
                className="w-full accent-[#54EC46] bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Results Output Column */}
          <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-6 text-center">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Projected Annual Savings</h3>

            <div className="space-y-1">
              <p className="text-4xl font-extrabold text-[#54EC46] sm:text-5xl">
                ${estimatedSavings.toLocaleString()}
              </p>
              <p className="text-xs text-slate-400">Net Financial Savings Per Year</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                <p className="text-slate-400 font-medium">Estimated Payback</p>
                <p className="text-lg font-bold text-white mt-0.5">&lt; {paybackPeriodMonths} Months</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                <p className="text-slate-400 font-medium">Downtime Reduction</p>
                <p className="text-lg font-bold text-emerald-400 mt-0.5">40% Decrease</p>
              </div>
            </div>

            <Button asChild className="w-full font-bold bg-[#54EC46] text-slate-950 hover:bg-[#54EC46]/90 py-6">
              <Link href="/book-demo">
                Request Custom ROI Analysis <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
