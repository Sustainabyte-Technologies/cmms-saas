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
                <TableRow>
                  <TableHead>Part Code</TableHead>
                  <TableHead>Part Name</TableHead>
                  <TableHead>Warehouse Location</TableHead>
                  <TableHead className="text-right">Current Stock</TableHead>
                  <TableHead className="text-right">Safety Minimum</TableHead>
                  <TableHead className="text-right">Deficit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parts.map((part) => {
                  const deficit = part.minimumStock - part.currentStock;
                  return (
                    <TableRow key={part.id} className="bg-rose-500/5">
                      <TableCell className="font-mono text-xs text-rose-600">{part.partCode}</TableCell>
                      <TableCell className="font-bold flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
                        {part.partName}
                      </TableCell>
                      <TableCell>{part.warehouse?.name || "Unassigned"}</TableCell>
                      <TableCell className="text-right text-rose-600 font-bold">{part.currentStock} {part.unit}</TableCell>
                      <TableCell className="text-right text-muted-foreground font-semibold">{part.minimumStock} {part.unit}</TableCell>
                      <TableCell className="text-right text-rose-600 font-bold">-{deficit} {part.unit}</TableCell>
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
