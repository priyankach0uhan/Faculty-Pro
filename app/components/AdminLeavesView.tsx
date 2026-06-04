"use client";

import { useState } from "react";
// ✅ Change this import line to use a clean alias path:
import { processLeaveApplication } from "@/app/admin/dashboard/actions";
import { Calendar, Search, ShieldCheck, CheckCircle2, XCircle, Clock } from "lucide-react";

interface AdminLeavesViewProps {
  leavesData: any[];
  adminUserId: string;
}

export function AdminLeavesView({ leavesData, adminUserId }: AdminLeavesViewProps) {
  const [leaves, setLeaves] = useState<any[]>(leavesData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLeave, setSelectedLeave] = useState<any>(leavesData[0] || null);
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredLeaves = leaves.filter((item) => {
  // ✅ Explicitly targets the relation object path returned by the foreign key join
  const profile = item.profiles; 
  
  const name = profile?.full_name?.toLowerCase() || "";
  const empId = profile?.employee_id?.toLowerCase() || "";
  return name.includes(searchTerm.toLowerCase()) || empId.includes(searchTerm.toLowerCase());
});

  const handleAction = async (leaveId: string, action: "approved" | "rejected") => {
    setIsProcessing(true);
    try {
      await processLeaveApplication(leaveId, action, adminUserId);
      
      setLeaves((prev) =>
        prev.map((item) =>
          item.id === leaveId 
            ? { ...item, status: action, reviewed_by: adminUserId, reviewed_at: new Date().toISOString() } 
            : item
        )
      );
      
      setSelectedLeave((prev: any) => ({
        ...prev,
        status: action,
        reviewed_by: adminUserId,
        reviewed_at: new Date().toISOString()
      }));
    } catch (err) {
      console.error("Action transmission error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full animate-fade-in">
      
      {/* QUEUE SIDEBAR SELECTION PANEL */}
      <div className="lg:col-span-4 space-y-4">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-gray-400 absolute left-4" />
          <input
            type="text"
            placeholder="Search staff request name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 p-3.5 bg-white border border-[#F5F1EA] rounded-2xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#7A8F66]"
          />
        </div>

        <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Application Logs Queue</p>
          {filteredLeaves.map((item) => {
            const isSelected = selectedLeave?.id === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedLeave(item)}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex justify-between items-center ${
                  isSelected ? "bg-white border-[#7A8F66] shadow-md" : "bg-white border-[#F5F1EA] hover:bg-[#FAF9F6]"
                }`}
              >
                <div>
                  <p className="text-xs font-black text-[#2D2D2D]">{item.profiles?.full_name}</p>
                  <p className="text-[10px] text-gray-400 font-bold font-mono mt-0.5">{item.profiles?.employee_id} • {item.leave_type}</p>
                </div>
                <span className={`px-2 py-0.5 text-[9px] font-black rounded-md uppercase border ${
                  item.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                  item.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                  'bg-amber-50 text-amber-600 border-amber-100'
                }`}>
                  {item.status}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* REACTION VIEWPORT MAPPING OVERVIEW */}
      <div className="lg:col-span-8">
        {selectedLeave ? (
          <div className="bg-white border border-[#F5F1EA] rounded-[2rem] overflow-hidden shadow-sm flex flex-col min-h-[480px]">
            <div className="p-6 border-b border-[#F5F1EA] bg-[#FAF9F6] flex justify-between items-start">
              <div>
                <span className="bg-[#FFF9E6] text-[#9B7E5A] font-black text-[9px] px-2 py-0.5 rounded-md border border-[#F5F1EA] uppercase">
                  {selectedLeave.leave_type}
                </span>
                <h3 className="font-black text-[#2D2D2D] text-lg mt-2">{selectedLeave.profiles?.full_name}</h3>
                <p className="text-xs text-gray-400 font-bold uppercase mt-0.5">
                  {selectedLeave.profiles?.department} • <span className="font-mono">{selectedLeave.profiles?.employee_id}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 bg-white px-3 py-2 border border-[#F5F1EA] rounded-xl font-mono text-[11px] font-bold text-[#2D2D2D]">
                <Calendar className="w-3.5 h-3.5 text-[#9B7E5A]" />
                <span>{selectedLeave.start_date}</span>
                <span className="text-gray-300">to</span>
                <span>{selectedLeave.end_date}</span>
              </div>
            </div>

            <div className="flex-1 p-6 space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Reason Statement / Justification History</p>
                <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-[#F5F1EA] text-xs text-[#2D2D2D] font-medium leading-relaxed">
                  {selectedLeave.reason || "No explicit reasoning details provided."}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Audit Tracking Logs</p>
                <div className="border border-[#F5F1EA] rounded-2xl divide-y divide-[#F5F1EA] text-xs">
                  <div className="p-3.5 flex justify-between items-center bg-[#FAF9F6]/20">
                    <span className="text-gray-400 font-medium">Filing Timestamp</span>
                    <span className="font-mono text-gray-500 font-bold">{new Date(selectedLeave.created_at).toLocaleString()}</span>
                  </div>
                  <div className="p-3.5 flex justify-between items-center">
                    <span className="text-gray-400 font-medium">Settlement Status</span>
                    <div className="flex items-center gap-1.5 font-bold capitalize">
                      <span className={
                        selectedLeave.status === 'approved' ? 'text-green-600' :
                        selectedLeave.status === 'rejected' ? 'text-red-600' : 'text-amber-600'
                      }>{selectedLeave.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#F5F1EA] bg-[#FAF9F6] flex justify-end gap-3">
              {selectedLeave.status === "pending" ? (
                <>
                  <button
                    onClick={() => handleAction(selectedLeave.id, "rejected")}
                    disabled={isProcessing}
                    className="px-5 py-3 border border-red-200 bg-red-50 text-red-600 font-black text-xs uppercase tracking-widest rounded-xl text-center hover:bg-red-100/70 transition"
                  >
                    Deny Request
                  </button>
                  <button
                    onClick={() => handleAction(selectedLeave.id, "approved")}
                    disabled={isProcessing}
                    className="px-5 py-3 bg-[#7A8F66] text-white font-black text-xs uppercase tracking-widest rounded-xl text-center hover:bg-[#6b7d5a] shadow-md transition"
                  >
                    Approve Request
                  </button>
                </>
              ) : (
                <div className="text-center w-full text-[11px] italic font-bold text-gray-400 py-1">
                  This transaction history log is locked and archived.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-12 text-center border border-dashed border-[#F5F1EA] rounded-[2.5rem] bg-white text-xs text-gray-400 font-bold">
            Select an active leave item row from the logs list container to run verification checks.
          </div>
        )}
      </div>
    </div>
  );
}