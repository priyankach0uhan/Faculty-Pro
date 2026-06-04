import React from "react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers"; // Added to read our custom session
import { handleUpdateResignationStatus } from "../dashboard/actions"; 

export default async function AdminResignationsPage() {
  const supabase = await createClient();
  const cookieStore = await cookies();

  // 1. Session Isolation: Check for our unified cookie session
  const mockSession = cookieStore.get("mock_user_session");
  
  if (!mockSession) {
    redirect("/login");
  }

  const sessionData = JSON.parse(mockSession.value);

  // 2. Security Gate: Ensure ONLY users with the 'admin' role can access this terminal
  if (sessionData.role !== "admin") {
    redirect("/staff/dashboard");
  }

  // 3. Fetch resignation logs joined with profile information
  const { data: resignations } = await supabase
    .from("resignations")
    .select(`
      *,
      profiles (
        full_name,
        employee_id,
        department
      )
    `)
    .order("created_at", { ascending: false });

  return (
    <div className="w-full max-w-[1200px] mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#2D2D2D] tracking-tight">Resignation Desk Control Center</h1>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">
          Manage personnel operational departures and lifecycle statuses
        </p>
      </div>

      <div className="bg-white border border-[#F5F1EA] rounded-[2rem] overflow-hidden shadow-sm">
        <div className="p-6 bg-[#FAF9F6] border-b border-[#F5F1EA]">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Processing Queue</p>
        </div>
        
        <div className="divide-y divide-[#F5F1EA]">
          {resignations?.map((item) => (
            <div key={item.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-black text-sm text-[#2D2D2D]">{item.profiles?.full_name || "Unknown Staff"}</h4>
                <p className="text-[10px] text-gray-400 font-bold font-mono uppercase">
                  {item.profiles?.employee_id} • {item.profiles?.department}
                </p>
                
                <p className="text-[11px] text-amber-700 font-black uppercase tracking-wide flex items-center gap-1 pt-1">
                  Requested Exit Date: 
                  <span className="font-mono bg-amber-50 px-1.5 py-0.5 border border-amber-100 rounded-md">
                    {item.last_working_day || "Not Specified"}
                  </span>
                </p>
                
                <p className="text-xs text-gray-600 mt-2 italic">"{item.reason}"</p>
              </div>

              {/* DYNAMIC DROP-DOWN SELECT ELEMENT DESK */}
              <div className="flex items-center gap-3">
                <form action={handleUpdateResignationStatus} className="flex items-end gap-2">
                  <input type="hidden" name="id" value={item.id} />
                  
                  <div className="flex flex-col space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">
                      Filing Control
                    </label>
                    <select
                      name="status"
                      key={item.status}
                      defaultValue={item.status || "pending"}
                      className={`text-xs font-black uppercase tracking-wider px-3 py-2.5 rounded-xl border bg-white focus:outline-none cursor-pointer transition-all ${
                        item.status === 'approved' ? 'text-green-700 border-green-200 bg-green-50/30' :
                        item.status === 'rejected' ? 'text-red-700 border-red-200 bg-red-50/30' :
                        item.status === 'on hold' ? 'text-blue-700 border-blue-200 bg-blue-50/30' :
                        item.status === 'reverted' ? 'text-gray-500 border-gray-200 bg-gray-50' :
                        'text-amber-700 border-amber-200 bg-amber-50/30'
                      }`}
                      disabled={item.status === 'reverted'}
                    >
                      <option value="pending">⏳ Pending Review</option>
                      <option value="approved">✅ Approved</option>
                      <option value="rejected">❌ Rejected</option>
                      <option value="on hold">⏸️ On Hold</option>
                      {item.status === 'reverted' && (
                        <option value="reverted">↩️ Reverted by Staff</option>
                      )}
                    </select>
                  </div>

                  {item.status !== 'reverted' && (
                    <button 
                      type="submit" 
                      className="px-4 py-2.5 bg-[#2D2D2D] hover:bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-sm"
                    >
                      Update
                    </button>
                  )}
                </form>
              </div>

            </div>
          ))}
          
          {(!resignations || resignations.length === 0) && (
            <p className="text-center italic text-xs text-gray-300 py-12 font-bold">
              No resignation requests logged in system history logs.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}