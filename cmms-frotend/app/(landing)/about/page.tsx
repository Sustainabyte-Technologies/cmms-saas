"use client";

import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingFooter } from "@/components/landing/landing-footer";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Building2, ShieldCheck, Target, Award, Users, CheckCircle2 } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
      <LandingNavbar />

      <main className="flex-1 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <Badge className="bg-[#54EC46]/10 text-[#54EC46] border-[#54EC46]/30 text-xs px-3 py-1 font-bold">
              ABOUT FIXBYTE INC.
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Empowering Industrial Reliability Through AI & Machine Intelligence
            </h1>
            <p className="text-slate-300 text-base sm:text-lg">
              Our mission is to eliminate equipment breakdowns globally, allowing plants, hospitals, and infrastructure operators to operate at peak efficiency.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-slate-800 bg-slate-900/60 p-6 space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#54EC46]/10 text-[#54EC46]">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Our Mission</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Provide maintenance engineers and plant leaders with real-time predictive analytics, automated workflows, and simple tools that save lives and capital.
              </p>
            </Card>

            <Card className="border-slate-800 bg-slate-900/60 p-6 space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#54EC46]/10 text-[#54EC46]">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Enterprise Trust</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Built from the ground up with SOC-2 Type II certification, ISO 27001 data isolation, end-to-end encryption, and 99.99% availability guarantees.
              </p>
            </Card>

            <Card className="border-slate-800 bg-slate-900/60 p-6 space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#54EC46]/10 text-[#54EC46]">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Global Reach</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Serving 500+ industrial plants, airport facilities, and healthcare networks across North America, Europe, Asia-Pacific, and the Middle East.
              </p>
            </Card>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
