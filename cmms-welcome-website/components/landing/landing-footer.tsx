"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Linkedin, Twitter, Github, ShieldCheck, Mail, ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DASHBOARD_BOOK_DEMO_URL } from "@/lib/config";

export function LandingFooter() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("Subscribed to FixByte Industrial Insights!");
    setEmail("");
  };

  return (
    <footer className="border-t border-slate-200 bg-slate-50 text-slate-600 font-sans">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Col 1: Brand & Newsletter */}
          <div className="lg:col-span-2 space-y-5">
            <Logo href="/" size="lg" showSubtitle={false} />
            <p className="text-xs text-slate-600 max-w-sm leading-relaxed">
              FixByte is the leading AI-powered Enterprise CMMS & Asset Reliability Platform, empowering engineering teams to eliminate unplanned equipment downtime.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2 max-w-sm pt-2">
              <p className="text-xs font-bold text-slate-900">Subscribe to Maintenance Insights</p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter work email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white border-slate-300 text-xs text-slate-900 placeholder:text-slate-400"
                />
                <Button type="submit" size="sm" className="bg-[#54EC46] text-slate-950 font-bold hover:bg-[#4BD63E] shadow-sm">
                  Join
                </Button>
              </div>
            </form>
          </div>

          {/* Col 2: Product Modules */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-900">Product Modules</p>
            <ul className="space-y-2 text-xs">
              <li><Link href="/product/assets" className="hover:text-emerald-700 transition-colors font-medium">Asset Management</Link></li>
              <li><Link href="/product/work-orders" className="hover:text-emerald-700 transition-colors font-medium">Work Orders</Link></li>
              <li><Link href="/product/pm" className="hover:text-emerald-700 transition-colors font-medium">Preventive Maintenance</Link></li>
              <li><Link href="/product/inventory" className="hover:text-emerald-700 transition-colors font-medium">Inventory & Spare Parts</Link></li>
              <li><Link href="/product/reliability" className="hover:text-emerald-700 transition-colors font-medium">Reliability Engineering</Link></li>
              <li><Link href="/product/amc" className="hover:text-emerald-700 transition-colors font-medium">AMC Contracts</Link></li>
              <li><Link href="/product/vendors" className="hover:text-emerald-700 transition-colors font-medium">Vendor Management</Link></li>
              <li><Link href="/product/ai" className="hover:text-emerald-700 transition-colors font-medium">AI Anomaly Detection</Link></li>
            </ul>
          </div>

          {/* Col 3: Solutions & Industries */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-900">Solutions</p>
            <ul className="space-y-2 text-xs">
              <li><Link href="/solutions/maintenance-managers" className="hover:text-emerald-700 transition-colors font-medium">Maintenance Managers</Link></li>
              <li><Link href="/solutions/plant-managers" className="hover:text-emerald-700 transition-colors font-medium">Plant Managers</Link></li>
              <li><Link href="/solutions/reliability-engineers" className="hover:text-emerald-700 transition-colors font-medium">Reliability Engineers</Link></li>
              <li><Link href="/industries/manufacturing" className="hover:text-emerald-700 transition-colors font-medium">Manufacturing</Link></li>
              <li><Link href="/industries/healthcare" className="hover:text-emerald-700 transition-colors font-medium">Healthcare & Hospitals</Link></li>
              <li><Link href="/industries/facility-management" className="hover:text-emerald-700 transition-colors font-medium">Facility Management</Link></li>
            </ul>
          </div>

          {/* Col 4: Company & Legal */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-900">Company & Legal</p>
            <ul className="space-y-2 text-xs">
              <li><Link href="/about" className="hover:text-emerald-700 transition-colors font-medium">About FixByte</Link></li>
              <li><Link href="/pricing" className="hover:text-emerald-700 transition-colors font-medium">Enterprise Pricing</Link></li>
              <li><Link href="/blog" className="hover:text-emerald-700 transition-colors font-medium">Blog & Resources</Link></li>
              <li><a href={DASHBOARD_BOOK_DEMO_URL} className="hover:text-emerald-700 transition-colors font-medium">Book Live Demo</a></li>
              <li><Link href="#" className="hover:text-emerald-700 transition-colors font-medium">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-emerald-700 transition-colors font-medium">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-emerald-700 transition-colors font-medium">SOC-2 Compliance</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Security Badges & Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 pt-8 gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} FixByte Inc. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1 text-slate-600 font-medium">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> ISO 27001 & SOC-2 Type II Certified
            </span>
            <div className="flex items-center gap-3">
              <Link href="#" className="text-slate-500 hover:text-slate-900"><Linkedin className="h-4 w-4" /></Link>
              <Link href="#" className="text-slate-500 hover:text-slate-900"><Twitter className="h-4 w-4" /></Link>
              <Link href="#" className="text-slate-500 hover:text-slate-900"><Github className="h-4 w-4" /></Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
