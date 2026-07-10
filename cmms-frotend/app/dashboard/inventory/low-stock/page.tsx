"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/ui-components";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { fetchLowStock, SparePart } from "@/lib/api/inventory-api";

export default function LowStockPage() {
  const [parts, setParts] = useState<SparePart[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLowStock = async () => {
      setLoading(true);
      try {
        const data = await fetchLowStock();
        setParts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadLowStock();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Low Stock Alerts"
        description="Immediate notifications for spare parts falling below designated safety stock thresholds."
      />

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading low stock items...</div>
          ) : parts.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
              <ShieldAlert className="h-12 w-12 text-green-500" />
              <p className="font-semibold text-green-600">Stock Levels Healthy</p>
              <p className="text-xs text-muted-foreground">All spare parts are currently above their safety thresholds.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="text-sm font-semibold text-foreground pl-6">Part Code</TableHead>
                  <TableHead className="text-sm font-semibold text-foreground">Part Name</TableHead>
                  <TableHead className="text-sm font-semibold text-foreground">Warehouse Location</TableHead>
                  <TableHead className="text-sm font-semibold text-foreground text-right">Current Stock</TableHead>
                  <TableHead className="text-sm font-semibold text-foreground text-right">Safety Minimum</TableHead>
                  <TableHead className="text-sm font-semibold text-foreground text-right pr-6">Deficit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parts.map((part) => {
                  const deficit = part.minimumStock - part.currentStock;
                  return (
                    <TableRow key={part.id} className="bg-rose-500/[0.02] hover:bg-rose-500/[0.04] transition-colors">
                      <TableCell className="font-mono text-xs py-4 pl-6 text-rose-600 font-semibold">{part.partCode}</TableCell>
                      <TableCell className="font-semibold text-sm py-4 text-foreground flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
                        {part.partName}
                      </TableCell>
                      <TableCell className="text-sm py-4 text-muted-foreground">{part.warehouse?.name || "Unassigned"}</TableCell>
                      <TableCell className="text-right text-sm text-rose-600 font-bold py-4">{part.currentStock} {part.unit}</TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground font-semibold py-4">{part.minimumStock} {part.unit}</TableCell>
                      <TableCell className="text-right text-sm text-rose-600 font-bold py-4 pr-6">-{deficit} {part.unit}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
