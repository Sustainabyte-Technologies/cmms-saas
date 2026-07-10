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
import { fetchStockTransactions, StockTransaction } from "@/lib/api/inventory-api";

export default function TransactionsPage() {
  const [txs, setTxs] = useState<StockTransaction[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTx = async () => {
      setLoading(true);
      try {
        const data = await fetchStockTransactions(search);
        setTxs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadTx();
  }, [search]);

  const getTxTypeBadgeColor = (type: string) => {
    switch (type) {
      case "RECEIVE": return "text-green-700 bg-green-100 px-2 py-0.5 rounded text-xs font-bold";
      case "ISSUE": return "text-blue-700 bg-blue-100 px-2 py-0.5 rounded text-xs font-bold";
      case "RETURN": return "text-purple-700 bg-purple-100 px-2 py-0.5 rounded text-xs font-bold";
      case "ADJUSTMENT": return "text-orange-700 bg-orange-100 px-2 py-0.5 rounded text-xs font-bold";
      default: return "text-gray-700 bg-gray-100 px-2 py-0.5 rounded text-xs";
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Transactions Log"
        description="Immutable chronological record of all warehouse receipts, issues, adjustments, and movements."
      />

      <Card>
        <CardContent className="p-4 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by part name, part code, or reference no..."
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
            <div className="p-8 text-center text-muted-foreground">Loading transactions...</div>
          ) : txs.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No stock transactions logged.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="text-sm font-semibold text-foreground pl-6">Date / Time</TableHead>
                  <TableHead className="text-sm font-semibold text-foreground">Type</TableHead>
                  <TableHead className="text-sm font-semibold text-foreground">Part Code / Name</TableHead>
                  <TableHead className="text-sm font-semibold text-foreground">Warehouse</TableHead>
                  <TableHead className="text-sm font-semibold text-foreground text-right">Quantity</TableHead>
                  <TableHead className="text-sm font-semibold text-foreground">Performed By</TableHead>
                  <TableHead className="text-sm font-semibold text-foreground pr-6">Reference / Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {txs.map((tx) => (
                  <TableRow key={tx.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="text-xs text-muted-foreground py-4 pl-6">
                      {new Date(tx.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="py-4">
                      <span className={getTxTypeBadgeColor(tx.transactionType)}>
                        {tx.transactionType}
                      </span>
                    </TableCell>
                    <TableCell className="py-4">
                      <div>
                        <p className="font-semibold text-sm text-foreground">{tx.sparePart?.partName}</p>
                        <p className="text-xs text-muted-foreground font-mono">{tx.sparePart?.partCode}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground py-4">{tx.warehouse?.name || "Unassigned"}</TableCell>
                    <TableCell className={`text-right font-bold text-sm py-4 ${tx.transactionType === "ISSUE" ? "text-red-600" : "text-green-600"}`}>
                      {tx.transactionType === "ISSUE" ? "-" : "+"}{tx.quantity} {tx.sparePart?.unit}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground py-4">{tx.performedBy?.fullName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground py-4 pr-6 max-w-[200px] truncate">
                      {tx.referenceNumber ? `[${tx.referenceNumber}] ` : ""}
                      {tx.notes}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
