"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Play,
  Eye,
  Plus,
  Loader2,
} from "lucide-react";
import { PMCalendarEvent } from "@/lib/api/preventive-maintenance-api";
import { Customer } from "@/lib/api/customers-api";
import { Asset } from "@/lib/api/assets-api";
import { extractFromCustomers } from "@/lib/api/customers-api";

interface PMCalendarProps {
  currentMonth: number;
  currentYear: number;
  monthNames: string[];
  calendarEvents: PMCalendarEvent[];
  calendarLoading: boolean;
  selectedCalendarEvent: PMCalendarEvent | null;
  setSelectedCalendarEvent: (val: PMCalendarEvent | null) => void;
  eventDetailsLoading: boolean;
  eventDetails: any | null;
  handleEventClick: (event: PMCalendarEvent) => void;
  handleTriggerWorkOrder: (pmId: string) => void;
  handleViewDetails: (pm: any) => void;
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
  handleToday: () => void;
  getCalendarDays: () => any[];
  getEventsForDate: (date: Date) => any[];
  formatFrequency: (freq: string) => string;
  formatDateSafely: (date: string | null | undefined) => string;
  calendarCustomerFilter: string;
  setCalendarCustomerFilter: (val: string) => void;
  calendarSiteFilter: string;
  setCalendarSiteFilter: (val: string) => void;
  calendarDeptFilter: string;
  setCalendarDeptFilter: (val: string) => void;
  calendarAssetFilter: string;
  setCalendarAssetFilter: (val: string) => void;
  calendarTechFilter: string;
  setCalendarTechFilter: (val: string) => void;
  calendarStatusFilter: string;
  setCalendarStatusFilter: (val: string) => void;
  calendarFrequencyFilter: string;
  setCalendarFrequencyFilter: (val: string) => void;
  calendarSearchQuery: string;
  setCalendarSearchQuery: (val: string) => void;
  customers: Customer[];
  assets: Asset[];
  technicians: any[];
}

