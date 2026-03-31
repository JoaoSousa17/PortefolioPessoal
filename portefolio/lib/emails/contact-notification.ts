// portefolio/lib/emails/contact-notification.ts

export function buildContactEmail({
  senderName,
  senderContact,
  subject,
  message,
}: {
  senderName: string
  senderContact: string
  subject: string
  message: string
}): string {
  return `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Novo Contacto</title>
</head>
<body style="margin:0;padding:0;background:#0f0f13;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f13;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Top accent bar -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,#dc2626,#ef4444,#f97316,#ef4444,#dc2626);border-radius:4px 4px 0 0;"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a24 0%,#16161f 50%,#1e1a2e 100%);padding:48px 48px 36px;border-left:1px solid rgba(255,255,255,0.06);border-right:1px solid rgba(255,255,255,0.06);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:48px;height:48px;background:linear-gradient(135deg,#dc2626,#b91c1c);border-radius:12px;text-align:center;vertical-align:middle;">
                          <span style="color:#fff;font-size:20px;font-weight:900;letter-spacing:-1px;">JS</span>
                        </td>
                        <td style="padding-left:14px;vertical-align:middle;">
                          <div style="color:#fff;font-size:17px;font-weight:700;letter-spacing:-0.3px;">João Sousa</div>
                          <div style="color:rgba(255,255,255,0.35);font-size:12px;margin-top:2px;letter-spacing:0.5px;text-transform:uppercase;">Portfolio</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <span style="background:rgba(220,38,38,0.15);border:1px solid rgba(220,38,38,0.3);color:#f87171;font-size:11px;font-weight:600;padding:5px 12px;border-radius:20px;letter-spacing:0.5px;text-transform:uppercase;">Nova Mensagem</span>
                  </td>
                </tr>
              </table>
              <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent);margin:32px 0;"></div>
              <h1 style="margin:0;color:#fff;font-size:28px;font-weight:800;letter-spacing:-0.8px;line-height:1.2;">
                Recebeste um novo<br/>
                <span style="color:#f87171;">contacto!</span>
              </h1>
              <p style="margin:12px 0 0;color:rgba(255,255,255,0.45);font-size:14px;line-height:1.6;">
                Alguém preencheu o formulário de contacto do teu portfólio.
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#13131a;padding:0 48px 40px;border-left:1px solid rgba(255,255,255,0.06);border-right:1px solid rgba(255,255,255,0.06);">

              <!-- Sender info card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
                <tr>
                  <td style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:24px;">
                    <div style="color:rgba(255,255,255,0.35);font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:20px;">Remetente</div>

                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
                      <tr>
                        <td style="width:32px;height:32px;background:rgba(220,38,38,0.1);border:1px solid rgba(220,38,38,0.2);border-radius:8px;text-align:center;vertical-align:middle;">
                          <span style="color:#f87171;font-size:15px;">👤</span>
                        </td>
                        <td style="padding-left:12px;vertical-align:middle;">
                          <div style="color:rgba(255,255,255,0.4);font-size:11px;margin-bottom:2px;text-transform:uppercase;letter-spacing:0.5px;">Nome</div>
                          <div style="color:#fff;font-size:15px;font-weight:600;">${senderName}</div>
                        </td>
                      </tr>
                    </table>

                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
                      <tr>
                        <td style="width:32px;height:32px;background:rgba(220,38,38,0.1);border:1px solid rgba(220,38,38,0.2);border-radius:8px;text-align:center;vertical-align:middle;">
                          <span style="color:#f87171;font-size:15px;">✉️</span>
                        </td>
                        <td style="padding-left:12px;vertical-align:middle;">
                          <div style="color:rgba(255,255,255,0.4);font-size:11px;margin-bottom:2px;text-transform:uppercase;letter-spacing:0.5px;">Contacto</div>
                          <div style="color:#f87171;font-size:15px;font-weight:600;">${senderContact}</div>
                        </td>
                      </tr>
                    </table>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:32px;height:32px;background:rgba(220,38,38,0.1);border:1px solid rgba(220,38,38,0.2);border-radius:8px;text-align:center;vertical-align:middle;">
                          <span style="color:#f87171;font-size:15px;">🏷️</span>
                        </td>
                        <td style="padding-left:12px;vertical-align:middle;">
                          <div style="color:rgba(255,255,255,0.4);font-size:11px;margin-bottom:2px;text-transform:uppercase;letter-spacing:0.5px;">Assunto</div>
                          <div style="color:#fff;font-size:15px;font-weight:600;">${subject}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Message -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
                <tr>
                  <td style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.07);border-left:3px solid #dc2626;border-radius:0 16px 16px 0;padding:28px;">
                    <div style="color:rgba(255,255,255,0.35);font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:16px;">Mensagem</div>
                    <div style="color:rgba(255,255,255,0.85);font-size:15px;line-height:1.8;white-space:pre-wrap;">${message}</div>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
                <tr>
                  <td align="center">
                    <a href="mailto:${senderContact}?subject=Re: ${subject}" style="display:inline-block;background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff;font-size:14px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:12px;letter-spacing:0.3px;">
                      Responder a ${senderName} →
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0f0f13;border:1px solid rgba(255,255,255,0.06);border-top:1px solid rgba(255,255,255,0.04);border-radius:0 0 16px 16px;padding:24px 48px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="color:rgba(255,255,255,0.2);font-size:12px;line-height:1.6;">
                      Email enviado automaticamente pelo teu portfólio.<br/>
                      <span style="color:rgba(255,255,255,0.12);">joaosousa.dev</span>
                    </div>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <div style="width:32px;height:32px;background:linear-gradient(135deg,#dc2626,#b91c1c);border-radius:8px;text-align:center;line-height:32px;display:inline-block;">
                      <span style="color:#fff;font-size:13px;font-weight:900;">JS</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Bottom accent bar -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,#dc2626,#ef4444,#f97316,#ef4444,#dc2626);border-radius:0 0 4px 4px;"></td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}