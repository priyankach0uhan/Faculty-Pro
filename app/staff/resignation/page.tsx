import React from "react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { handleResignationAction, handleRevertResignationAction } from "../dashboard/actions"; 

export default async function ResignationDeskPage() {
  const supabase = await createClient();
  const cookieStore = await cookies();

  let activeUserId = null;

  // 1. Session Isolation: Authenticate session via user cookie metadata
  const mockSession = cookieStore.get("mock_user_session");
  if (mockSession) {
    const sessionData = JSON.parse(mockSession.value);
    activeUserId = sessionData.id; // Extracts the user profile unique row UUID
  } else {
    // Fallback context for admin or direct authentication tracks
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!authError && user) activeUserId = user.id;
  }

  // Security Wall: Force bounce unauthenticated targets back to base login terminal
  if (!activeUserId) redirect("/login");

  // 2. 🔒 STRICT DATA ISOLATION FILTERING: Fetch history entries belonging ONLY to this account UUID
  const { data: structuralHistory } = await supabase
    .from("resignations")
    .select("*")
    .eq("employee_id", activeUserId)
    .order("created_at", { ascending: false });

  const currentFiling = structuralHistory?.[0];
  
  // Form unlocks if there are no filings, or if the admin rejects, places on-hold, or the staff reverts it.
  const isFormUnlocked = 
    !currentFiling || 
    currentFiling.status === 'rejected' || 
    currentFiling.status === 'reverted' ||
    currentFiling.status === 'on hold';

  return (
    <div className="w-full max-w-[800px] mx-auto p-4 space-y-8">
      <div className="bg-white p-8 rounded-[2.5rem] border border-[#F5F1EA] shadow-sm">
        <h3 className="font-black text-[#2D2D2D] text-lg mb-2">Formal Resignation Desk</h3>
        <p className="text-[10px] text-gray-400 font-bold uppercase mb-6 tracking-tight">
          File personnel operational separation parameters
        </p>

        {/* SUBMISSION FORM - Rendered if unlocked so staff can file multiple times */}
        {isFormUnlocked ? (
          <form action={handleResignationAction} className="space-y-6">
            {/* Injecting the secure profile row UUID string instead of the display Employee ID label */}
            <input type="hidden" name="profileId" value={activeUserId} />

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                Requested Last Working Day
              </label>
              <input 
                type="date"
                name="last_working_day"
                className="p-4 bg-[#FAF9F6] border border-[#F5F1EA] rounded-2xl text-xs font-medium w-full focus:outline-none"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                Reason for Separation
              </label>
              <textarea 
                name="reason" 
                rows={4}
                placeholder="State your formal justification statement for records..."
                className="p-4 bg-[#FAF9F6] border border-[#F5F1EA] rounded-2xl text-xs font-medium w-full focus:outline-none resize-none"
                required 
              />
            </div>

            <button type="submit" className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all">
              Submit Formal Resignation
            </button>
          </form>
        ) : (
          /* ACTIVE CARD BLOCK: Displays if status is currently pending or approved */
          <div className="p-6 bg-[#FAF9F6] border border-[#F5F1EA] rounded-[1.5rem] text-xs space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-black uppercase text-[10px] tracking-wider">Filing Status</span>
              <span className={`px-3 py-1 rounded-full font-black uppercase text-[10px] border ${
                currentFiling.status === 'approved' ? 'bg-green-50 text-green-700 border-green-100' :
                currentFiling.status === 'on hold' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                'bg-amber-50 text-amber-700 border-amber-100'
              }`}>
                {currentFiling.status || "PENDING"}
              </span>
            </div>
            
            <div className="space-y-3 font-medium text-[#2D2D2D]">
              <div>
                <span className="font-bold text-gray-400 uppercase text-[9px] block mb-1">Requested Last Working Day</span> 
                <span className="font-mono bg-white px-3 py-1 border border-[#F5F1EA] rounded-lg inline-block text-[#2D2D2D]">
                  {currentFiling.last_working_day}
                </span>
              </div>
              <div>
                <span className="font-bold text-gray-400 uppercase text-[9px] block mb-1">Reason / Statement</span> 
                <div className="p-3 bg-white border border-[#F5F1EA] rounded-xl text-gray-600">
                  "{currentFiling.reason}"
                </div>
              </div>
            </div>

            {/* SHOW REVERT CONTROL ELEMENT IF REQUEST IS STILL PENDING EXTRACTION */}
            {currentFiling.status === "pending" && (
              <form action={handleRevertResignationAction} className="pt-2">
                <input type="hidden" name="resignationId" value={currentFiling.id} />
                <button type="submit" className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all">
                  ↩️ Revert Resignation Request
                </button>
              </form>
            )}
          </div>
        )}

        {/* LOG HISTORY GRID: Shows past historical filings underneath */}
        {structuralHistory && structuralHistory.length > 0 && (
          <div className="mt-8 pt-8 border-t border-[#F5F1EA] space-y-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Filing Log History</p>
            <div className="space-y-2">
              {structuralHistory.map((historyItem) => (
                <div key={historyItem.id} className="p-4 bg-white border border-[#F5F1EA] rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-[#2D2D2D]">Exit: <span className="font-mono">{historyItem.last_working_day}</span></p>
                    <p className="text-[10px] text-gray-400 truncate max-w-[300px] mt-0.5">"{historyItem.reason}"</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                    historyItem.status === 'approved' ? 'bg-green-50 text-green-700 border-green-100' :
                    historyItem.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                    historyItem.status === 'on hold' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                    historyItem.status === 'reverted' ? 'bg-gray-100 text-gray-500 border-gray-200' : 
                    'bg-amber-50 text-amber-700 border-amber-100'
                  }`}>
                    {historyItem.status === 'reverted' ? 'Reverted' : historyItem.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}