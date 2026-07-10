"use client";

import { useRole } from "@/contexts/role-context";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phoneNumber?: string;
  createdBy?: string;
  createdById?: string;
  status: "active" | "inactive" | "pending";
  joinDate: string;
}

interface UsersTableProps {
  data: User[];
  caption?: string;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
}

const roleColors: Record<string, string> = {
  admin: "bg-red-100 text-red-800",
  maintenance_manager: "bg-blue-100 text-blue-800",
  customer_manager: "bg-blue-100 text-blue-800",
  site_incharge: "bg-emerald-100 text-emerald-800",
  supervisor: "bg-purple-100 text-purple-800",
  technician: "bg-green-100 text-green-800",
  inventory_manager: "bg-yellow-100 text-yellow-800",
  purchase_manager: "bg-indigo-100 text-indigo-800",
};

const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800",
  inactive: "bg-gray-100 text-gray-800",
  pending: "bg-amber-100 text-amber-800",
};

const formatRole = (role: string) => {
  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export function UsersTable({ data, caption, onEdit, onDelete }: UsersTableProps) {
  const { role, userData } = useRole();
  const currentUserId = userData?.id;
  
  return (
    <Table>
      {caption && <TableCaption>{caption}</TableCaption>}
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
        {data.map((user) => {
          let canEditDelete = false;
          
          if (role === "admin") {
            canEditDelete = true;
          } else if (role === "customer_manager") {
            // Customer Managers can only edit/delete users they themselves created
            canEditDelete = !!currentUserId && user.createdById === currentUserId;
          } else if (role === "site_incharge") {
            // Site In-Charges can only edit/delete supervisor and technician users they themselves created
            const isTargetSupervisorOrTechnician = user.role === "supervisor" || user.role === "technician";
            const isCreator = !!currentUserId && user.createdById === currentUserId;
            canEditDelete = isTargetSupervisorOrTechnician && isCreator;
          } else if (role === "supervisor") {
            // Supervisors can only edit/delete technician users they themselves created
            const isTargetTechnician = user.role === "technician";
            const isCreator = !!currentUserId && user.createdById === currentUserId;
            canEditDelete = isTargetTechnician && isCreator;
          }
          
          return (
            <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-medium text-sm py-4 pl-6">{user.name}</TableCell>
              <TableCell className="text-muted-foreground text-sm py-4">{user.email}</TableCell>
              <TableCell className="py-4">
                <Badge className={roleColors[user.role] || "bg-gray-100 text-gray-800"}>
                  {formatRole(user.role)}
                </Badge>
              </TableCell>
              <TableCell className="py-4">
                <Badge className={statusColors[user.status]}>
                  {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="text-sm py-4">{user.joinDate}</TableCell>
              <TableCell className="text-muted-foreground text-sm py-4">
                {user.createdBy ? formatRole(user.createdBy) : "System"}
              </TableCell>
              <TableCell className="py-4">
                <div className="flex items-center justify-center gap-2">
                  {canEditDelete ? (
                    <>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                        onClick={() => onEdit?.(user)}
                        title="Edit user"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                        onClick={() => onDelete?.(user)}
                        title="Delete user"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <span className="text-xs font-medium text-muted-foreground px-2 py-1 bg-muted rounded">View Only</span>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
