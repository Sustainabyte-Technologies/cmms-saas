"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  ArrowLeft,
  Building,
  Calendar,
  DollarSign,
  Shield,
  Clock,
  Plus,
  Trash2,
  Check,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { getCustomers, getSites, getDepartments, Customer, Site, Department } from "@/lib/api/customers-api";
import { fetchAssets, Asset } from "@/lib/api/assets-api";
import { createAMCContract, ContractType, AMCStatus } from "@/lib/api/amc-api";
import { toast } from "sonner";

export default function CreateAMCContractPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Master Data
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);

  // Form Fields
  const [contractName, setContractName] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [siteId, setSiteId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(
    new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10)
  );
  const [contractType, setContractType] = useState<ContractType>("COMPREHENSIVE");
  const [status, setStatus] = useState<AMCStatus>("ACTIVE");
  const [contractValue, setContractValue] = useState<number>(5000);
  const [currency, setCurrency] = useState("USD");
  const [slaResponseTime, setSlaResponseTime] = useState<number>(24);
  const [slaResolutionTime, setSlaResolutionTime] = useState<number>(48);
  const [serviceFrequency, setServiceFrequency] = useState("MONTHLY");
  const [numberOfVisits, setNumberOfVisits] = useState<number>(12);
  const [remarks, setRemarks] = useState("");

  // Asset Selection & Coverage
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [assetCoverageMap, setAssetCoverageMap] = useState<Record<string, { coverageType: string; warrantyIncluded: boolean }>>({});

  useEffect(() => {
    loadMasterData();
  }, []);

  const loadMasterData = async () => {
    try {
      const [c, s, d, aRes] = await Promise.all([
        getCustomers(),
        getSites(),
        getDepartments(),
        fetchAssets(1, 100),
      ]);
      setCustomers(c || []);
      setSites(s || []);
      setDepartments(d || []);
      setAssets(aRes.data || []);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load customer/site/asset records");
    }
  };

  const filteredSites = customerId ? sites.filter((s) => s.customerId === customerId) : sites;
  const filteredDepartments = siteId ? departments.filter((d) => d.siteId === siteId) : departments;
  const filteredAssets = assets.filter((a) => {
    if (customerId && a.customerId && a.customerId !== customerId) return false;
    if (siteId && a.siteId && a.siteId !== siteId) return false;
    return true;
  });

  const toggleAssetSelection = (assetId: string) => {
    if (selectedAssetIds.includes(assetId)) {
      setSelectedAssetIds(selectedAssetIds.filter((id) => id !== assetId));
    } else {
      setSelectedAssetIds([...selectedAssetIds, assetId]);
      if (!assetCoverageMap[assetId]) {
        setAssetCoverageMap({
          ...assetCoverageMap,
          [assetId]: { coverageType: "FULL_SERVICE", warrantyIncluded: true },
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractName.trim()) {
      toast.error("Please enter a Contract Name");
      return;
    }
    if (!customerId) {
      toast.error("Please select a Customer");
      return;
    }
    if (!siteId) {
      toast.error("Please select a Site");
      return;
    }

    setLoading(true);

    try {
      const mappedAssets = selectedAssetIds.map((assetId) => ({
        assetId,
        coverageType: assetCoverageMap[assetId]?.coverageType || "FULL_SERVICE",
        warrantyIncluded: assetCoverageMap[assetId]?.warrantyIncluded ?? true,
      }));

      const payload = {
        contractName,
        customerId,
        siteId,
        departmentId: departmentId || undefined,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        contractType,
        status,
        contractValue: Number(contractValue),
        currency,
        slaResponseTime: Number(slaResponseTime),
        slaResolutionTime: Number(slaResolutionTime),
        serviceFrequency,
        numberOfVisits: Number(numberOfVisits),
        remarks,
        assets: mappedAssets,
      };

      const result = await createAMCContract(payload);
      toast.success(`AMC Contract ${result.contractNumber} created successfully!`);
      router.push(`/dashboard/amc/contracts/${result.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create AMC Contract");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/amc/contracts">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Create Enterprise AMC Contract</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Register new customer maintenance agreement, SLA limits, and covered equipment
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Primary Contract Details */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Contract Information
            </CardTitle>
            <CardDescription>General agreement details and scope</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-foreground uppercase">Contract Title / Name *</label>
              <Input
                placeholder="e.g. Annual HVAC & Generator Maintenance Contract 2026-2027"
                value={contractName}
                onChange={(e) => setContractName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase">Customer *</label>
              <Select value={customerId} onValueChange={setCustomerId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select Customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase">Site *</label>
              <Select value={siteId} onValueChange={setSiteId} required disabled={!customerId}>
                <SelectTrigger>
                  <SelectValue placeholder={customerId ? "Select Site" : "Select Customer First"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredSites.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase">Department (Optional)</label>
              <Select value={departmentId} onValueChange={setDepartmentId} disabled={!siteId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {filteredDepartments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase">Contract Type *</label>
              <Select value={contractType} onValueChange={(val) => setContractType(val as ContractType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COMPREHENSIVE">Comprehensive (Parts Included)</SelectItem>
                  <SelectItem value="NON_COMPREHENSIVE">Non-Comprehensive (Parts Extra)</SelectItem>
                  <SelectItem value="LABOUR_ONLY">Labour Only</SelectItem>
                  <SelectItem value="PREVENTIVE_ONLY">Preventive Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase">Status *</label>
              <Select value={status} onValueChange={(val) => setStatus(val as AMCStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase">Contract Value *</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0"
                  value={contractValue}
                  onChange={(e) => setContractValue(Number(e.target.value))}
                  required
                />
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-[90px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Dates, PM Frequency & SLA */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" /> Validity, Frequency & SLA Settings
            </CardTitle>
            <CardDescription>Define contract timeline, service frequency, and response SLA bounds</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase">Start Date *</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase">End Date *</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase">Service Frequency *</label>
              <Select value={serviceFrequency} onValueChange={setServiceFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                  <SelectItem value="HALF_YEARLY">Half Yearly</SelectItem>
                  <SelectItem value="YEARLY">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase">Total Visits Included</label>
              <Input
                type="number"
                min="1"
                value={numberOfVisits}
                onChange={(e) => setNumberOfVisits(Number(e.target.value))}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase">SLA Response Time (Hours)</label>
              <Input
                type="number"
                min="1"
                value={slaResponseTime}
                onChange={(e) => setSlaResponseTime(Number(e.target.value))}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase">SLA Resolution Time (Hours)</label>
              <Input
                type="number"
                min="1"
                value={slaResolutionTime}
                onChange={(e) => setSlaResolutionTime(Number(e.target.value))}
              />
            </div>

            <div className="space-y-1.5 lg:col-span-2">
              <label className="text-xs font-bold text-foreground uppercase">Remarks / Special Terms</label>
              <Input
                placeholder="e.g. Mandatory 24/7 breakdown support included"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Covered Assets Selection Table */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" /> Covered Assets Selection ({selectedAssetIds.length} Selected)
              </CardTitle>
              <CardDescription>Select equipment covered under this AMC contract</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[350px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="w-[50px] text-center">Select</TableHead>
                    <TableHead className="font-bold">Asset Code</TableHead>
                    <TableHead className="font-bold">Asset Name</TableHead>
                    <TableHead className="font-bold">Category</TableHead>
                    <TableHead className="font-bold">Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No assets found for the selected customer/site filter.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAssets.map((asset) => {
                      const isSelected = selectedAssetIds.includes(asset.id);
                      return (
                        <TableRow
                          key={asset.id}
                          className={`cursor-pointer transition-colors ${isSelected ? "bg-primary/5 font-medium" : "hover:bg-muted/40"}`}
                          onClick={() => toggleAssetSelection(asset.id)}
                        >
                          <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleAssetSelection(asset.id)}
                            />
                          </TableCell>
                          <TableCell className="font-mono text-xs font-bold text-primary">
                            {asset.assetCode}
                          </TableCell>
                          <TableCell className="font-semibold text-foreground">{asset.assetName}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{asset.category}</Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{asset.location}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button variant="outline" type="button" asChild>
            <Link href="/dashboard/amc/contracts">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating Contract..." : "Create AMC Contract"}
          </Button>
        </div>
      </form>
    </div>
  );
}
