"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardCard } from "@/components/shared/ui-components";
import { Zap, Coins, Target, ShieldAlert, Ticket } from "lucide-react";
import { fetchIncidentDashboard, IncidentDashboardData } from "@/lib/api/incidents-api";
import { fetchServiceTicketDashboard, ServiceTicketDashboardData } from "@/lib/api/service-tickets-api";

export function DashboardOverviewCards() {
  const [incidentData, setIncidentData] = useState<IncidentDashboardData | null>(null);
  const [ticketData, setTicketData] = useState<ServiceTicketDashboardData | null>(null);

  useEffect(() => {
    fetchIncidentDashboard()
      .then(setIncidentData)
      .catch((err) => console.error("Could not fetch incident stats for executive card:", err));

    fetchServiceTicketDashboard()
      .then(setTicketData)
      .catch((err) => console.error("Could not fetch ticket stats for executive card:", err));
  }, []);

  const totalIncidents = incidentData?.metrics?.total ?? 0;
  const openIncidents = incidentData?.metrics?.open ?? 0;
  const criticalIncidents = incidentData?.metrics?.critical ?? 0;

  const totalTickets = ticketData?.metrics?.total ?? 0;
  const openTickets =
    (ticketData?.metrics?.newTickets ?? 0) +
    (ticketData?.metrics?.assigned ?? 0) +
    (ticketData?.metrics?.inProgress ?? 0) +
    (ticketData?.metrics?.onHold ?? 0);
  const urgentTickets = ticketData?.metrics?.urgent ?? 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <Link href="/dashboard/service-tickets" className="block">
        <DashboardCard
          title="Service Tickets"
          value={`Total: ${totalTickets}`}
          icon={Ticket}
          description={`Open: ${openTickets} | Urgent: ${urgentTickets}`}
          className="hover:shadow-md transition-all duration-300 border-blue-500/20 bg-blue-500/5 cursor-pointer"
        />
      </Link>
      <Link href="/dashboard/incidents" className="block">
        <DashboardCard
          title="Incident Management"
          value={`Total: ${totalIncidents}`}
          icon={ShieldAlert}
          description={`Open: ${openIncidents} | Critical: ${criticalIncidents}`}
          className="hover:shadow-md transition-all duration-300 border-red-500/20 bg-red-500/5 cursor-pointer"
        />
      </Link>
      <DashboardCard
        title="Energy Consumption"
        value="45,200 kWh"
        icon={Zap}
        description="Savings: 5,400 kWh ($1,250)"
        className="hover:shadow-md transition-all duration-300 border-emerald-500/10"
      />
      <DashboardCard
        title="Operation Spend"
        value="$8,900"
        icon={Coins}
        description="Last Month Spend: $12,400"
        className="hover:shadow-md transition-all duration-300 border-blue-500/10"
      />
      <DashboardCard
        title="Target Budget"
        value="$15,000"
        icon={Target}
        description="Last Month Target: $14,000"
        className="hover:shadow-md transition-all duration-300"
      />
    </div>
  );
}
