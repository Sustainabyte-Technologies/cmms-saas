"use client";

import { useState, useEffect } from "react";
import { PageHeader, EmptyState } from "@/components/shared/ui-components";
import {
  AssetsTable,
  CreateAssetDialog,
  EditAssetDialog,
  DeleteAssetDialog,
  ViewAssetDialog,
} from "@/components/dashboard/assets";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Filter, Server, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchAssets, Asset, deleteAsset } from "@/lib/api/assets-api";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAssets, setTotalAssets] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const { toast } = useToast();

  // Handle deep-linking to specific asset if assetId query param is present
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const assetIdParam = params.get("assetId");
      if (assetIdParam) {
        console.log("🔗 Deep link assetId found in URL:", assetIdParam);
        setSelectedAssetId(assetIdParam);
        setViewDialogOpen(true);
      }
    }
  }, []);

  // Fetch assets on mount and when pagination/search changes
  useEffect(() => {
    const loadAssets = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("📦 Loading assets...");
        const response = await fetchAssets(currentPage, rowsPerPage, searchQuery);
        console.log("✅ Assets loaded:", response);
        setAssets(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalAssets(response.pagination.total);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load assets";
        console.error("❌ Error loading assets:", errorMessage);
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

    loadAssets();
  }, [currentPage, rowsPerPage, searchQuery, toast]);

  // Handle asset view
  const handleViewAsset = (asset: Asset) => {
    console.log("👁️ View asset:", asset);
    setSelectedAssetId(asset.id);
    setViewDialogOpen(true);
  };

  // Handle asset edit
  const handleEditAsset = (asset: Asset) => {
    console.log("✏️ Edit asset:", asset);
    setSelectedAsset(asset);
    setEditDialogOpen(true);
  };

  // Handle asset delete
  const handleDeleteAsset = (asset: Asset) => {
    console.log("🗑️ Delete asset:", asset);
    setSelectedAsset(asset);
    setDeleteDialogOpen(true);
  };

  // Handle asset creation success - reload assets
  const handleAssetCreated = () => {
    console.log("✅ Asset created, reloading assets...");
    setCurrentPage(1);
    setSearchQuery("");
  };

  // Handle asset update success - reload assets
  const handleAssetUpdated = () => {
    console.log("✅ Asset updated, reloading assets...");
    // Reload current page to reflect changes
  };

  // Handle asset deletion success - reload assets
  const handleAssetDeletedSuccess = () => {
    console.log("✅ Asset deleted, reloading assets...");
    // Reload current page or go to first page
    if (assets.length === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Skeleton loader component
  const SkeletonTableRows = () => (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50 hover:bg-muted/50">
          <TableHead className="w-50 text-sm font-semibold text-foreground pl-6">Asset Name</TableHead>
          <TableHead className="text-sm font-semibold text-foreground">Code</TableHead>
          <TableHead className="text-sm font-semibold text-foreground">Category</TableHead>
          <TableHead className="text-sm font-semibold text-foreground">Location</TableHead>
          <TableHead className="text-sm font-semibold text-foreground">Status</TableHead>
          <TableHead className="text-sm font-semibold text-foreground">Created By</TableHead>
          <TableHead className="w-20 text-sm font-semibold text-foreground">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i} className="hover:bg-muted/50">
            <TableCell className="pl-6">
              <Skeleton className="h-4 w-[150px]" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-[80px]" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-[100px]" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-[120px]" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-6 w-[90px] rounded-full" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-[110px]" />
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assets"
        description="Manage and track all your organization's assets"
      >
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Asset
        </Button>
      </PageHeader>

      {/* Create Asset Dialog */}
      <CreateAssetDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleAssetCreated}
      />

      {/* View Asset Dialog */}
      <ViewAssetDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        assetId={selectedAssetId}
      />

      {/* Edit Asset Dialog */}
      <EditAssetDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        asset={selectedAsset}
        onSuccess={handleAssetUpdated}
        onDeleted={handleAssetDeletedSuccess}
      />

      {/* Delete Asset Dialog */}
      <DeleteAssetDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        asset={selectedAsset}
        onSuccess={handleAssetDeletedSuccess}
      />

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search assets by name or code..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page when searching
                }}
                className="pl-9"
              />
            </div>
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="UNDER_MAINTENANCE">Under Maintenance</SelectItem>
                  <SelectItem value="BREAKDOWN">Breakdown</SelectItem>
                  <SelectItem value="IDLE">Idle</SelectItem>
                  <SelectItem value="RETIRED">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assets Table */}
      <Card>
        <CardContent className="p-0">
          {error && (
            <div className="p-6 border-b border-red-200 bg-red-50">
              <div className="flex items-center gap-3 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <div>
                  <p className="font-semibold">Error loading assets</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <SkeletonTableRows />
          ) : assets.length === 0 ? (
            <EmptyState
              title="No assets found"
              description={
                searchQuery
                  ? "Try adjusting your search criteria"
                  : "No assets have been created yet"
              }
              icon={Server}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <AssetsTable
                  data={assets}
                  onView={handleViewAsset}
                  onEdit={handleEditAsset}
                  onDelete={handleDeleteAsset}
                  caption={`Showing ${(currentPage - 1) * rowsPerPage + 1} - ${Math.min(currentPage * rowsPerPage, totalAssets)} of ${totalAssets} assets`}
                />
              </div>
              
              {/* Pagination Controls */}
              <div className="flex items-center justify-between border-t border-border px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Rows per page:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value={10}>10</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
