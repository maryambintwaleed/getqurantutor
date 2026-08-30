/**
 * Transactional email via Resend's HTTP API — no SDK, so nothing to install or
 * keep up to date.
 *
 * Without RESEND_API_KEY nothing is sent and the message is logged instead, so
 * the app runs identically in development and never fails a family's request
 * just because email is not configured yet.
 */

const API = "https://api.resend.com/emails";

function config() {
  return {
    key: process.env.RESEND_API_KEY,
    // Resend's shared sender works before your domain is verified.
    from: process.env.EMAIL_FROM ?? "GetQuranTutor <onboarding@resend.dev>",
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://getqurantutor.com",
  };
}

export function siteUrl() {
  return config().siteUrl.replace(/\/$/, "");
}

type Mail = { to: string; subject: string; heading: string; body: string[]; cta?: { label: string; href: string } };

export async function sendEmail({ to, subject, heading, body, cta }: Mail) {
  const { key, from } = config();
  if (!to || !to.includes("@")) return { skipped: "no recipient" };

  if (!key) {
    console.log(`[email skipped — no RESEND_API_KEY] to=${to} subject="${subject}"`);
    return { skipped: "not configured" };
  }

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, html: renderEmail(heading, body, cta), text: [heading, ...body, cta?.href].filter(Boolean).join("\n\n") }),
    });
    if (!res.ok) {
      console.error(`[email failed] ${res.status} ${await res.text()}`);
      return { error: res.status };
    }
    return { sent: true };
  } catch (err) {
    // Never let a mail problem break the action the user actually performed.
    console.error("[email failed]", err);
    return { error: "exception" };
  }
}

export function renderEmail(heading: string, body: string[], cta?: { label: string; href: string }) {
  const paragraphs = body
    .map((p) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#334155;">${p}</p>`)
    .join("");
  const button = cta
    ? `<a href="${cta.href}" style="display:inline-block;margin-top:8px;background:#047857;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:600;font-size:15px;">${cta.label}</a>`
    : "";
  return `<!doctype html><html><body style="margin:0;background:#f8fafc;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border-radius:14px;padding:32px;" cellpadding="0" cellspacing="0">
      <tr><td>
        <p style="margin:0 0 20px;font-size:18px;font-weight:700;color:#047857;">GetQuranTutor</p>
        <h1 style="margin:0 0 16px;font-size:21px;line-height:1.3;color:#0f172a;">${heading}</h1>
        ${paragraphs}
        ${button}
      </td></tr>
    </table>
    <p style="margin:20px 0 0;font-size:12px;color:#94a3b8;">GetQuranTutor · ${siteUrl().replace(/^https?:\/\//, "")}</p>
  </td></tr></table>
</body></html>`;
}
