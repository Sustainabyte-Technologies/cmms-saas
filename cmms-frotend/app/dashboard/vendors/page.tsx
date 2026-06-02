"use client";

import { useState } from "react";
import { PageHeader, EmptyState } from "@/components/shared/ui-components";
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
import { Plus, Search, MoreHorizontal, Building2, Eye, Edit, Trash2, Star } from "lucide-react";

// Mock data
const vendors = [
  {
    id: "VND-001",
    name: "Industrial Supplies Co.",
    email: "orders@industrialsupplies.com",
    phone: "+1 (555) 123-4567",
    category: "General Supplies",
    contactPerson: "John Williams",
    rating: 4.8,
    totalOrders: 45,
  },
  {
    id: "VND-002",
    name: "Tech Parts Inc.",
    email: "sales@techparts.com",
    phone: "+1 (555) 234-5678",
    category: "Electrical",
    contactPerson: "Sarah Miller",
    rating: 4.5,
    totalOrders: 32,
  },
  {
    id: "VND-003",
    name: "Safety Equipment Ltd.",
    email: "info@safetyequip.com",
    phone: "+1 (555) 345-6789",
    category: "Safety",
    contactPerson: "Mike Brown",
    rating: 4.9,
    totalOrders: 28,
  },
  {
    id: "VND-004",
    name: "Lubricants Direct",
    email: "orders@lubricantsdirect.com",
    phone: "+1 (555) 456-7890",
    category: "Lubricants",
    contactPerson: "Emily Chen",
    rating: 4.2,
    totalOrders: 67,
  },
  {
    id: "VND-005",
    name: "Electrical Solutions",
    email: "contact@electricalsolutions.com",
    phone: "+1 (555) 567-8901",
    category: "Electrical",
    contactPerson: "David Lee",
    rating: 4.6,
    totalOrders: 19,
  },
];

export default function VendorsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredVendors = vendors.filter((vendor) =>
    vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendors"
        description="Manage your supplier network"
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Vendor
        </Button>
      </PageHeader>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Vendors Table */}
      <Card>
        <CardContent className="p-0">
          {filteredVendors.length === 0 ? (
            <EmptyState
              title="No vendors found"
              description="Try adjusting your search criteria"
              icon={Building2}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="hidden lg:table-cell">Contact</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="hidden sm:table-cell">Orders</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{vendor.name}</p>
                          <p className="text-xs text-muted-foreground">{vendor.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {vendor.category}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div>
                        <p className="text-sm">{vendor.contactPerson}</p>
                        <p className="text-xs text-muted-foreground">{vendor.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-warning text-warning" />
                        <span className="font-medium">{vendor.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {vendor.totalOrders}
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
