"use client";

// Edit AMC Contract Page
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, Save, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchAMCById, updateAMCContract, ContractType, AMCStatus } from "@/lib/api/amc-api";
import { toast } from "sonner";

export default function EditAMCContractPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [contractName, setContractName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [contractType, setContractType] = useState<ContractType>("COMPREHENSIVE");
  const [status, setStatus] = useState<AMCStatus>("ACTIVE");
  const [contractValue, setContractValue] = useState<number>(0);
  const [slaResponseTime, setSlaResponseTime] = useState<number>(24);
  const [slaResolutionTime, setSlaResolutionTime] = useState<number>(48);
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const contract = await fetchAMCById(id);
      setContractName(contract.contractName);
      setStartDate(new Date(contract.startDate).toISOString().slice(0, 10));
      setEndDate(new Date(contract.endDate).toISOString().slice(0, 10));
      setContractType(contract.contractType);
      setStatus(contract.status);
      setContractValue(contract.contractValue);
      setSlaResponseTime(contract.slaResponseTime);
      setSlaResolutionTime(contract.slaResolutionTime);
      setRemarks(contract.remarks || "");
    } catch (err: any) {
      toast.error(err.message || "Failed to load contract");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateAMCContract(id, {
        contractName,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        contractType,
        status,
        contractValue: Number(contractValue),
        slaResponseTime: Number(slaResponseTime),
        slaResolutionTime: Number(slaResolutionTime),
        remarks,
      });

      toast.success("AMC Contract updated successfully");
      router.push(`/dashboard/amc/contracts/${id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update contract");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
        Loading AMC Contract details...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/amc/contracts/${id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Edit AMC Contract</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Modify agreement parameters and SLA bounds</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Contract Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold uppercase">Contract Name</label>
              <Input value={contractName} onChange={(e) => setContractName(e.target.value)} required />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase">Contract Type</label>
              <Select value={contractType} onValueChange={(val) => setContractType(val as ContractType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COMPREHENSIVE">Comprehensive</SelectItem>
                  <SelectItem value="NON_COMPREHENSIVE">Non-Comprehensive</SelectItem>
                  <SelectItem value="LABOUR_ONLY">Labour Only</SelectItem>
                  <SelectItem value="PREVENTIVE_ONLY">Preventive Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase">Status</label>
              <Select value={status} onValueChange={(val) => setStatus(val as AMCStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase">Start Date</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase">End Date</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase">Contract Value ($)</label>
              <Input
                type="number"
                min="0"
                value={contractValue}
                onChange={(e) => setContractValue(Number(e.target.value))}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase">SLA Response Time (Hours)</label>
              <Input
                type="number"
                min="1"
                value={slaResponseTime}
                onChange={(e) => setSlaResponseTime(Number(e.target.value))}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase">SLA Resolution Time (Hours)</label>
              <Input
                type="number"
                min="1"
                value={slaResolutionTime}
                onChange={(e) => setSlaResolutionTime(Number(e.target.value))}
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold uppercase">Remarks</label>
              <Input value={remarks} onChange={(e) => setRemarks(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3 border-t pt-4">
          <Button variant="outline" type="button" asChild>
            <Link href={`/dashboard/amc/contracts/${id}`}>Cancel</Link>
          </Button>
          <Button type="submit" disabled={saving}>
            <Save className="h-4 w-4 mr-2" /> {saving ? "Saving Changes..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
