"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { History, RefreshCw, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AMCServiceHistoryPage() {
  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">AMC Service & Spare Parts History</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Complete audit trail of service tickets, work orders, technician logs & parts consumed under AMC
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/amc/contracts">View Contracts</Link>
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="p-4 border-b">
          <CardTitle className="text-base font-bold">Service Log Registry</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-bold">Visit Date</TableHead>
                <TableHead className="font-bold">Contract</TableHead>
                <TableHead className="font-bold">Asset</TableHead>
                <TableHead className="font-bold">Technician</TableHead>
                <TableHead className="font-bold">Parts Consumed</TableHead>
                <TableHead className="font-bold text-right">Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="text-xs font-semibold">{new Date().toLocaleDateString()}</TableCell>
                <TableCell className="font-mono text-xs font-bold text-primary">AMC-000001</TableCell>
                <TableCell className="text-xs font-medium">Chiller Unit #1</TableCell>
                <TableCell className="text-xs">John Senior Tech</TableCell>
                <TableCell className="text-xs text-muted-foreground">Filter Cartridge (Covered)</TableCell>
                <TableCell className="text-right font-bold text-xs">$0.00</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
