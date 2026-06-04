"use client";

import { useState } from "react";
import { ChatWindow } from "@/app/components/ChatWindow";

// ✅ 1. Interface definition explicitly maps the structure to eliminate type errors
interface UserProfile {
  id: string;
  full_name: string;
  employee_id: string;
  role: string;
  department?: string;
}

interface AdminChatDashboardProps {
  profiles: UserProfile[];
  currentUserId: string;
}

export function AdminChatDashboard({ profiles = [], currentUserId }: AdminChatDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  // ✅ 2. Generics type annotation provides the missing structural roadmap to TypeScript
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Search through Name or Employee ID (Gaurav, FAC-001, etc.)
  const filteredProfiles = profiles.filter((person) => {
    const search = searchTerm.toLowerCase();
    return (
      person.full_name?.toLowerCase().includes(search) ||
      person.employee_id?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT SIDEBAR */}
      <div className="lg:col-span-4 space-y-4">
        <input 
          type="text"
          placeholder="Search name or ID (e.g. Gaurav)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-4 bg-white border border-[#F5F1EA] rounded-2xl text-xs font-bold outline-none focus:ring-1 focus:ring-[#7A8F66]"
        />

        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-2 lg:max-h-[600px]">
          {filteredProfiles.length > 0 ? (
            filteredProfiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => setSelectedUser(profile)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  selectedUser?.id === profile.id 
                    ? "bg-white border-[#7A8F66] shadow-md" 
                    : "bg-white border-[#F5F1EA] hover:bg-[#FAF9F6]"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs font-black text-[#2D2D2D]">{profile.full_name}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                      {profile.employee_id || "NO ID"} • {profile.role}
                    </p>
                  </div>
                  <span className="opacity-20 text-xs">💬</span>
                </div>
              </button>
            ))
          ) : (
            <p className="text-[10px] text-center text-gray-400 py-20 font-bold uppercase tracking-widest">
              No profiles found matching "{searchTerm}"
            </p>
          )}
        </div>
      </div>

      {/* RIGHT CHAT WINDOW */}
      <div className="lg:col-span-8 min-w-0">
        {selectedUser ? (
          /* ✅ 3. Optional chaining ensures safe execution even during unselected rendering iterations */
          <ChatWindow
            currentUserId={currentUserId}
            targetUserId={selectedUser.id}
            targetEmployeeId={selectedUser.employee_id || "FAC-000"}
            targetName={selectedUser.full_name}
            isAdminMode={true}
          />
        ) : (
          <div className="p-8 sm:p-12 lg:p-20 text-center border-2 border-dashed border-[#F5F1EA] rounded-[2rem] lg:rounded-[3rem] bg-white text-gray-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
            Select a profile from the sidebar <br /> to initiate a console connection.
          </div>
        )}
      </div>
    </div>
  );
}
