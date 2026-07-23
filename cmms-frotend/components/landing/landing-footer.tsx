"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Linkedin, Twitter, Github, ShieldCheck, Mail, ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function LandingFooter() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("Subscribed to FixByte Industrial Insights!");
    setEmail("");
  };

  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 font-sans">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Col 1: Brand & Newsletter */}
          <div className="lg:col-span-2 space-y-5">
            <Logo href="/" size="lg" showSubtitle={false} />
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              FixByte is the leading AI-powered Enterprise CMMS & Asset Reliability Platform, empowering engineering teams to eliminate unplanned equipment downtime.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2 max-w-sm pt-2">
              <p className="text-xs font-bold text-white">Subscribe to Maintenance Insights</p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter work email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-900 border-slate-800 text-xs text-white placeholder:text-slate-500"
                />
                <Button type="submit" size="sm" className="bg-[#54EC46] text-slate-950 font-bold hover:bg-[#54EC46]/90">
                  Join
                </Button>
              </div>
            </form>
          </div>

          {/* Col 2: Product Modules */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-white">Product Modules</p>
            <ul className="space-y-2 text-xs">
              <li><Link href="/product/assets" className="hover:text-[#54EC46] transition-colors">Asset Management</Link></li>
              <li><Link href="/product/work-orders" className="hover:text-[#54EC46] transition-colors">Work Orders</Link></li>
              <li><Link href="/product/pm" className="hover:text-[#54EC46] transition-colors">Preventive Maintenance</Link></li>
              <li><Link href="/product/inventory" className="hover:text-[#54EC46] transition-colors">Inventory & Spare Parts</Link></li>
              <li><Link href="/product/reliability" className="hover:text-[#54EC46] transition-colors">Reliability Engineering</Link></li>
              <li><Link href="/product/amc" className="hover:text-[#54EC46] transition-colors">AMC Contracts</Link></li>
              <li><Link href="/product/vendors" className="hover:text-[#54EC46] transition-colors">Vendor Management</Link></li>
              <li><Link href="/product/ai" className="hover:text-[#54EC46] transition-colors">AI Anomaly Detection</Link></li>
            </ul>
          </div>

          {/* Col 3: Solutions & Industries */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-white">Solutions</p>
            <ul className="space-y-2 text-xs">
              <li><Link href="/solutions/maintenance-managers" className="hover:text-[#54EC46] transition-colors">Maintenance Managers</Link></li>
              <li><Link href="/solutions/plant-managers" className="hover:text-[#54EC46] transition-colors">Plant Managers</Link></li>
              <li><Link href="/solutions/reliability-engineers" className="hover:text-[#54EC46] transition-colors">Reliability Engineers</Link></li>
              <li><Link href="/industries/manufacturing" className="hover:text-[#54EC46] transition-colors">Manufacturing</Link></li>
              <li><Link href="/industries/healthcare" className="hover:text-[#54EC46] transition-colors">Healthcare & Hospitals</Link></li>
              <li><Link href="/industries/facility-management" className="hover:text-[#54EC46] transition-colors">Facility Management</Link></li>
            </ul>
          </div>

          {/* Col 4: Company & Legal */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-white">Company & Legal</p>
            <ul className="space-y-2 text-xs">
              <li><Link href="/about" className="hover:text-[#54EC46] transition-colors">About FixByte</Link></li>
              <li><Link href="/pricing" className="hover:text-[#54EC46] transition-colors">Enterprise Pricing</Link></li>
              <li><Link href="/blog" className="hover:text-[#54EC46] transition-colors">Blog & Resources</Link></li>
              <li><Link href="/book-demo" className="hover:text-[#54EC46] transition-colors">Book Live Demo</Link></li>
              <li><Link href="#" className="hover:text-[#54EC46] transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-[#54EC46] transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-[#54EC46] transition-colors">SOC-2 Compliance</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Security Badges & Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-800/80 pt-8 gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} FixByte Inc. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="h-4 w-4 text-[#54EC46]" /> ISO 27001 & SOC-2 Type II Certified
            </span>
            <div className="flex items-center gap-3">
              <Link href="#" className="text-slate-400 hover:text-white"><Linkedin className="h-4 w-4" /></Link>
              <Link href="#" className="text-slate-400 hover:text-white"><Twitter className="h-4 w-4" /></Link>
              <Link href="#" className="text-slate-400 hover:text-white"><Github className="h-4 w-4" /></Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
