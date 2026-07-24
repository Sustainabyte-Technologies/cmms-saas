"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Building2, ShieldCheck, Target, Award, Users, CheckCircle2 } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge className="bg-[#54EC46]/20 text-emerald-800 border-[#54EC46]/40 text-xs px-3 py-1 font-bold">
            ABOUT FIXBYTE INC.
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Empowering Industrial Reliability Through AI & Machine Intelligence
          </h1>
          <p className="text-slate-600 text-base sm:text-lg">
            Our mission is to eliminate equipment breakdowns globally, allowing plants, hospitals, and infrastructure operators to operate at peak efficiency.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-slate-200 bg-slate-50/80 p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#54EC46]/20 text-emerald-700">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Our Mission</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Provide maintenance engineers and plant leaders with real-time predictive analytics, automated workflows, and simple tools that save lives and capital.
            </p>
          </Card>

          <Card className="border-slate-200 bg-slate-50/80 p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#54EC46]/20 text-emerald-700">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Enterprise Trust</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Built from the ground up with SOC-2 Type II certification, ISO 27001 data isolation, end-to-end encryption, and 99.99% availability guarantees.
            </p>
          </Card>

          <Card className="border-slate-200 bg-slate-50/80 p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#54EC46]/20 text-emerald-700">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Global Reach</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Serving 500+ industrial plants, airport facilities, and healthcare networks across North America, Europe, Asia-Pacific, and the Middle East.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
