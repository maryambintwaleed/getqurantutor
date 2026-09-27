"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  ShieldCheck,
  User,
  CheckCircle2,
  Clock,
  Send,
  RefreshCw,
  Search,
  Filter,
  Bot,
  Sparkles,
} from "lucide-react";

interface SupportMessage {
  id: string;
  sender: "USER" | "AI" | "ADMIN";
  senderName: string;
  content: string;
  createdAt: string;
}

interface SupportConversation {
  id: string;
  userId: string | null;
  userName: string;
  userEmail: string;
  userRole: string;
  status: "OPEN" | "RESOLVED" | "CLOSED";
  createdAt: string;
  updatedAt: string;
  messages: SupportMessage[];
}

export default function AdminSupportPage() {
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [replyContent, setReplyContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/support");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
        if (data.conversations?.length > 0 && !selectedId) {
          setSelectedId(data.conversations[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load admin support chats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 12000);
    return () => clearInterval(interval);
  }, []);

  const selectedConversation = conversations.find((c) => c.id === selectedId);

  const filteredConversations = conversations.filter((c) => {
    const matchesStatus = filterStatus === "ALL" || c.status === filterStatus;
    const matchesSearch =
      c.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.messages.some((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const handleSendReply = async () => {
    if (!selectedId || !replyContent.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch("/api/admin/support/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selectedId,
          content: replyContent.trim(),
        }),
      });

      if (res.ok) {
        setReplyContent("");
        await fetchConversations();
      }
    } catch (err) {
      console.error("Failed to send admin reply:", err);
    } finally {
      setSending(false);
    }
  };

  const handleUpdateStatus = async (status: "OPEN" | "RESOLVED" | "CLOSED") => {
    if (!selectedId) return;

    try {
      const res = await fetch("/api/admin/support/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: selectedId, status }),
      });

      if (res.ok) {
        await fetchConversations();
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="text-emerald-700" size={26} /> Support Chat Inbox
          </h1>
          <p className="text-sm text-slate-500">
            View live user support conversations, AI automated responses, and send official admin replies.
          </p>
        </div>
        <button
          onClick={fetchConversations}
          className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar: Conversations List */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[650px]">
          {/* Controls */}
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 space-y-2.5">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user, email, or message..."
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-1.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <Filter size={13} className="text-slate-400" />
              {["ALL", "OPEN", "RESOLVED", "CLOSED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    filterStatus === st
                      ? "bg-emerald-700 text-white"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loading && conversations.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">Loading support inbox...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">No support chats found.</div>
            ) : (
              filteredConversations.map((c) => {
                const lastMsg = c.messages[c.messages.length - 1];
                const isSelected = c.id === selectedId;

                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={`w-full text-left p-4 transition-colors flex items-start justify-between gap-3 ${
                      isSelected
                        ? "bg-emerald-50/70 border-l-4 border-l-emerald-600"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-slate-900 truncate">
                          {c.userName || "Guest User"}
                        </span>
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                          {c.userRole}
                        </span>
                      </div>
                      {c.userEmail && (
                        <p className="text-xs text-slate-400 truncate mb-1.5">{c.userEmail}</p>
                      )}
                      <p className="text-xs text-slate-600 line-clamp-1">
                        {lastMsg ? `${lastMsg.sender === "USER" ? "User: " : lastMsg.sender === "AI" ? "AI: " : "Admin: "}${lastMsg.content}` : "No messages"}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="text-[10px] text-slate-400">
                        {new Date(c.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          c.status === "OPEN"
                            ? "bg-amber-100 text-amber-800"
                            : c.status === "RESOLVED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel: Active Thread */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[650px]">
          {selectedConversation ? (
            <>
              {/* Header */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    {selectedConversation.userName}
                    <span className="text-xs font-normal text-slate-500">
                      ({selectedConversation.userEmail || "No Email Provided"})
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Role: <strong className="text-slate-600">{selectedConversation.userRole}</strong> • Started:{" "}
                    {new Date(selectedConversation.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Status:</span>
                  {(["OPEN", "RESOLVED", "CLOSED"] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(st)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        selectedConversation.status === st
                          ? "bg-slate-900 text-white"
                          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message History */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/40">
                {selectedConversation.messages.map((msg) => {
                  const isUser = msg.sender === "USER";
                  const isAdmin = msg.sender === "ADMIN";

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? "items-start" : isAdmin ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-400 font-medium">
                        {isUser ? (
                          <span className="flex items-center gap-1 text-slate-700 font-semibold">
                            <User size={12} /> {selectedConversation.userName}
                          </span>
                        ) : isAdmin ? (
                          <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                            <ShieldCheck size={12} /> Admin ({msg.senderName})
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-700 font-semibold">
                            <Bot size={12} /> AI Assistant
                          </span>
                        )}
                        <span>•</span>
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>

                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          isUser
                            ? "bg-white border border-slate-200 text-slate-900 shadow-xs"
                            : isAdmin
                            ? "bg-emerald-700 text-white shadow-sm"
                            : "bg-amber-50/90 border border-amber-200 text-amber-950 shadow-xs"
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Admin Reply Box */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendReply();
                }}
                className="p-4 bg-white border-t border-slate-200 flex items-center gap-3"
              >
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Type an official admin reply..."
                  disabled={sending}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!replyContent.trim() || sending}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-40 transition-colors shadow-sm"
                >
                  <Send size={16} /> Send Reply
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <MessageSquare size={40} className="mb-2 text-slate-300" />
              <p className="font-medium text-slate-600">Select a conversation to inspect</p>
              <p className="text-xs text-slate-400 mt-1">
                You can reply to users, check AI response history, and update resolution status.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
