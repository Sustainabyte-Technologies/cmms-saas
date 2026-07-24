"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { DASHBOARD_URL } from "@/lib/config";

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: "Starter",
      desc: "Ideal for small plants & facility teams replacing paper/Excel.",
      priceMonthly: 59,
      priceAnnual: 49,
      highlighted: false,
      features: [
        "Up to 500 Critical Assets",
        "Work Orders & Work Requests",
        "Calendar Preventive Maintenance",
        "Basic Inventory & Spare Parts",
        "Mobile App Access",
        "Standard Email Support",
      ],
      cta: "Start Free Trial",
      href: "/register",
    },
    {
      name: "Professional",
      desc: "For growing industrial operations requiring AI analytics & vendor workflows.",
      priceMonthly: 189,
      priceAnnual: 149,
      highlighted: true,
      badge: "MOST POPULAR",
      features: [
        "Unlimited Assets & Warehouses",
        "AI Anomaly Detection & Failure Predictions",
        "Reliability Engineering (MTTR, MTBF, RCA)",
        "Purchase Management & GRN Auto-Stock",
        "Annual Maintenance Contract (AMC) Module",
        "QR / Barcode Scanner Integration",
        "Priority 24/7 Phone & Ticket Support",
      ],
      cta: "Start Free Trial",
      href: "/register",
    },
    {
      name: "Enterprise",
      desc: "For multi-site corporations & mission-critical infrastructure.",
      priceMonthly: 449,
      priceAnnual: 399,
      highlighted: false,
      features: [
        "All Professional Features Included",
        "Custom AI Prediction Models",
        "Single Sign-On (SSO / SAML / Azure AD)",
        "Dedicated Customer Success Manager",
        "99.99% Uptime Guarantee SLA",
        "Custom SAP, Maximo, ERP Integrations",
        "Full Audit Log & Regulatory Compliance",
      ],
      cta: "Book Live Demo",
      href: "/book-demo",
    },
  ];

  return (
    <section id="pricing" className="bg-slate-50/70 py-24 text-slate-900 border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge className="bg-[#54EC46]/20 text-emerald-800 border-[#54EC46]/40 text-xs px-3 py-1 font-bold">
            TRANSPARENT ENTERPRISE PRICING
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Predictable Plans That Scale With Your Operations
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            All plans include a 14-day free trial, full onboarding support, and zero hidden setup fees.
          </p>

          {/* Monthly / Annual Toggle */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <span className={`text-xs font-semibold ${!isAnnual ? "text-slate-900 font-bold" : "text-slate-500"}`}>
              Monthly Billing
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative h-6 w-12 rounded-full bg-slate-200 p-1 transition-colors border border-slate-300"
            >
              <div
                className={`h-4 w-4 rounded-full bg-[#54EC46] transition-transform shadow-sm ${
                  isAnnual ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
            <span className={`text-xs font-semibold ${isAnnual ? "text-emerald-700 font-bold" : "text-slate-500"}`}>
              Annual Billing <span className="rounded-full bg-[#54EC46]/20 px-2 py-0.5 text-[10px] text-emerald-800 font-bold">Save 20%</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid gap-8 lg:grid-cols-3 items-stretch">
          {plans.map((p) => {
            const price = isAnnual ? p.priceAnnual : p.priceMonthly;
            return (
              <div
                key={p.name}
                className={`relative flex flex-col justify-between rounded-3xl p-8 transition-all ${
                  p.highlighted
                    ? "border-2 border-[#54EC46] bg-white shadow-2xl shadow-emerald-500/10 scale-105 z-10"
                    : "border border-slate-200 bg-white shadow-sm hover:border-slate-300"
                }`}
              >
                {p.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <Badge className="bg-[#54EC46] text-slate-950 font-extrabold text-[11px] px-3 py-0.5 shadow-sm">
                      {p.badge}
                    </Badge>
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{p.name}</h3>
                    <p className="text-xs text-slate-600 mt-1 min-h-[32px]">{p.desc}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-slate-900">${price}</span>
                    <span className="text-xs text-slate-500 font-medium">/ user / month</span>
                  </div>

                  <ul className="space-y-3 pt-2">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#54EC46]/20 text-emerald-700 mt-0.5 font-bold">
                          <Check className="h-3 w-3" />
                        </div>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8">
                  <Button
                    asChild
                    className={`w-full font-bold py-6 ${
                      p.highlighted
                        ? "bg-[#54EC46] text-slate-950 hover:bg-[#4BD63E] shadow-md shadow-emerald-500/20"
                        : "bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200"
                    }`}
                  >
                    <a href={`${DASHBOARD_URL}${p.href}`}>
                      {p.cta} <ArrowRight className="ml-1.5 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
