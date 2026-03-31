// portefolio/app/api/contact/route.ts

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"
import { buildContactEmail } from "@/lib/emails/contact-notification"

const resend = new Resend(process.env.RESEND_API_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, contact, subject, message } = body

    if (!name || !contact || !message) {
      return NextResponse.json({ error: "Campos obrigatórios em falta." }, { status: 400 })
    }

    // 1. Save to Supabase
    const { error: dbError } = await supabase
      .from("contact_messages")
      .insert([{ name, contact, subject, message }])

    if (dbError) {
      // Log but don't block — still try to send the email
      console.error("[contact] Supabase error:", dbError.message)
    }

    // 2. Get recipient email from profile
    const { data: profile } = await supabase
      .from("profile")
      .select("email")
      .single()

    if (!profile?.email) {
      console.error("[contact] No email found in profile table")
      return NextResponse.json({ success: true })
    }

    // 3. Send notification email
    const { error: emailError } = await resend.emails.send({
      from: "Portfolio <noreply@joaosousa.space>",
      to: profile.email,
      subject: `📬 Novo contacto de ${name}${subject ? ` — ${subject}` : ""}`,
      html: buildContactEmail({
        senderName: name,
        senderContact: contact,
        subject: subject || "Sem assunto",
        message,
      }),
    })

    if (emailError) {
      console.error("[contact] Resend error:", emailError.message)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[contact] Unexpected error:", err)
    return NextResponse.json({ error: "Erro interno." }, { status: 500 })
  }
}
