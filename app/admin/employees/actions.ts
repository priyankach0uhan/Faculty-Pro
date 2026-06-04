"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";

interface EditFacultyPayload {
  id: string;
  full_name: string;
  email: string;
  department: string;
  role: "admin" | "management" | "HOD" | "teacher" | "staff";
  status: "ACTIVE" | "INACTIVE";
}

// Admin Client to safely bypass RLS for user accounts management
const getAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
};

/**
 * SERVER ACTION: ONBOARD NEW FACULTY
 * Creates real authentication accounts and provisions internal institutional rows
 */
export async function createFaculty(formData: FormData) {
  const supabaseAdmin = getAdminClient();

  const email = (formData.get("email") as string)?.trim();
  const fullName = (formData.get("fullName") as string)?.trim();
  const department = (formData.get("department") as string)?.trim();
  const role = ((formData.get("role") as string) || "staff").toLowerCase();

  // ==========================
  // VALIDATION
  // ==========================

  if (!fullName) {
    return { error: "Full Name is required." };
  }

  if (!department) {
    return { error: "Department is required." };
  }

  if (!email) {
    return { error: "Email address is required." };
  }

  // Email Format Validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return {
      error: "Please enter a valid email address.",
    };
  }

  try {
    // ==========================
    // CHECK DUPLICATE EMAIL
    // ==========================

    const { data: existingUser } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingUser) {
      return {
        error: "This email is already registered.",
      };
    }

    // ==========================
    // GENERATE FACULTY ID
    // ==========================

    const { count } = await supabaseAdmin
      .from("profiles")
      .select("*", {
        count: "exact",
        head: true,
      });

    const nextNumber = (count || 0) + 1;
    const autoEmployeeId = `FAC-${nextNumber
      .toString()
      .padStart(3, "0")}`;

    // ==========================
    // CREATE AUTH ACCOUNT
    // ==========================

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password: autoEmployeeId,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
        },
      });

    if (authError) {
      return {
        error: authError.message,
      };
    }

    // ==========================
    // CREATE PROFILE RECORD
    // ==========================

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: authData.user.id,
        full_name: fullName,
        email,
        department,
        employee_id: autoEmployeeId,
        role,
        status: "ACTIVE",
      });

    // Rollback Auth User if profile creation fails
    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);

      return {
        error: profileError.message,
      };
    }

    // ==========================
    // REFRESH CACHE
    // ==========================

    triggerGlobalRevalidation();

    return {
      success: true,
      generatedId: autoEmployeeId,
    };
  } catch (error) {
    console.error(error);

    return {
      error: "System synchronization failed.",
    };
  }
}
/**
 * SERVER ACTION: UPDATE EXISTING FACULTY PROFILE DATA
 * Updates mutable tracking information across administrative panels[cite: 1]
 */
export async function handleUpdateFaculty(
  payload: EditFacultyPayload
) {
  const supabaseAdmin = getAdminClient();

  const email = payload.email.trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return {
      success: false,
      error: "Please enter a valid email address.",
    };
  }

  try {
    const { error: profileUpdateError } =
      await supabaseAdmin
        .from("profiles")
        .update({
          full_name: payload.full_name.trim(),
          email,
          department: payload.department.trim(),
          role: payload.role.toLowerCase(),
          status: payload.status,
        })
        .eq("id", payload.id);

    if (profileUpdateError) {
      return {
        success: false,
        error: profileUpdateError.message,
      };
    }

    await supabaseAdmin.auth.admin.updateUserById(
      payload.id,
      {
        email,
        user_metadata: {
          full_name: payload.full_name.trim(),
        },
      }
    );

    triggerGlobalRevalidation();

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      error: "Profile revision system failure.",
    };
  }
}

/**
 * SERVER ACTION: DELETE FACULTY PROFILE RECORDS & AUTHS
 * Completely purges profile data fields and cuts core workspace access credentials[cite: 1]
 */
export async function handleDeleteFaculty(profileId: string) {
  const supabaseAdmin = getAdminClient();

  try {
    // 1. Purge authorization credentials from Core Authentication Service
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(profileId);
    if (authDeleteError) return { success: false, error: authDeleteError.message };

    // 2. Delete data rows from tracking profiles table (Foreign key cleans up attendance/filings automatically)
    const { error: databaseDeleteError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", profileId);

    if (databaseDeleteError) return { success: false, error: databaseDeleteError.message };

    triggerGlobalRevalidation();
    return { success: true };
  } catch (err: any) {
    return { success: false, error: "Account execution breakdown failed." };
  }
}

/**
 * CONTEXTUAL SYNC CACHE CLEANER
 */
function triggerGlobalRevalidation() {
  revalidatePath("/admin/dashboard");   // Re-measures "Total Staff" tiles counters
  revalidatePath("/admin/employees");   // Syncs the Faculty Directory interactive records view
  revalidatePath("/admin/clock");       // Syncs Live Duty Matrix indicators
}