import { Resend } from "resend";
import type { Submission } from "./db";
import { siteConfig } from "./config";
function getResend() {
  const key = process.env.EMAIL_PROVIDER_API_KEY;
  if (!key) throw new Error("EMAIL_PROVIDER_API_KEY is not set");
  return new Resend(key);
}
interface EmailPayload {
  submission: Omit<Submission, "id" | "created_at" | "ip_hash">;
}
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
export async function sendEnquiryEmail({ submission }: EmailPayload): Promise<void> {
  const resend = getResend();
  const to     = process.env.ENQUIRY_TO_EMAIL;
  const from   = process.env.ENQUIRY_FROM_EMAIL;
  if (!to || !from) throw new Error("Email env vars not set");
  const s = {
    full_name:   escapeHtml(submission.full_name),
    company:     escapeHtml(submission.company),
    phone:       escapeHtml(submission.phone),
    email:       escapeHtml(submission.email),
    location:    escapeHtml(submission.location),
    crew_type:   escapeHtml(submission.crew_type),
    event_dates: escapeHtml(submission.event_dates),
    message:     submission.message ? escapeHtml(submission.message) : null,
  };
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:20px;margin:0">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e0e0e0">
    <div style="background:#111;padding:24px 28px;border-bottom:3px solid #F5C400">
      <h1 style="color:#fff;margin:0;font-size:20px">New Enquiry — <span style="color:#F5C400">Vantor Crew</span></h1>
      <p style="color:#bbb;margin:6px 0 0;font-size:12px">${new Date().toLocaleString("en-GB", { timeZone: "Europe/London" })}</p>
    </div>
    <div style="padding:28px">
      <table style="width:100%;border-collapse:collapse">
        ${row("Name", s.full_name)}
        ${row("Company", s.company)}
        ${row("Phone", `<a href="tel:${s.phone}" style="color:#F5C400">${s.phone}</a>`)}
        ${row("Email", `<a href="mailto:${s.email}" style="color:#F5C400">${s.email}</a>`)}
        ${row("Location", s.location)}
        ${row("Crew Type", s.crew_type)}
        ${row("Event Dates", s.event_dates)}
        ${s.message ? row("Message", s.message) : ""}
      </table>
    </div>
    <div style="background:#f9f9f9;padding:20px 28px;border-top:1px solid #e0e0e0">
      <a href="tel:${s.phone}" style="display:inline-block;background:#F5C400;color:#111;padding:10px 20px;border-radius:5px;text-decoration:none;font-weight:700;font-size:13px;margin-right:8px">📞 Call Now</a>
      <a href="mailto:${s.email}?subject=Re: Crew Availability Enquiry" style="display:inline-block;background:#111;color:#fff;padding:10px 20px;border-radius:5px;text-decoration:none;font-weight:700;font-size:13px;margin-right:8px">✉️ Reply</a>
      <a href="https://wa.me/${submission.phone.replace(/[^0-9]/g,"")}" style="display:inline-block;background:#25D366;color:#fff;padding:10px 20px;border-radius:5px;text-decoration:none;font-weight:700;font-size:13px">💬 WhatsApp</a>
    </div>
    <div style="padding:14px 28px;border-top:1px solid #e0e0e0">
      <p style="margin:0;font-size:11px;color:#aaa">${siteConfig.url}</p>
    </div>
  </div>
</body></html>`;
  const text = `New Enquiry\nName: ${submission.full_name}\nCompany: ${submission.company}\nPhone: ${submission.phone}\nEmail: ${submission.email}\nLocation: ${submission.location}\nCrew Type: ${submission.crew_type}\nDates: ${submission.event_dates}\n${submission.message ? `Message: ${submission.message}` : ""}`.trim();
  await resend.emails.send({
    from, to,
    replyTo: submission.email,
    subject: `New Enquiry: ${submission.full_name} – ${submission.company} (${submission.location})`,
    html, text,
  });
}
function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:9px 12px;font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:.06em;width:120px;vertical-align:top;border-bottom:1px solid #f0f0f0">${label}</td>
    <td style="padding:9px 12px;font-size:14px;color:#111;border-bottom:1px solid #f0f0f0">${value}</td>
  </tr>`;
}
