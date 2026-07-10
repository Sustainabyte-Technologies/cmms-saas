"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateAsset, uploadAssetImage, deleteAsset, Asset, CreateAssetPayload } from "@/lib/api/assets-api";
import { getCustomers, Customer } from "@/lib/api/customers-api";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, Upload, X, ImageIcon, Pencil } from "lucide-react";

interface EditAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset | null;
  onSuccess?: (asset: Asset) => void;
  onDeleted?: () => void;
}

export function EditAssetDialog({
  open,
  onOpenChange,
  asset,
  onSuccess,
  onDeleted,
}: EditAssetDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [selectedSiteId, setSelectedSiteId] = useState<string>("");
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");

  const [formData, setFormData] = useState<Partial<CreateAssetPayload>>({
    assetName: "",
    category: "",
    location: "",
    manufacturer: "",
    modelNumber: "",
    serialNumber: "",
    capacity: "",
    powerRating: "",
    description: "",
    status: "ACTIVE",
    systemId: "",
  });

  // Fetch customers list
  useEffect(() => {
    if (open) {
      getCustomers()
        .then(setCustomers)
        .catch(err => {
          console.error("Failed to load customers for asset edit:", err);
        });
    }
  }, [open]);

  // Update form data when asset changes
  useEffect(() => {
    if (asset && open) {
      setFormData({
        assetName: asset.assetName || "",
        category: asset.category || "",
        location: asset.location || "",
        manufacturer: asset.manufacturer || "",
        modelNumber: asset.modelNumber || "",
        serialNumber: asset.serialNumber || "",
        capacity: asset.capacity || "",
        powerRating: asset.powerRating || "",
        description: asset.description || "",
        status: asset.status || "ACTIVE",
        systemId: asset.systemId || "",
      });
      setSelectedCustomerId(asset.customerId || "");
      setSelectedSiteId(asset.siteId || "");
      setSelectedDeptId(asset.departmentId || "");
      // Reset file state
      setSelectedFile(null);
      setFilePreview(null);
    }
  }, [asset, open]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof CreateAssetPayload
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSelectChange = (value: string, field: keyof CreateAssetPayload) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!asset) {
      toast({ title: "Error", description: "No asset selected", variant: "destructive" });
      return;
    }

    if (!formData.assetName?.trim()) {
      toast({ title: "Validation Error", description: "Asset name is required", variant: "destructive" });
      return;
    }
    if (!formData.category?.trim()) {
      toast({ title: "Validation Error", description: "Category is required", variant: "destructive" });
      return;
    }
    if (!formData.location?.trim()) {
      toast({ title: "Validation Error", description: "Location is required", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);

      let updatedAsset = await updateAsset(asset.id, {
        ...formData,
        customerId: selectedCustomerId || null,
        siteId: selectedSiteId || null,
        departmentId: selectedDeptId || null,
        systemId: formData.systemId || null,
      });

      // Upload image if a new file was selected
      if (selectedFile) {
        try {
          const imageResult = await uploadAssetImage(asset.id, selectedFile);
          updatedAsset = { ...updatedAsset, ...imageResult };
        } catch (uploadError) {
          toast({
            title: "Warning",
            description: "Asset updated but image upload failed. You can try uploading the image again.",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Success",
        description: `Asset "${formData.assetName}" has been updated successfully`,
      });

      onOpenChange(false);
      onSuccess?.(updatedAsset);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update asset";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!asset) return;

    try {
      setLoading(true);
      await deleteAsset(asset.id);

      toast({
        title: "Success",
        description: `Asset "${asset.assetName}" has been deleted successfully`,
      });

      setShowDeleteConfirm(false);
      onOpenChange(false);
      onDeleted?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete asset";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Current image URL (existing or new preview)
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const currentImageUrl = filePreview || (asset?.imageUrl ? `${API_BASE_URL}/assets/${asset.id}/image?t=${encodeURIComponent(asset.imageUrl)}` : null);

  if (!asset) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[92vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 border-b bg-muted/30">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Pencil className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">Edit Asset</DialogTitle>
                <DialogDescription className="mt-0.5">
                  Update the asset information. Fields marked with <span className="text-red-500">*</span> are required.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-8 py-6 space-y-8">
            {/* Section: Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-assetName">
                    Asset Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-assetName"
                    placeholder="e.g., Carrier Chiller"
                    value={formData.assetName || ""}
                    onChange={(e) => handleInputChange(e, "assetName")}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-category">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-category"
                    placeholder="e.g., Chiller, Manufacturing"
                    value={formData.category || ""}
                    onChange={(e) => handleInputChange(e, "category")}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-location">
                    Location <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-location"
                    placeholder="e.g., Block A"
                    value={formData.location || ""}
                    onChange={(e) => handleInputChange(e, "location")}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-manufacturer">Manufacturer</Label>
                  <Input
                    id="edit-manufacturer"
                    placeholder="e.g., Carrier"
                    value={formData.manufacturer || ""}
                    onChange={(e) => handleInputChange(e, "manufacturer")}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Section: System Assignment */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">System Assignment (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-customerSelect">Customer</Label>
                  <select
                    id="edit-customerSelect"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedCustomerId}
                    onChange={(e) => {
                      setSelectedCustomerId(e.target.value);
                      setSelectedSiteId("");
                      setSelectedDeptId("");
                      setFormData(prev => ({ ...prev, systemId: "" }));
                    }}
                    disabled={loading}
                  >
                    <option value="">— Select Customer —</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-siteSelect">Site</Label>
                  <select
                    id="edit-siteSelect"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedSiteId}
                    onChange={(e) => {
                      setSelectedSiteId(e.target.value);
                      setSelectedDeptId("");
                      setFormData(prev => ({ ...prev, systemId: "" }));
                    }}
                    disabled={loading || !selectedCustomerId}
                  >
                    <option value="">— Select Site —</option>
                    {customers.find(c => c.id === selectedCustomerId)?.sites?.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-deptSelect">Department</Label>
                  <select
                    id="edit-deptSelect"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedDeptId}
                    onChange={(e) => {
                      setSelectedDeptId(e.target.value);
                      setFormData(prev => ({ ...prev, systemId: "" }));
                    }}
                    disabled={loading || !selectedSiteId}
                  >
                    <option value="">— Select Department —</option>
                    {customers.find(c => c.id === selectedCustomerId)?.sites?.find(s => s.id === selectedSiteId)?.departments?.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-systemSelect">System</Label>
                  <select
                    id="edit-systemSelect"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.systemId || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, systemId: e.target.value }))}
                    disabled={loading || !selectedDeptId}
                  >
                    <option value="">— Select System —</option>
                    {customers.find(c => c.id === selectedCustomerId)?.sites?.find(s => s.id === selectedSiteId)?.departments?.find(d => d.id === selectedDeptId)?.systems?.map(sys => (
                      <option key={sys.id} value={sys.id}>{sys.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section: Technical Specifications */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Technical Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-modelNumber">Model Number</Label>
                  <Input
                    id="edit-modelNumber"
                    placeholder="e.g., 30XA"
                    value={formData.modelNumber || ""}
                    onChange={(e) => handleInputChange(e, "modelNumber")}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-serialNumber">Serial Number</Label>
                  <Input
                    id="edit-serialNumber"
                    placeholder="e.g., CH123456"
                    value={formData.serialNumber || ""}
                    onChange={(e) => handleInputChange(e, "serialNumber")}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-capacity">Capacity</Label>
                  <Input
                    id="edit-capacity"
                    placeholder="e.g., 250 TR"
                    value={formData.capacity || ""}
                    onChange={(e) => handleInputChange(e, "capacity")}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-powerRating">Power Rating</Label>
                  <Input
                    id="edit-powerRating"
                    placeholder="e.g., 180 kW"
                    value={formData.powerRating || ""}
                    onChange={(e) => handleInputChange(e, "powerRating")}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Section: Status */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Status</h3>
              <div className="max-w-xs">
                <Label htmlFor="edit-status">Current Status</Label>
                <Select
                  value={formData.status || "ACTIVE"}
                  onValueChange={(value) => handleSelectChange(value, "status")}
                  disabled={loading}
                >
                  <SelectTrigger id="edit-status" className="mt-2">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="UNDER_MAINTENANCE">Under Maintenance</SelectItem>
                    <SelectItem value="BREAKDOWN">Breakdown</SelectItem>
                    <SelectItem value="IDLE">Idle</SelectItem>
                    <SelectItem value="RETIRED">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Section: Description */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Description</h3>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Notes / Description</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Enter any additional notes about this asset..."
                  value={formData.description || ""}
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
                <Label htmlFor="edit-attachment">Asset Image</Label>

                {/* Show current image if exists */}
                {currentImageUrl && !selectedFile && (
                  <div className="relative rounded-lg overflow-hidden border bg-muted/30 group">
                    <img
                      src={currentImageUrl}
                      alt={asset.assetName}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Change Image
                      </Button>
                    </div>
                  </div>
                )}

                {/* Upload area if no image */}
                {!currentImageUrl && !selectedFile && (
                  <div
                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all duration-200 group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <Upload className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Click to upload</p>
                        <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG, GIF up to 10MB</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* New file selected preview */}
                {selectedFile && (
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
                          {(selectedFile.size / 1024).toFixed(1)} KB · New image (will replace current)
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
                  id="edit-attachment"
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
          <div className="px-8 py-5 border-t bg-muted/30 flex items-center">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={loading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Asset
            </Button>
            <div className="flex gap-3 ml-auto">
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
                {loading ? "Updating..." : "Update Asset"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Asset</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold">{asset?.assetName}</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {loading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
