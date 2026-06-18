"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Download, Search, Filter } from "lucide-react";
import { UsersTable, User } from "@/components/dashboard/users-table";
import { AddUserDialog } from "@/components/dashboard/users/add-user-dialog";
import { EditUserDialog } from "@/components/dashboard/users/edit-user-dialog";
import { DeleteUserDialog } from "@/components/dashboard/users/delete-user-dialog";
import { PageHeader } from "@/components/shared/ui-components";
import { fetchUsers } from "@/lib/api/users-api";
import { toastService } from "@/lib/toast-service";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";

export default function UsersPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch users from API on mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetchUsers();
      console.log("📦 Raw API Response:", response);
      
      // Extract users array from API response
      const usersData = Array.isArray(response) ? response : (response?.data as any[]) || [];
      
      // Transform API response to match User interface
      const transformedUsers = usersData.map((user: any) => {
        console.log("🔍 User object:", user);
        const roleFromObject = user.role?.name || "TECHNICIAN";
        const roleName = user.roleName || roleFromObject;
        
        // Extract createdBy role name for display
        const createdByRole = user.createdBy?.role?.name || "System";
        
        return {
          id: user.id,
          name: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          createdBy: createdByRole,
          role: roleName.toLowerCase().replace(/ /g, "_"),
          status: "active" as const,
          joinDate: new Date(user.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
        };
      });
      
      console.log("✨ Transformed Users:", transformedUsers);
      setUsers(transformedUsers);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load users";
      toastService.error("Failed to load users", errorMessage);
      console.error("Error loading users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUserSuccess = () => {
    loadUsers(); // Reload users after successful creation
  };

  const handleEditUser = (user: User) => {
    // Need to get the full user object with all details from the API response
    // For now, we'll use the user from the table and fetch additional details if needed
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleEditSuccess = () => {
    loadUsers(); // Reload users after successful edit
  };

  const handleDeleteSuccess = () => {
    loadUsers(); // Reload users after successful deletion
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole =
      roleFilter === "all" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Apply pagination to filtered users
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Get unique roles for filter dropdown
  const uniqueRoles = Array.from(new Set(users.map(u => u.role)));

  // Skeleton loader component
  const SkeletonTableRows = () => (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50 hover:bg-muted/50">
          <TableHead className="w-[200px] text-sm font-semibold text-foreground pl-6">Name</TableHead>
          <TableHead className="text-sm font-semibold text-foreground">Email</TableHead>
          <TableHead className="text-sm font-semibold text-foreground">Role</TableHead>
          <TableHead className="text-sm font-semibold text-foreground">Status</TableHead>
          <TableHead className="text-sm font-semibold text-foreground">Join Date</TableHead>
          <TableHead className="text-sm font-semibold text-foreground">Created By</TableHead>
          <TableHead className="text-center text-sm font-semibold text-foreground">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i} className="hover:bg-muted/50">
            <TableCell className="pl-6 py-4">
              <Skeleton className="h-4 w-[150px]" />
            </TableCell>
            <TableCell className="py-4">
              <Skeleton className="h-4 w-[180px]" />
            </TableCell>
            <TableCell className="py-4">
              <Skeleton className="h-6 w-[100px] rounded-full" />
            </TableCell>
            <TableCell className="py-4">
              <Skeleton className="h-6 w-[80px] rounded-full" />
            </TableCell>
            <TableCell className="py-4">
              <Skeleton className="h-4 w-[100px]" />
            </TableCell>
            <TableCell className="py-4">
              <Skeleton className="h-4 w-[120px]" />
            </TableCell>
            <TableCell className="py-4">
              <div className="flex gap-2 justify-center">
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
        title="Users"
        description="Manage system users and their access permissions."
      >
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
        <Button size="sm" className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </PageHeader>

      {/* Search and Filter Section */}
      <div className="space-y-4 rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page when searching
                }}
                className="pl-9"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={(value) => {
              setRoleFilter(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {uniqueRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role
                      .split("_")
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(" ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Users Table Section */}
      <div className="rounded-lg border border-border bg-card shadow-sm">
        {isLoading ? (
          <SkeletonTableRows />
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {searchQuery || roleFilter !== "all" || statusFilter !== "all"
              ? "No users found matching your filters."
              : "No users found. Click \"Add User\" to create one."}
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="overflow-x-auto">
              <UsersTable 
                data={paginatedUsers} 
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
              />
            </div>
            {/* Pagination Controls */}
            <div className="flex items-center justify-between border-t border-border px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                  className="rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value={10}>10</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              
              <div className="text-sm text-muted-foreground">
                {startIndex + 1} - {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <AddUserDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={handleAddUserSuccess}
      />

      <EditUserDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        user={selectedUser}
        onSuccess={handleEditSuccess}
      />

      <DeleteUserDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        user={selectedUser}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
