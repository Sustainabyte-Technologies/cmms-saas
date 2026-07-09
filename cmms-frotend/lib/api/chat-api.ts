const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!response.ok) {
    let msg = `HTTP ${response.status}`;
    try {
      const d = await response.json();
      msg = d.message || d.error || msg;
    } catch {}
    throw new Error(msg);
  }
  return response.json();
}

export interface ChatUser {
  id: string;
  fullName: string;
  email: string;
  role?: string;
  department?: string | null;
  site?: string | null;
  status?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  sender: ChatUser;
  receiver: ChatUser;
}

export async function fetchChatPartner(): Promise<ChatUser> {
  return getJson<ChatUser>(`${API_BASE_URL}/chat/partner`);
}

export async function fetchChatHistory(otherUserId: string): Promise<ChatMessage[]> {
  return getJson<ChatMessage[]>(`${API_BASE_URL}/chat/messages/${otherUserId}`);
}

export async function fetchAvailableUsers(): Promise<ChatUser[]> {
  return getJson<ChatUser[]>(`${API_BASE_URL}/chat/available-users`);
}

export async function fetchTechnicians(): Promise<ChatUser[]> {
  const response = await fetch(`${API_BASE_URL}/users?role=TECHNICIAN&limit=100`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!response.ok) {
     let msg = `HTTP ${response.status}`;
     try {
       const d = await response.json();
       msg = d.message || d.error || msg;
     } catch {}
     throw new Error(msg);
  }
  const result = await response.json();
  return result.data || [];
}
