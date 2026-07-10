"use client";

import { DashboardCard } from "@/components/shared/ui-components";
import { Zap, Coins, Target, Wallet } from "lucide-react";

export function DashboardOverviewCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <DashboardCard
        title="Energy Consumption last month"
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
      <DashboardCard
        title="Expense Till Now"
        value="$68,500"
        icon={Wallet}
        description="Cumulative year-to-date expenditure"
        className="hover:shadow-md transition-all duration-300"
      />
    </div>
  );
}
