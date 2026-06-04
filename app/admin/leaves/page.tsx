import React from "react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers"; // Added to read our custom session
import { AdminLeavesView } from "@/app/components/AdminLeavesView";

export default async function AdminLeavesPage() {
  const supabase = await createClient();
  const cookieStore = await cookies();

  // 1. Session Isolation: Authenticate via our secure cookie parameters
  const mockSession = cookieStore.get("mock_user_session");
  
  if (!mockSession) {
    redirect("/login");
  }

  const sessionData = JSON.parse(mockSession.value);

  // 2. Security Gate: Ensure ONLY users with the 'admin' role can access this page
  // This prevents staff from manually typing /admin/leaves in the URL
  if (sessionData.role !== "admin") {
    redirect("/staff/dashboard");
  }

  // 3. Fetch leave logs joined explicitly on the employee foreign key constraint map
  // We use the 'leaves_employee_id_fkey' to pull the staff's name and department for the admin to see
  const { data: leaves } = await supabase
    .from("leaves")
    .select(`
      *,
      profiles!leaves_employee_id_fkey (
        full_name,
        employee_id,
        department
      )
    `)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-2xl font-black text-[#2D2D2D] tracking-tight">Leave Management Desk</h1>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">
          Review history logs and manage staff vacancy applications
        </p>
      </div>
      
      {/* Passing the sanitized data to the view. 
          Using sessionData.id ensures the component knows which admin is making approvals.
      */}
      <AdminLeavesView 
        leavesData={leaves || []} 
        adminUserId={sessionData.id} 
      />
    </div>
  );
}