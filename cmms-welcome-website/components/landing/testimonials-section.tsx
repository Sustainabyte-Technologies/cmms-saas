"use client";

import { Badge } from "@/components/ui/badge";
import { Star, Quote, TrendingUp, Building2 } from "lucide-react";

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Marcus Vance",
      role: "VP of Global Maintenance Operations",
      company: "Apex Precision Automotive",
      quote: "FixByte AI accurately predicted a major hydraulic pump failure 8 days before our annual shutdown. We saved an estimated $210,000 in unscheduled downtime.",
      roi: "42% Reduction in Downtime",
      rating: 5,
    },
    {
      name: "Elena Rostova",
      role: "Director of Reliability Engineering",
      company: "PharmaCare International",
      quote: "The seamless integration between Spare Parts inventory and Goods Receipt (GRN) auto-stock updates transformed our storekeeper workflow. PM compliance is up to 99.2%.",
      roi: "99.2% PM Compliance Rate",
      rating: 5,
    },
    {
      name: "David Chen",
      role: "Head of Facility Engineering",
      company: "Metro Health Systems",
      quote: "Managing AMC contracts for 14 hospital buildings used to be a nightmare of lost PDFs. FixByte brought complete visibility, compliance alerts, and digital certificates.",
      roi: "100% Audit Compliance",
      rating: 5,
    },
  ];

  return (
    <section id="testimonials" className="bg-white py-24 text-slate-900 border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge className="bg-[#54EC46]/20 text-emerald-800 border-[#54EC46]/40 text-xs px-3 py-1 font-bold">
            CUSTOMER SUCCESS STORIES
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Trusted By Engineering Teams At Scale
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            Discover how leading enterprises achieve operational excellence with FixByte.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-slate-50/80 p-8 shadow-sm hover:border-emerald-500/50 hover:shadow-md transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 text-amber-500">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Badge className="bg-[#54EC46]/20 text-emerald-800 border-[#54EC46]/40 text-[10px] font-bold">
                    <TrendingUp className="mr-1 h-3 w-3 text-emerald-600" /> {t.roi}
                  </Badge>
                </div>

                <Quote className="h-8 w-8 text-emerald-500/30" />
                <p className="text-sm text-slate-700 leading-relaxed italic">
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-6 border-t border-slate-200 mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#54EC46]/20 text-emerald-800 font-extrabold text-sm">
                  {t.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role} • <span className="text-slate-700 font-semibold">{t.company}</span></p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
