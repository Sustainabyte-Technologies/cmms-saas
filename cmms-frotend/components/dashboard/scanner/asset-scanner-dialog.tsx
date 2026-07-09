"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchAssetById, Asset } from "@/lib/api/assets-api";
import { useToast } from "@/hooks/use-toast";
import {
  QrCode,
  Camera,
  Upload,
  Search,
  Wrench,
  MapPin,
  AlertCircle,
  Loader2,
  Building,
  Check,
  ChevronRight,
  Info
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

interface AssetScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssetScannerDialog({ open, onOpenChange }: AssetScannerDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("camera");
  const [scanning, setScanning] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState<string>("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to parse assetId from scanned QR text
  const extractAssetId = (text: string): string => {
    try {
      if (text.includes("assetId=")) {
        const url = new URL(text);
        return url.searchParams.get("assetId") || text;
      }
    } catch (_) {
      // If not a valid URL, check if there's query parameter manually
      if (text.includes("assetId=")) {
        const parts = text.split("assetId=");
        return parts[parts.length - 1];
      }
    }
    return text; // Fallback to raw text (assuming it is the direct UUID)
  };

  const handleAssetFound = async (rawText: string) => {
    const assetId = extractAssetId(rawText);
    console.log("🔍 Scanned Asset ID:", assetId);
    setLoading(true);
    setError(null);
    stopScanner();

    try {
      const data = await fetchAssetById(assetId);
      setAsset(data);
      toast({
        title: "Asset Found",
        description: `Successfully loaded details for ${data.assetName}`,
      });
    } catch (err) {
      console.error(err);
      setError("Asset not found. Please verify the QR code is correct.");
      toast({
        title: "Lookup Failed",
        description: "Could not retrieve asset details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) return;

    setError(null);
    setScanning(true);
    setAsset(null);

    // Wait for the DOM element to render
    setTimeout(async () => {
      try {
        const html5Qrcode = new Html5Qrcode("reader");
        scannerRef.current = html5Qrcode;

        await html5Qrcode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
          },
          (decodedText) => {
            handleAssetFound(decodedText);
          },
          () => {
            // silent fail on scan frames
          }
        );
      } catch (err) {
        console.error("Camera scan start error:", err);
        setError("Could not access camera. Please allow camera permissions or upload an image instead.");
        setScanning(false);
      }
    }, 100);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      if (scannerRef.current.isScanning) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current = null;
            setScanning(false);
          })
          .catch((err) => {
            console.error("Failed to stop scanner:", err);
          });
      } else {
        scannerRef.current = null;
        setScanning(false);
      }
    }
  };

  // Start scanner when dialog opens and tab is "camera"
  useEffect(() => {
    if (open && activeTab === "camera" && !asset && !loading) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [open, activeTab, asset]);

  // Handle image upload scanning
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setAsset(null);

    try {
      const html5Qrcode = new Html5Qrcode("file-scanner-temp");
      const decodedText = await html5Qrcode.scanFile(file, true);
      await handleAssetFound(decodedText);
    } catch (err) {
      console.error(err);
      setError("No readable QR code found in this image.");
      toast({
        title: "Scan Failed",
        description: "Could not read QR code from file.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Handle manual code lookups
  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;

    setLoading(true);
    setError(null);
    setAsset(null);

    try {
      const data = await fetchAssetById(manualCode.trim());
      setAsset(data);
      toast({
        title: "Asset Found",
        description: `Successfully loaded details for ${data.assetName}`,
      });
    } catch (err) {
      console.error(err);
      setError("Asset ID not found in database. Please verify and try again.");
      toast({
        title: "Search Failed",
        description: "Asset not found.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAsset(null);
    setError(null);
    setManualCode("");
    if (activeTab === "camera") {
      startScanner();
    }
  };

  const handleClose = () => {
    stopScanner();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) handleClose(); }}>
      <DialogContent className="sm:max-w-[500px] overflow-hidden p-0 rounded-2xl">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b bg-muted/20">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <QrCode className="h-4.5 w-4.5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-lg">Scan Asset QR Code</DialogTitle>
                <DialogDescription className="text-xs">
                  Scan a QR code to view live asset specs and active status.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Tab Controls (only show if no asset is currently loaded) */}
        {!asset && !loading && (
          <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setError(null); }} className="w-full">
            <div className="px-6 pt-4 border-b">
              <TabsList className="grid w-full grid-cols-3 bg-muted/40 p-1 rounded-lg h-9">
                <TabsTrigger value="camera" className="text-xs font-semibold gap-1.5 py-1.5">
                  <Camera className="h-3.5 w-3.5" /> Camera
                </TabsTrigger>
                <TabsTrigger value="upload" className="text-xs font-semibold gap-1.5 py-1.5">
                  <Upload className="h-3.5 w-3.5" /> Upload
                </TabsTrigger>
                <TabsTrigger value="manual" className="text-xs font-semibold gap-1.5 py-1.5">
                  <Search className="h-3.5 w-3.5" /> Code
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Camera Tab Content */}
            <TabsContent value="camera" className="mt-0">
              <div className="flex flex-col items-center justify-center p-6 space-y-4">
                <div className="relative w-full aspect-square max-w-[260px] rounded-2xl overflow-hidden border-2 border-primary/30 bg-black flex items-center justify-center shadow-inner">
                  {scanning ? (
                    <div id="reader" className="w-full h-full [&_video]:object-cover" />
                  ) : (
                    <div className="text-center p-4 text-muted-foreground/60">
                      <Camera className="h-10 w-10 mx-auto mb-2 text-muted-foreground/30 animate-pulse" />
                      <p className="text-xs font-medium">Starting camera...</p>
                    </div>
                  )}
                  {scanning && (
                    <div className="absolute inset-0 border-2 border-primary/50 animate-pulse pointer-events-none rounded-xl m-6">
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />
                      <div className="absolute top-1/2 left-0 right-0 h-[1.5px] bg-primary/60 animate-bounce" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground text-center">
                  Align the QR code within the square to scan automatically.
                </p>
              </div>
            </TabsContent>

            {/* Upload Tab Content */}
            <TabsContent value="upload" className="mt-0">
              <div className="p-6 space-y-4">
                <div
                  className="border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/30 transition-all rounded-xl p-8 text-center cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                  <p className="text-xs font-semibold text-foreground">Upload QR Code Image</p>
                  <p className="text-[10px] text-muted-foreground mt-1">PNG, JPG, or JPEG up to 5MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
                {/* Hidden container needed for html5-qrcode file scanning */}
                <div id="file-scanner-temp" className="hidden" />
              </div>
            </TabsContent>

            {/* Manual Code Input Tab Content */}
            <TabsContent value="manual" className="mt-0">
              <form onSubmit={handleManualSearch} className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="manual-asset-id" className="text-xs">Asset ID / Code</Label>
                  <div className="flex gap-2">
                    <Input
                      id="manual-asset-id"
                      placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      className="text-xs flex-1 h-9"
                    />
                    <Button type="submit" disabled={!manualCode.trim()} className="h-9 text-xs px-4">
                      Lookup
                    </Button>
                  </div>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs font-medium text-muted-foreground">Retrieving asset data...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && !asset && (
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider">Scan / Search Error</h4>
                <p className="text-xs mt-1 text-destructive/80 leading-relaxed">{error}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2.5">
              <Button variant="outline" size="sm" onClick={handleReset} className="text-xs">
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Display Scanned Asset Details */}
        {asset && !loading && (
          <div className="p-6 space-y-5">
            <div className="flex items-start gap-4">
              {asset.imageUrl ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/assets/${asset.id}/image?t=${encodeURIComponent(asset.imageUrl)}`}
                  alt={asset.assetName}
                  className="h-16 w-16 rounded-lg object-cover border shrink-0"
                />
              ) : (
                <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center border border-dashed shrink-0 text-muted-foreground/50">
                  <Wrench className="h-6 w-6" />
                </div>
              )}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge variant="outline" className="text-[10px] font-mono py-0 px-1.5 bg-muted/50">
                    {asset.assetCode}
                  </Badge>
                  <Badge
                    className={`text-[9px] font-bold py-0.5 px-2 rounded-full ${
                      asset.status === "ACTIVE"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : asset.status === "UNDER_MAINTENANCE"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : asset.status === "BREAKDOWN"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    {asset.status || "ACTIVE"}
                  </Badge>
                </div>
                <h3 className="text-base font-bold text-foreground truncate">{asset.assetName}</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 shrink-0" /> {asset.location}
                </p>
              </div>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 gap-4 bg-muted/20 border rounded-xl p-4 text-xs">
              <div>
                <span className="text-muted-foreground block font-medium">Category</span>
                <span className="font-semibold text-foreground mt-0.5 block">{asset.category}</span>
              </div>
              {asset.manufacturer && (
                <div>
                  <span className="text-muted-foreground block font-medium">Manufacturer</span>
                  <span className="font-semibold text-foreground mt-0.5 block">{asset.manufacturer}</span>
                </div>
              )}
              {asset.modelNumber && (
                <div>
                  <span className="text-muted-foreground block font-medium">Model</span>
                  <span className="font-semibold text-foreground mt-0.5 block">{asset.modelNumber}</span>
                </div>
              )}
              {asset.serialNumber && (
                <div>
                  <span className="text-muted-foreground block font-medium">Serial Number</span>
                  <span className="font-semibold text-foreground mt-0.5 block">{asset.serialNumber}</span>
                </div>
              )}
            </div>

            {/* Description Summary */}
            {asset.description && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Notes / Description</span>
                <p className="text-xs text-foreground/80 leading-relaxed bg-muted/10 rounded-lg p-3 border border-border/60">
                  {asset.description}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2.5 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="flex-1 text-xs"
              >
                Scan Another
              </Button>
              <Button
                asChild
                size="sm"
                className="flex-1 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                <a href={`/dashboard/assets?assetId=${asset.id}`}>
                  View Full Profile <ChevronRight className="h-4 w-4 ml-1" />
                </a>
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
