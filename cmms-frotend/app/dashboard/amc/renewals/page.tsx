"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  RefreshCw,
  AlertTriangle,
  Clock,
  CheckCircle,
  FileText,
  Calendar,
  DollarSign,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { fetchAMCExpiringContracts, renewAMCContract, AMCContract } from "@/lib/api/amc-api";
import { toast } from "sonner";

export default function AMCRenewalsPage() {
  const [expiringContracts, setExpiringContracts] = useState<AMCContract[]>([]);
  const [loading, setLoading] = useState(true);

  // Renewal Modal
  const [selectedContract, setSelectedContract] = useState<AMCContract | null>(null);
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [newContractValue, setNewContractValue] = useState<number>(0);
  const [remarks, setRemarks] = useState("");
  const [renewing, setRenewing] = useState(false);

  useEffect(() => {
    loadExpiring();
  }, []);

  const loadExpiring = async () => {
    setLoading(true);
    try {
      const data = await fetchAMCExpiringContracts();
      setExpiringContracts(data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load expiring contracts");
    } finally {
      setLoading(false);
    }
  };

  const openRenewModal = (contract: AMCContract) => {
    setSelectedContract(contract);
    const end = new Date(contract.endDate);
    const nextStart = new Date(end);
    nextStart.setDate(nextStart.getDate() + 1);
    const nextEnd = new Date(nextStart);
    nextEnd.setFullYear(nextEnd.getFullYear() + 1);

    setNewStartDate(nextStart.toISOString().slice(0, 10));
    setNewEndDate(nextEnd.toISOString().slice(0, 10));
    setNewContractValue(contract.contractValue);
    setRemarks("");
  };

  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract) return;
    setRenewing(true);
    try {
      const payload = {
        newStartDate: new Date(newStartDate).toISOString(),
        newEndDate: new Date(newEndDate).toISOString(),
        newContractValue: Number(newContractValue),
        remarks,
      };

      const result = await renewAMCContract(selectedContract.id, payload);
      toast.success(`Contract ${selectedContract.contractNumber} renewed successfully!`);
      setSelectedContract(null);
      loadExpiring();
    } catch (err: any) {
      toast.error(err.message || "Failed to renew contract");
    } finally {
      setRenewing(false);
    }
  };

  const urgentContracts = expiringContracts.filter((c) => (c.remainingDays ?? 99) <= 7);
  const moderateContracts = expiringContracts.filter(
    (c) => (c.remainingDays ?? 99) > 7 && (c.remainingDays ?? 99) <= 15
  );
  const standardContracts = expiringContracts.filter(
    (c) => (c.remainingDays ?? 99) > 15 && (c.remainingDays ?? 99) <= 30
  );

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">AMC Renewals Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Automated 30-day, 15-day, and 7-day contract expiry alerts & one-click renewal engine
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadExpiring} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {/* Alert Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-rose-500 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase">Critical (≤ 7 Days)</p>
              <h3 className="text-2xl font-bold mt-1">{urgentContracts.length}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Immediate action required</p>
            </div>
            <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase">Moderate (8 - 15 Days)</p>
              <h3 className="text-2xl font-bold mt-1">{moderateContracts.length}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Renewal pending</p>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
              <Clock className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">Upcoming (16 - 30 Days)</p>
              <h3 className="text-2xl font-bold mt-1">{standardContracts.length}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Advance notice</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
              <Calendar className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Expiring Contracts Table */}
      <Card className="shadow-sm">
        <CardHeader className="p-4 border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold">Contracts Pending Renewal</CardTitle>
            <CardDescription>Click Renew to extend contract validity and maintain historical continuity</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-bold">Contract No.</TableHead>
                <TableHead className="font-bold">Contract Name</TableHead>
                <TableHead className="font-bold">Customer</TableHead>
                <TableHead className="font-bold">End Date</TableHead>
                <TableHead className="font-bold">Days Remaining</TableHead>
                <TableHead className="font-bold text-right">Value</TableHead>
                <TableHead className="font-bold text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Checking expiring contracts...
                  </TableCell>
                </TableRow>
              ) : expiringContracts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                    No active contracts expiring within 30 days. All contracts are up-to-date!
                  </TableCell>
                </TableRow>
              ) : (
                expiringContracts.map((c) => {
                  const days = c.remainingDays ?? 0;
                  const isCritical = days <= 7;
                  const isModerate = days > 7 && days <= 15;

                  return (
                    <TableRow key={c.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="font-mono text-xs font-bold text-primary">{c.contractNumber}</TableCell>
                      <TableCell className="font-semibold text-foreground text-sm">{c.contractName}</TableCell>
                      <TableCell className="text-xs font-medium">{c.customer?.name || "N/A"}</TableCell>
                      <TableCell className="text-xs">{new Date(c.endDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            isCritical
                              ? "bg-rose-500/15 text-rose-600 border-rose-500/20"
                              : isModerate
                              ? "bg-amber-500/15 text-amber-600 border-amber-500/20"
                              : "bg-blue-500/15 text-blue-600 border-blue-500/20"
                          }
                        >
                          {days <= 0 ? "Expired" : `${days} Days Left`}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-sm">
                        ${c.contractValue.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button size="sm" onClick={() => openRenewModal(c)}>
                            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Renew
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/amc/contracts/${c.id}`}>Details</Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Renewal Dialog */}
      {selectedContract && (
        <Dialog open={!!selectedContract} onOpenChange={() => setSelectedContract(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Renew Contract {selectedContract.contractNumber}</DialogTitle>
              <DialogDescription>
                Renew {selectedContract.contractName} for customer {selectedContract.customer?.name}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleRenewSubmit} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase">New Start Date</label>
                <Input
                  type="date"
                  value={newStartDate}
                  onChange={(e) => setNewStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase">New End Date</label>
                <Input type="date" value={newEndDate} onChange={(e) => setNewEndDate(e.target.value)} required />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase">New Contract Value ($)</label>
                <Input
                  type="number"
                  min="0"
                  value={newContractValue}
                  onChange={(e) => setNewContractValue(Number(e.target.value))}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase">Renewal Remarks</label>
                <Input
                  placeholder="e.g. Contract extended for 1 year with updated terms"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setSelectedContract(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={renewing}>
                  {renewing ? "Renewing..." : "Confirm Renewal"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
