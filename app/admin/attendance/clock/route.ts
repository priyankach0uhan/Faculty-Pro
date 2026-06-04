import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  // 1. Check Session Authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  // 2. Parse Action Body Form Data
  const formData = await request.formData();
  const actionType = formData.get("action") as string;
  const currentDate = new Date().toISOString().split("T")[0];

  if (actionType === "in") {
    // Determine status relative to system clock baseline rules
    const currentHour = new Date().getHours();
    const resolvedStatus = currentHour >= 9 ? "Late" : "Present";

    const { error } = await supabase.from("attendance").insert({
      employee_id: user.id,
      status: resolvedStatus,
      work_date: currentDate,
      check_in: new Date().toISOString(),
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  } else if (actionType === "out") {
    const { error } = await supabase
      .from("attendance")
      .update({
        check_out: new Date().toISOString(),
      })
      .eq("employee_id", user.id)
      .eq("work_date", currentDate);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // 3. Redirect back to staff workspace smoothly
  const requestUrl = new URL(request.url);
  return NextResponse.redirect(`${requestUrl.origin}/staff/dashboard`, 303);
}