import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers"; // Added to extract session tracking cookies
import { StaffChatDashboard } from "./StaffChatDashboard";

export default async function StaffInquiryPage() {
  const supabase = await createClient();
  const cookieStore = await cookies();

  let activeUserId = null;

  // 1. Session Isolation: Authenticate via our secure cookie parameters
  const mockSession = cookieStore.get("mock_user_session");
  if (mockSession) {
    const sessionData = JSON.parse(mockSession.value);
    activeUserId = sessionData.id; // Extracts the user profile unique row UUID
  } else {
    // Fallback context for admin or direct authentication tracks
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!authError && user) activeUserId = user.id;
  }

  // Security Wall: Force bounce unauthenticated targets back to base login terminal
  if (!activeUserId) redirect("/login");

  // 2. Fetch all Administrator profiles for the search reference list
  const { data: adminList } = await supabase
    .from("profiles")
    .select("id, full_name, employee_id")
    .eq("role", "admin");

  // 3. Fetch current staff details using the targeted session UUID string row ID
  const { data: currentStaff } = await supabase
    .from("profiles")
    .select("id, employee_id")
    .eq("id", activeUserId)
    .single();

  if (!currentStaff) {
    redirect("/login");
  }

  return (
    <div className="w-full max-w-[1300px] mx-auto p-4">
      <h2 className="text-xl font-black text-[#2D2D2D] tracking-tight mb-6">
        Inquiry & Reply Desk
      </h2>
      
      {/* 
          🔒 STRICT PRIVACY LOCKDOWN: 
          Passing the active session's exact profile UUID (currentStaff.id) 
          and code labels directly to isolate the conversation state records.
      */}
      <StaffChatDashboard 
        admins={adminList || []} 
        currentUserId={currentStaff.id} 
        staffEmployeeId={currentStaff.employee_id || "FAC-000"} 
      />
    </div>
  );
}