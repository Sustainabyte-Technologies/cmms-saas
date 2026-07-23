"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  ArrowLeft,
  Calendar,
  DollarSign,
  Shield,
  Clock,
  Building,
  User,
  Plus,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Wrench,
  Ticket,
  ClipboardList,
  Edit,
  History,
  Layers,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { fetchAMCById, generateAMCPM, renewAMCContract, AMCContract } from "@/lib/api/amc-api";
import { toast } from "sonner";

export default function AMCDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [contract, setContract] = useState<AMCContract | null>(null);
  const [loading, setLoading] = useState(true);

  // Renew Dialog State
  const [renewDialogOpen, setRenewDialogOpen] = useState(false);
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [newContractValue, setNewContractValue] = useState<number>(0);
  const [renewRemarks, setRenewRemarks] = useState("");
  const [renewing, setRenewing] = useState(false);

  // Generate PM State
  const [generatingPM, setGeneratingPM] = useState(false);

  useEffect(() => {
    if (id) loadContract();
  }, [id]);

  const loadContract = async () => {
    setLoading(true);
    try {
      const res = await fetchAMCById(id);
      setContract(res);
      // Pre-fill renewal fields
      if (res) {
        const currentEnd = new Date(res.endDate);
        const nextStart = new Date(currentEnd);
        nextStart.setDate(nextStart.getDate() + 1);
        const nextEnd = new Date(nextStart);
        nextEnd.setFullYear(nextEnd.getFullYear() + 1);

        setNewStartDate(nextStart.toISOString().slice(0, 10));
        setNewEndDate(nextEnd.toISOString().slice(0, 10));
        setNewContractValue(res.contractValue);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load AMC Contract");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePM = async () => {
    if (!contract) return;
    setGeneratingPM(true);
    try {
      const res = await generateAMCPM(contract.id);
      toast.success(res.message || "Generated PM schedules successfully");
      loadContract();
    } catch (err: any) {
      toast.error(err.message || "Failed to generate PM schedules");
    } finally {
      setGeneratingPM(false);
    }
  };

  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract) return;
    setRenewing(true);
    try {
      const payload = {
        newStartDate: new Date(newStartDate).toISOString(),
        newEndDate: new Date(newEndDate).toISOString(),
        newContractValue: Number(newContractValue),
        remarks: renewRemarks,
      };

      const newContract = await renewAMCContract(contract.id, payload);
      toast.success(`AMC Contract renewed successfully as ${newContract.contractNumber}`);
      setRenewDialogOpen(false);
      router.push(`/dashboard/amc/contracts/${newContract.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to renew contract");
    } finally {
      setRenewing(false);
    }
  };

  const handleExportContractPDF = () => {
    if (!contract) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups to export the PDF contract certificate");
      return;
    }

    const startStr = new Date(contract.startDate).toLocaleDateString();
    const endStr = new Date(contract.endDate).toLocaleDateString();

    const assetRows = (contract.assets || []).map((item, i) => `
      <tr style="background-color: ${i % 2 === 0 ? '#ffffff' : '#f8fafc'};">
        <td style="padding: 10px 12px; font-family: monospace; font-weight: bold; color: #166534;">${item.asset?.assetCode || '-'}</td>
        <td style="padding: 10px 12px; font-weight: 600; color: #0f172a;">${item.asset?.assetName || '-'}</td>
        <td style="padding: 10px 12px; color: #334155;">${item.asset?.category || '-'}</td>
        <td style="padding: 10px 12px; color: #334155;">${item.asset?.location || '-'}</td>
        <td style="padding: 10px 12px;"><span style="display: inline-block; padding: 2px 8px; font-size: 10px; font-weight: 600; border-radius: 4px; background-color: ${item.warrantyIncluded ? '#dcfce7' : '#f1f5f9'}; color: ${item.warrantyIncluded ? '#15803d' : '#64748b'};">${item.warrantyIncluded ? 'COVERED' : 'EXCLUDED'}</span></td>
      </tr>
    `).join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>AMC Agreement Certificate - ${contract.contractNumber}</title>
          <style>
            @page { size: A4 portrait; margin: 15mm; }
            body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 20px; background: #fff; }
            .header-bar { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #15803d; padding-bottom: 15px; margin-bottom: 20px; }
            .logo-title { font-size: 24px; font-weight: 800; color: #15803d; letter-spacing: -0.5px; }
            .logo-sub { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #15803d; margin-top: 2px; }
            .cert-stamp { font-size: 13px; font-weight: 800; color: #15803d; border: 2px solid #15803d; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
            .field-group { margin-bottom: 8px; }
            .field-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; }
            .field-value { font-size: 13px; font-weight: 600; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
            th { background-color: #0f172a; color: #ffffff; text-align: left; padding: 10px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
            td { border-bottom: 1px solid #e2e8f0; }
            .terms-box { margin-top: 25px; padding: 12px; background: #f1f5f9; border-radius: 6px; font-size: 11px; color: #475569; }
            .footer-sign { margin-top: 50px; display: flex; justify-content: space-between; padding-top: 20px; border-top: 1px solid #cbd5e1; }
            .sign-box { width: 220px; text-align: center; font-size: 11px; color: #64748b; }
            .sign-line { border-top: 1px solid #0f172a; margin-top: 45px; margin-bottom: 4px; }
          </style>
        </head>
        <body>
          <div class="header-bar">
            <div style="display: flex; align-items: center; gap: 12px;">
              <img src="${window.location.origin}/logo1.png" style="height: 42px; width: auto; object-fit: contain;" />
              <div style="display: flex; flex-direction: column;">
                <img src="${window.location.origin}/logo2.png" style="height: 24px; width: auto; object-fit: contain;" />
                <div class="logo-sub">Enterprise Maintenance Contract Certificate</div>
              </div>
            </div>
            <div class="cert-stamp">${contract.status}</div>
          </div>

          <div style="margin-bottom: 20px;">
            <h2 style="margin: 0 0 5px 0; font-size: 18px; color: #0f172a;">${contract.contractName}</h2>
            <div style="font-family: monospace; font-weight: bold; color: #15803d; font-size: 13px;">Contract Ref: ${contract.contractNumber}</div>
          </div>

          <div class="details-grid">
            <div>
              <div class="field-group">
                <div class="field-label">Customer Organization</div>
                <div class="field-value">${contract.customer?.name || 'N/A'}</div>
              </div>
              <div class="field-group">
                <div class="field-label">Site / Plant Facility</div>
                <div class="field-value">${contract.site?.name || 'N/A'}</div>
              </div>
              <div class="field-group">
                <div class="field-label">Contract Type</div>
                <div class="field-value" style="color: #15803d;">${contract.contractType.replace('_', ' ')}</div>
              </div>
              <div class="field-group">
                <div class="field-label">Contract Financial Value</div>
                <div class="field-value">$${contract.contractValue.toLocaleString()} ${contract.currency}</div>
              </div>
            </div>
            <div>
              <div class="field-group">
                <div class="field-label">Start Date</div>
                <div class="field-value">${startStr}</div>
              </div>
              <div class="field-group">
                <div class="field-label">Expiry Date</div>
                <div class="field-value">${endStr}</div>
              </div>
              <div class="field-group">
                <div class="field-label">Service Response SLA</div>
                <div class="field-value">${contract.slaResponseTime} Hours (Resolution: ${contract.slaResolutionTime} Hours)</div>
              </div>
              <div class="field-group">
                <div class="field-label">Service Frequency</div>
                <div class="field-value">${contract.serviceFrequency || 'MONTHLY'}</div>
              </div>
            </div>
          </div>

          <h3 style="font-size: 13px; font-weight: 700; margin-bottom: 10px; color: #0f172a; text-transform: uppercase;">Covered Equipment Schedule (${contract.assets?.length || 0} Assets)</h3>
          <table>
            <thead>
              <tr>
                <th>Asset Code</th>
                <th>Equipment Name</th>
                <th>Category</th>
                <th>Location</th>
                <th>Warranty Status</th>
              </tr>
            </thead>
            <tbody>
              ${assetRows}
            </tbody>
          </table>

          <div class="terms-box">
            <strong>Service Terms & SLA Guarantee:</strong> This contract binds FixByte Operations to maintain the covered assets above in accordance with response SLA within ${contract.slaResponseTime} hours and resolution SLA within ${contract.slaResolutionTime} hours. Non-compliance is logged as an SLA breach.
          </div>

          <div class="footer-sign">
            <div class="sign-box">
              <div class="sign-line"></div>
              <div>Customer Authorized Signatory</div>
            </div>
            <div class="sign-box">
              <div class="sign-line"></div>
              <div>FixByte Operations Director</div>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
        Loading AMC Contract details...
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-foreground">AMC Contract Not Found</h2>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/dashboard/amc/contracts">Back to Contracts</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Banner Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card p-6 rounded-2xl border shadow-sm">
        <div className="flex items-start gap-4">
          <Button variant="outline" size="icon" asChild className="shrink-0">
            <Link href="/dashboard/amc/contracts">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold text-primary px-2.5 py-0.5 bg-primary/10 rounded-md">
                {contract.contractNumber}
              </span>
              <Badge variant="outline" className="text-xs">
                {contract.contractType.replace("_", " ")}
              </Badge>
              {contract.status === "ACTIVE" ? (
                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                  Active Coverage
                </Badge>
              ) : (
                <Badge variant="outline">{contract.status}</Badge>
              )}
            </div>
            <h1 className="text-2xl font-extrabold text-foreground mt-1.5">{contract.contractName}</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Customer: <span className="font-semibold text-foreground">{contract.customer?.name}</span> • Site:{" "}
              <span className="font-semibold text-foreground">{contract.site?.name}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button variant="outline" size="sm" onClick={handleExportContractPDF} className="border-emerald-600/30 text-emerald-600 hover:bg-emerald-50">
            <Printer className="h-4 w-4 mr-2" /> Export PDF Certificate
          </Button>
          <Button variant="outline" size="sm" onClick={handleGeneratePM} disabled={generatingPM}>
            <RefreshCw className={`h-4 w-4 mr-2 ${generatingPM ? "animate-spin" : ""}`} />
            Auto-Generate PM
          </Button>
          <Button variant="outline" size="sm" onClick={() => setRenewDialogOpen(true)}>
            <RefreshCw className="h-4 w-4 mr-2 text-blue-500" />
            Renew Contract
          </Button>
          <Button size="sm" asChild>
            <Link href={`/dashboard/amc/contracts/${contract.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" /> Edit Contract
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-lg text-blue-500">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Contract Value</p>
              <p className="text-xl font-bold text-foreground">
                ${contract.contractValue.toLocaleString()} {contract.currency}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-500">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Validity Period</p>
              <p className="text-sm font-semibold">
                {new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}
              </p>
              {contract.remainingDays !== undefined && (
                <p className={`text-xs font-bold ${contract.remainingDays <= 30 ? "text-amber-500" : "text-emerald-600"}`}>
                  {contract.remainingDays} days remaining
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 rounded-lg text-indigo-500">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">SLA Constraints</p>
              <p className="text-xs font-semibold">
                Response: <span className="text-primary font-bold">{contract.slaResponseTime}h</span> • Resolution:{" "}
                <span className="text-primary font-bold">{contract.slaResolutionTime}h</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 rounded-lg text-purple-500">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Covered Assets</p>
              <p className="text-xl font-bold text-foreground">{contract.assets?.length || 0} Assets</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Content */}
      <Tabs defaultValue="assets" className="space-y-4">
        <TabsList className="bg-card border">
          <TabsTrigger value="assets">Covered Assets ({contract.assets?.length || 0})</TabsTrigger>
          <TabsTrigger value="visits">Service Visits ({contract.visits?.length || 0})</TabsTrigger>
          <TabsTrigger value="history">Service History ({contract.serviceHistories?.length || 0})</TabsTrigger>
          <TabsTrigger value="renewals">Renewal History ({contract.renewals?.length || 0})</TabsTrigger>
        </TabsList>

        {/* Tab 1: Covered Assets */}
        <TabsContent value="assets">
          <Card className="shadow-sm">
            <CardHeader className="p-4 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Equipment Covered Under AMC</CardTitle>
                <CardDescription>Assets bound by response SLA and parts warranty terms</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="font-bold">Asset Code</TableHead>
                    <TableHead className="font-bold">Asset Name</TableHead>
                    <TableHead className="font-bold">Category</TableHead>
                    <TableHead className="font-bold">Location</TableHead>
                    <TableHead className="font-bold">Warranty Included</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!contract.assets || contract.assets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No assets mapped to this contract yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    contract.assets.map((item) => (
                      <TableRow key={item.id} className="hover:bg-muted/40">
                        <TableCell className="font-mono text-xs font-bold text-primary">
                          {item.asset?.assetCode}
                        </TableCell>
                        <TableCell className="font-semibold text-foreground">{item.asset?.assetName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.asset?.category}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{item.asset?.location}</TableCell>
                        <TableCell>
                          {item.warrantyIncluded ? (
                            <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20">Yes</Badge>
                          ) : (
                            <Badge variant="outline">No</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Service Visits */}
        <TabsContent value="visits">
          <Card className="shadow-sm">
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-base font-bold">Scheduled & Performed AMC Visits</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="font-bold">Visit Date</TableHead>
                    <TableHead className="font-bold">Visit Type</TableHead>
                    <TableHead className="font-bold">Technician</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="font-bold">Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!contract.visits || contract.visits.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No visit records recorded yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    contract.visits.map((visit) => (
                      <TableRow key={visit.id}>
                        <TableCell className="text-xs font-semibold">
                          {new Date(visit.visitDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{visit.visitType}</Badge>
                        </TableCell>
                        <TableCell className="text-xs font-medium">{visit.technician?.fullName || "Unassigned"}</TableCell>
                        <TableCell>
                          <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/20">{visit.status}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{visit.remarks || "-"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Service History */}
        <TabsContent value="history">
          <Card className="shadow-sm">
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-base font-bold">AMC Service & Breakdown History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="font-bold">Date</TableHead>
                    <TableHead className="font-bold">Asset</TableHead>
                    <TableHead className="font-bold">Technician</TableHead>
                    <TableHead className="font-bold">Parts Used</TableHead>
                    <TableHead className="font-bold text-right">Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!contract.serviceHistories || contract.serviceHistories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No service history recorded for this AMC.
                      </TableCell>
                    </TableRow>
                  ) : (
                    contract.serviceHistories.map((hist) => (
                      <TableRow key={hist.id}>
                        <TableCell className="text-xs font-semibold">
                          {new Date(hist.visitDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-xs font-medium">{hist.asset?.assetName}</TableCell>
                        <TableCell className="text-xs">{hist.technician?.fullName || "N/A"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{hist.partsUsed || "None"}</TableCell>
                        <TableCell className="text-right font-semibold text-xs">${hist.cost}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Renewal History */}
        <TabsContent value="renewals">
          <Card className="shadow-sm">
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-base font-bold">Historical Renewals & Extensions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="font-bold">Renewal Date</TableHead>
                    <TableHead className="font-bold">Previous Validity</TableHead>
                    <TableHead className="font-bold">New Validity</TableHead>
                    <TableHead className="font-bold text-right">Previous Value</TableHead>
                    <TableHead className="font-bold text-right">New Value</TableHead>
                    <TableHead className="font-bold">Renewed By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!contract.renewals || contract.renewals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No historical renewals recorded yet for this contract.
                      </TableCell>
                    </TableRow>
                  ) : (
                    contract.renewals.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="text-xs font-semibold">
                          {new Date(r.renewalDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(r.previousStartDate).toLocaleDateString()} -{" "}
                          {new Date(r.previousEndDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-emerald-600">
                          {new Date(r.newStartDate).toLocaleDateString()} - {new Date(r.newEndDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right text-xs font-medium">${r.previousValue}</TableCell>
                        <TableCell className="text-right text-xs font-bold text-emerald-600">${r.newValue}</TableCell>
                        <TableCell className="text-xs">{r.renewedBy?.fullName || "System"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Renew Modal */}
      <Dialog open={renewDialogOpen} onOpenChange={setRenewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Renew AMC Contract</DialogTitle>
            <DialogDescription>
              Clone agreement parameters, extend validity, and archive previous version.
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
                placeholder="e.g. 5% annual price escalation applied"
                value={renewRemarks}
                onChange={(e) => setRenewRemarks(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setRenewDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={renewing}>
                {renewing ? "Renewing..." : "Confirm Renewal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
