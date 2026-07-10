"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/ui-components";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";
import { fetchSpareParts, SparePart } from "@/lib/api/inventory-api";

export default function StockPage() {
  const [parts, setParts] = useState<SparePart[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStock = async () => {
      setLoading(true);
      try {
        const data = await fetchSpareParts(search);
        setParts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadStock();
  }, [search]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Stock Levels"
        description="Verify real-time quantities: Current, Reserved (assigned to approved WOs), and Available stock."
      />

      <Card>
        <CardContent className="p-4 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search stock by name or part code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading stock levels...</div>
          ) : parts.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No stock matching criteria.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="text-sm font-semibold text-foreground pl-6">Part Code</TableHead>
                  <TableHead className="text-sm font-semibold text-foreground">Part Name</TableHead>
                  <TableHead className="text-sm font-semibold text-foreground">Warehouse</TableHead>
                  <TableHead className="text-sm font-semibold text-foreground text-right">Total Current Stock</TableHead>
                  <TableHead className="text-sm font-semibold text-foreground text-right">Reserved Qty</TableHead>
                  <TableHead className="text-sm font-semibold text-foreground text-right">Available Qty</TableHead>
                  <TableHead className="text-sm font-semibold text-foreground text-right">Min Level</TableHead>
                  <TableHead className="text-sm font-semibold text-foreground text-right pr-6">Max Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parts.map((part) => {
                  const availableStock = part.currentStock - part.reservedStock;
                  return (
                    <TableRow key={part.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-xs py-4 pl-6 text-muted-foreground">{part.partCode}</TableCell>
                      <TableCell className="font-medium text-sm py-4 text-foreground">{part.partName}</TableCell>
                      <TableCell className="text-sm py-4 text-muted-foreground">{part.warehouse?.name || "Unassigned"}</TableCell>
                      <TableCell className="text-right text-sm font-medium py-4 text-foreground">{part.currentStock} {part.unit}</TableCell>
                      <TableCell className="text-right text-sm text-amber-600 font-medium py-4">{part.reservedStock} {part.unit}</TableCell>
                      <TableCell className="text-right text-sm text-green-600 font-bold py-4">{availableStock} {part.unit}</TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground py-4">{part.minimumStock} {part.unit}</TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground py-4 pr-6">{part.maximumStock} {part.unit}</TableCell>
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
