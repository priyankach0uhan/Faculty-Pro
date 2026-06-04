"use client";

import React, { useState, useEffect } from "react";
import { updateFacultyAttendance, AllowedStatus } from "./action";

interface SupabaseFacultyRow {
  id: string;
  employee_id: string;
  full_name: string;
  department: string;
  attendance: {
    status: AllowedStatus;
  }[];
}

export default function AttendancePage() {
  const [dbStaff, setDbStaff] = useState<SupabaseFacultyRow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Fetch data dynamically from Supabase
  async function fetchCurrentMetrics() {
    const { supabase } = await import("@/lib/supabase");
    const currentDate = new Date().toISOString().split("T")[0];

    // Select all teachers/staff and their attendance record for TODAY
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        id, 
        employee_id, 
        full_name, 
        department,
        attendance(status)
      `)
      .neq("role", "admin") // Filter out admins to show all faculty
      .filter("attendance.work_date", "eq", currentDate);

    if (error) {
      console.error("Fetch Error:", error.message);
      return;
    }

    if (data) setDbStaff(data as unknown as SupabaseFacultyRow[]);
  }

  useEffect(() => {
    fetchCurrentMetrics();
    
    // Close dropdown when clicking outside
    const handleOutsideClick = () => setActiveDropdown(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  const departments = ["all", ...Array.from(new Set(dbStaff.map((item) => item.department)))];

  // Handle the Administrative Override status update
  async function handleStatusChange(uuid: string, status: AllowedStatus) {
    setIsUpdating(uuid);
    try {
      // Calls the Server Action which performs revalidatePath internally
      await updateFacultyAttendance(uuid, status);
      await fetchCurrentMetrics(); 
    } catch (err) {
      alert("System Action failed to write to database instance.");
    } finally {
      setIsUpdating(null);
      setActiveDropdown(null);
    }
  }

  const filteredStaff = dbStaff.filter((item) => {
    const currentStatus = item.attendance?.[0]?.status || "Absent";
    const matchesSearch =
      item.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.employee_id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "Present" && (currentStatus === "Present" || currentStatus === "Late")) ||
      (statusFilter === "Absent" && currentStatus === "Absent") ||
      (statusFilter === "On Leave" && currentStatus === "On Leave");

    const matchesDept = deptFilter === "all" || item.department === deptFilter;

    return matchesSearch && matchesStatus && matchesDept;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[#F5F1EA] pb-6">
        <div>
          <h1 className="text-2xl font-black text-[#2D2D2D]">Live Faculty Duty Matrix</h1>
          <p className="text-xs text-gray-400 font-medium mt-1">
            Connected Directly to Live Supabase Backend Tables.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-[#F5F1EA] shadow-sm">
          <span className="text-lg">📅</span>
          <span className="text-xs font-bold text-gray-600">{today}</span>
        </div>
      </div>

      {/* Filters UI */}
      <div className="bg-white p-4 rounded-2xl border border-[#F5F1EA] shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <span className="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search matching real database indexes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FAF9F6] border border-[#F5F1EA] rounded-xl text-xs font-medium text-[#2D2D2D] focus:outline-none focus:ring-1 focus:ring-[#7A8F66]"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 bg-[#FAF9F6] border border-[#F5F1EA] rounded-xl text-xs font-bold text-gray-600 focus:outline-none capitalize cursor-pointer"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept === "all" ? "All Departments" : dept}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#FAF9F6] border border-[#F5F1EA] rounded-xl text-xs font-bold text-gray-600 focus:outline-none cursor-pointer"
          >
            <option value="all">All System Statuses</option>
            <option value="Present">🟢 Active / Present</option>
            <option value="Absent">🔴 Flagged Absent</option>
            <option value="On Leave">✉️ On Approved Leave</option>
          </select>
        </div>
      </div>

      {/* Main Framework Table Viewport */}
      <div className="bg-white rounded-[2.5rem] border border-[#F5F1EA] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF9F6] border-b border-[#F5F1EA] text-[10px] uppercase font-black text-gray-400 tracking-wider">
                <th className="p-6">Database Key</th>
                <th className="p-6">Faculty Member</th>
                <th className="p-6">Department Cluster</th>
                <th className="p-6">Current Status</th>
                <th className="p-6 text-right">Administrative Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FAF9F6]">
              {filteredStaff.map((person) => {
                const currentStatus = person.attendance?.[0]?.status || "Absent";
                return (
                  <tr key={person.id} className="hover:bg-[#FFFDF8] transition-colors">
                    <td className="p-6 font-mono font-bold text-sm text-[#9B7E5A]">{person.employee_id}</td>
                    <td className="p-6 font-black text-sm text-[#2D2D2D]">
                      {person.full_name}
                      {isUpdating === person.id && (
                        <span className="text-[10px] text-[#7A8F66] ml-2 animate-pulse font-bold">(Syncing...)</span>
                      )}
                    </td>
                    <td className="p-6 text-xs text-gray-500 font-semibold">{person.department}</td>
                    <td className="p-6">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wide border ${
                          currentStatus === "Present"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : currentStatus === "Absent"
                            ? "bg-red-50 text-red-600 border-red-100"
                            : currentStatus === "On Leave"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        {currentStatus}
                      </span>
                    </td>
                    <td className="p-6 text-right relative" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-block">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdown(activeDropdown === person.id ? null : person.id);
                          }}
                          className="px-4 py-2 bg-white border border-[#F5F1EA] text-gray-500 font-black text-[10px] uppercase tracking-widest rounded-xl shadow-sm hover:bg-gray-50 transition flex items-center gap-2 ml-auto"
                        >
                          <span>Override</span>
                          <span className="text-[8px]">▼</span>
                        </button>

                        {activeDropdown === person.id && (
                          <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white shadow-2xl border border-[#F5F1EA] z-[100] p-1.5 animate-in fade-in zoom-in duration-200">
                            {[
                              { label: "Set Present", val: "Present", color: "text-green-700", icon: "🟢" },
                              { label: "Set Absent", val: "Absent", color: "text-red-600", icon: "🔴" },
                              { label: "Set On Leave", val: "On Leave", color: "text-amber-600", icon: "✉️" },
                              { label: "Flag Late", val: "Late", color: "text-blue-600", icon: "⏱️" }
                            ].map((opt) => (
                              <button
                                key={opt.val}
                                onClick={() => handleStatusChange(person.id, opt.val as AllowedStatus)}
                                className={`w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-tight hover:bg-[#FAF9F6] ${opt.color} rounded-xl transition flex items-center gap-2`}
                              >
                                <span>{opt.icon}</span> {opt.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}