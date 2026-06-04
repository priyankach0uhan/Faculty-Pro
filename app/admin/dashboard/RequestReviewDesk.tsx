import React from "react";
import { createClient } from "@/utils/supabase/server";
import { reviewStatusRequest } from "@/app/staff/dashboard/actions";

export default async function RequestReviewDesk() {
  const supabase = await createClient();

  // 1. Fetch only pending requests
  const { data: requests } = await supabase
    .from("status_requests")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  // 2. Hide the component if no actions are required
  if (!requests || requests.length === 0) return null;

  return (
    <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[2.5rem] border border-[#F5F1EA] shadow-sm mt-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <h3 className="font-black text-[#2D2D2D] text-lg flex items-center gap-2">
          📥 Calendar Correction Queue 
        </h3>
        <span className="px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-black rounded-full uppercase tracking-widest border border-amber-100">
          {requests.length} Action Pending
        </span>
      </div>
      
      <div className="space-y-4">
        {requests.map((req) => {
          /** * We use .bind() to handle arguments in a Server Component loop.
           * This prevents the "Functions cannot be passed" runtime error.
           */
          const handleDeny = reviewStatusRequest.bind(null, req.id, false);
          const handleApprove = reviewStatusRequest.bind(null, req.id, true);

          return (
            <div key={req.id} className="p-5 bg-[#FAF9F6] border border-[#F5F1EA] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-white hover:shadow-md group">
              <div className="space-y-1">
                <p className="text-xs font-black text-[#2D2D2D]">
                  {req.faculty_name} <span className="font-mono text-[#9B7E5A] font-bold ml-1">({req.employee_id})</span>
                </p>
                <p className="text-[10px] text-gray-500 font-bold">
                  Target Date: <span className="text-gray-800 underline decoration-[#7A8F66] underline-offset-2">{req.requested_date}</span> 
                  <span className="mx-2">→</span> 
                  Requesting <span className="text-[#7A8F66] font-black uppercase tracking-tighter">{req.requested_status}</span>
                </p>
                <div className="bg-white/50 p-2 rounded-lg mt-2 border border-dashed border-[#F5F1EA]">
                   <p className="text-[11px] text-gray-400 italic font-medium">"{req.reason}"</p>
                </div>
              </div>

              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                {/* Rejection Form */}
                <form action={handleDeny}>
                  <button type="submit" className="w-full px-5 py-2.5 bg-white border border-red-100 text-red-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition active:scale-95 sm:w-auto">
                    Deny
                  </button>
                </form>
                
                {/* Approval Form */}
                <form action={handleApprove}>
                  <button type="submit" className="w-full px-5 py-2.5 bg-[#2D2D2D] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition shadow-lg shadow-black/5 active:scale-95 sm:w-auto">
                    Approve & Sync
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
