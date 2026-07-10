import { jwtDecode } from 'jwt-decode';

export interface DecodedToken {
  sub: string;
  email: string;
  organizationId: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Get token from cookies
 */
export function getTokenFromCookies(): string | null {
  if (typeof document === 'undefined') return null;
  
  const name = 'access_token=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(';');
  
  for (let cookie of cookieArray) {
    cookie = cookie.trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length);
    }
  }
  return null;
}

/**
 * Decode JWT token
 */
export function decodeToken(token: string): DecodedToken | null {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

/**
 * Get decoded token from cookies
 */
export function getDecodedTokenFromCookies(): DecodedToken | null {
  const token = getTokenFromCookies();
  if (!token) return null;
  return decodeToken(token);
}

/**
 * Check if token is valid
 */
export function isTokenValid(token: DecodedToken): boolean {
  const now = Math.floor(Date.now() / 1000);
  return token.exp > now;
}

/**
 * Get user info from token
 */
export function getUserFromToken(token: DecodedToken) {
  return {
    id: token.sub,
    email: token.email,
    role: token.role.toLowerCase(),
    organizationId: token.organizationId,
  };
}

/**
 * Normalize role name to match your role configuration
 */
export function normalizeRole(role: any): string {
  if (!role) return 'admin';
  const roleStr = typeof role === 'object' && role.name ? role.name : String(role);
  
  const roleMap: Record<string, string> = {
    ADMIN: 'admin',
    CUSTOMER_MANAGER: 'customer_manager',
    MAINTENANCE_MANAGER: 'customer_manager',
    SITE_INCHARGE: 'site_incharge',
    SUPERVISOR: 'supervisor',
    TECHNICIAN: 'technician',
    INVENTORY_MANAGER: 'inventory_manager',
    PURCHASE_MANAGER: 'purchase_manager',
  };
  
  return roleMap[roleStr.toUpperCase()] || 'admin';
}

/**
 * Get role-specific dashboard route
 */
export function getRoleDashboardRoute(role: string): string {
  const normalizedRole = normalizeRole(role);
  const roleRoutes: Record<string, string> = {
    admin: '/dashboard',
    customer_manager: '/dashboard/maintenance-planning',
    maintenance_manager: '/dashboard/maintenance-planning',
    site_incharge: '/dashboard',
    supervisor: '/dashboard/work-orders',
    technician: '/dashboard/my-tasks',
    inventory_manager: '/dashboard/inventory',
    purchase_manager: '/dashboard/purchase',
  };
  
  return roleRoutes[normalizedRole] || '/dashboard';
}

/**
 * Clear token from cookies and localStorage
 */
export function clearTokenFromCookies(): void {
  if (typeof document === 'undefined') return;
  document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  // Also clear localStorage
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('userRole');
    localStorage.removeItem('organizationId');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
  }
}

/**
 * Logout user
 */
export async function logoutUser(): Promise<boolean> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    const response = await fetch(`${apiUrl}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (response.ok) {
      clearTokenFromCookies();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Logout error:', error);
    // Clear token locally even if API call fails
    clearTokenFromCookies();
    return false;
  }
}
