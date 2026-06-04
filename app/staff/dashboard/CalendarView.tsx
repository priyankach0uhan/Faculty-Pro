"use client";

import React, { useState } from "react";

interface AttendanceLog {
  work_date: string;
  status: string;
}

interface LeaveLog {
  start_date: string;
  end_date: string;
  status: string;
  leave_type: string;
}

export function AttendanceCalendar({ 
  logs, 
  leaves = [], 
  startDate 
}: { 
  logs: AttendanceLog[]; 
  leaves: LeaveLog[]; 
  startDate: string; 
}) {
  const [viewDate, setViewDate] = useState(new Date());
  
  // Normalize base comparison targets
  const todayObj = new Date();
  const todayMidnight = new Date(todayObj.getFullYear(), todayObj.getMonth(), todayObj.getDate()).getTime();
  
  const joinDate = new Date(startDate);
  joinDate.setHours(0, 0, 0, 0);

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  const changeMonth = (offset: number) => {
    const nextMonth = new Date(currentYear, currentMonth + offset, 1);
    if (nextMonth > todayObj) return; 
    if (nextMonth < new Date(joinDate.getFullYear(), joinDate.getMonth(), 1)) return;
    setViewDate(nextMonth);
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const blankDays = firstDay === 0 ? 6 : firstDay - 1;

  const weekdayHeaders = [
    { id: "m1", label: "M" }, { id: "t1", label: "T" }, { id: "w1", label: "W" },
    { id: "t2", label: "T" }, { id: "f1", label: "F" }, { id: "s1", label: "S" }, 
    { id: "s2", label: "S" }
  ];

  return (
    <div className="bg-[#FAF9F6] p-6 rounded-[2rem] border border-[#F5F1EA] w-full text-xs">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-[11px] font-black text-[#2D2D2D] uppercase tracking-widest">
          {viewDate.toLocaleString("default", { month: "long", year: "numeric" })}
        </h4>
        <div className="flex gap-4 font-bold text-gray-400">
          <button onClick={() => changeMonth(-1)} className="hover:text-black transition-colors text-lg">←</button>
          <button 
            onClick={() => changeMonth(1)} 
            disabled={currentYear === todayObj.getFullYear() && currentMonth === todayObj.getMonth()}
            className="hover:text-black disabled:opacity-10 transition-colors text-lg"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekdayHeaders.map((day) => (
          <div key={day.id} className="text-[10px] text-center font-black text-gray-300 py-2">
            {day.label}
          </div>
        ))}
        
        {Array.from({ length: blankDays }).map((_, i) => (
          <div key={`blank-${i}`} className="h-10 w-full" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dateObj = new Date(currentYear, currentMonth, dayNum);
          const currentTileTime = dateObj.getTime();
          const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
          
          const log = logs.find(l => l.work_date === dateStr);
          const isToday = dateObj.toDateString() === todayObj.toDateString();
          const isPast = currentTileTime < todayMidnight;
          const isFuture = currentTileTime > todayMidnight;

          // Check if date falls inside an approved leave block safely
          const approvedLeave = leaves.find(lv => {
            if (lv.status !== "approved") return false;
            const start = new Date(lv.start_date).setHours(0,0,0,0);
            const end = new Date(lv.end_date).setHours(23,59,59,999);
            return currentTileTime >= start && currentTileTime <= end;
          });

          let tileStyles = "bg-white text-[#2D2D2D] border-[#F5F1EA]";

          // Dynamic Status Precedence Flow
          if (log) {
            const statusUpper = log.status.toUpperCase();
            if (statusUpper === "PRESENT") {
              tileStyles = "bg-[#7A8F66] text-white border-[#7A8F66] shadow-sm";
            } else if (statusUpper === "ON LEAVE" || statusUpper === "LEAVE") {
              tileStyles = "bg-[#FFB02E] text-white border-[#FFB02E] shadow-sm";
            } else if (statusUpper === "ABSENT") {
              tileStyles = "bg-red-500 text-white border-red-500 shadow-sm";
            } else if (statusUpper === "LATE") {
              tileStyles = "bg-blue-500 text-white border-blue-500 shadow-sm";
            }
          } else if (approvedLeave) {
            tileStyles = "bg-[#FFB02E] text-white border-[#FFB02E] shadow-sm";
          } else if (isPast) {
            tileStyles = "bg-red-500 text-white border-red-600 shadow-sm";
          } else if (isToday) {
            tileStyles = "border-2 border-[#7A8F66] text-[#7A8F66] font-black animate-pulse";
          } else if (isFuture) {
            tileStyles = "bg-white text-gray-300 border-[#F5F1EA] opacity-40";
          }

          return (
            <div 
              key={`day-${dateStr}`} 
              className={`h-10 rounded-xl flex items-center justify-center text-[11px] font-black border transition-all ${tileStyles}`}
              title={log ? `Status: ${log.status}` : approvedLeave ? `Approved Leave: ${approvedLeave.leave_type}` : undefined}
            >
              {dayNum.toString().padStart(2, '0')}
            </div>
          );
        })}
      </div>
      
      {/* UPDATE LEGEND LABELS TO MATCH APP CONSTANTS */}
      <div className="mt-8 pt-5 border-t border-[#F5F1EA] flex justify-center gap-6">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#7A8F66]"></span>
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Present</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFB02E]"></span>
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">On Leave</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Late</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Absent</span>
        </div>
      </div>
    </div>
  );
}