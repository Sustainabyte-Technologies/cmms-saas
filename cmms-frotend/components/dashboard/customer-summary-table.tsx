"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getDashboardSummary, CustomerSummaryItem } from "@/lib/api/dashboard-api";
import { Layers, Search, ChevronLeft, ChevronRight } from "lucide-react";

export function CustomerSummaryTable() {
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 5;

  const [data, setData] = useState<CustomerSummaryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchValue);
      setPage(1); // Reset page on new search
    }, 300);
    return () => clearTimeout(handler);
  }, [searchValue]);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getDashboardSummary(debouncedSearch, page, limit);
        setData(result.data || []);
        setTotal(result.total || 0);
        setTotalPages(result.totalPages || 1);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch customer summary");
        console.error("Error fetching customer summary:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [debouncedSearch, page]);

  // Calculate item range for displaying: "Showing X-Y of Z"
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <Card className="border border-border shadow-sm">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 gap-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Layers className="h-4 w-4 text-primary" />
            Customer Hierarchy Summary
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">Complete hierarchy counts per customer.</p>
        </div>
        
        {/* Search bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or code..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9 h-9 w-full bg-background"
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="rounded-md border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-semibold text-foreground">Customer</TableHead>
                <TableHead className="text-center font-semibold text-foreground">Sites</TableHead>
                <TableHead className="text-center font-semibold text-foreground">Departments</TableHead>
                <TableHead className="text-center font-semibold text-foreground">Systems</TableHead>
                <TableHead className="text-center font-semibold text-foreground">Assets</TableHead>
                <TableHead className="text-center font-semibold text-foreground">Work Orders</TableHead>
                <TableHead className="text-center font-semibold text-foreground">Checklists</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Loading Skeletons
                Array.from({ length: limit }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="py-4">
                      <div className="space-y-2">
                        <div className="h-4 w-28 bg-muted rounded animate-pulse" />
                        <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                      </div>
                    </TableCell>
                    {Array.from({ length: 6 }).map((_, cellIdx) => (
                      <TableCell key={cellIdx} className="text-center py-4">
                        <div className="h-4 w-8 bg-muted rounded mx-auto animate-pulse" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-destructive font-medium">
                    Failed to load customer summary data: {error}
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No customers found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={item.customerId} className="hover:bg-muted/5 transition-colors">
                    <TableCell className="font-medium">
                      <div>
                        <p className="font-semibold text-sm text-foreground">{item.customerName}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">{item.customerCode}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-sm font-semibold">{item.sites}</TableCell>
                    <TableCell className="text-center text-sm font-semibold">{item.departments}</TableCell>
                    <TableCell className="text-center text-sm font-semibold">{item.systems}</TableCell>
                    <TableCell className="text-center text-sm font-semibold">{item.assets}</TableCell>
                    <TableCell className="text-center text-sm font-semibold">{item.workOrders}</TableCell>
                    <TableCell className="text-center text-sm font-semibold">{item.checklists}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination controls */}
        {!loading && !error && total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-1">
            <p className="text-xs text-muted-foreground font-medium">
              Showing <span className="font-semibold text-foreground">{startItem}</span> to{" "}
              <span className="font-semibold text-foreground">{endItem}</span> of{" "}
              <span className="font-semibold text-foreground">{total}</span> customers
            </p>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 gap-1 pl-2 pr-3"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <span className="text-xs font-semibold text-muted-foreground min-w-[70px] text-center select-none">
                Page {page} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-8 gap-1 pl-3 pr-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
