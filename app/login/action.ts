"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

interface LoginPayload {
  identifier: string;
  password?: string;
  portalType: "admin" | "staff";
}

export async function loginAction(payload: LoginPayload) {
  const supabase = await createClient();
  const identifier = payload.identifier.trim();
  const typedPassword = payload.password?.trim();

  // 1. Core Look up in the profiles table first to identify who is logging in
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .or(`email.eq.${identifier},employee_id.eq.${identifier}`)
    .single();

  if (profileError || !profile) {
    return { error: "Account parameters not found in institutional system records." };
  }

  // 2. Portal Security Enforcement Guard Rails
  if (payload.portalType === "admin" && profile.role !== "admin") {
    return { error: "Access Denied: Non-administrative profile used on Admin Portal." };
  }
  if (payload.portalType === "staff" && profile.role === "admin") {
    return { error: "Access Denied: Admin profiles must use the Admin Portal tab." };
  }

  // 3. Centralized Database Password Validation Engine
  // Admins use their direct profile password; staff fallback to their Employee ID if no password is set.
  const targetSecretKey = profile.role === "admin" 
    ? profile.password 
    : (profile.password || profile.employee_id);

  if (typedPassword !== targetSecretKey) {
    return { 
      error: profile.role === "admin" 
        ? "Authentication failed: Invalid administrative password." 
        : "Invalid password. Your default password is your Employee ID." 
    };
  }

  // 4. Build the session cookie container to track authentication globally
  const cookieStore = await cookies();
  cookieStore.set(
    "mock_user_session",
    JSON.stringify({
      id: profile.id,
      email: profile.email,
      role: profile.role,
      employee_id: profile.employee_id
    }),
    {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production"
    }
  );

  // 5. Determine redirection path target dynamically
  let destinationDashboard = "/staff/dashboard";
  if (profile.role === "admin") {
    destinationDashboard = "/admin/dashboard";
  }

  // 6. Execute absolute break redirect cleanly at the function root level
  redirect(destinationDashboard);
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