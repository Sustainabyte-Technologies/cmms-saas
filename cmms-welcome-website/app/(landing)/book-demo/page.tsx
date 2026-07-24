"use client";

import { useState } from "react";
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
    <div className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
          {/* Left Column: Value Prop */}
          <div className="lg:col-span-5 space-y-6">
            <Badge className="bg-[#54EC46]/20 text-emerald-800 border-[#54EC46]/40 text-xs px-3 py-1 font-bold">
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
              LIVE DEMO DEMAND
            </Badge>

            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl leading-tight">
              Experience FixByte Live In Action
            </h1>

            <p className="text-slate-600 text-base leading-relaxed">
              Schedule a 1-on-1 personalized walk-through with an Enterprise Solutions Architect tailored to your specific plant setup, equipment count, and compliance standards.
            </p>

            <div className="space-y-4 pt-4 text-sm text-slate-700">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Custom ROI Calculation</p>
                  <p className="text-xs text-slate-500">See your exact projected downtime reduction & savings.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Interactive AI Assistant Demo</p>
                  <p className="text-xs text-slate-500">Test natural language search and failure prediction live.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Data Migration Architecture</p>
                  <p className="text-xs text-slate-500">Learn how to import assets & PM schedules in under 24 hours.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Demo Booking Form */}
          <div className="lg:col-span-7">
            <Card className="border-slate-200 bg-white shadow-xl">
              <CardContent className="p-8">
                {submitted ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-[#54EC46]/20 text-emerald-700">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Thank You, {fullName}!</h2>
                    <p className="text-slate-600 text-sm max-w-md mx-auto">
                      Your demo request for <span className="text-emerald-700 font-semibold">{company}</span> has been confirmed. A calendar invitation has been dispatched to <span className="text-slate-900 font-mono font-bold">{email}</span>.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Request Live Enterprise Demo</h2>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs font-semibold text-slate-700">Full Name *</Label>
                        <Input
                          required
                          placeholder="John Doe"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="bg-slate-50 border-slate-200 text-xs text-slate-900"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-slate-700">Work Email *</Label>
                        <Input
                          required
                          type="email"
                          placeholder="john@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-slate-50 border-slate-200 text-xs text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs font-semibold text-slate-700">Company Name *</Label>
                        <Input
                          required
                          placeholder="Acme Industrial Inc."
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          className="bg-slate-50 border-slate-200 text-xs text-slate-900"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-slate-700">Designation / Role</Label>
                        <Input
                          placeholder="Maintenance Manager"
                          value={designation}
                          onChange={(e) => setDesignation(e.target.value)}
                          className="bg-slate-50 border-slate-200 text-xs text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs font-semibold text-slate-700">Industry</Label>
                        <Select value={industry} onValueChange={setIndustry}>
                          <SelectTrigger className="bg-slate-50 border-slate-200 text-xs text-slate-900">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-slate-200 text-slate-900">
                            <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="Healthcare">Healthcare & BioPharma</SelectItem>
                            <SelectItem value="Facility Management">Facility Management</SelectItem>
                            <SelectItem value="Energy & Utilities">Energy & Utilities</SelectItem>
                            <SelectItem value="Automotive">Automotive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs font-semibold text-slate-700">Employees</Label>
                        <Select value={employees} onValueChange={setEmployees}>
                          <SelectTrigger className="bg-slate-50 border-slate-200 text-xs text-slate-900">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-slate-200 text-slate-900">
                            <SelectItem value="1-50">1-50</SelectItem>
                            <SelectItem value="50-100">50-100</SelectItem>
                            <SelectItem value="100-500">100-500</SelectItem>
                            <SelectItem value="500+">500+ Employees</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs font-semibold text-slate-700">Assets Count</Label>
                        <Select value={assetsCount} onValueChange={setAssetsCount}>
                          <SelectTrigger className="bg-slate-50 border-slate-200 text-xs text-slate-900">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-slate-200 text-slate-900">
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
                        <Label className="text-xs font-semibold text-slate-700">Phone Number</Label>
                        <Input
                          placeholder="+1 (555) 000-0000"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="bg-slate-50 border-slate-200 text-xs text-slate-900"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-slate-700">Preferred Demo Date</Label>
                        <Input
                          type="date"
                          value={demoDate}
                          onChange={(e) => setDemoDate(e.target.value)}
                          className="bg-slate-50 border-slate-200 text-xs text-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-slate-700">Tell Us About Your Requirements</Label>
                      <Textarea
                        placeholder="Current challenges, software being replaced..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="bg-slate-50 border-slate-200 text-xs text-slate-900 h-20"
                      />
                    </div>

                    <Button type="submit" className="w-full font-bold bg-[#54EC46] text-slate-950 hover:bg-[#4BD63E] shadow-md shadow-emerald-500/20 py-6 text-sm">
                      Schedule Live Demo <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
