"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { fetchAssetById, Asset } from "@/lib/api/assets-api";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  AlertCircle, 
  FileText, 
  MapPin, 
  Building, 
  Tag, 
  Settings, 
  Calendar, 
  User, 
  Mail, 
  Info,
  Layers
} from "lucide-react";

interface ViewAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assetId: string | null;
}

const formatText = (text: string) => {
  return text
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function ViewAssetDialog({
  open,
  onOpenChange,
  assetId,
}: ViewAssetDialogProps) {
  const { toast } = useToast();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAsset = async () => {
      if (!open || !assetId) return;

      try {
        setLoading(true);
        setError(null);
        console.log("📖 Loading asset details:", assetId);
        const data = await fetchAssetById(assetId);
        console.log("✅ Asset details loaded:", data);
        setAsset(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load asset";
        console.error("❌ Error loading asset:", errorMessage);
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadAsset();
  }, [open, assetId, toast]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[92vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 border-b bg-muted/30">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Info className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">Asset Details</DialogTitle>
                <DialogDescription className="mt-0.5">
                  View complete information and status for this asset
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground font-medium">Loading asset details...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-8">
            <div className="rounded-lg bg-red-50 p-4 border border-red-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">Error loading asset</p>
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Details Content */}
        {asset && !loading && (
          <div className="px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Left & Middle Column (2/3 width) - Specifications */}
              <div className="md:col-span-2 space-y-8">
                
                {/* Title and Badges */}
                <div className="space-y-4 pb-4 border-b">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{asset.assetName}</h2>
                    <p className="text-sm text-muted-foreground font-mono mt-0.5">ID: {asset.assetCode}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200">
                      <Tag className="h-3.5 w-3.5 mr-1" />
                      {formatText(asset.category)}
                    </Badge>
                    <Badge
                      className={
                        asset.status === "ACTIVE"
                          ? "bg-green-50 text-green-700 hover:bg-green-50 border-green-200"
                          : asset.status === "UNDER_MAINTENANCE"
                          ? "bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200"
                          : asset.status === "BREAKDOWN"
                          ? "bg-red-50 text-red-700 hover:bg-red-50 border-red-200"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-50 border-gray-200"
                      }
                      variant="outline"
                    >
                      <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                        asset.status === "ACTIVE" ? "bg-green-500" :
                        asset.status === "UNDER_MAINTENANCE" ? "bg-amber-500" :
                        asset.status === "BREAKDOWN" ? "bg-red-500" : "bg-gray-500"
                      }`} />
                      {formatText(asset.status || "ACTIVE")}
                    </Badge>
                  </div>
                </div>

                {/* Section: Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Basic Location & Make</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-muted/20 rounded-xl p-5 border">
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                        <MapPin className="h-3.5 w-3.5" /> Location
                      </span>
                      <p className="text-sm font-semibold text-foreground">{asset.location}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                        <Building className="h-3.5 w-3.5" /> Manufacturer
                      </span>
                      <p className="text-sm font-semibold text-foreground">{asset.manufacturer || "Not Specified"}</p>
                    </div>
                  </div>
                </div>

                {/* Section: Technical Specs */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Technical Specifications</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 bg-muted/20 rounded-xl p-5 border">
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground font-medium">Model Number</span>
                      <p className="text-sm font-semibold text-foreground">{asset.modelNumber || "—"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground font-medium">Serial Number</span>
                      <p className="text-sm font-semibold text-foreground">{asset.serialNumber || "—"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground font-medium">Capacity</span>
                      <p className="text-sm font-semibold text-foreground">{asset.capacity || "—"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground font-medium">Power Rating</span>
                      <p className="text-sm font-semibold text-foreground">{asset.powerRating || "—"}</p>
                    </div>
                  </div>
                </div>

                {/* Section: Description */}
                {asset.description && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" /> Description & Notes
                    </h3>
                    <div className="bg-muted/10 rounded-xl p-5 border text-sm text-foreground leading-relaxed">
                      {asset.description}
                    </div>
                  </div>
                )}

              </div>

              {/* Right Column (1/3 width) - Image & Meta */}
              <div className="space-y-6">
                
                {/* Asset Image */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Asset Image</h3>
                  {asset.imageUrl ? (
                    <div className="rounded-xl overflow-hidden border bg-muted/30 shadow-sm">
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/assets/${asset.id}/image?t=${encodeURIComponent(asset.imageUrl)}`}
                        alt={asset.assetName}
                        className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-muted-foreground/25 bg-muted/10 p-8 text-center">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-2 text-muted-foreground">
                        <Settings className="h-5 w-5" />
                      </div>
                      <p className="text-xs text-muted-foreground font-medium">No image attached</p>
                    </div>
                  )}
                </div>

                {/* Meta details card */}
                <div className="rounded-xl border bg-muted/30 p-5 space-y-4">
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5" /> Metadata
                  </h4>
                  
                  <div className="space-y-3.5 text-xs">
                    <div className="space-y-1">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3" /> Created By
                      </span>
                      <p className="font-semibold text-foreground">
                        {asset.createdBy?.fullName || "System"}
                        {asset.createdBy?.role?.name && (
                          <span className="ml-1 text-muted-foreground font-normal">
                            ({formatText(asset.createdBy.role.name)})
                          </span>
                        )}
                      </p>
                    </div>

                    {asset.createdBy?.email && (
                      <div className="space-y-1">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" /> Email
                        </span>
                        <p className="font-semibold text-foreground truncate">{asset.createdBy.email}</p>
                      </div>
                    )}

                    <div className="space-y-1">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Created On
                      </span>
                      <p className="font-semibold text-foreground">{formatDate(asset.createdAt)}</p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
