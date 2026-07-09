"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRole } from "@/contexts/role-context";
import { getJwtTokenFromServer } from "@/app/actions/auth-actions";
import { fetchChatHistory, fetchAvailableUsers, ChatMessage, ChatUser } from "@/lib/api/chat-api";
import { io, Socket } from "socket.io-client";
import { 
  MessageSquare, 
  Send, 
  User, 
  Circle, 
  Loader2, 
  AlertCircle,
  Clock,
  CheckCheck,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface ChatWidgetProps {
  onClose?: () => void;
  showCloseButton?: boolean;
  initialSelectedTechId?: string | null;
}

export function ChatWidget({ 
  onClose, 
  showCloseButton = false,
  initialSelectedTechId = null
}: ChatWidgetProps) {
  const { userData, role } = useRole();
  const [technicians, setTechnicians] = useState<ChatUser[]>([]);
  const [selectedTech, setSelectedTech] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [loadingTechs, setLoadingTechs] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [socketStatus, setSocketStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Step 1: Fetch list of available chat partners based on role hierarchy
  useEffect(() => {
    async function loadAvailableUsers() {
      try {
        setLoadingTechs(true);
        setError(null);
        const data = await fetchAvailableUsers();
        setTechnicians(data);
        if (data.length > 0) {
          const preselected = initialSelectedTechId ? data.find(t => t.id === initialSelectedTechId) : null;
          setSelectedTech(preselected || data[0]);
        }
      } catch (err: any) {
        console.error("Failed to load available chat users:", err);
        setError("Could not load contact list. Please try again.");
      } finally {
        setLoadingTechs(false);
      }
    }

    if (role) {
      loadAvailableUsers();
    }
  }, [role]);

  // Synchronize selection if initialSelectedTechId changes from parent
  useEffect(() => {
    if (initialSelectedTechId && technicians.length > 0) {
      const target = technicians.find(t => t.id === initialSelectedTechId);
      if (target) {
        setSelectedTech(target);
      }
    }
  }, [initialSelectedTechId, technicians]);

  // Step 2: Establish Socket connection and handle events
  useEffect(() => {
    let socket: Socket | null = null;

    async function initSocket() {
      const token = await getJwtTokenFromServer();
      if (!token) {
        console.warn("Could not retrieve JWT token from cookies on server.");
        setSocketStatus("disconnected");
        return;
      }

      console.log("Socket connection starting...");
      setSocketStatus("connecting");

      // Connect to Socket.IO server
      const socketUrl = API_BASE_URL;
      socket = io(socketUrl, {
        transports: ["websocket"],
        auth: { token },
        query: { token }
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("Connected to socket server with ID:", socket?.id);
        setSocketStatus("connected");
        socket?.emit("join");
      });

      socket.on("disconnect", () => {
        console.log("Disconnected from socket server");
        setSocketStatus("disconnected");
      });

      socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
        setSocketStatus("disconnected");
        setSending(false);
      });

      // Handle real-time incoming messages
      socket.on("receiveMessage", (message: ChatMessage) => {
        console.log("Received new message:", message);
        if (
          (message.senderId === selectedTech?.id && message.receiverId === userData?.id) ||
          (message.senderId === userData?.id && message.receiverId === selectedTech?.id)
        ) {
          setMessages((prev) => [...prev, message]);
        }
      });

      // Handle message delivery confirmations
      socket.on("messageSent", (message: ChatMessage) => {
        console.log("Message sent confirmation received:", message);
        setSending(false);
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });
      });
    }

    initSocket();

    return () => {
      if (socket) {
        socket.off("connect");
        socket.off("disconnect");
        socket.off("connect_error");
        socket.off("receiveMessage");
        socket.off("messageSent");
        socket.disconnect();
      }
    };
  }, [selectedTech, userData]);

  // Step 3: Load chat history when selected technician changes
  useEffect(() => {
    if (!selectedTech) {
      setMessages([]);
      return;
    }

    async function loadChatHistory() {
      try {
        setLoadingHistory(true);
        const history = await fetchChatHistory(selectedTech!.id);
        setMessages(history);
      } catch (err: any) {
        console.error("Failed to load chat history:", err);
      } finally {
        setLoadingHistory(false);
      }
    }

    loadChatHistory();
  }, [selectedTech]);

  // Step 4: Send message logic
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedTech || !socketRef.current || socketStatus !== "connected" || sending) {
      return;
    }

    setSending(true);

    const payload = {
      receiverId: selectedTech.id,
      message: inputText.trim(),
    };

    socketRef.current.emit("sendMessage", payload);
    setInputText("");
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 bg-background rounded-2xl border border-border">
        <AlertCircle className="h-14 w-14 text-destructive mb-4" />
        <h2 className="text-xl font-bold text-foreground">Error</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md text-center">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-card">
      {/* Top Banner / Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Support Desk</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Real-time troubleshooting</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors",
              socketStatus === "connected" && "bg-success/10 border-success/30 text-success",
              socketStatus === "connecting" && "bg-warning/10 border-warning/30 text-warning",
              socketStatus === "disconnected" && "bg-destructive/10 border-destructive/30 text-destructive"
            )}>
              <Circle className={cn(
                "h-2 w-2 fill-current",
                socketStatus === "connected" && "text-success",
                socketStatus === "connecting" && "text-warning animate-pulse",
                socketStatus === "disconnected" && "text-destructive"
              )} />
              <span className="capitalize">{socketStatus}</span>
            </div>
          </div>
          {showCloseButton && onClose && (
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="flex flex-1 min-h-0">
        {/* Left Sidebar: Technician List */}
        <div className="w-[200px] sm:w-[240px] border-r border-border flex flex-col bg-muted/10 shrink-0">
          <div className="p-4 border-b border-border">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              Contacts ({technicians.length})
            </label>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {loadingTechs ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Loading...</span>
              </div>
            ) : technicians.length === 0 ? (
              <div className="text-center py-16 px-4">
                <p className="text-xs text-muted-foreground">No contacts available.</p>
              </div>
            ) : (
              technicians.map((tech) => {
                const isActive = selectedTech?.id === tech.id;
                return (
                  <button
                    key={tech.id}
                    onClick={() => setSelectedTech(tech)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "hover:bg-muted text-foreground/80 hover:text-foreground"
                    )}
                  >
                    <div className={cn(
                      "h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border",
                      isActive ? "bg-primary-foreground/15 border-transparent" : "bg-muted-foreground/10 border-border"
                    )}>
                      {tech.fullName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate leading-tight">{tech.fullName}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={cn(
                          "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border tracking-wider shrink-0",
                          isActive 
                            ? "bg-primary-foreground/15 border-transparent text-primary-foreground" 
                            : "bg-muted-foreground/10 border-border text-muted-foreground"
                        )}>
                          {tech.role?.replace("_", " ")}
                        </span>
                        {(tech.department || tech.site) && (
                          <span className={cn(
                            "text-[9px] truncate max-w-[80px] font-medium",
                            isActive ? "text-primary-foreground/70" : "text-muted-foreground"
                          )}>
                            • {tech.department || tech.site}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Chat Interface */}
        <div className="flex-1 flex flex-col bg-background min-w-0">
          {selectedTech ? (
            <>
              {/* Active Conversation Header */}
              <div className="px-6 py-4 border-b border-border bg-muted/5 flex items-center gap-3 shrink-0">
                <div className="h-9 w-9 bg-primary/10 border border-primary/20 text-primary rounded-full flex items-center justify-center font-bold text-xs uppercase">
                  {selectedTech.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate leading-tight">{selectedTech.fullName}</h3>
                  <p className="text-xs text-muted-foreground truncate leading-none mt-1">{selectedTech.email}</p>
                </div>
              </div>

              {/* Message Thread */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loadingHistory ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-xs">Fetching history...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 text-muted-foreground">
                    <MessageSquare className="h-10 w-10 text-muted-foreground/20 mb-3" />
                    <p className="text-sm font-medium">No messages yet.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isSelf = msg.senderId === userData?.id;
                    const date = new Date(msg.createdAt);
                    const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex w-full",
                          isSelf ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "flex flex-col max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm border transition-all duration-200",
                            isSelf
                              ? "bg-primary text-primary-foreground border-primary rounded-tr-none"
                              : "bg-muted/40 border-border text-foreground rounded-tl-none"
                          )}
                        >
                          <p className="text-sm break-words whitespace-pre-wrap leading-relaxed">
                            {msg.message}
                          </p>
                          <div className={cn(
                            "flex items-center gap-1 mt-1.5 justify-end select-none",
                            isSelf ? "text-primary-foreground/60" : "text-muted-foreground"
                          )}>
                            <Clock className="h-2.5 w-2.5" />
                            <span className="text-[9px] font-mono leading-none">{formattedTime}</span>
                            {isSelf && (
                              <CheckCheck className="h-3.5 w-3.5 text-primary-foreground/80 ml-0.5" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Bottom Send Action Panel */}
              <form
                onSubmit={handleSendMessage}
                className="px-6 py-4 border-t border-border bg-muted/5 flex items-center gap-3 shrink-0"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    socketStatus === "connected"
                      ? `Message ${selectedTech.fullName}...`
                      : "Connecting..."
                  }
                  disabled={socketStatus !== "connected"}
                  className="flex-1 px-4 py-3 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || socketStatus !== "connected" || sending}
                  className="p-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/95 transition-all shadow-sm flex items-center justify-center disabled:opacity-50 disabled:hover:bg-primary cursor-pointer"
                >
                  {sending ? (
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  ) : (
                    <Send className="h-4.5 w-4.5" />
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-muted-foreground">
              <User className="h-12 w-12 text-muted-foreground/20 mb-3" />
              <p className="text-sm font-semibold">Select a Technician</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
