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
                <TableRow>
                  <TableHead>Part Code</TableHead>
                  <TableHead>Part Name</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead className="text-right">Total Current Stock</TableHead>
                  <TableHead className="text-right">Reserved Qty</TableHead>
                  <TableHead className="text-right">Available Qty</TableHead>
                  <TableHead className="text-right">Min Level</TableHead>
                  <TableHead className="text-right">Max Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parts.map((part) => {
                  const availableStock = part.currentStock - part.reservedStock;
                  return (
                    <TableRow key={part.id}>
                      <TableCell className="font-mono text-xs">{part.partCode}</TableCell>
                      <TableCell className="font-semibold">{part.partName}</TableCell>
                      <TableCell>{part.warehouse?.name || "Unassigned"}</TableCell>
                      <TableCell className="text-right font-medium">{part.currentStock} {part.unit}</TableCell>
                      <TableCell className="text-right text-amber-600 font-medium">{part.reservedStock} {part.unit}</TableCell>
                      <TableCell className="text-right text-green-600 font-bold">{availableStock} {part.unit}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{part.minimumStock} {part.unit}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{part.maximumStock} {part.unit}</TableCell>
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
