import React from "react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import RequestChangeModal from "./RequestChangeModal"; 
import { handleLeaveAction, handleClockAction } from "./actions";
import { RealtimeCalendarWrapper } from "./RealtimeCalendarWrapper";

interface AttendanceRecord {
  id: number;
  work_date: string;
  check_in: string;
  check_out: string | null;
  status: string;
}

export default async function StaffDashboard() {
  const supabase = await createClient();
  const cookieStore = await cookies();

  let activeEmployeeId = null;
  let activeUserId = null;

  const mockSession = cookieStore.get("mock_user_session");
  if (mockSession) {
    const sessionData = JSON.parse(mockSession.value);
    activeEmployeeId = sessionData.employee_id;
    activeUserId = sessionData.id;
  } else {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!authError && user) {
      activeUserId = user.id;
    }
  }

  if (!activeUserId && !activeEmployeeId) redirect("/login");

  let query = supabase.from("profiles").select("*");
  if (activeEmployeeId) {
    query = query.eq("employee_id", activeEmployeeId);
  } else {
    query = query.eq("id", activeUserId);
  }

  const { data: profile } = await query.single();

  if (!profile) return <div className="p-10 text-center text-red-500 font-bold">Profile Data Mapping Error</div>;

  // 🔒 STRICT PRIVACY FILTERING: Query matching columns using the exact unique UUID row ID
  const [attendance, messages, leavesData] = await Promise.all([
    supabase.from("attendance").select("*").eq("employee_id", profile.id).order("work_date", { ascending: false }),
    supabase.from("messages").select("*").eq("receiver_id", profile.id).order("created_at", { ascending: false }),
    supabase.from("leaves").select("*").eq("employee_id", profile.id).order("created_at", { ascending: false }),
  ]);

  const attendanceLogs = (attendance.data as AttendanceRecord[]) || [];
  const leavesLogs = leavesData.data || [];
  const currentDate = new Date().toISOString().split("T")[0];
  const hasMarkedToday = attendanceLogs.some((log) => log.work_date === currentDate);

  return (
    <div className="w-full max-w-[1300px] mx-auto space-y-8 block">
      
      {/* IDENTITY BANNER HERO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        <div className="lg:col-span-8 bg-white p-6 rounded-[2rem] border border-[#F5F1EA] shadow-sm flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#2D2D2D] tracking-tight">Welcome back, {profile.full_name}</h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">
              Department of {profile.department} • <span className="font-mono text-[#9B7E5A]">{profile.employee_id}</span>
            </p>
          </div>
          
          <RequestChangeModal 
            employeeId={profile.id} 
            facultyName={profile.full_name} 
          />
        </div>
        
        <div className="lg:col-span-4 bg-[#7A8F66] p-6 rounded-[2rem] text-white shadow-md shadow-[#7A8F66]/10 flex flex-col justify-center">
          <p className="text-[9px] font-black opacity-60 uppercase tracking-widest">Administrative Notice</p>
          <p className="text-xs font-bold mt-1 line-clamp-2">{messages.data?.[0]?.content || "Your system profile is fully synchronized."}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COMPARTMENT */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-[#F5F1EA] shadow-sm text-center">
            <h3 className="font-black text-[#2D2D2D] text-lg mb-2">Daily Registry</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase mb-6">Mark presence to avoid absence record</p>
            
            {/* Action handler binds the real row UUID profile.id to prevent syntax type errors */}
            <form action={handleClockAction.bind(null, profile.id, "Present")}>
              <button 
                disabled={hasMarkedToday}
                className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                  hasMarkedToday 
                    ? "bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-100" 
                    : "bg-[#7A8F66] text-white shadow-xl shadow-[#7A8F66]/20 hover:scale-[1.01]"
                }`}
              >
                {hasMarkedToday ? "✓ Attendance Recorded" : "📍 Mark Attendance"}
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] border border-[#F5F1EA] shadow-sm space-y-4">
            <h3 className="font-black text-[#2D2D2D] text-xs uppercase tracking-wider px-2">Leave Applications Log</h3>
            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
              {leavesLogs.map((item: any) => (
                <div key={item.id} className="p-3 bg-[#FAF9F6] border border-[#F5F1EA] rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <p className="font-black text-[#2D2D2D]">{item.leave_type}</p>
                    <p className="text-[9px] text-gray-400 font-bold mt-0.5">{item.start_date} to {item.end_date}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-[9px] font-black rounded-md uppercase border ${
                    item.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                    item.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                    'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
              {leavesLogs.length === 0 && <p className="text-center italic text-xs text-gray-300 py-6 font-bold">No filing applications sent.</p>}
            </div>
          </div>
        </div>

        {/* RIGHT COMPARTMENT */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-[#F5F1EA] shadow-sm">
            <h3 className="font-black text-[#2D2D2D] text-lg mb-6">Leave Exemptions Desk</h3>
            
            <form action={handleLeaveAction} className="space-y-4">
              {/* Injecting profile.id (UUID) to align with database architecture */}
              <input type="hidden" name="profileId" value={profile.id} />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Classification</label>
                  <select name="leaveType" className="p-4 bg-[#FAF9F6] border border-[#F5F1EA] rounded-2xl text-xs font-bold w-full focus:outline-none focus:ring-1 focus:ring-[#7A8F66]">
                    <option value="Casual Exemption">Casual Exemption</option>
                    <option value="Medical Leave">Medical Leave</option>
                    <option value="Academic Leave">Academic Leave</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Start Date</label>
                  <input type="date" name="startDate" className="p-4 bg-[#FAF9F6] border border-[#F5F1EA] rounded-2xl text-xs font-bold w-full focus:outline-none" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">End Date</label>
                  <input type="date" name="endDate" className="p-4 bg-[#FAF9F6] border border-[#F5F1EA] rounded-2xl text-xs font-bold w-full focus:outline-none" required />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Filing Reason Description</label>
                <textarea 
                   name="reason" 
                   rows={2}
                   placeholder="State reason for requested leave duration..." 
                   className="p-4 bg-[#FAF9F6] border border-[#F5F1EA] rounded-2xl text-xs font-medium w-full focus:outline-none resize-none" 
                   required 
                />
              </div>

              <button type="submit" className="w-full py-4 bg-[#2D2D2D] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all">
                Submit Leave Request
              </button>
            </form>
          </div>

          {/* REALTIME CONTAINER */}
          <div className="bg-white p-2 rounded-[2.5rem] border border-[#F5F1EA] shadow-sm overflow-hidden">
            <RealtimeCalendarWrapper 
              initialLogs={attendanceLogs}
              initialLeaves={leavesLogs}
              userId={profile.id} 
              startDate={profile.start_date || profile.created_at}
            />
          </div>
        </div>

      </div>
    </div>
  );
}