import "server-only";

// Resend email via native fetch (no SDK dependency).
// Docs: https://resend.com/docs/api-reference/emails/send-email
// POST https://api.resend.com/emails
//   Authorization: Bearer <api-key>
//   Content-Type: application/json
//   body: { from, to, subject, text }

export async function sendResendEmail({
  apiKey,
  from,
  to,
  subject,
  text,
}: {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  text: string;
}): Promise<void> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, text }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`resend send failed: ${res.status} ${detail}`);
  }
}
