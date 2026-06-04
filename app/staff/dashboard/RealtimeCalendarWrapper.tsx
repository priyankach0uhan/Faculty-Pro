"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { AttendanceCalendar } from "./CalendarView";

interface AttendanceRecord {
  id: number;
  work_date: string;
  check_in: string;
  check_out: string | null;
  status: string;
}

interface RealtimeCalendarWrapperProps {
  initialLogs: AttendanceRecord[];
  initialLeaves: any[];
  userId: string;
  startDate: string;
  onLeavesUpdate?: (updatedLeaves: any[]) => void; // Syncs history panel side logs
}

export function RealtimeCalendarWrapper({ 
  initialLogs, 
  initialLeaves, 
  userId, 
  startDate,
  onLeavesUpdate
}: RealtimeCalendarWrapperProps) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>(initialLogs);

  useEffect(() => {
    // A. Listen for instant modifications to the active daily calendar state
    const attendanceChannel = supabase
      .channel(`live_dashboard_attendance:${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "attendance", filter: `employee_id=eq.${userId}` },
        async () => {
          const { data } = await supabase
            .from("attendance")
            .select("*")
            .eq("employee_id", userId)
            .order("work_date", { ascending: false });
          if (data) setAttendanceLogs(data as AttendanceRecord[]);
        }
      )
      .subscribe();

    // B. Listen for real-time adjustments to requested leave logs (History updates)
    const leavesChannel = supabase
      .channel(`live_dashboard_leaves:${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leaves", filter: `employee_id=eq.${userId}` },
        async () => {
          const { data } = await supabase
            .from("leaves")
            .select("*")
            .eq("employee_id", userId)
            .order("created_at", { ascending: false });
          
          if (data && onLeavesUpdate) {
            onLeavesUpdate(data);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(attendanceChannel);
      supabase.removeChannel(leavesChannel);
    };
  }, [userId, supabase, onLeavesUpdate]);

  return (
    <AttendanceCalendar 
      logs={attendanceLogs} 
      leaves={initialLeaves} 
      startDate={startDate} 
    />
  );
}