"use client";

import { useEffect, useState, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { sendInquiryMessage } from "../staff/dashboard/actions";

interface Message {
  id: number;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  employee_id: string;
  faculty_name: string;
  message: string;
  is_from_admin: boolean;
}

interface ChatWindowProps {
  currentUserId: string;
  targetUserId: string;     // The UUID of the person you are chatting with
  targetEmployeeId: string; // The FAC-XXX identifier
  targetName: string;       // Admin name or Staff name
  isAdminMode: boolean;
}

export function ChatWindow({ currentUserId, targetUserId, targetEmployeeId, targetName, isAdminMode }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Initialize supabase client inside useEffect to keep the dependency array stable
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 1. Reset messages when switching chat partners to avoid "ghost" messages
    setMessages([]);

    const fetchMessages = async () => {
      if (!targetUserId || !currentUserId) return;
      
      const { data, error } = await supabase
        .from("inquiries")
        .select("*")
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${currentUserId})`)
        .order("created_at", { ascending: true });
      
      if (!error && data) setMessages(data);
    };

    fetchMessages();

    // 2. Real-time Subscription for this specific conversation
    const channel = supabase
      .channel(`chat_${targetUserId}`) 
      .on("postgres_changes", { 
        event: "INSERT", 
        schema: "public", 
        table: "inquiries" 
      }, (payload) => {
        const newMsg = payload.new as Message;
        
        const isMatch = 
          (newMsg.sender_id === currentUserId && newMsg.receiver_id === targetUserId) ||
          (newMsg.sender_id === targetUserId && newMsg.receiver_id === currentUserId);
        
        if (isMatch) {
          setMessages((prev) => {
            if (prev.find(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // ✅ FIXED: Removed 'supabase' from dependencies to prevent the "changed size" error.
  }, [targetUserId, currentUserId]); 

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !targetUserId) return;

    const tempText = inputMessage;
    setInputMessage(""); 

    try {
      const result = await sendInquiryMessage(
        currentUserId, 
        targetUserId, 
        targetEmployeeId, 
        targetName, 
        tempText, 
        isAdminMode
      );
      
      if (result && !result.success) {
        console.error("Message failed to send:", result.error);
      }
    } catch (err) {
      console.error("Chat Error:", err);
    }
  };

  return (
    <div className="flex flex-col h-[70vh] min-h-[420px] max-h-[620px] bg-white border border-[#F5F1EA] rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-sm transition-all">
      {/* Chat Header */}
      <div className="p-4 border-b border-[#F5F1EA] bg-[#FAF9F6] flex flex-wrap justify-between items-center gap-3 shadow-sm">
        <div className="flex flex-col">
          <h4 className="font-black text-[#2D2D2D] text-xs uppercase tracking-wider">
            {isAdminMode ? `Staff Terminal: ${targetName}` : `Admin Support: ${targetName}`}
          </h4>
          <span className="text-[9px] text-gray-400 font-bold uppercase">System Cloud Synced</span>
        </div>
        <span className="font-mono text-[10px] font-black text-[#7A8F66] bg-white px-3 py-1 rounded-full border border-[#F5F1EA]">
          {targetEmployeeId}
        </span>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4 bg-[#FAF9F6]/20">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center opacity-30 flex-col space-y-2">
            <span className="text-2xl">✉️</span>
            <p className="text-[10px] font-bold uppercase tracking-widest">No conversation history</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.sender_id === currentUserId;
            return (
              <div key={msg.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`max-w-[88%] sm:max-w-[80%] p-3 sm:p-4 rounded-2xl text-xs leading-relaxed shadow-sm ${
                  isOwnMessage 
                    ? "bg-[#2D2D2D] text-white font-medium rounded-tr-none" 
                    : "bg-white border border-[#F5F1EA] text-[#2D2D2D] font-medium rounded-tl-none"
                }`}>
                  <p className="break-words">{msg.message}</p>
                  <div className={`text-[8px] mt-2 font-mono flex items-center gap-1 opacity-50 ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                    <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {isOwnMessage && <span>• Sent</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-[#F5F1EA] bg-white flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={isAdminMode ? "Type a reply to staff member..." : "Ask your question to administrator..."}
          className="min-w-0 flex-1 p-4 bg-[#FAF9F6] border border-[#F5F1EA] rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#7A8F66]/10 focus:border-[#7A8F66] transition-all"
        />
        <button 
          type="submit" 
          disabled={!inputMessage.trim()}
          className="px-6 py-4 sm:py-0 bg-[#7A8F66] text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-[#6b7d5a] transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
        >
          Send
        </button>
      </form>
    </div>
  );
}
