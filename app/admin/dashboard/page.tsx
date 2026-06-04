import React from "react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import RequestReviewDesk from "./RequestReviewDesk"; 

interface MetricCardProps {
  label: string;
  value: number;
  sub: string;
  icon: string;
  color?: string;
}

export default async function AdminDashboard() {
  const supabase = await createClient();

  // 1. Security Check
 

  const today = new Date().toISOString().split("T")[0];

  // 2. Parallel Aggregate Data Fetching
  const [
    { count: totalStaff },
    { count: presentToday },
    { count: approvedLeaves },
    { count: pendingExits },
    allProfilesResponse,
    todayAttendanceResponse
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).neq("role", "admin"),
    supabase.from("attendance").select("*", { count: "exact", head: true }).eq("work_date", today),
    supabase.from("leaves").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("resignations").select("*", { count: "exact", head: true }).eq("status", "pending"),
    // Fetch all active base faculty profiles (excluding admin)
    supabase.from("profiles").select("employee_id, full_name, department, role").neq("role", "admin").order("employee_id", { ascending: true }),
    // Fetch today's log entries to cross-reference logs live
    supabase.from("attendance").select("employee_id, status").eq("work_date", today)
  ]);

  const profiles = allProfilesResponse.data || [];
  const attendanceLogs = todayAttendanceResponse.data || [];

  // Map logs into a dictionary for quick O(1) matching speed lookup
  const attendanceMap = new Map(attendanceLogs.map(log => [log.employee_id, log.status]));

  return (
    <div className="space-y-6 sm:space-y-8 w-full">
      {/* METRIC CARDS SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard label="Total Staff Appointed" value={totalStaff || 0} sub="Across Appointed Sectors" icon="👥" />
        <MetricCard 
          label="Present Today" 
          value={presentToday || 0} 
          sub={`${((presentToday || 0) / (totalStaff || 1) * 100).toFixed(1)}% attendance rate`} 
          icon="🟢" 
          color="text-green-600"
        />
        <MetricCard label="On Approved Absence" value={approvedLeaves || 0} sub="Medical & Earned Leaves" icon="📅" color="text-amber-600" />
        <MetricCard label="Action Pending Issues" value={pendingExits || 0} sub="Unprocessed Exits Pending" icon="⚠️" color="text-red-600" />
      </div>

      <RequestReviewDesk />

      {/* LIVE FACULTY DUTY MATRIX */}
      <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[2.5rem] border border-[#F5F1EA] shadow-sm">
        <h3 className="font-black text-[#2D2D2D] text-lg mb-6">Live Faculty Duty Matrix</h3>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left">
          <thead>
            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-[#F5F1EA]">
              <th className="pb-4">Faculty ID</th>
              <th className="pb-4">Name</th>
              <th className="pb-4">Department</th>
              <th className="pb-4">Duty Status</th>
            </tr>
          </thead>
          <tbody className="text-xs font-bold text-[#2D2D2D]">
            {profiles.map((profile) => {
              // Check if employee has a real-time tracking record logged for today
              const loggedStatus = attendanceMap.get(profile.employee_id);
              const dutyStatus = loggedStatus || "OUT SESSION";

              return (
                <tr key={profile.employee_id} className="border-b border-[#FAF9F6] last:border-0 hover:bg-[#FAF9F6]/30 transition-colors">
                  <td className="py-4 font-mono">{profile.employee_id || "N/A"}</td>
                  <td className="py-4">
                    <div className="flex flex-col">
                      <span>{profile.full_name || "Unknown Faculty"}</span>
                      <span className="text-[9px] text-gray-400 font-mono tracking-wide uppercase mt-0.5">{profile.role}</span>
                    </div>
                  </td>
                  <td className="py-4">{profile.department || "General"}</td>
                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-black ${
                      dutyStatus === 'ABSENT' 
                        ? 'bg-red-50 text-red-700' 
                        : dutyStatus === 'LATE' 
                        ? 'bg-amber-50 text-amber-700' 
                        : dutyStatus === 'PRESENT' 
                        ? 'bg-green-50 text-green-700' 
                        : 'bg-gray-100 text-gray-500 border border-gray-200/50' // Style for OUT SESSION
                    }`}>
                      {dutyStatus}
                    </span>
                  </td>
                </tr>
              );
            })}
            {profiles.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-400 font-medium italic">
                  No registered profiles found in database.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, icon, color = "text-[#7A8F66]" }: MetricCardProps) {
  return (
    <div className="bg-white p-5 sm:p-6 lg:p-8 rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[2.5rem] border border-[#F5F1EA] shadow-sm flex flex-col justify-between min-h-40 sm:h-48">
      <div className="flex justify-between items-start">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest max-w-[12rem] sm:max-w-[100px]">{label}</p>
        <span className="text-xl opacity-20">{icon}</span>
      </div>
      <div>
        <p className={`text-4xl font-black ${color}`}>{value.toString().padStart(2, '0')}</p>
        <p className="text-[10px] font-bold text-gray-400 mt-1">{sub}</p>
      </div>
    </div>
  );
}
