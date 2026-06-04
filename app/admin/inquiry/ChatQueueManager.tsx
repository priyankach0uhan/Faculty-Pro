"use client";

import { useState } from "react";
import { ChatWindow } from "@/app/components/ChatWindow";
interface Channel {
  employee_id: string;
  faculty_name: string;
  sender_id: string;
}

export function ChatQueueManager({ uniqueChannels, adminUserId }: { uniqueChannels: Channel[], adminUserId: string }) {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(uniqueChannels[0] || null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left List Pane */}
      <div className="lg:col-span-4 space-y-2">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-3">Open Channels</p>
        {uniqueChannels.map((ch) => (
          <button
            key={ch.employee_id}
            onClick={() => setSelectedChannel(ch)}
            className={`w-full text-left p-4 rounded-2xl border transition-all flex justify-between items-center ${
              selectedChannel?.employee_id === ch.employee_id
                ? "bg-white border-[#7A8F66] shadow-md"
                : "bg-white border-[#F5F1EA] hover:bg-[#FAF9F6]"
            }`}
          >
            <div>
              <p className="text-xs font-black text-[#2D2D2D]">{ch.faculty_name}</p>
              <p className="text-[10px] text-gray-400 font-bold font-mono mt-0.5">{ch.employee_id}</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-[#7A8F66]" />
          </button>
        ))}
        {uniqueChannels.length === 0 && (
          <p className="text-center text-xs italic font-bold text-gray-300 p-8">No inquiries received yet.</p>
        )}
      </div>

      {/* Right Interaction Window Box */}
      <div className="lg:col-span-8">
        {selectedChannel ? (
   <ChatWindow
  currentUserId={adminUserId}
  targetUserId={selectedChannel.sender_id} 
  targetEmployeeId={selectedChannel.employee_id}
  targetName={selectedChannel.faculty_name} 
  isAdminMode={true}
/>
        ) : (
          <div className="p-12 text-center border border-dashed border-[#F5F1EA] rounded-[2.5rem] bg-white text-xs text-gray-400 font-bold">
            Select an open faculty stream thread to begin diagnostic troubleshooting.
          </div>
        )}
      </div>
    </div>
  );
}