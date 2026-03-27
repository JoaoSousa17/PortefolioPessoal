import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Uses the service role key so it bypasses RLS.
// This route is only called from the admin dashboard which is behind
// a localStorage auth check — it is NOT exposed to public users.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { field, value } = body as {
      field: "under_construction" | "under_maintenance"
      value: boolean
    }

    if (!["under_construction", "under_maintenance"].includes(field)) {
      return NextResponse.json({ error: "Invalid field" }, { status: 400 })
    }

    // Fetch the single row id first
    const { data: row, error: fetchErr } = await supabaseAdmin
      .from("site_status")
      .select("id")
      .limit(1)
      .single()

    if (fetchErr || !row) {
      return NextResponse.json({ error: "Row not found" }, { status: 404 })
    }

    // Build patch — the two flags are mutually exclusive
    const patch: Record<string, boolean> = { [field]: value }
    if (value) {
      const other =
        field === "under_construction" ? "under_maintenance" : "under_construction"
      patch[other] = false
    }

    const { data, error: updateErr } = await supabaseAdmin
      .from("site_status")
      .update(patch)
      .eq("id", row.id)
      .select()
      .single()

    if (updateErr) {
      console.error("site_status update error:", updateErr)
      return NextResponse.json({ error: updateErr.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error("site_status route error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}