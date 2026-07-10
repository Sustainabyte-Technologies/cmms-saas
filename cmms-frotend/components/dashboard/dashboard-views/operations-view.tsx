"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity, Store } from "lucide-react";
import { fetchWorkOrders } from "@/lib/api/work-orders-api";

export function OperationsView() {
  const [opsData, setOpsData] = useState({
    todayWo: 4,
    openWo: 12,
    inProgressWo: 8,
    overdueWo: 2,
    todayPm: 3,
  });

  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const list = await fetchWorkOrders();
        if (list && list.workOrders && list.workOrders.length > 0) {
          const open = list.workOrders.filter((w: any) => w.status === "open").length;
          const progress = list.workOrders.filter((w: any) => w.status === "in_progress").length;
          setOpsData(prev => ({
            ...prev,
            openWo: open,
            inProgressWo: progress,
            todayWo: list.workOrders.length,
          }));
          setWorkOrders(list.workOrders.slice(0, 4));
        }
      } catch (err) {
        console.error("Ops View fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const techAvailability = [
    { name: "Mike Johnson", role: "Mechanical Tech", status: "Active", loc: "Site Chennai" },
    { name: "Sarah Chen", role: "HVAC Specialist", status: "Active", loc: "Site Bangalore" },
    { name: "Tom Williams", role: "Electrician", status: "Idle", loc: "Workshop" },
    { name: "Emily Davis", role: "Plumber", status: "Offline", loc: "On Leave" },
  ];

  const pendingApprovals = [
    { req: "PO-4091: Compressor Core Bearings", cost: "$1,250", date: "Today", applicant: "Sarah Chen" },
    { req: "WO-1249: Boiler Out-Of-Cycle PM", cost: "-", date: "Yesterday", applicant: "Anil Dev" },
  ];

  const liveActivities = [
    { user: "Mike J.", action: "Began troubleshooting Hydraulic Leak WO-1241", time: "2 min ago" },
    { user: "Sarah C.", action: "Uploaded calibration checklist for Chiller CL-04", time: "15 min ago" },
    { user: "System", action: "Auto-generated 4 work orders from Preventive Scheduler", time: "1 hour ago" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Operations View
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time shopfloor maintenance dashboard and technician schedules.
          </p>
        </div>
        <div className="text-[10px] font-bold text-muted-foreground uppercase border rounded-lg px-2.5 py-1 bg-muted/20 shrink-0">
          Audience: Admin • Maintenance Manager • Site In-Charge
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="p-4 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Today's Work Orders</span>
          <CardTitle className="text-2xl font-bold mt-2">{opsData.todayWo}</CardTitle>
        </Card>
        <Card className="p-4 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Open Work Orders</span>
          <CardTitle className="text-2xl font-bold mt-2">{opsData.openWo}</CardTitle>
        </Card>
        <Card className="p-4 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">In Progress</span>
          <CardTitle className="text-2xl font-bold mt-2 text-indigo-500">{opsData.inProgressWo}</CardTitle>
        </Card>
        <Card className="p-4 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Overdue</span>
          <CardTitle className="text-2xl font-bold mt-2 text-red-500">{opsData.overdueWo}</CardTitle>
        </Card>
        <Card className="p-4 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Today's PM</span>
          <CardTitle className="text-2xl font-bold mt-2 text-emerald-500">{opsData.todayPm}</CardTitle>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Column 1: Today's Tasks */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold">Technician Availability & Shift Status</CardTitle>
            <CardDescription>Roster mapping skills and current location status.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {techAvailability.map((t, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-border/80 bg-card/50 hover:bg-card transition-colors text-xs">
                  <div>
                    <h4 className="font-bold text-foreground">{t.name}</h4>
                    <p className="text-muted-foreground mt-0.5">{t.role} • {t.loc}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                    t.status === "Active" ? "bg-emerald-500/10 text-emerald-500" :
                    t.status === "Idle" ? "bg-amber-500/10 text-amber-500" : "bg-muted text-muted-foreground"
                  }`}>
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Column 2: Pending Approvals & Live Activities */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Pending Approvals</CardTitle>
              <CardDescription>Requisitions requiring approval.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingApprovals.map((pa, idx) => (
                <div key={idx} className="p-3 border rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-foreground">{pa.req}</p>
                    <p className="text-muted-foreground mt-0.5">By: {pa.applicant} • {pa.date}</p>
                  </div>
                  <span className="font-semibold text-primary">{pa.cost}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Live Activities</CardTitle>
              <CardDescription>Operational log alerts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {liveActivities.map((la, idx) => (
                <div key={idx} className="flex justify-between text-xs items-start gap-4">
                  <p className="text-muted-foreground">
                    <span className="font-bold text-foreground">{la.user}</span> {la.action}
                  </p>
                  <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">{la.time}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
