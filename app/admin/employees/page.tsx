import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import AddFacultyModal from "./AddFacultyModal";
import { FacultyTableManager } from "@/app/components/FacultyTableManager";

export default async function EmployeesPage() {
  const supabase = await createClient();
  const cookieStore = await cookies();

  // 1. Session Isolation: Authenticate via our secure cookie parameters
  const mockSession = cookieStore.get("mock_user_session");
  if (!mockSession) redirect("/login");

  const sessionData = JSON.parse(mockSession.value);

  // 2. Security Gate: Ensure ONLY users with the 'admin' role can access this page
  if (sessionData.role !== "admin") {
    redirect("/staff/dashboard");
  }

  // 3. Fetch employees excluding admins
  const { data: employees } = await supabase
    .from("profiles")
    .select("*")
    .neq('role', 'admin') 
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#2D2D2D] tracking-tight">Faculty Directory</h1>
          <p className="text-xs text-gray-400 font-medium">Manage and monitor all appointed educational staff.</p>
        </div>
        
        {/* MODAL COMPONENT REPLACES STATIC BUTTON */}
        <AddFacultyModal />
      </div>

      {/* 
        🔒 INTERACTIVE TABLE MANAGER LAYER:
        Injects the data into our clickable Client Component.
        This provides row selection event hooks for modifying records or running deletion targets. 
      */}
      <FacultyTableManager initialData={employees || []} />
    </div>
  );
}
