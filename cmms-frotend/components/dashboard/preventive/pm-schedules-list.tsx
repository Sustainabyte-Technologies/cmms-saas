"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MoreHorizontal,
  Play,
  Clock,
  Edit,
  PauseCircle,
  PlayCircle,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PreventiveMaintenance } from "@/lib/api/preventive-maintenance-api";
import { Asset } from "@/lib/api/assets-api";

interface PMSchedulesListProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  frequencyFilter: string;
  setFrequencyFilter: (val: string) => void;
  assetFilter: string;
  setAssetFilter: (val: string) => void;
  assets: Asset[];
  paginatedPMs: PreventiveMaintenance[];
  getDynamicStatus: (pm: PreventiveMaintenance) => any;
  getDueDateSubtext: (pm: PreventiveMaintenance) => string;
  formatFrequency: (freq: string) => string;
  formatDateSafely: (date: string | null | undefined) => string;
  handleViewDetails: (pm: PreventiveMaintenance) => void;
  handleManualTrigger: (pm: PreventiveMaintenance) => void;
  handleViewHistory: (pm: PreventiveMaintenance) => void;
  handleEditClick: (pm: PreventiveMaintenance) => void;
  handleToggleStatus: (pm: PreventiveMaintenance) => void;
  handleDeleteClick: (pm: PreventiveMaintenance) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  startEntryIndex: number;
  endEntryIndex: number;
  totalEntries: number;
}

