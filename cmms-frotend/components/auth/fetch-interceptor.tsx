"use client";

if (typeof window !== "undefined") {
  // Prevent duplicate patching
  if (!(window as any).__fetchPatched) {
    (window as any).__fetchPatched = true;
    const originalFetch = window.fetch;
    
    window.fetch = async (input, init) => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const requestUrl = 
        typeof input === "string" 
          ? input 
          : input instanceof URL 
            ? input.toString() 
            : input.url;

      // Only intercept requests to our API server
      if (requestUrl.startsWith(apiUrl)) {
        // Inline utility to fetch cookie value synchronously
        const getCookie = (name: string) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop()?.split(";").shift();
          return null;
        };

        const token = getCookie("access_token");
        if (token) {
          init = init || {};
          init.headers = init.headers || {};

          if (init.headers instanceof Headers) {
            if (!init.headers.has("Authorization")) {
              init.headers.set("Authorization", `Bearer ${token}`);
            }
          } else if (Array.isArray(init.headers)) {
            const hasAuth = init.headers.some(([key]) => key.toLowerCase() === "authorization");
            if (!hasAuth) {
              init.headers.push(["Authorization", `Bearer ${token}`]);
            }
          } else {
            const hasAuth = Object.keys(init.headers).some(
              (key) => key.toLowerCase() === "authorization"
            );
            if (!hasAuth) {
              (init.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
            }
          }
        }
      }

      return originalFetch(input, init);
    };
  }
}

export function FetchInterceptor() {
  return null;
}
