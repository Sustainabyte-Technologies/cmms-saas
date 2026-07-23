"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, RefreshCw, Eye, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AMCVisitsPage() {
  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">AMC Service Visits History</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track routine inspections, PM visits, technician assignments and completion status
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/amc/contracts">View Contracts</Link>
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="p-4 border-b">
          <CardTitle className="text-base font-bold">Scheduled & Performed Visits Registry</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-bold">Visit Date</TableHead>
                <TableHead className="font-bold">Visit Type</TableHead>
                <TableHead className="font-bold">Contract</TableHead>
                <TableHead className="font-bold">Technician</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="font-bold">Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="text-xs font-semibold">{new Date().toLocaleDateString()}</TableCell>
                <TableCell><Badge variant="outline">ROUTINE</Badge></TableCell>
                <TableCell className="font-mono text-xs font-bold text-primary">AMC-000001</TableCell>
                <TableCell className="text-xs font-medium">John Technician</TableCell>
                <TableCell><Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20">SCHEDULED</Badge></TableCell>
                <TableCell className="text-xs text-muted-foreground">Monthly HVAC inspection</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
