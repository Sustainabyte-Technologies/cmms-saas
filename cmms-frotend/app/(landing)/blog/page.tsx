"use client";

import { useState } from "react";
import Link from "next/link";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingFooter } from "@/components/landing/landing-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, BookOpen, Clock, ArrowRight, Sparkles } from "lucide-react";

export default function BlogPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");

  const articles = [
    {
      id: "ai-predictive-maintenance",
      title: "How Artificial Intelligence Predicts Bearing Failures 14 Days Before Breakdown",
      category: "AI & IoT",
      readTime: "6 min read",
      date: "Jul 20, 2026",
      desc: "Learn how real-time vibration analysis combined with machine learning models eliminates unplanned equipment halts.",
    },
    {
      id: "inventory-grn-stock-sync",
      title: "Streamlining Spare Parts Inventory With Automatic Goods Receipt (GRN) Stock Increment",
      category: "Inventory",
      readTime: "5 min read",
      date: "Jul 15, 2026",
      desc: "Eliminate storekeeper manual data entry lag by connecting purchase orders directly with inventory ledger updates.",
    },
    {
      id: "reliability-mttr-mtbf-guide",
      title: "The Ultimate Guide To Calculating MTTR, MTBF, and Conducting 5-Why Root Cause Analysis",
      category: "Reliability",
      readTime: "8 min read",
      date: "Jul 10, 2026",
      desc: "A comprehensive handbook for reliability engineers looking to reduce mean time to repair and eliminate repeating failures.",
    },
    {
      id: "amc-contract-audit-compliance",
      title: "Managing Enterprise Annual Maintenance Contracts (AMC) Without Spreadsheet Chaos",
      category: "AMC & Vendors",
      readTime: "4 min read",
      date: "Jul 02, 2026",
      desc: "How multi-site facility managers track contract expiration dates, vendor SLAs, and digital inspection certificates.",
    },
  ];

  const filtered = articles.filter(
    (a) =>
      (category === "ALL" || a.category.includes(category)) &&
      (a.title.toLowerCase().includes(search.toLowerCase()) || a.desc.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
      <LandingNavbar />

      <main className="flex-1 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <Badge className="bg-[#54EC46]/10 text-[#54EC46] border-[#54EC46]/30 text-xs px-3 py-1 font-bold">
              <BookOpen className="mr-1.5 h-3.5 w-3.5" />
              KNOWLEDGE & RESEARCH HUB
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Industrial Maintenance & AI Insights
            </h1>
            <p className="text-slate-400 text-base sm:text-lg">
              Articles, research papers, and technical guides on CMMS, EAM, AI predictive analytics, and reliability engineering.
            </p>
          </div>

          {/* Search & Category Filter */}
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                placeholder="Search articles on AI, PM, MTTR, Inventory..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-slate-900 border-slate-800 text-xs text-white pl-9"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
              {["ALL", "AI & IoT", "Inventory", "Reliability", "AMC & Vendors"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                    category === cat ? "bg-[#54EC46] text-slate-950" : "bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Articles Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {filtered.map((art) => (
              <Card key={art.id} className="border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between hover:border-[#54EC46]/40 transition-colors">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <Badge variant="outline" className="border-slate-700 text-[#54EC46] text-[10px]">{art.category}</Badge>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {art.readTime}</span>
                  </div>

                  <h2 className="text-xl font-bold text-white hover:text-[#54EC46] transition-colors">{art.title}</h2>
                  <p className="text-xs text-slate-400 leading-relaxed">{art.desc}</p>
                </div>

                <div className="pt-6 border-t border-slate-800/80 mt-6 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-mono">{art.date}</span>
                  <Link href="#" className="font-bold text-[#54EC46] hover:underline flex items-center gap-1">
                    Read Article <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
