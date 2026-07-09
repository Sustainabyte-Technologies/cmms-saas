"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  ArrowLeft,
  Building2,
  Calendar,
  Wrench,
  Clock,
  AlertCircle,
  CheckSquare,
  Edit,
  PauseCircle,
  PlayCircle,
  Play,
  Trash2,
  Loader2,
} from "lucide-react";
import { PreventiveMaintenance } from "@/lib/api/preventive-maintenance-api";
import { ChecklistTemplate } from "@/lib/api/work-orders-api";

interface PMScheduleDetailsProps {
  selectedPm: PreventiveMaintenance;
  onBack: () => void;
  getDynamicStatus: (pm: PreventiveMaintenance) => any;
  getDueDateSubtext: (pm: PreventiveMaintenance) => string;
  formatFrequency: (freq: string) => string;
  formatDateSafely: (date: string | null | undefined) => string;
  checklists: ChecklistTemplate[];
  handleEditClick: (pm: PreventiveMaintenance) => void;
  handleToggleStatus: (pm: PreventiveMaintenance) => void;
  handleManualTrigger: (pm: PreventiveMaintenance) => void;
  handleDeleteClick: (pm: PreventiveMaintenance) => void;
  historyLoading: boolean;
  pmHistory: any | null;
}

export function PMScheduleDetails({
  selectedPm,
  onBack,
  getDynamicStatus,
  getDueDateSubtext,
  formatFrequency,
  formatDateSafely,
  checklists,
  handleEditClick,
  handleToggleStatus,
  handleManualTrigger,
  handleDeleteClick,
  historyLoading,
  pmHistory,
}: PMScheduleDetailsProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Detail Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={onBack}
            className="h-9 w-9 border-slate-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              PM Schedule Details: <span className="text-indigo-600 font-semibold">{selectedPm.pmNumber}</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Home &gt; Preventive Maintenance &gt; {selectedPm.title}
            </p>
          </div>
        </div>
      </div>

      {/* Master Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Left Card: Details */}
        <div className="lg:col-span-1">
          <Card className="shadow-sm border border-slate-200 h-full flex flex-col justify-between overflow-hidden bg-card">
            <div>
              <CardHeader className="pb-4 border-b bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">PM Schedule Info</span>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border uppercase tracking-wider ${getDynamicStatus(selectedPm).colorClass}`}>
                    {getDynamicStatus(selectedPm).status}
                  </span>
                </div>
                <CardTitle className="text-xl font-bold text-slate-900 mt-2 leading-snug">
                  {selectedPm.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                <div className="space-y-3.5">
                  {/* Asset */}
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Building2 className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none">Asset</p>
                      <p className="text-sm font-semibold text-slate-800 mt-1">{selectedPm.asset?.assetName || "N/A"}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{selectedPm.asset?.assetCode || ""}</p>
                    </div>
                  </div>

                  {/* Frequency */}
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <Calendar className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none">Frequency</p>
                      <p className="text-sm font-semibold text-slate-800 mt-1">{formatFrequency(selectedPm.frequency)}</p>
                    </div>
                  </div>

                  {/* Assigned Tech */}
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Wrench className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none">Assigned Technician</p>
                      <p className="text-sm font-semibold text-slate-800 mt-1">
                        {selectedPm.assignedTechnician?.fullName || (
                          <span className="text-xs text-slate-400 italic">Unassigned</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Est Hours */}
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <Clock className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none">Estimated Hours</p>
                      <p className="text-sm font-semibold text-slate-800 mt-1">
                        {selectedPm.estimatedHours !== undefined && selectedPm.estimatedHours !== null
                          ? `${selectedPm.estimatedHours} hrs`
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Next Due Date */}
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                      <AlertCircle className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none">Next Due Date</p>
                      <p className="text-sm font-semibold text-slate-800 mt-1">{formatDateSafely(selectedPm.nextDueDate)}</p>
                      <p className={`text-xs mt-0.5 font-semibold ${
                        getDynamicStatus(selectedPm).status === "Overdue" ? "text-rose-600" :
                        getDynamicStatus(selectedPm).status === "Due Soon" ? "text-amber-600" : "text-emerald-600"
                      }`}>
                        {getDueDateSubtext(selectedPm)}
                      </p>
                    </div>
                  </div>

                  {/* Start Date */}
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center shrink-0">
                      <Calendar className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none">Start Date</p>
                      <p className="text-sm font-semibold text-slate-800 mt-1">{formatDateSafely(selectedPm.startDate)}</p>
                    </div>
                  </div>

                  {/* Checklist Template */}
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                      <CheckSquare className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none">Checklist Template</p>
                      <p className="text-sm font-semibold text-slate-800 mt-1">
                        {checklists.find(c => c.id === selectedPm.checklistTemplateId)?.name || "None"}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  {selectedPm.description && (
                    <div className="pt-3 border-t">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Description</p>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed whitespace-pre-wrap">{selectedPm.description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </div>

            <div className="p-6 border-t bg-slate-50/50 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="font-semibold text-xs h-9" onClick={() => handleEditClick(selectedPm)}>
                  <Edit className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
                  Edit Schedule
                </Button>
                <Button variant="outline" size="sm" className="font-semibold text-xs h-9" onClick={() => handleToggleStatus(selectedPm)}>
                  {selectedPm.status === "ACTIVE" ? (
                    <>
                      <PauseCircle className="mr-1.5 h-3.5 w-3.5 text-amber-600" />
                      Pause
                    </>
                  ) : (
                    <>
                      <PlayCircle className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                      Activate
                    </>
                  )}
                </Button>
              </div>
              <Button className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold text-xs h-9" onClick={() => handleManualTrigger(selectedPm)}>
                <Play className="mr-1.5 h-3.5 w-3.5" />
                Generate Work Order Now
              </Button>
              <Button variant="ghost" className="w-full text-rose-600 hover:text-rose-700 hover:bg-rose-50/50 font-semibold text-xs h-9" onClick={() => handleDeleteClick(selectedPm)}>
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Delete Schedule
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Card: WO History */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm border border-slate-200 h-full flex flex-col overflow-hidden bg-card">
            <CardHeader className="pb-4 border-b bg-slate-50/50">
              <CardTitle className="text-base font-semibold text-slate-900">Work Order History</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                All work orders generated from this preventive maintenance schedule.
              </p>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col justify-start">
              {historyLoading ? (
                <div className="flex h-[300px] flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="mt-3 text-xs text-muted-foreground">Loading PM history...</p>
                </div>
              ) : !pmHistory || pmHistory.history.length === 0 ? (
                <div className="flex h-[300px] flex-col items-center justify-center text-center">
                  <AlertCircle className="h-8 w-8 text-slate-400 mb-2" />
                  <p className="text-sm font-semibold text-slate-800">No Work Orders generated yet</p>
                  <p className="text-xs text-muted-foreground mt-1">This PM schedule hasn't generated any work orders yet.</p>
                </div>
              ) : (
                <div className="border rounded-xl overflow-hidden bg-card">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="font-semibold text-slate-700">WO No.</TableHead>
                        <TableHead className="font-semibold text-slate-700">Title</TableHead>
                        <TableHead className="font-semibold text-slate-700">Priority</TableHead>
                        <TableHead className="font-semibold text-slate-700">Status</TableHead>
                        <TableHead className="font-semibold text-slate-700">Created At</TableHead>
                        <TableHead className="font-semibold text-slate-700">Due Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pmHistory.history.map((wo: any) => (
                        <TableRow key={wo.id} className="hover:bg-slate-50/50">
                          <TableCell className="font-semibold text-slate-900">{wo.workOrderNumber}</TableCell>
                          <TableCell className="font-medium text-slate-800">{wo.title}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border uppercase tracking-wider ${
                              wo.priority === "CRITICAL" ? "text-rose-700 bg-rose-50 border-rose-200" :
                              wo.priority === "HIGH" ? "text-rose-600 bg-rose-50/50 border-rose-200" :
                              wo.priority === "MEDIUM" ? "text-amber-600 bg-amber-50/50 border-amber-200" :
                              "text-emerald-600 bg-emerald-50/50 border-emerald-200"
                            }`}>
                              {wo.priority}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border uppercase tracking-wider ${
                              wo.status === "COMPLETED" || wo.status === "CLOSED" ? "text-emerald-600 bg-emerald-50 border-emerald-200" :
                              wo.status === "IN_PROGRESS" ? "text-blue-600 bg-blue-50 border-blue-200" :
                              "text-slate-600 bg-slate-50 border-slate-200"
                            }`}>
                              {wo.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-slate-500 font-semibold text-xs">
                            {formatDateSafely(wo.createdAt)}
                          </TableCell>
                          <TableCell className="text-slate-500 font-semibold text-xs">
                            {formatDateSafely(wo.dueDate)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
