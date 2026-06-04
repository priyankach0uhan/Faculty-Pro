"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

interface LoginPayload {
  identifier: string;
  password?: string;
  portalType: "admin" | "staff";
}

/**
 * SYSTEM AUTHENTICATION & LOGIN BYPASS ACTION
 */
export async function loginAction(payload: LoginPayload) {
  const supabase = await createClient();
  const identifier = payload.identifier.trim();
  const typedPassword = payload.password?.trim();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .or(`email.eq.${identifier},employee_id.eq.${identifier}`)
    .single();

  if (profileError || !profile) {
    return { error: "Account parameters not found in institutional system records." };
  }

  if (payload.portalType === "admin" && profile.role !== "admin") {
    return { error: "Access Denied: This is the Admin Portal." };
  }
  if (payload.portalType === "staff" && profile.role === "admin") {
    return { error: "Access Denied: Admin profiles must use the Admin Portal tab." };
  }

  const validSystemPassword = profile.password || profile.employee_id;

  if (typedPassword !== validSystemPassword) {
    return { error: "Invalid password credentials. Default access parameter is your Employee ID." };
  }

  const cookieStore = await cookies();
  cookieStore.set("mock_user_session", JSON.stringify({
    id: profile.id,          // Real database UUID
    email: profile.email,
    role: profile.role,
    employee_id: profile.employee_id
  }), { 
    path: "/", 
    httpOnly: true, 
    secure: process.env.NODE_ENV === "production" 
  });

  if (profile.role === "admin") {
    redirect("/admin/dashboard");
  }
  redirect("/staff/dashboard");
}

/**
 * PASSWORD RESET ENGINE
 */
export async function handlePasswordResetAction(userCodeIdentifier: string, structuralNewSecretKey: string) {
  const supabase = await createClient();
  const targetCode = userCodeIdentifier.trim();
  const isEmailFormat = targetCode.includes("@");

  let query = supabase.from("profiles").update({ password: structuralNewSecretKey.trim() });

  if (isEmailFormat) {
    query = query.eq("email", targetCode);
  } else {
    query = query.eq("employee_id", targetCode);
  }

  const { error } = await query;
  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * GLOBAL USER LOGOUT CONTROLLER ACTION
 */
export async function handleLogoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("mock_user_session");
  
  const supabase = await createClient();
  await supabase.auth.signOut();
  
  redirect("/login");
}

/**
 * 1. CLOCK ACTION
 * Uses profile ID (UUID) to fix database constraints
 */
export async function handleClockAction(profileId: string, status: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];
  const fullTimestampString = new Date().toISOString(); 

  const { error } = await supabase.from("attendance").upsert({
    employee_id: profileId, // Real UUID inserted here
    work_date: today,
    status: status,
    check_in: fullTimestampString
  }, { onConflict: 'employee_id,work_date' });

  if (error) throw new Error(error.message);
  
  revalidatePath("/staff/dashboard");
  revalidatePath("/admin/dashboard");
}

/**
 * 2. LEAVE ACTION
 */
export async function handleLeaveAction(formData: FormData) {
  const supabase = await createClient();
  
  const { error } = await supabase.from("leaves").insert({
    employee_id: formData.get("profileId"), // Real UUID extracted from hidden input
    leave_type: formData.get("leaveType"),
    start_date: formData.get("startDate"),
    end_date: formData.get("endDate"),
    reason: formData.get("reason"),
    status: "pending"
  });

  if (error) throw new Error(error.message);
  
  revalidatePath("/staff/dashboard");
  revalidatePath("/admin/leaves"); 
}

/**
 * 3. RESIGNATION ACTION
 */
export async function handleResignationAction(formData: FormData) {
  const supabase = await createClient();

  const profileId = formData.get("profileId") as string;
  const reason = formData.get("reason") as string;
  const lastWorkingDay = formData.get("last_working_day") as string;

  if (!profileId || !reason || !lastWorkingDay) {
    throw new Error("Required fields are missing.");
  }

  const { error } = await supabase.from("resignations").insert({
    employee_id: profileId,
    reason: reason,
    last_working_day: lastWorkingDay,
    status: "pending", 
  });

  if (error) throw new Error(error.message);

  revalidatePath("/staff/dashboard");
  revalidatePath("/staff/resignation");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/resignations");
}

/**
 * REVERT RESIGNATION ACTION
 */
export async function handleRevertResignationAction(formData: FormData) {
  const supabase = await createClient();
  const resignationId = formData.get("resignationId") as string;

  if (!resignationId) throw new Error("Resignation ID missing.");

  const { error } = await supabase
    .from("resignations")
    .update({ status: "reverted" })
    .eq("id", resignationId);

  if (error) throw new Error(error.message);

  revalidatePath("/staff/resignation");
  revalidatePath("/staff/dashboard");
  revalidatePath("/admin/resignations");
  revalidatePath("/admin/dashboard");
}

/**
 * 4. REVIEW REQUEST ACTION
 */
export async function reviewStatusRequest(requestId: string, approve: boolean) {
  const supabase = await createClient();

  const { data: request } = await supabase
    .from("status_requests")
    .select("*")
    .eq("id", requestId)
    .single();

  if (!request) return;

  await supabase
    .from("status_requests")
    .update({ status: approve ? "approved" : "rejected" })
    .eq("id", requestId);

  if (approve) {
    const fullTimestampString = new Date().toISOString();

    await supabase.from("attendance").upsert({
      employee_id: request.employee_id,
      work_date: request.requested_date,
      status: request.requested_status,
      check_in: fullTimestampString
    }, { onConflict: 'employee_id,work_date' });
  }

  revalidatePath("/admin/dashboard");
  revalidatePath("/staff/dashboard");
}

/**
 * 5. SUBMIT REQUEST ACTION
 */
export async function submitStatusRequest(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.from("status_requests").insert({
    employee_id: formData.get("profileId"),
    faculty_name: formData.get("facultyName"),
    requested_date: formData.get("requestedDate"),
    requested_status: formData.get("requestedStatus"),
    reason: formData.get("reason")
  });

  if (error) return { success: false, error: error.message };
  revalidatePath("/staff/dashboard");
  return { success: true };
}

/**
 * 6. SEND INQUIRY MESSAGE
 */
export async function sendInquiryMessage(
  senderId: string,
  receiverId: string,
  employeeId: string,
  facultyName: string,
  messageText: string,
  isAdmin: boolean = false
) {
  const supabase = await createClient();

  const { error } = await supabase.from("inquiries").insert({
    sender_id: senderId,
    receiver_id: receiverId,
    employee_id: employeeId,
    faculty_name: facultyName,
    message: messageText,
    is_from_admin: isAdmin
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}