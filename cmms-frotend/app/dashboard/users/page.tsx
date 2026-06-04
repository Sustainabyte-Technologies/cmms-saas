"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import { UsersTable, User } from "@/components/dashboard/users-table";
import { AddUserDialog } from "@/components/dashboard/users/add-user-dialog";
import { EditUserDialog } from "@/components/dashboard/users/edit-user-dialog";
import { DeleteUserDialog } from "@/components/dashboard/users/delete-user-dialog";
import { fetchUsers } from "@/lib/api/users-api";
import { toastService } from "@/lib/toast-service";

export default function UsersPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch users from API on mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await fetchUsers();
      console.log("📦 Raw API Response:", data);
      
      // Transform API response to match User interface
      const transformedUsers = data.map((user: any) => {
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

  const totalPages = Math.ceil(users.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedUsers = users.slice(startIndex, endIndex);

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Users</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage system users and their access permissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button size="sm" className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No users found. Click "Add User" to create one.
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
                {startIndex + 1} - {Math.min(endIndex, users.length)} of {users.length} users
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
