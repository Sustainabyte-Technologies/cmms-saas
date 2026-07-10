"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShoppingCart, Store } from "lucide-react";

export function PurchaseVendorView() {
  const purchaseRequests = [
    { req: "REQ-0024: 10 units Hydraulic Oil Drums", cost: "$1,800", date: "Today", applicant: "Mike Johnson" },
    { req: "REQ-0025: 5 units MERV Replacement Filters", cost: "$250", date: "Yesterday", applicant: "Sarah Chen" },
  ];

  const pendingPOs = [
    { po: "PO-4091", desc: "Hydraulic valves requisition", cost: "$1,250", vendor: "Hydraulics Express", status: "Under Review" },
    { po: "PO-4093", desc: "HVAC Fan Assembly unit B replacement", cost: "$3,800", vendor: "ClimateTech Solutions", status: "Awaiting Signature" },
  ];

  const vendorPerformance = [
    { name: "Hydraulics Express", onTimeRate: "98.5%", leadTime: "3.2 days" },
    { name: "Global Bearings Inc.", onTimeRate: "96.0%", leadTime: "4.1 days" },
    { name: "ClimateTech Solutions", onTimeRate: "92.2%", leadTime: "5.8 days" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-primary" />
            Purchase & Vendor View
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Supplier procurement management, PO triggers, cost analysis, and shipping statuses.
          </p>
        </div>
        <div className="text-[10px] font-bold text-muted-foreground uppercase border rounded-lg px-2.5 py-1 bg-muted/20 shrink-0">
          Audience: Purchase Manager • Admin
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Pending POs</span>
          <CardTitle className="text-2xl font-bold mt-2">{pendingPOs.length}</CardTitle>
        </Card>
        <Card className="p-4 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Purchase Cost (Monthly)</span>
          <CardTitle className="text-2xl font-bold mt-2 text-indigo-500">$14,890</CardTitle>
        </Card>
        <Card className="p-4 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Average Lead Time</span>
          <CardTitle className="text-2xl font-bold mt-2 text-emerald-500">4.5 days</CardTitle>
        </Card>
        <Card className="p-4 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Outstanding Requisitions</span>
          <CardTitle className="text-2xl font-bold mt-2 text-amber-500">{purchaseRequests.length}</CardTitle>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Column 1: Requisitions & POs */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold">Active Purchase Requests</CardTitle>
              <CardDescription>Material requisitions spawned from inventory or technicians.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {purchaseRequests.map((pr, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-border/80 bg-card/50 text-xs">
                    <div>
                      <h4 className="font-bold text-foreground">{pr.req}</h4>
                      <p className="text-muted-foreground mt-0.5">Requested by: {pr.applicant} • {pr.date}</p>
                    </div>
                    <span className="font-bold text-primary">{pr.cost}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold">Pending Purchase Orders & Delivery Status</CardTitle>
              <CardDescription>POs awaiting approval or currently in transit.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingPOs.map((po, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-border/60 bg-card/40 text-xs">
                    <div>
                      <h4 className="font-bold text-foreground">{po.desc}</h4>
                      <p className="text-muted-foreground mt-0.5">Supplier: {po.vendor} • Status: <span className="font-semibold text-primary">{po.status}</span></p>
                    </div>
                    <span className="font-mono font-bold text-[10px] text-muted-foreground bg-muted border px-2 py-0.5 rounded">{po.po}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Column 2: Vendor Performance & ratings */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-base font-bold">Preferred Vendor & Rating Index</CardTitle>
            <CardDescription>Top suppliers rated by delivery SLA performance.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            {vendorPerformance.map((v, idx) => (
              <div key={idx} className="p-3 border border-border/70 rounded-xl bg-card text-xs">
                <div className="flex justify-between items-center font-bold">
                  <span className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-muted-foreground" />
                    {v.name}
                  </span>
                  <span className="text-emerald-500">4.9 ★</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground mt-2 text-[10px] font-semibold">
                  <span>On-Time: {v.onTimeRate}</span>
                  <span>Avg Lead: {v.leadTime}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