export function PMSchedulesList({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  frequencyFilter,
  setFrequencyFilter,
  assetFilter,
  setAssetFilter,
  assets,
  paginatedPMs,
  getDynamicStatus,
  getDueDateSubtext,
  formatFrequency,
  formatDateSafely,
  handleViewDetails,
  handleManualTrigger,
  handleViewHistory,
  handleEditClick,
  handleToggleStatus,
  handleDeleteClick,
  currentPage,
  setCurrentPage,
  totalPages,
  startEntryIndex,
  endEntryIndex,
  totalEntries,
}: PMSchedulesListProps) {
  return (
    <Card className="shadow-sm border border-slate-200 bg-card">
      <CardContent className="p-6 space-y-6">
        {/* Filters Bar */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search schedules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Select */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</span>
              <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="on_track">On Track</SelectItem>
                  <SelectItem value="due_soon">Due Soon</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="completed">Completed / Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Frequency Select */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Frequency</span>
              <Select value={frequencyFilter} onValueChange={(val) => { setFrequencyFilter(val); setCurrentPage(1); }}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Frequency</SelectItem>
                  <SelectItem value="DAILY">Daily</SelectItem>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                  <SelectItem value="HALF_YEARLY">Half Yearly</SelectItem>
                  <SelectItem value="YEARLY">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Asset Select */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Asset</span>
              <Select value={assetFilter} onValueChange={(val) => { setAssetFilter(val); setCurrentPage(1); }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Asset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assets</SelectItem>
                  {assets.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.assetName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reset Filter Button */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-transparent uppercase tracking-wider select-none">Action</span>
              <Button variant="outline" size="icon" onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setFrequencyFilter("all");
                setAssetFilter("all");
                setCurrentPage(1);
              }} title="Clear Filters">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="border rounded-xl overflow-hidden bg-card">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-700">PM No.</TableHead>
                <TableHead className="font-semibold text-slate-700">Schedule Name</TableHead>
                <TableHead className="font-semibold text-slate-700">Asset</TableHead>
                <TableHead className="font-semibold text-slate-700">Frequency</TableHead>
                <TableHead className="font-semibold text-slate-700">Assigned Tech</TableHead>
                <TableHead className="font-semibold text-slate-700">Est. Hours</TableHead>
                <TableHead className="font-semibold text-slate-700">Next Due Date</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="w-[80px] font-semibold text-slate-700 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPMs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center h-48 text-muted-foreground">
                    No preventive maintenance schedules matching filters were found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPMs.map((pm) => {
                  const dynamicStatus = getDynamicStatus(pm);
                  return (
                    <TableRow key={pm.id} className="hover:bg-slate-50/50">
                      {/* PM No */}
                      <TableCell className="font-semibold text-slate-900">
                        <button
                          type="button"
                          onClick={() => handleViewDetails(pm)}
                          className="hover:underline text-indigo-600 font-bold text-left"
                        >
                          {pm.pmNumber}
                        </button>
                      </TableCell>

                      {/* Title */}
                      <TableCell className="font-medium text-slate-800">
                        <button
                          type="button"
                          onClick={() => handleViewDetails(pm)}
                          className="hover:underline text-slate-800 font-medium text-left"
                        >
                          {pm.title}
                        </button>
                      </TableCell>

                      {/* Asset */}
                      <TableCell>
                        <div>
                          <p className="font-semibold text-slate-800 leading-none">{pm.asset?.assetName}</p>
                          <p className="text-xs text-muted-foreground mt-1">{pm.asset?.assetCode}</p>
                        </div>
                      </TableCell>

                      {/* Frequency */}
                      <TableCell className="text-muted-foreground font-medium">
                        {formatFrequency(pm.frequency)}
                      </TableCell>

                      {/* Assigned Tech */}
                      <TableCell className="font-medium text-slate-800">
                        {pm.assignedTechnician?.fullName || (
                          <span className="text-xs text-slate-400 italic">Unassigned</span>
                        )}
                      </TableCell>

                      {/* Est. Hours */}
                      <TableCell className="font-medium text-slate-800">
                        {pm.estimatedHours !== undefined && pm.estimatedHours !== null ? (
                          `${pm.estimatedHours} hrs`
                        ) : (
                          <span className="text-xs text-slate-400 italic">N/A</span>
                        )}
                      </TableCell>

                      {/* Next Due Date */}
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-800">
                            {formatDateSafely(pm.nextDueDate)}
                          </p>
                          <p className={`text-xs mt-1 font-semibold ${
                            dynamicStatus.status === "Overdue" ? "text-rose-600" :
                            dynamicStatus.status === "Due Soon" ? "text-amber-600" : "text-emerald-600"
                          }`}>
                            {getDueDateSubtext(pm)}
                          </p>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border uppercase tracking-wider ${dynamicStatus.colorClass}`}>
                          {dynamicStatus.status}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 rounded-full">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[180px]">
                            <DropdownMenuItem className="font-medium" onClick={() => handleManualTrigger(pm)}>
                              <Play className="mr-2 h-4 w-4 text-emerald-600" />
                              Create Work Order
                            </DropdownMenuItem>
                            <DropdownMenuItem className="font-medium" onClick={() => handleViewHistory(pm)}>
                              <Clock className="mr-2 h-4 w-4 text-indigo-600" />
                              View History
                            </DropdownMenuItem>
                            <DropdownMenuItem className="font-medium" onClick={() => handleEditClick(pm)}>
                              <Edit className="mr-2 h-4 w-4 text-blue-600" />
                              Edit Schedule
                            </DropdownMenuItem>
                            <DropdownMenuItem className="font-medium" onClick={() => handleToggleStatus(pm)}>
                              {pm.status === "ACTIVE" ? (
                                <>
                                  <PauseCircle className="mr-2 h-4 w-4 text-amber-600" />
                                  Pause Schedule
                                </>
                              ) : (
                                <>
                                  <PlayCircle className="mr-2 h-4 w-4 text-emerald-600" />
                                  Activate Schedule
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-rose-600 font-medium" onClick={() => handleDeleteClick(pm)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Schedule
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t pt-4">
          <span className="text-sm text-muted-foreground font-medium">
            Showing {startEntryIndex} to {endEntryIndex} of {totalEntries} entries
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {Array.from({ length: totalPages }).map((_, idx) => (
              <Button
                key={idx}
                variant={currentPage === idx + 1 ? "default" : "outline"}
                onClick={() => setCurrentPage(idx + 1)}
                className={`h-8 w-8 text-xs font-semibold ${
                  currentPage === idx + 1 ? "bg-[#16a34a] text-white hover:bg-[#15803d]" : ""
                }`}
              >
                {idx + 1}
              </Button>
            ))}

            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
