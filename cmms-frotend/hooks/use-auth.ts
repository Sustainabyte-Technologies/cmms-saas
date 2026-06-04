import { useEffect, useState } from 'react';
import { getDecodedTokenFromCookies, DecodedToken } from '@/lib/auth';

export function useAuth() {
  const [token, setToken] = useState<DecodedToken | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const decodedToken = getDecodedTokenFromCookies();
    setToken(decodedToken);
    setIsLoading(false);
  }, []);

  return {
    token,
    isLoading,
    isAuthenticated: !!token,
    user: token ? {
      id: token.sub,
      email: token.email,
      role: token.role,
      organizationId: token.organizationId,
    } : null,
  };
}
