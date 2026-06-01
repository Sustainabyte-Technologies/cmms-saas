"use client";

import { useState } from "react";
import { PageHeader, StatusBadge, EmptyState } from "@/components/shared/ui-components";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Filter, MoreHorizontal, Server, Eye, Edit, Trash2 } from "lucide-react";

// Mock data
const assets = [
  {
    id: "AST-001",
    name: "CNC Machine #1",
    code: "CNC-001",
    category: "Manufacturing",
    location: "Building A - Floor 1",
    status: "operational",
    value: "$125,000",
  },
  {
    id: "AST-002",
    name: "HVAC Unit #3",
    code: "HVAC-003",
    category: "Facilities",
    location: "Building B - Rooftop",
    status: "maintenance",
    value: "$45,000",
  },
  {
    id: "AST-003",
    name: "Conveyor Belt #7",
    code: "CONV-007",
    category: "Manufacturing",
    location: "Building A - Floor 2",
    status: "operational",
    value: "$78,000",
  },
  {
    id: "AST-004",
    name: "Backup Generator",
    code: "GEN-001",
    category: "Facilities",
    location: "Building C - Basement",
    status: "repair",
    value: "$95,000",
  },
  {
    id: "AST-005",
    name: "Assembly Line A",
    code: "ASSY-001",
    category: "Manufacturing",
    location: "Building A - Floor 1",
    status: "operational",
    value: "$250,000",
  },
];

const getStatusVariant = (status: string) => {
  switch (status) {
    case "operational":
      return "success";
    case "maintenance":
      return "warning";
    case "repair":
      return "error";
    default:
      return "default";
  }
};

export default function AssetsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || asset.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assets"
        description="Manage and track all your organization&apos;s assets"
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Asset
        </Button>
      </PageHeader>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assets Table */}
      <Card>
        <CardContent className="p-0">
          {filteredAssets.length === 0 ? (
            <EmptyState
              title="No assets found"
              description="Try adjusting your search or filter criteria"
              icon={Server}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="hidden lg:table-cell">Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Value</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Server className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{asset.name}</p>
                          <p className="text-xs text-muted-foreground">{asset.code}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {asset.category}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {asset.location}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={asset.status} variant={getStatusVariant(asset.status)} />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {asset.value}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
