// API service for user management

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface CreateUserPayload {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  roleName: "ADMIN" | "MAINTENANCE_MANAGER" | "SUPERVISOR" | "TECHNICIAN" | "INVENTORY_MANAGER" | "PURCHASE_MANAGER";
}

export interface UserResponse {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  roleName: string;
  createdAt: string;
}

export interface AuthenticatedUser {
  sub: string;
  email: string;
  organizationId: string;
  role: string;
  iat: number;
  exp: number;
}

export interface UpdateProfilePayload {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
}

/**
 * Create a new user via API
 * @param userData - User data to create
 * @returns Created user data
 */
export async function createUser(userData: CreateUserPayload): Promise<UserResponse> {
  try {
    console.log("🔄 Creating user:", userData);
    
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Send cookies with request
      body: JSON.stringify(userData),
    });

    console.log("📡 Response status:", response.status);

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorMessage = `HTTP ${response.status}: Failed to create user`;
      
      try {
        if (contentType?.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } else {
          const text = await response.text();
          console.error("Response body:", text);
        }
      } catch (parseError) {
        console.error("Could not parse error response:", parseError);
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("✅ User created successfully:", data);
    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Error creating user:", errorMessage);
    
    if (errorMessage.includes("Failed to fetch")) {
      throw new Error(
        `Cannot connect to server at ${API_BASE_URL}. Make sure the backend is running.`
      );
    }
    
    throw error;
  }
}

/**
 * Fetch all users from API
 * @returns Array of users or response object
 */
export async function fetchUsers(): Promise<any> {
  try {
    console.log("🔄 Fetching users from:", `${API_BASE_URL}/users`);
    
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Send cookies with request
    });

    console.log("📡 Response status:", response.status);

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorMessage = `HTTP ${response.status}: Failed to fetch users`;
      
      try {
        if (contentType?.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } else {
          const text = await response.text();
          console.error("Response body:", text);
        }
      } catch (parseError) {
        console.error("Could not parse error response:", parseError);
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("✅ Raw API Response Structure:", {
      count: Array.isArray(data) ? data.length : 0,
      firstUser: Array.isArray(data) && data[0] ? data[0] : null,
    });
    console.log("📊 Full Users Data:", data);
    
    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Error fetching users:", errorMessage);
    
    // Check if it's a network error
    if (errorMessage.includes("Failed to fetch")) {
      console.error("⚠️ Network error - Backend might not be running at", `${API_BASE_URL}`);
      throw new Error(
        `Cannot connect to server at ${API_BASE_URL}. Make sure the backend is running.`
      );
    }
    
    throw error;
  }
}

/**
 * Update an existing user
 * @param userId - User ID to update
 * @param updateData - Data to update (fullName, phoneNumber, roleName)
 * @returns Updated user data
 */
export async function updateUser(
  userId: string,
  updateData: {
    fullName?: string;
    phoneNumber?: string;
    roleName?: "ADMIN" | "MAINTENANCE_MANAGER" | "SUPERVISOR" | "TECHNICIAN" | "INVENTORY_MANAGER" | "PURCHASE_MANAGER";
    password?: string;
  }
): Promise<UserResponse> {
  try {
    console.log("🔄 Updating user:", userId, updateData);
    
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Send cookies with request
      body: JSON.stringify(updateData),
    });

    console.log("📡 Response status:", response.status);

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorMessage = `HTTP ${response.status}: Failed to update user`;
      
      try {
        if (contentType?.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } else {
          const text = await response.text();
          console.error("Response body:", text);
        }
      } catch (parseError) {
        console.error("Could not parse error response:", parseError);
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("✅ User updated successfully:", data);
    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Error updating user:", errorMessage);
    
    if (errorMessage.includes("Failed to fetch")) {
      throw new Error(
        `Cannot connect to server at ${API_BASE_URL}. Make sure the backend is running.`
      );
    }
    
    throw error;
  }
}

/**
 * Delete a user
 * @param userId - User ID to delete
 * @returns Success response
 */
