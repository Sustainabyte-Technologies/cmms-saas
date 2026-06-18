"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createAsset, uploadAssetImage, Asset, CreateAssetPayload } from "@/lib/api/assets-api";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, ImageIcon, Package, Info } from "lucide-react";

interface CreateAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (asset: Asset) => void;
}

export function CreateAssetDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateAssetDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Omit<CreateAssetPayload, 'status'>>({
    assetName: "",
    category: "",
    location: "",
    manufacturer: "",
    modelNumber: "",
    serialNumber: "",
    capacity: "",
    powerRating: "",
    description: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof Omit<CreateAssetPayload, 'status'>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setFilePreview(url);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const resetForm = () => {
    setFormData({
      assetName: "",
      category: "",
      location: "",
      manufacturer: "",
      modelNumber: "",
      serialNumber: "",
      capacity: "",
      powerRating: "",
      description: "",
    });
    handleRemoveFile();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.assetName.trim()) {
      toast({ title: "Validation Error", description: "Asset name is required", variant: "destructive" });
      return;
    }
    if (!formData.category.trim()) {
      toast({ title: "Validation Error", description: "Category is required", variant: "destructive" });
      return;
    }
    if (!formData.location.trim()) {
      toast({ title: "Validation Error", description: "Location is required", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      let newAsset = await createAsset(formData);

      if (selectedFile && newAsset.id) {
        try {
          const updatedAsset = await uploadAssetImage(newAsset.id, selectedFile);
          newAsset = { ...newAsset, ...updatedAsset };
        } catch (uploadError) {
          toast({
            title: "Warning",
            description: "Asset created but image upload failed. You can upload the image later.",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Success",
        description: `Asset "${formData.assetName}" has been created successfully`,
      });

      resetForm();
      onOpenChange(false);
      onSuccess?.(newAsset);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create asset";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[92vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 border-b bg-muted/30">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">Create New Asset</DialogTitle>
                <DialogDescription className="mt-0.5">
                  Add a new asset to your organization. Fields marked with <span className="text-red-500">*</span> are required.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-8 py-6 space-y-8">
            {/* Info Banner */}
            <div className="flex items-start gap-3 rounded-lg bg-blue-50 border border-blue-200 p-4">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
              <p className="text-sm text-blue-800">
                New assets are automatically created with <span className="font-semibold">ACTIVE</span> status and can be modified later.
              </p>
            </div>

            {/* Section: Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="space-y-2">
                  <Label htmlFor="assetName">
                    Asset Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="assetName"
                    placeholder="e.g., Carrier Chiller"
                    value={formData.assetName}
                    onChange={(e) => handleInputChange(e, "assetName")}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="category"
                    placeholder="e.g., Chiller, Manufacturing"
                    value={formData.category}
                    onChange={(e) => handleInputChange(e, "category")}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">
                    Location <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="location"
                    placeholder="e.g., Block A"
                    value={formData.location}
                    onChange={(e) => handleInputChange(e, "location")}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input
                    id="manufacturer"
                    placeholder="e.g., Carrier"
                    value={formData.manufacturer}
                    onChange={(e) => handleInputChange(e, "manufacturer")}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Section: Technical Specifications */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Technical Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                <div className="space-y-2">
                  <Label htmlFor="modelNumber">Model Number</Label>
                  <Input
                    id="modelNumber"
                    placeholder="e.g., 30XA"
                    value={formData.modelNumber}
                    onChange={(e) => handleInputChange(e, "modelNumber")}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serialNumber">Serial Number</Label>
                  <Input
                    id="serialNumber"
                    placeholder="e.g., CH123456"
                    value={formData.serialNumber}
                    onChange={(e) => handleInputChange(e, "serialNumber")}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    placeholder="e.g., 250 TR"
                    value={formData.capacity}
                    onChange={(e) => handleInputChange(e, "capacity")}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="powerRating">Power Rating</Label>
                  <Input
                    id="powerRating"
                    placeholder="e.g., 180 kW"
                    value={formData.powerRating}
                    onChange={(e) => handleInputChange(e, "powerRating")}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Section: Description */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Description</h3>
              <div className="space-y-2">
                <Label htmlFor="description">Notes / Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter any additional notes about this asset..."
                  value={formData.description}
                  onChange={(e) => handleInputChange(e, "description")}
                  disabled={loading}
                  rows={4}
                  className="resize-none"
                />
              </div>
            </div>

            {/* Section: Attachment */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Attachment</h3>
              <div className="space-y-2">
                <Label htmlFor="attachment">Asset Image</Label>
                {!selectedFile ? (
                  <div
                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all duration-200 group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <Upload className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Click to upload
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          JPG, PNG, GIF up to 10MB
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border rounded-lg p-3 bg-muted/30">
                    <div className="flex items-center gap-3">
                      {filePreview ? (
                        <img
                          src={filePreview}
                          alt="Preview"
                          className="h-16 w-16 rounded-lg object-cover border"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center border">
                          <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={handleRemoveFile}
                        disabled={loading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  id="attachment"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-5 border-t bg-muted/30 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="min-w-[100px]"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[140px]">
              {loading ? "Creating..." : "Create Asset"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
