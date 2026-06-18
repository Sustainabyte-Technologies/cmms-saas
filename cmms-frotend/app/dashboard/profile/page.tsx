"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/ui-components";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getAuthenticatedUser, getUserById, UserResponse } from "@/lib/api/users-api";
import { toast } from "sonner";
import { User, Mail, Phone, Badge, Calendar, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // First, get the authenticated user info
        const authUser = await getAuthenticatedUser();
        console.log("Auth user:", authUser);
        
        // Then fetch detailed user information
        const userDetails = await getUserById(authUser.sub);
        console.log("User details:", userDetails);
        
        setUserProfile(userDetails);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load profile";
        console.error("Error fetching profile:", err);
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Profile"
          description="View and manage your account profile"
        />
        <Card>
          <CardContent className="pt-6">
            <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
              <p className="text-sm font-medium">Error loading profile</p>
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!userProfile) {
    return null;
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Profile"
          description="View and manage your account profile"
        />
        <Link href="/dashboard/profile/edit">
          <Button>Edit Profile</Button>
        </Link>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">{userProfile.fullName}</CardTitle>
              <CardDescription className="text-base">{userProfile.roleName}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Personal Information</h3>
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Email */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                </div>
                <p className="text-base font-medium">{userProfile.email}</p>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                </div>
                <p className="text-base font-medium">{userProfile.phoneNumber || "Not provided"}</p>
              </div>

              {/* Role */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="h-4 w-4 text-muted-foreground" />
                  <label className="text-sm font-medium text-muted-foreground">Role</label>
                </div>
                <p className="text-base font-medium">{userProfile.roleName}</p>
              </div>

              {/* User ID */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <label className="text-sm font-medium text-muted-foreground">User ID</label>
                </div>
                <p className="text-xs font-mono text-muted-foreground break-all">{userProfile.id}</p>
              </div>

              {/* Created Date */}
              {userProfile.createdAt && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                  </div>
                  <p className="text-base font-medium">{formatDate(userProfile.createdAt)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Link href="/dashboard/profile/edit" className="flex-1">
              <Button className="w-full">Edit Profile</Button>
            </Link>
            <Button variant="outline" className="flex-1">
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Information */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Manage your account security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="font-medium">Password</p>
              <p className="text-sm text-muted-foreground">Last changed: Not available</p>
            </div>
            <Link href="/dashboard/profile/edit">
              <Button variant="outline">Update</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
