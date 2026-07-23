"use client";

import { useState } from "react";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingFooter } from "@/components/landing/landing-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Sparkles, Calendar, CheckCircle2, ShieldCheck, ArrowRight, Building2, Users } from "lucide-react";

export default function BookDemoPage() {
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [designation, setDesignation] = useState("");
  const [industry, setIndustry] = useState("Manufacturing");
  const [country, setCountry] = useState("United States");
  const [employees, setEmployees] = useState("100-500");
  const [assetsCount, setAssetsCount] = useState("100-500 Assets");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [demoDate, setDemoDate] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !company) {
      toast.error("Please fill in all required fields.");
      return;
    }

    toast.success("Demo request submitted! An Enterprise Specialist will contact you within 2 business hours.");
    setSubmitted(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
      <LandingNavbar />

      <main className="flex-1 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
            {/* Left Column: Value Prop */}
            <div className="lg:col-span-5 space-y-6">
              <Badge className="bg-[#54EC46]/10 text-[#54EC46] border-[#54EC46]/30 text-xs px-3 py-1 font-bold">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                LIVE DEMO DEMAND
              </Badge>

              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl leading-tight">
                Experience FixByte Live In Action
              </h1>

              <p className="text-slate-300 text-base leading-relaxed">
                Schedule a 1-on-1 personalized walk-through with an Enterprise Solutions Architect tailored to your specific plant setup, equipment count, and compliance standards.
              </p>

              <div className="space-y-4 pt-4 text-sm text-slate-200">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#54EC46] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white">Custom ROI Calculation</p>
                    <p className="text-xs text-slate-400">See your exact projected downtime reduction & savings.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#54EC46] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white">Interactive AI Assistant Demo</p>
                    <p className="text-xs text-slate-400">Test natural language search and failure prediction live.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#54EC46] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white">Data Migration Architecture</p>
                    <p className="text-xs text-slate-400">Learn how to import assets & PM schedules in under 24 hours.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Demo Booking Form */}
            <div className="lg:col-span-7">
              <Card className="border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl">
                <CardContent className="p-8">
                  {submitted ? (
                    <div className="text-center py-12 space-y-4">
                      <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-[#54EC46]/20 text-[#54EC46]">
                        <CheckCircle2 className="h-8 w-8" />
                      </div>
                      <h2 className="text-2xl font-bold text-white">Thank You, {fullName}!</h2>
                      <p className="text-slate-300 text-sm max-w-md mx-auto">
                        Your demo request for <span className="text-[#54EC46] font-semibold">{company}</span> has been confirmed. A calendar invitation has been dispatched to <span className="text-white font-mono">{email}</span>.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <h2 className="text-xl font-bold text-white mb-2">Request Live Enterprise Demo</h2>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs font-semibold text-slate-300">Full Name *</Label>
                          <Input
                            required
                            placeholder="John Doe"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="bg-slate-950 border-slate-800 text-xs text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-slate-300">Work Email *</Label>
                          <Input
                            required
                            type="email"
                            placeholder="john@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-slate-950 border-slate-800 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs font-semibold text-slate-300">Company Name *</Label>
                          <Input
                            required
                            placeholder="Acme Industrial Inc."
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            className="bg-slate-950 border-slate-800 text-xs text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-slate-300">Designation / Role</Label>
                          <Input
                            placeholder="Maintenance Manager"
                            value={designation}
                            onChange={(e) => setDesignation(e.target.value)}
                            className="bg-slate-950 border-slate-800 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label className="text-xs font-semibold text-slate-300">Industry</Label>
                          <Select value={industry} onValueChange={setIndustry}>
                            <SelectTrigger className="bg-slate-950 border-slate-800 text-xs text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-800 text-white">
                              <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                              <SelectItem value="Healthcare">Healthcare & BioPharma</SelectItem>
                              <SelectItem value="Facility Management">Facility Management</SelectItem>
                              <SelectItem value="Energy & Utilities">Energy & Utilities</SelectItem>
                              <SelectItem value="Automotive">Automotive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-xs font-semibold text-slate-300">Employees</Label>
                          <Select value={employees} onValueChange={setEmployees}>
                            <SelectTrigger className="bg-slate-950 border-slate-800 text-xs text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-800 text-white">
                              <SelectItem value="1-50">1-50</SelectItem>
                              <SelectItem value="50-100">50-100</SelectItem>
                              <SelectItem value="100-500">100-500</SelectItem>
                              <SelectItem value="500+">500+ Employees</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-xs font-semibold text-slate-300">Assets Count</Label>
                          <Select value={assetsCount} onValueChange={setAssetsCount}>
                            <SelectTrigger className="bg-slate-950 border-slate-800 text-xs text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-800 text-white">
                              <SelectItem value="< 50">&lt; 50 Assets</SelectItem>
                              <SelectItem value="50-200">50 - 200 Assets</SelectItem>
                              <SelectItem value="200-1000">200 - 1000 Assets</SelectItem>
                              <SelectItem value="1000+">1000+ Assets</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs font-semibold text-slate-300">Phone Number</Label>
                          <Input
                            placeholder="+1 (555) 000-0000"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="bg-slate-950 border-slate-800 text-xs text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-slate-300">Preferred Demo Date</Label>
                          <Input
                            type="date"
                            value={demoDate}
                            onChange={(e) => setDemoDate(e.target.value)}
                            className="bg-slate-950 border-slate-800 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs font-semibold text-slate-300">Tell Us About Your Requirements</Label>
                        <Textarea
                          placeholder="Current challenges, software being replaced..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="bg-slate-950 border-slate-800 text-xs text-white h-20"
                        />
                      </div>

                      <Button type="submit" className="w-full font-bold bg-[#54EC46] text-slate-950 hover:bg-[#54EC46]/90 py-6 text-sm">
                        Schedule Live Demo <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