export async function deleteUser(userId: string): Promise<void> {
  try {
    console.log("🔄 Deleting user:", userId);
    
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Send cookies with request
    });

    console.log("📡 Response status:", response.status);

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorMessage = `HTTP ${response.status}: Failed to delete user`;
      
      try {
        if (contentType?.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } else {
          const text = await response.text();
          console.error("Response body:", text);
        }
      } catch (parseError) {
        console.error("Could not parse error response:", parseError);
      }
      
      throw new Error(errorMessage);
    }

    console.log("✅ User deleted successfully");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Error deleting user:", errorMessage);
    
    if (errorMessage.includes("Failed to fetch")) {
      throw new Error(
        `Cannot connect to server at ${API_BASE_URL}. Make sure the backend is running.`
      );
    }
    
    throw error;
  }
}

/**
 * Fetch technician workload (active work orders count)
 * @returns Array of technicians with their active work order counts
 */
export async function fetchTechnicianWorkload(): Promise<any[]> {
  try {
    console.log("🔄 Fetching technician workload from:", `${API_BASE_URL}/users/technicians/workload`);
    
    const response = await fetch(`${API_BASE_URL}/users/technicians/workload`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    console.log("📡 Response status:", response.status);

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorMessage = `HTTP ${response.status}: Failed to fetch technician workload`;
      
      try {
        if (contentType?.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } else {
          const text = await response.text();
          console.error("Response body:", text);
        }
      } catch (parseError) {
        console.error("Could not parse error response:", parseError);
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("✅ Technician workload fetched successfully:", data);
    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Error fetching technician workload:", errorMessage);
    
    if (errorMessage.includes("Failed to fetch")) {
      throw new Error(
        `Cannot connect to server at ${API_BASE_URL}. Make sure the backend is running.`
      );
    }
    
    throw error;
  }
}

/**
 * Get the authenticated user from the auth endpoint
 * @returns Authenticated user data
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser> {
  try {
    console.log("🔄 Fetching authenticated user from:", `${API_BASE_URL}/auth/me`);
    
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Send cookies with request
    });

    console.log("📡 Response status:", response.status);

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorMessage = `HTTP ${response.status}: Failed to fetch authenticated user`;
      
      try {
        if (contentType?.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } else {
          const text = await response.text();
          console.error("Response body:", text);
        }
      } catch (parseError) {
        console.error("Could not parse error response:", parseError);
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("✅ Authenticated user fetched successfully:", data);
    return data.user || data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Error fetching authenticated user:", errorMessage);
    
    if (errorMessage.includes("Failed to fetch")) {
      throw new Error(
        `Cannot connect to server at ${API_BASE_URL}. Make sure the backend is running.`
      );
    }
    
    throw error;
  }
}

/**
 * Get a specific user by ID
 * @param userId - User ID to fetch
 * @returns User data
 */
export async function getUserById(userId: string): Promise<UserResponse> {
  try {
    console.log("🔄 Fetching user:", `${API_BASE_URL}/users/${userId}`);
    
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Send cookies with request
    });

    console.log("📡 Response status:", response.status);

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorMessage = `HTTP ${response.status}: Failed to fetch user`;
      
      try {
        if (contentType?.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } else {
          const text = await response.text();
          console.error("Response body:", text);
        }
      } catch (parseError) {
        console.error("Could not parse error response:", parseError);
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("✅ User fetched successfully:", data);
    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Error fetching user:", errorMessage);
    
    if (errorMessage.includes("Failed to fetch")) {
      throw new Error(
        `Cannot connect to server at ${API_BASE_URL}. Make sure the backend is running.`
      );
    }
    
    throw error;
  }
}

/**
 * Update the current user profile
 * @param userId - User ID to update
 * @param updateData - Data to update
 * @returns Updated user data
 */
export async function updateUserProfile(
  userId: string,
  updateData: UpdateProfilePayload
): Promise<UserResponse> {
  try {
    console.log("🔄 Updating profile for user:", userId, updateData);
    
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Send cookies with request
      body: JSON.stringify(updateData),
    });

    console.log("📡 Response status:", response.status);

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorMessage = `HTTP ${response.status}: Failed to update profile`;
      
      try {
        if (contentType?.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } else {
          const text = await response.text();
          console.error("Response body:", text);
        }
      } catch (parseError) {
        console.error("Could not parse error response:", parseError);
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("✅ Profile updated successfully:", data);
    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Error updating profile:", errorMessage);
    
    if (errorMessage.includes("Failed to fetch")) {
      throw new Error(
        `Cannot connect to server at ${API_BASE_URL}. Make sure the backend is running.`
      );
    }
    
    throw error;
  }
}
