"use server"; // CRITICAL: This must be at the very top

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type AllowedStatus = "Present" | "Absent" | "On Leave" | "Late";

export async function updateFacultyAttendance(uuid: string, status: AllowedStatus) {
  const supabase = await createClient();
  const currentDate = new Date().toISOString().split("T")[0];

  // Logic to update or insert today's attendance
  const { error } = await supabase.from("attendance").upsert(
    { 
      employee_id: uuid, 
      status: status, 
      work_date: currentDate,
      check_in: new Date().toISOString() 
    },
    { onConflict: 'employee_id,work_date' }
  );

  if (error) throw new Error(error.message);

  // Sync all relevant views
  revalidatePath("/admin/attendance");
  revalidatePath("/admin/dashboard");
  revalidatePath("/staff/dashboard");
}