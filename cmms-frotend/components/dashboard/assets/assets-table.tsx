"use client";

import { useRole } from "@/contexts/role-context";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Asset } from "@/lib/api/assets-api";

interface AssetsTableProps {
  data: Asset[];
  caption?: string;
  onView?: (asset: Asset) => void;
  onEdit?: (asset: Asset) => void;
  onDelete?: (asset: Asset) => void;
}

const categoryColors: Record<string, string> = {
  manufacturing: "bg-blue-100 text-blue-800",
  facilities: "bg-green-100 text-green-800",
  equipment: "bg-purple-100 text-purple-800",
  chiller: "bg-cyan-100 text-cyan-800",
  hvac: "bg-sky-100 text-sky-800",
  tools: "bg-yellow-100 text-yellow-800",
  vehicles: "bg-orange-100 text-orange-800",
  other: "bg-gray-100 text-gray-800",
};

const statusColors: Record<string, string> = {
  operational: "bg-emerald-100 text-emerald-800",
  maintenance: "bg-amber-100 text-amber-800",
  repair: "bg-red-100 text-red-800",
  UNDER_MAINTENANCE: "bg-orange-100 text-orange-800",
  inactive: "bg-gray-100 text-gray-800",
};

const formatText = (text: string) => {
  return text
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const formatRoleName = (roleName?: string) => {
  if (!roleName) return "";
  return formatText(roleName);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export function AssetsTable({ data, caption, onView, onEdit, onDelete }: AssetsTableProps) {
  const { role } = useRole();

  return (
    <Table>
      {caption && <TableCaption>{caption}</TableCaption>}
      <TableHeader>
        <TableRow className="bg-muted/50 hover:bg-muted/50">
          <TableHead className="w-50 text-sm font-semibold text-foreground pl-6">
            Asset Name
          </TableHead>
          <TableHead className="text-sm font-semibold text-foreground">Code</TableHead>
          <TableHead className="text-sm font-semibold text-foreground">Category</TableHead>
          <TableHead className="text-sm font-semibold text-foreground">Location</TableHead>
          <TableHead className="text-sm font-semibold text-foreground">Status</TableHead>
          <TableHead className="text-sm font-semibold text-foreground">Created By</TableHead>
          <TableHead className="text-sm font-semibold text-foreground">Created Date</TableHead>
          <TableHead className="text-center text-sm font-semibold text-foreground">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((asset) => {
          const canEdit = role === "admin" || role === "maintenance_manager";

          return (
            <TableRow key={asset.id} className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-medium text-sm py-4 pl-6">
                {asset.assetName}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm py-4">
                {asset.assetCode}
              </TableCell>
              <TableCell className="py-4">
                <Badge
                  className={
                    categoryColors[asset.category?.toLowerCase()] ||
                    "bg-gray-100 text-gray-800"
                  }
                >
                  {formatText(asset.category)}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm py-4">
                {asset.location}
              </TableCell>
              <TableCell className="py-4">
                <Badge
                  className={
                    statusColors[asset.status?.toLowerCase() || "operational"] ||
                    "bg-gray-100 text-gray-800"
                  }
                >
                  {formatText(asset.status || "operational")}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm py-4">
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">
                    {asset.createdBy?.fullName || "System"}
                  </span>
                  {asset.createdBy?.role?.name && (
                    <span className="text-xs text-muted-foreground">
                      ({formatRoleName(asset.createdBy.role.name)})
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm py-4">
                {formatDate(asset.createdAt)}
              </TableCell>
              <TableCell className="py-4">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-600"
                    onClick={() => onView?.(asset)}
                    title="View asset details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {canEdit ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                        onClick={() => onEdit?.(asset)}
                        title="Edit asset"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                        onClick={() => onDelete?.(asset)}
                        title="Delete asset"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
