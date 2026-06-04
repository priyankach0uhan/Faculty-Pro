  "use server";

  import { createClient } from "@/utils/supabase/server";
  import { revalidatePath } from "next/cache";

  export async function addEmployee(formData: FormData) {
    const supabase = await createClient();
    
    const email = formData.get("email") as string;
    const fullName = formData.get("fullName") as string;
    const dept = formData.get("department") as string;
    const empId = formData.get("employeeId") as string;

    // 1. Create User in Auth (Password defaults to EmployeeID for first login)
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: empId,
      email_confirm: true,
    });

    if (authError) throw new Error(authError.message);

    // 2. Create Profile Record
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authUser.user.id,
      full_name: fullName,
      department: dept,
      employee_id: empId,
      role: "staff"
    });

    if (profileError) throw new Error(profileError.message);

    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/faculty");
  }
  export async function processCalendarCorrection(
    requestId: string,
    employeeUserId: string,
    targetDate: string,
    desiredStatus: string,
    action: "approved" | "rejected",
    adminUserId: string
  ) {
    const supabase = await createClient();

    // 1. Update the historic correction file path item
    const { error: correctionError } = await supabase
      .from("calendar_corrections")
      .update({
        status: action,
        reviewed_by: adminUserId,
        reviewed_at: new Date().toISOString()
      })
      .eq("id", requestId);

    if (correctionError) throw new Error(correctionError.message);

    // 2. If approved, execute the live attendance matrix override modification
    if (action === "approved") {
      const { error: attendanceError } = await supabase
        .from("attendance")
        .upsert({
          employee_id: employeeUserId,
          work_date: targetDate,
          status: desiredStatus,
          check_in: "09:00:00", // Standard execution fallback markers
          check_out: "17:00:00"
        }, { onConflict: "employee_id,work_date" });

      if (attendanceError) throw new Error(attendanceError.message);
    }

    revalidatePath("/admin/dashboard");
  }

  /**
   * PROCESS LEAVE APPLICATION
   * Resolves a staff vacancy application and reflects it on both historical components
   */
  export async function processLeaveApplication(
    leaveId: string,
    action: "approved" | "rejected",
    adminUserId: string
  ) {
    const supabase = await createClient();

    const { error } = await supabase
      .from("leaves")
      .update({
        status: action,
        reviewed_by: adminUserId,
        reviewed_at: new Date().toISOString()
      })
      .eq("id", leaveId);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/dashboard");
  }
  export async function handleResignationAction(formData: FormData) {
    const supabase = await createClient();

    // 1. Log everything to your VS Code terminal to find the mismatch
    console.log("Form Entries:", Object.fromEntries(formData.entries()));

    const employeeId = formData.get("employeeId") as string;
    const reason = formData.get("reason") as string;
    
    // 2. Try to get the date using both possible naming conventions
    const lastWorkingDay = (formData.get("last_working_day") || formData.get("lastWorkingDay")) as string;

    if (!employeeId || !reason || !lastWorkingDay) {
      throw new Error(`Missing fields. Employee: ${!!employeeId}, Reason: ${!!reason}, Date: ${!!lastWorkingDay}`);
    }

    const { error } = await supabase.from("resignations").insert({
      employee_id: employeeId,
      reason: reason,
      last_working_day: lastWorkingDay,
      status: "pending",
    });

    if (error) throw new Error(error.message);

    revalidatePath("/staff/resignation");
    revalidatePath("/admin/resignations");
  }export async function handleUpdateResignationStatus(formData: FormData) {
  const supabase = await createClient();

  const targetId = formData.get("id") as string;
  const newStatus = formData.get("status") as string;

  if (!targetId || !newStatus) {
    throw new Error("Missing operation parameter keys.");
  }

  // 1. Mutate row state inside Supabase relations
  const { error } = await supabase
    .from("resignations")
    .update({ status: newStatus })
    .eq("id", targetId);

  if (error) throw new Error(error.message);

  // 2. Clear layouts and cache pools instantly on both portals
  revalidatePath("/admin/resignations");
  revalidatePath("/staff/resignation");
  revalidatePath("/admin/dashboard");
  revalidatePath("/staff/dashboard");
}