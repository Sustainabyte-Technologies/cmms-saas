"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, DollarSign, TrendingUp, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { DASHBOARD_BOOK_DEMO_URL } from "@/lib/config";

export function RoiCalculatorSection() {
  const [assetCount, setAssetCount] = useState(150);
  const [downtimeCostPerHour, setDowntimeCostPerHour] = useState(2500);
  const [annualUnplannedHours, setAnnualUnplannedHours] = useState(120);

  // ROI Math calculations
  const totalCurrentDowntimeCost = annualUnplannedHours * downtimeCostPerHour;
  const estimatedSavings = Math.round(totalCurrentDowntimeCost * 0.4); // 40% reduction
  const paybackPeriodMonths = 1.8;

  return (
    <section id="roi-calculator" className="bg-slate-50/70 py-24 text-slate-900 border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge className="bg-[#54EC46]/20 text-emerald-800 border-[#54EC46]/40 text-xs px-3 py-1 font-bold">
            <Calculator className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
            ENTERPRISE ROI CALCULATOR
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Calculate Your Plant's Cost Savings With FixByte
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            See how much your organization will save by eliminating unplanned equipment downtime and optimizing PM compliance.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 lg:items-center max-w-5xl mx-auto rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          {/* Inputs Column */}
          <div className="lg:col-span-6 space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Operational Inputs</h3>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <Label className="text-slate-700">Number of Critical Assets</Label>
                <span className="text-emerald-700 font-bold">{assetCount} Assets</span>
              </div>
              <input
                type="range"
                min="10"
                max="2000"
                value={assetCount}
                onChange={(e) => setAssetCount(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-200 rounded-lg cursor-pointer h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <Label className="text-slate-700">Estimated Hourly Downtime Cost ($)</Label>
                <span className="text-emerald-700 font-bold">${downtimeCostPerHour.toLocaleString("en-US")}/hr</span>
              </div>
              <input
                type="range"
                min="500"
                max="25000"
                step="500"
                value={downtimeCostPerHour}
                onChange={(e) => setDowntimeCostPerHour(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-200 rounded-lg cursor-pointer h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <Label className="text-slate-700">Annual Unplanned Downtime Hours</Label>
                <span className="text-emerald-700 font-bold">{annualUnplannedHours} Hours / Year</span>
              </div>
              <input
                type="range"
                min="20"
                max="1000"
                step="10"
                value={annualUnplannedHours}
                onChange={(e) => setAnnualUnplannedHours(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-200 rounded-lg cursor-pointer h-2"
              />
            </div>
          </div>

          {/* Results Output Column */}
          <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-6 space-y-6 text-center">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Projected Annual Savings</h3>

            <div className="space-y-1">
              <p className="text-4xl font-extrabold text-emerald-600 sm:text-5xl">
                ${estimatedSavings.toLocaleString("en-US")}
              </p>
              <p className="text-xs text-slate-500 font-medium">Net Financial Savings Per Year</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <p className="text-slate-500 font-medium">Estimated Payback</p>
                <p className="text-lg font-bold text-slate-900 mt-0.5">&lt; {paybackPeriodMonths} Months</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <p className="text-slate-500 font-medium">Downtime Reduction</p>
                <p className="text-lg font-bold text-emerald-600 mt-0.5">40% Decrease</p>
              </div>
            </div>

            <Button asChild className="w-full font-bold bg-[#54EC46] text-slate-950 hover:bg-[#4BD63E] shadow-md shadow-emerald-500/20 py-6">
              <a href={DASHBOARD_BOOK_DEMO_URL}>
                Request Custom ROI Analysis <ArrowRight className="ml-1.5 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
