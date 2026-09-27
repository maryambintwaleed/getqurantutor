"use client";

import { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  MessageCircle,
  Headphones,
  RefreshCw,
} from "lucide-react";

interface Message {
  id: string;
  sender: "USER" | "AI" | "ADMIN";
  senderName?: string;
  content: string;
  createdAt: string;
}

interface SuggestedAction {
  label: string;
  url: string;
}

export default function SupportChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversation ID from localStorage on mount
  useEffect(() => {
    const savedId = localStorage.getItem("gqt_support_cid");
    if (savedId) {
      setConversationId(savedId);
      fetchHistory(savedId);
    } else {
      // Default welcome message
      setMessages([
        {
          id: "welcome-1",
          sender: "AI",
          senderName: "GetQuranTutor AI",
          content:
            "Assalamu Alaikum! 👋 Welcome to **GetQuranTutor Support**.\n\nHow can we assist you today? Feel free to ask about finding female tutors, pricing, tutor verification, or wallet credits.",
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  }, []);

  // Poll for admin replies if conversation exists and widget is open or minimized
  useEffect(() => {
    if (!conversationId) return;

    const interval = setInterval(() => {
      fetchHistory(conversationId, true);
    }, 10000);

    return () => clearInterval(interval);
  }, [conversationId, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
    }
  }, [messages, isOpen]);

  const fetchHistory = async (cid: string, silent = false) => {
    try {
      const res = await fetch(`/api/support/history?conversationId=${cid}`);
      if (res.ok) {
        const data = await res.json();
        if (data.messages && data.messages.length > 0) {
          // Check if new admin message arrived
          if (silent && !isOpen) {
            const lastMsg = data.messages[data.messages.length - 1];
            if (lastMsg.sender === "ADMIN" && messages.length < data.messages.length) {
              setHasUnread(true);
            }
          }
          setMessages(data.messages);
        }
      }
    } catch (err) {
      console.error("Failed to load chat history:", err);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    if (!textToSend) setInput("");
    setIsLoading(true);

    // Optimistic user message
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      sender: "USER",
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await fetch("/api/support/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          content: text,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.conversationId) {
          setConversationId(data.conversationId);
          localStorage.setItem("gqt_support_cid", data.conversationId);
        }
        if (data.messages) {
          setMessages(data.messages);
        }
      } else {
        throw new Error("Failed to send");
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "AI",
          senderName: "System Error",
          content: "Sorry, we could not process your message right now. Please try again or reach out on WhatsApp.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const QUICK_QUESTIONS = [
    { label: "👩‍🏫 Female Tutors", prompt: "How do I find a female Quran tutor?" },
    { label: "💰 Parent Pricing", prompt: "Is it free for families to request tutors?" },
    { label: "🛡️ Tutor Verification", prompt: "How are Quran tutors verified?" },
    { label: "💼 Tutor Credits", prompt: "How do credits work for teachers?" },
  ];

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-50 font-sans max-w-full">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open Support Chat"
          className="relative flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-2.5 sm:px-5 sm:py-3.5 text-white shadow-xl hover:bg-emerald-800 transition-all transform hover:scale-105 active:scale-95 group"
        >
          <div className="relative">
            <MessageSquare size={19} className="group-hover:rotate-12 transition-transform sm:w-[22px] sm:h-[22px]" />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-400 animate-ping" />
            )}
          </div>
          <span className="font-semibold text-xs sm:text-sm tracking-wide">Support Chat</span>
          <span className="flex h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
        </button>
      )}

      {/* Expanded Chat Dialog */}
      {isOpen && (
        <div className="flex flex-col w-[calc(100vw-1.5rem)] max-w-[420px] sm:w-[420px] h-[520px] sm:h-[580px] max-h-[82vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-emerald-800 to-emerald-700 px-4 py-3.5 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold">
                <Headphones size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-base leading-tight flex items-center gap-1.5">
                  GetQuranTutor Support
                  <Sparkles size={14} className="text-amber-300" />
                </h3>
                <p className="text-xs text-emerald-100 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Instant AI & Admin Live Support
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {conversationId && (
                <button
                  onClick={() => fetchHistory(conversationId)}
                  title="Refresh chat"
                  className="p-1.5 rounded-full hover:bg-white/10 text-emerald-100 transition-colors"
                >
                  <RefreshCw size={16} />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 rounded-full hover:bg-white/10 text-emerald-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Quick Action Bar / FAQs */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border-b border-slate-100 overflow-x-auto scrollbar-none text-xs">
            {QUICK_QUESTIONS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(item.prompt)}
                disabled={isLoading}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50/50 transition-colors shadow-xs font-medium"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
            {messages.map((msg) => {
              const isUser = msg.sender === "USER";
              const isAdmin = msg.sender === "ADMIN";

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-slate-400 font-medium">
                    {isUser ? (
                      <span>You</span>
                    ) : isAdmin ? (
                      <span className="flex items-center gap-1 text-amber-700 font-semibold">
                        <ShieldCheck size={12} /> Live Admin Support ({msg.senderName || "Admin"})
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                        <Bot size={12} /> GetQuranTutor AI
                      </span>
                    )}
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      isUser
                        ? "bg-emerald-700 text-white rounded-br-xs shadow-sm"
                        : isAdmin
                        ? "bg-amber-50 border border-amber-200 text-slate-900 rounded-bl-xs shadow-sm"
                        : "bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-xs"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-white border border-slate-200 text-xs text-slate-500 max-w-[70%]">
                <Bot size={16} className="animate-spin text-emerald-600" />
                <span>AI assistant is typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Direct WhatsApp Contact Banner */}
          <div className="px-3 py-1.5 bg-emerald-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-emerald-800 font-medium flex items-center gap-1">
              <MessageCircle size={14} className="text-emerald-600" /> Need instant WhatsApp reply?
            </span>
            <a
              href="https://wa.me/15551234567?text=Hello%20GetQuranTutor%20Support"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 hover:text-emerald-900 font-semibold underline flex items-center gap-0.5"
            >
              Open WhatsApp <ExternalLink size={11} />
            </a>
          </div>

          {/* Footer Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything or leave a message..."
              disabled={isLoading}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-40 transition-colors shrink-0"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
