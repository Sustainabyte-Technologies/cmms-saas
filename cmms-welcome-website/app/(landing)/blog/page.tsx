"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
    <div className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge className="bg-[#54EC46]/20 text-emerald-800 border-[#54EC46]/40 text-xs px-3 py-1 font-bold">
            <BookOpen className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
            KNOWLEDGE & RESEARCH HUB
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Industrial Maintenance & AI Insights
          </h1>
          <p className="text-slate-600 text-base sm:text-lg">
            Articles, research papers, and technical guides on CMMS, EAM, AI predictive analytics, and reliability engineering.
          </p>
        </div>

        {/* Search & Category Filter */}
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search articles on AI, PM, MTTR, Inventory..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white border-slate-200 text-xs text-slate-900 pl-9"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
            {["ALL", "AI & IoT", "Inventory", "Reliability", "AMC & Vendors"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                  category === cat ? "bg-[#54EC46] text-slate-950 shadow-sm" : "bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200"
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
            <Card key={art.id} className="border-slate-200 bg-white p-6 flex flex-col justify-between hover:border-emerald-500/40 hover:shadow-md transition-all shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <Badge variant="outline" className="border-emerald-200 text-emerald-800 bg-emerald-50 text-[10px] font-bold">{art.category}</Badge>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {art.readTime}</span>
                </div>

                <h2 className="text-xl font-bold text-slate-900 hover:text-emerald-700 transition-colors">{art.title}</h2>
                <p className="text-xs text-slate-600 leading-relaxed">{art.desc}</p>
              </div>

              <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono">{art.date}</span>
                <Link href="#" className="font-bold text-emerald-700 hover:underline flex items-center gap-1">
                  Read Article <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
