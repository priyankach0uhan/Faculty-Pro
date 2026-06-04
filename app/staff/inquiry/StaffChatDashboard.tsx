"use client";

import { useState } from "react";
import { ChatWindow } from "@/app/components/ChatWindow";

interface AdminProfile {
  id: string;
  full_name: string;
  employee_id: string;
}

interface StaffChatDashboardProps {
  admins: AdminProfile[];
  currentUserId: string;
  staffEmployeeId: string;
}

export function StaffChatDashboard({ 
  admins = [], 
  currentUserId, 
  staffEmployeeId 
}: StaffChatDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState<AdminProfile | null>(null);

  // Filter logic to allow searching across multiple administrators
  const filteredAdmins = admins.filter((admin) =>
    admin.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* SIDEBAR: Admin Search & Selection */}
      <div className="lg:col-span-4 space-y-4">
        <div className="relative group">
          <input
            type="text"
            placeholder="Search Administrator Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 bg-white border border-[#F5F1EA] rounded-2xl text-xs font-bold text-[#2D2D2D] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7A8F66]/10 focus:border-[#7A8F66] transition-all"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity">🔍</span>
        </div>

        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar lg:max-h-[500px]">
          {filteredAdmins.length > 0 ? (
            filteredAdmins.map((admin) => (
              <button
                key={admin.id}
                onClick={() => setSelectedAdmin(admin)}
                className={`w-full text-left p-5 rounded-[1.8rem] border transition-all flex justify-between items-center group ${
                  selectedAdmin?.id === admin.id 
                    ? "bg-white border-[#7A8F66] shadow-lg shadow-[#7A8F66]/5 translate-x-1" 
                    : "bg-white border-[#F5F1EA] hover:bg-[#FAF9F6] hover:border-[#E8E2D5]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${
                    selectedAdmin?.id === admin.id ? "bg-[#7A8F66] text-white" : "bg-[#F5F1EA] text-[#7A8F66]"
                  }`}>
                    {admin.full_name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#2D2D2D]">{admin.full_name}</p>
                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-0.5">System Executive</p>
                  </div>
                </div>
                {selectedAdmin?.id === admin.id && (
                  <span className="w-2 h-2 rounded-full bg-[#7A8F66] animate-pulse" />
                )}
              </button>
            ))
          ) : (
            <div className="p-8 text-center bg-[#FAF9F6] rounded-2xl border border-dashed border-[#F5F1EA]">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">No matching administrators</p>
            </div>
          )}
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="lg:col-span-8 h-full min-h-[420px] lg:min-h-[550px] min-w-0">
        {selectedAdmin ? (
          <div className="h-full bg-white border border-[#F5F1EA] rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden shadow-sm">
             <ChatWindow
              currentUserId={currentUserId}
              targetUserId={selectedAdmin.id}
              targetEmployeeId={staffEmployeeId}
              targetName={selectedAdmin.full_name}
              isAdminMode={false}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 sm:p-12 lg:p-20 text-center border-2 border-dashed border-[#F5F1EA] rounded-[2rem] lg:rounded-[3rem] bg-white group hover:border-[#7A8F66]/20 transition-colors">
            <div className="w-16 h-16 bg-[#FAF9F6] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl grayscale">💬</span>
            </div>
            <h4 className="text-sm font-black text-[#2D2D2D] mb-1">Central Inquiry & Reply Desk</h4>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest max-w-[250px] leading-relaxed">
              Please pick an executive team member from the sidebar to begin communications.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
