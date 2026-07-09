"use server";

import { cookies } from "next/headers";

/**
 * Next.js Server Action to safely read the HttpOnly access_token cookie
 * on the server side and return it to the client.
 */
export async function getJwtTokenFromServer(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value || null;
    return token;
  } catch (error) {
    console.error("Failed to read token from cookies on server:", error);
    return null;
  }
}
