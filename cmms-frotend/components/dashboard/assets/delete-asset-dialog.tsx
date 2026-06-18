"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteAsset, Asset } from "@/lib/api/assets-api";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle } from "lucide-react";

interface DeleteAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset | null;
  onSuccess?: () => void;
}

export function DeleteAssetDialog({
  open,
  onOpenChange,
  asset,
  onSuccess,
}: DeleteAssetDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!asset) {
      toast({
        title: "Error",
        description: "No asset selected",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      console.log("🗑️ Deleting asset:", asset.id);

      await deleteAsset(asset.id);
      console.log("✅ Asset deleted successfully");

      toast({
        title: "Success",
        description: `Asset "${asset.assetName}" has been deleted successfully`,
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete asset";
      console.error("❌ Error deleting asset:", errorMessage);

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!asset) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <DialogTitle>Delete Asset</DialogTitle>
          </div>
          <DialogDescription className="mt-4">
            Are you sure you want to delete <span className="font-semibold">{asset.assetName}</span>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-2 rounded-lg bg-red-50 p-3">
          <p className="text-sm font-medium text-red-900">Asset Details:</p>
          <div className="text-sm text-red-800">
            <p><span className="font-medium">Code:</span> {asset.assetCode}</p>
            <p><span className="font-medium">Category:</span> {asset.category}</p>
            <p><span className="font-medium">Location:</span> {asset.location}</p>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete Asset"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
