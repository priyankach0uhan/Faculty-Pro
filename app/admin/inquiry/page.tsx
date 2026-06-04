import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers"; // Added to access session cookies
import { AdminChatDashboard } from "./AdminChatDashboard";

export default async function AdminInquiryPage() {
  const supabase = await createClient();
  const cookieStore = await cookies();

  let activeUserId = null;

  // 1. Session Isolation: Authenticate via our secure cookie parameters 
  const mockSession = cookieStore.get("mock_user_session");
  if (mockSession) {
    const sessionData = JSON.parse(mockSession.value);
    
    // Security Gate: Ensure ONLY users with the 'admin' role can access this terminal 
    if (sessionData.role !== "admin") {
      redirect("/staff/dashboard");
    }
    
    activeUserId = sessionData.id; // Extracts the unique row UUID for the Admin 
  } else {
    // Fallback context check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!authError && user) activeUserId = user.id;
  }

  // Security Wall: Force bounce unauthenticated targets back to login 
  if (!activeUserId) redirect("/login");

  // 2. Fetch ALL profiles EXCEPT the logged-in admin for the chat list 
  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("id, full_name, employee_id, role, department")
    .neq("id", activeUserId) // ✅ Removes only the current Admin from the list 
    .order("full_name", { ascending: true });

  return (
    <div className="w-full">
      {/* 🔒 DATA ISOLATION: 
          Passing the active session's exact profile UUID (activeUserId) 
          to identify the sender in the live chat engine. 
      */}
      <AdminChatDashboard 
        profiles={allProfiles || []} 
        currentUserId={activeUserId} 
      />
    </div>
  );
}
