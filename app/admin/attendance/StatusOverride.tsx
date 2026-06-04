"use client";

import React, { useState } from "react";
import { updateFacultyAttendance } from "./action";

export default function StatusOverride({ employeeId }: { employeeId: string }) {
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (status: string) => {
    setLoading(true);
    try {
      // Ensure the 'await' is INSIDE the function block
      await updateFacultyAttendance(employeeId, status as any);
    } catch (error) {
      console.error("Update failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative group inline-block text-right">
      <button 
        disabled={loading}
        className="px-4 py-2 bg-white border border-[#F5F1EA] text-gray-500 font-black text-[10px] uppercase tracking-widest rounded-xl shadow-sm hover:bg-gray-50 transition flex items-center gap-2 ml-auto"
      >
        {loading ? "..." : "Override"} <span className="text-[8px]">▼</span>
      </button>
      
      {/* DROPDOWN MENU */}
      <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white shadow-2xl border border-[#F5F1EA] z-[100] p-1.5 hidden group-hover:block animate-in fade-in zoom-in duration-200">
        {[
          { label: "Set Present", val: "Present", color: "text-green-700", icon: "🟢" },
          { label: "Set Absent", val: "Absent", color: "text-red-600", icon: "🔴" },
          { label: "Set On Leave", val: "On Leave", color: "text-amber-600", icon: "✉️" },
          { label: "Flag Late", val: "Late", color: "text-blue-600", icon: "⏱️" }
        ].map((opt) => (
          <button
            key={opt.val}
            onClick={() => handleUpdate(opt.val)}
            className={`w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-tight hover:bg-[#FAF9F6] ${opt.color} rounded-xl transition flex items-center gap-2`}
          >
            <span>{opt.icon}</span> {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}