export function PMCalendar({
  currentMonth,
  currentYear,
  monthNames,
  calendarEvents,
  calendarLoading,
  selectedCalendarEvent,
  setSelectedCalendarEvent,
  eventDetailsLoading,
  eventDetails,
  handleEventClick,
  handleTriggerWorkOrder,
  handleViewDetails,
  handlePrevMonth,
  handleNextMonth,
  handleToday,
  getCalendarDays,
  getEventsForDate,
  formatFrequency,
  formatDateSafely,
  calendarCustomerFilter,
  setCalendarCustomerFilter,
  calendarSiteFilter,
  setCalendarSiteFilter,
  calendarDeptFilter,
  setCalendarDeptFilter,
  calendarAssetFilter,
  setCalendarAssetFilter,
  calendarTechFilter,
  setCalendarTechFilter,
  calendarStatusFilter,
  setCalendarStatusFilter,
  calendarFrequencyFilter,
  setCalendarFrequencyFilter,
  calendarSearchQuery,
  setCalendarSearchQuery,
  customers,
  assets,
  technicians,
}: PMCalendarProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-6 items-stretch">
      {/* Calendar Grid Container */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Calendar Filters Bar */}
        <Card className="shadow-sm border border-slate-200 bg-card">
          <CardContent className="p-4 flex flex-wrap items-center gap-3">
            {/* Customer Filter */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Customer</span>
              <Select value={calendarCustomerFilter} onValueChange={(val) => { setCalendarCustomerFilter(val); setCalendarSiteFilter("all"); setCalendarDeptFilter("all"); }}>
                <SelectTrigger className="w-[140px] h-9 text-xs font-semibold">
                  <SelectValue placeholder="All Customers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Site Filter */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Site</span>
              <Select value={calendarSiteFilter} onValueChange={(val) => { setCalendarSiteFilter(val); setCalendarDeptFilter("all"); }}>
                <SelectTrigger className="w-[140px] h-9 text-xs font-semibold">
                  <SelectValue placeholder="All Sites" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sites</SelectItem>
                  {extractFromCustomers(customers).sites
                    .filter(s => calendarCustomerFilter === "all" || s.customerId === calendarCustomerFilter)
                    .map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Department Filter */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Department</span>
              <Select value={calendarDeptFilter} onValueChange={setCalendarDeptFilter}>
                <SelectTrigger className="w-[140px] h-9 text-xs font-semibold">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {extractFromCustomers(customers).departments
                    .filter(d => calendarSiteFilter === "all" || d.siteId === calendarSiteFilter)
                    .map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Asset Filter */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Asset</span>
              <Select value={calendarAssetFilter} onValueChange={setCalendarAssetFilter}>
                <SelectTrigger className="w-[140px] h-9 text-xs font-semibold">
                  <SelectValue placeholder="All Assets" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assets</SelectItem>
                  {assets.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.assetName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Technician Filter */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Technician</span>
              <Select value={calendarTechFilter} onValueChange={setCalendarTechFilter}>
                <SelectTrigger className="w-[140px] h-9 text-xs font-semibold">
                  <SelectValue placeholder="All Technicians" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Technicians</SelectItem>
                  {technicians.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</span>
              <Select value={calendarStatusFilter} onValueChange={setCalendarStatusFilter}>
                <SelectTrigger className="w-[130px] h-9 text-xs font-semibold">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Frequency Filter */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Frequency</span>
              <Select value={calendarFrequencyFilter} onValueChange={setCalendarFrequencyFilter}>
                <SelectTrigger className="w-[130px] h-9 text-xs font-semibold">
                  <SelectValue placeholder="All Frequencies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Frequencies</SelectItem>
                  <SelectItem value="DAILY">Daily</SelectItem>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                  <SelectItem value="HALF_YEARLY">Half Yearly</SelectItem>
                  <SelectItem value="YEARLY">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search Input */}
            <div className="flex flex-col gap-1.5 flex-1 min-w-[150px]">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Search</span>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search title or PM No..."
                  value={calendarSearchQuery}
                  onChange={(e) => setCalendarSearchQuery(e.target.value)}
                  className="pl-8 h-9 text-xs"
                />
              </div>
            </div>

            {/* Filter Reset */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-transparent uppercase tracking-wider select-none">Action</span>
              <Button variant="outline" size="sm" className="h-9 px-3 text-xs font-semibold border-slate-200" onClick={() => {
                setCalendarCustomerFilter("all");
                setCalendarSiteFilter("all");
                setCalendarDeptFilter("all");
                setCalendarAssetFilter("all");
                setCalendarTechFilter("all");
                setCalendarStatusFilter("all");
                setCalendarFrequencyFilter("all");
                setCalendarSearchQuery("");
              }}>
                <Filter className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Body */}
        <Card className="shadow-sm border border-slate-200 bg-card overflow-hidden">
          {/* Calendar Top Controls */}
          <div className="p-4 border-b flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-9 w-9 border-slate-200 bg-white" onClick={handlePrevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9 border-slate-200 bg-white" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="h-9 font-semibold text-xs border-slate-200 bg-white px-3" onClick={handleToday}>
                Today
              </Button>
            </div>

            <h2 className="text-lg font-bold text-slate-800">
              {monthNames[currentMonth - 1]} {currentYear}
            </h2>

            <div className="flex items-center border rounded-lg overflow-hidden bg-white p-0.5 shadow-sm">
              <Button variant="ghost" size="sm" className="h-7 px-3 text-[11px] font-bold text-slate-400 cursor-not-allowed">Day</Button>
              <Button variant="ghost" size="sm" className="h-7 px-3 text-[11px] font-bold text-slate-400 cursor-not-allowed">Week</Button>
              <Button variant="default" size="sm" className="h-7 px-3 text-[11px] font-bold bg-[#3b82f6] text-white shadow-sm hover:bg-[#2563eb]">Month</Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-4 bg-white">
            {calendarLoading ? (
              <div className="h-[450px] flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="mt-4 text-xs text-muted-foreground">Loading calendar schedules...</p>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden">
                {/* Weekday headers */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((header, idx) => (
                  <div key={idx} className="bg-slate-50 py-2.5 text-center text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    {header}
                  </div>
                ))}

                {/* Calendar cells */}
                {getCalendarDays().map((cell, idx) => {
                  const isCurrentMonth = cell.month === "current";
                  const dateEvents = getEventsForDate(cell.date);
                  const isToday = new Date().toDateString() === cell.date.toDateString();

                  return (
                    <div
                      key={idx}
                      className={`bg-white min-h-[100px] p-2 flex flex-col justify-between transition-colors hover:bg-slate-50/30 ${
                        !isCurrentMonth ? "bg-slate-50/50 text-slate-400" : "text-slate-800"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-extrabold ${
                          isToday ? "h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold" : "text-slate-500"
                        }`}>
                          {cell.day}
                        </span>
                      </div>

                      {/* Day Events */}
                      <div className="mt-2 space-y-1.5 flex-1 overflow-y-auto max-h-[80px]">
                        {dateEvents.map((event) => {
                          const eventTime = new Date(event.startDate).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
                          const isSelected = selectedCalendarEvent?.id === event.id;

                          // Color styles based on status / color
                          let bgClass = "bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100/80";
                          if (event.color === "#ef4444") {
                            bgClass = "bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100/80";
                          } else if (event.color === "#f59e0b") {
                            bgClass = "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100/80";
                          } else if (event.color === "#22c55e") {
                            bgClass = "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100/80";
                          }

                          return (
                            <button
                              key={event.id}
                              type="button"
                              onClick={() => handleEventClick(event)}
                              className={`w-full text-left p-1 px-1.5 rounded text-[10px] font-bold border transition-all flex flex-col gap-0.5 leading-tight ${bgClass} ${
                                isSelected ? "ring-2 ring-blue-500 ring-offset-1" : ""
                              }`}
                            >
                              <div className="flex items-center gap-1.5 justify-between">
                                <span className="truncate">{event.pmNumber}</span>
                                <span className="shrink-0 text-[8px] opacity-75 font-semibold">{eventTime}</span>
                              </div>
                              <span className="truncate opacity-90 font-medium">{event.title}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Calendar Legend */}
          <div className="p-4 border-t bg-slate-50/50 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              <span>Scheduled (Active)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span>Upcoming (Inactive)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
              <span>Overdue</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Sidebar Details Panel */}
      {selectedCalendarEvent && (
        <div className="w-full lg:w-[360px] shrink-0 animate-fade-in">
          <Card className="shadow-sm border border-slate-200 bg-card h-full flex flex-col overflow-hidden">
            <CardHeader className="p-4 border-b bg-slate-50/50 flex flex-row items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PM Details</span>
                <CardTitle className="text-base font-bold text-slate-800 mt-1 flex items-center gap-2">
                  {selectedCalendarEvent.pmNumber}
                </CardTitle>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-slate-400 hover:text-slate-600" onClick={() => setSelectedCalendarEvent(null)}>
                <Plus className="h-4 w-4 rotate-45" />
              </Button>
            </CardHeader>

            <CardContent className="p-5 flex-1 overflow-y-auto space-y-4">
              {eventDetailsLoading ? (
                <div className="h-48 flex flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="mt-2 text-xs text-muted-foreground">Loading details...</p>
                </div>
              ) : eventDetails ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border uppercase tracking-wider ${
                      selectedCalendarEvent.status === "ACTIVE" ? "text-blue-700 bg-blue-50 border-blue-200" : "text-slate-600 bg-slate-50 border-slate-200"
                    }`}>
                      {selectedCalendarEvent.status}
                    </span>
                    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      eventDetails.priority === "HIGH" || eventDetails.priority === "CRITICAL" ? "bg-rose-50 text-rose-700 border border-rose-100" :
                      eventDetails.priority === "MEDIUM" ? "bg-amber-50 text-amber-700 border border-amber-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                    }`}>
                      {eventDetails.priority}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 leading-snug">{eventDetails.title}</h3>

                  <div className="space-y-3 pt-3 border-t">
                    <div className="flex items-start justify-between text-xs font-semibold">
                      <span className="text-slate-400">PM Name</span>
                      <span className="text-slate-800 text-right">{eventDetails.title}</span>
                    </div>

                    <div className="flex items-start justify-between text-xs font-semibold">
                      <span className="text-slate-400">Asset</span>
                      <span className="text-slate-800 text-right">{eventDetails.asset?.assetName}</span>
                    </div>

                    <div className="flex items-start justify-between text-xs font-semibold">
                      <span className="text-slate-400">Site</span>
                      <span className="text-slate-800 text-right">{eventDetails.asset?.siteName || "N/A"}</span>
                    </div>

                    <div className="flex items-start justify-between text-xs font-semibold">
                      <span className="text-slate-400">Department</span>
                      <span className="text-slate-800 text-right">{eventDetails.asset?.departmentName || "N/A"}</span>
                    </div>

                    <div className="flex items-start justify-between text-xs font-semibold">
                      <span className="text-slate-400">Technician</span>
                      <span className="text-slate-800 text-right flex items-center gap-1.5">
                        {eventDetails.assignedTechnician ? (
                          <>
                            <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-700">
                              {eventDetails.assignedTechnician.fullName.substring(0, 2).toUpperCase()}
                            </div>
                            {eventDetails.assignedTechnician.fullName}
                          </>
                        ) : "Unassigned"}
                      </span>
                    </div>

                    <div className="flex items-start justify-between text-xs font-semibold">
                      <span className="text-slate-400">Frequency</span>
                      <span className="text-slate-800 text-right">{formatFrequency(eventDetails.frequency)}</span>
                    </div>

                    <div className="flex items-start justify-between text-xs font-semibold">
                      <span className="text-slate-400">Due Date</span>
                      <span className="text-slate-800 text-right">{formatDateSafely(eventDetails.nextDueDate)}</span>
                    </div>

                    <div className="flex items-start justify-between text-xs font-semibold">
                      <span className="text-slate-400">Estimated Time</span>
                      <span className="text-slate-800 text-right">{eventDetails.estimatedHours ? `${eventDetails.estimatedHours} hrs` : "N/A"}</span>
                    </div>

                    <div className="flex items-start justify-between text-xs font-semibold">
                      <span className="text-slate-400">Checklist Template</span>
                      <span className="text-slate-800 text-right">{eventDetails.checklistTemplate?.name || "None"}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic text-center pt-8">Failed to load details.</p>
              )}
            </CardContent>

            {eventDetails && (
              <div className="p-4 border-t bg-slate-50/50 space-y-2 shrink-0">
                <Button className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold text-xs h-9" onClick={() => handleTriggerWorkOrder(eventDetails.id)}>
                  <Play className="mr-1.5 h-3.5 w-3.5" />
                  Generate Work Order
                </Button>
                <Button variant="outline" className="w-full text-slate-700 font-semibold text-xs h-9" onClick={() => handleViewDetails(eventDetails)}>
                  <Eye className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
                  View PM Details
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
