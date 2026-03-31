// portefolio/app/api/cron/keepalive/route.ts
// Called by Vercel Cron at 00:01 every day.
// Loops through all active bots and fires a SELECT against each target Supabase project.

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  // Optional: protect with a secret so only Vercel can call this
  const authHeader = request.headers.get("authorization")
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Fetch all active bots
  const { data: bots, error } = await supabase
    .from("keepalive_bots")
    .select("*")
    .eq("is_active", true)

  if (error) {
    console.error("[keepalive] Failed to fetch bots:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const results: { id: string; name: string; status: string; error?: string }[] = []

  for (const bot of bots ?? []) {
    try {
      // Create a one-off client for the target Supabase project
      const targetClient = createClient(bot.project_url, bot.anon_key)

      const { error: queryError } = await targetClient
        .from(bot.table_name)
        .select(bot.column_name)
        .limit(1)

      if (queryError) throw new Error(queryError.message)

      // Update last_run_at and last_status to success
      await supabase
        .from("keepalive_bots")
        .update({
          last_run_at: new Date().toISOString(),
          last_status: "success",
          last_error: null,
        })
        .eq("id", bot.id)

      results.push({ id: bot.id, name: bot.name, status: "success" })
    } catch (err: any) {
      const msg = err?.message ?? "Unknown error"

      await supabase
        .from("keepalive_bots")
        .update({
          last_run_at: new Date().toISOString(),
          last_status: "error",
          last_error: msg,
        })
        .eq("id", bot.id)

      results.push({ id: bot.id, name: bot.name, status: "error", error: msg })
      console.error(`[keepalive] Bot "${bot.name}" failed:`, msg)
    }
  }

  console.log("[keepalive] Run complete:", results)
  return NextResponse.json({ ran: results.length, results })
}
