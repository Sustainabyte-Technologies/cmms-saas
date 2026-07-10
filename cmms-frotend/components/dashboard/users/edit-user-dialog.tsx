"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateUser } from "@/lib/api/users-api";
import { toastService } from "@/lib/toast-service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useRole } from "@/contexts/role-context";

const formSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  phoneNumber: z.string().min(10, "Phone number must be valid"),
  roleName: z.enum([
    "ADMIN",
    "CUSTOMER_MANAGER",
    "MAINTENANCE_MANAGER",
    "SITE_INCHARGE",
    "SUPERVISOR",
    "TECHNICIAN",
    "INVENTORY_MANAGER",
    "PURCHASE_MANAGER",
  ]),
  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 6, {
      message: "Password must be at least 6 characters",
    }),
});

type FormValues = z.infer<typeof formSchema>;

interface User {
  id: string;
  name?: string;
  fullName?: string;
  email: string;
  role?: string;
  roleName?: string;
  status: string;
  joinDate?: string;
  lastActive?: string;
  phoneNumber?: string;
}

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSuccess?: () => void;
}

export function EditUserDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: EditUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { role } = useRole();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: user?.fullName || user?.name || "",
      phoneNumber: user?.phoneNumber || "",
      roleName: (user?.roleName as FormValues["roleName"]) || "TECHNICIAN",
      password: "",
    },
  });

  // Update form when user changes
  useEffect(() => {
    if (user && open) {
      form.reset({
        fullName: user.fullName || user.name || "",
        phoneNumber: user.phoneNumber || "",
        roleName: (user.roleName as FormValues["roleName"]) || "TECHNICIAN",
        password: "",
      });
    }
  }, [user, open, form]);

  async function onSubmit(values: FormValues) {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      // Only send password if the admin typed a new one
      const payload: Parameters<typeof updateUser>[1] = {
        fullName: values.fullName,
        phoneNumber: values.phoneNumber,
        roleName: values.roleName,
        ...(values.password ? { password: values.password } : {}),
      };
      await updateUser(user.id, payload);
      toastService.success(
        "User updated successfully!",
        `${values.fullName} has been updated.`
      );
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      toastService.error("Failed to update user", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information. Email cannot be changed.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Display (Read-only) */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="px-3 py-2 rounded-md border border-input bg-muted text-sm">
                {user?.email}
              </div>
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            {/* Full Name */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter full name"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone Number */}
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter phone number"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password (optional — leave blank to keep unchanged) */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    New Password
                    <span className="ml-1 text-xs text-muted-foreground font-normal">
                      (leave blank to keep unchanged)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        {...field}
                        disabled={isLoading}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Role */}
            <FormField
              control={form.control}
              name="roleName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {role === "admin" && (
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      )}
                      {(role === "admin" || role === "customer_manager") && (
                        <>
                          <SelectItem value="CUSTOMER_MANAGER">
                            Customer Manager
                          </SelectItem>
                          <SelectItem value="SITE_INCHARGE">
                            Site In-Charge
                          </SelectItem>
                          <SelectItem value="INVENTORY_MANAGER">
                            Inventory Manager
                          </SelectItem>
                          <SelectItem value="PURCHASE_MANAGER">
                            Purchase Manager
                          </SelectItem>
                        </>
                      )}
                      {(role === "admin" || role === "customer_manager" || role === "site_incharge") && (
                        <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                      )}
                      <SelectItem value="TECHNICIAN">Technician</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Updating..." : "Update User"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
