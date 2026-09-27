import { inquiryTypes, inquiryFields } from "./contact-validation.js";
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
export function buildContactEmail(data, config, submittedAt = new Date()) {
  const type = inquiryTypes.find(([value]) => value === data.inquiryType)[1];
  const rows = [["Inquiry type", type], ["Name", data.name], ["Email", data.email], ...(data.source === "full" ? inquiryFields[data.inquiryType].filter(({ name }) => data[name]).map(({ name, label }) => [label, data[name]]) : []), ["Submitted from", data.source === "full" ? "Portfolio contact page" : "Portfolio quick contact"], ["Submitted at (UTC)", submittedAt.toISOString()]];
  return {
    from: { name: config.fromName, address: config.fromEmail }, to: config.toEmail, replyTo: { name: data.name, address: data.email },
    subject: `[Portfolio] ${type} inquiry — ${data.name}`,
    text: `New Portfolio Inquiry\n\n${rows.map(([label, value]) => `${label}: ${value}`).join("\n")}\n\nMessage:\n${data.message}`,
    html: `<html><body style="margin:0;padding:24px;background:#f1f5f9;font-family:Arial,sans-serif;color:#0f172a"><div style="max-width:640px;margin:auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:28px"><h1 style="font-size:24px;color:#047857">New Portfolio Inquiry</h1><table role="presentation" style="width:100%;border-collapse:collapse">${rows.map(([label, value]) => `<tr><td style="padding:10px 12px 10px 0;vertical-align:top;font-weight:bold;border-bottom:1px solid #e2e8f0">${escapeHtml(label)}</td><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;overflow-wrap:anywhere">${escapeHtml(value)}</td></tr>`).join("")}</table><h2 style="font-size:18px;margin-top:28px">Message</h2><div style="line-height:1.7;overflow-wrap:anywhere">${escapeHtml(data.message).replace(/\n/g, "<br />")}</div><p style="margin-top:28px;color:#64748b;font-size:13px">Use Reply to respond directly to the sender.</p></div></body></html>`,
    disableFileAccess: true, disableUrlAccess: true,
  };
}
