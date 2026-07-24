"use client";

import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle, AlertTriangle, Sparkles } from "lucide-react";

export function ComparisonSection() {
  const comparisonData = [
    { feature: "AI Predictive Failure Detection", excel: false, legacy: false, fixbyte: true },
    { feature: "Real-time Mobile Work Order Dispatching", excel: false, legacy: "Partial", fixbyte: true },
    { feature: "Asset Hierarchy & QR Code Scanning", excel: false, legacy: true, fixbyte: true },
    { feature: "Goods Receipt (GRN) Auto Stock Increment", excel: false, legacy: false, fixbyte: true },
    { feature: "Reliability KPIs (MTTR, MTBF, RCA, FMECA)", excel: false, legacy: false, fixbyte: true },
    { feature: "Annual Maintenance Contract (AMC) Module", excel: false, legacy: false, fixbyte: true },
    { feature: "Natural Language AI Assistant & Search", excel: false, legacy: false, fixbyte: true },
    { feature: "Setup Time & Onboarding", excel: "Instant (Fragile)", legacy: "6-12 Months", fixbyte: "Same Day Setup" },
  ];

  return (
    <section className="bg-white py-24 text-slate-900 border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge className="bg-[#54EC46]/20 text-emerald-800 border-[#54EC46]/40 text-xs px-3 py-1 font-bold">
            WHY FIXBYTE
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            See How FixByte Compares To Traditional Solutions
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            Compare manual spreadsheets and bloated legacy desktop CMMS platforms with FixByte's AI-native architecture.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 shadow-xl overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-200 hover:bg-transparent">
                <TableHead className="w-[300px] text-base font-bold text-slate-900">Capabilities & Features</TableHead>
                <TableHead className="text-center text-sm font-semibold text-slate-600">Excel / Paper Records</TableHead>
                <TableHead className="text-center text-sm font-semibold text-slate-600">Legacy Desktop CMMS</TableHead>
                <TableHead className="text-center text-base font-bold text-emerald-800 bg-[#54EC46]/20 rounded-t-xl py-3 border border-emerald-300/40">
                  FixByte AI-CMMS
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparisonData.map((row, idx) => (
                <TableRow key={idx} className="border-b border-slate-200/80 hover:bg-white/80">
                  <TableCell className="font-semibold text-sm text-slate-900">{row.feature}</TableCell>

                  <TableCell className="text-center">
                    {typeof row.excel === "boolean" ? (
                      row.excel ? (
                        <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-600" />
                      ) : (
                        <XCircle className="mx-auto h-5 w-5 text-slate-400" />
                      )
                    ) : (
                      <span className="text-xs text-slate-600 font-medium">{row.excel}</span>
                    )}
                  </TableCell>

                  <TableCell className="text-center">
                    {typeof row.legacy === "boolean" ? (
                      row.legacy ? (
                        <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-600" />
                      ) : (
                        <XCircle className="mx-auto h-5 w-5 text-slate-400" />
                      )
                    ) : (
                      <span className="text-xs text-slate-600 font-medium">{row.legacy}</span>
                    )}
                  </TableCell>

                  <TableCell className="text-center bg-[#54EC46]/10 font-bold">
                    {typeof row.fixbyte === "boolean" ? (
                      <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-600" />
                    ) : (
                      <span className="text-xs text-emerald-700 font-bold">{row.fixbyte}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
