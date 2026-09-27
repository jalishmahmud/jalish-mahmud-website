import "server-only";
import nodemailer from "nodemailer";
import { z } from "zod";
import { buildContactEmail } from "./contact-email.js";
const line = z.string().trim().min(1).max(254).regex(/^[^\r\n\u0000]+$/);
const schema = z.object({ SMTP_HOST: line, SMTP_PORT: z.coerce.number().int().min(1).max(65535), SMTP_SECURE: z.enum(["true", "false"]), SMTP_USER: line, SMTP_PASS: z.string().min(1), CONTACT_FROM_EMAIL: line.email(), CONTACT_FROM_NAME: line, CONTACT_TO_EMAIL: line.email() }).superRefine((env, ctx) => {
  if ((env.SMTP_PORT === 465 && env.SMTP_SECURE !== "true") || (env.SMTP_PORT === 587 && env.SMTP_SECURE !== "false")) ctx.addIssue({ code: "custom", path: ["SMTP_SECURE"], message: "Check port and TLS settings." });
});
export function getMailConfiguration(environment = process.env) {
  const result = schema.safeParse(environment);
  if (!result.success) throw Object.assign(new Error("Contact email configuration is missing or invalid."), { code: "CONTACT_CONFIG", fields: [...new Set(result.error.issues.map((issue) => issue.path[0]))] });
  const env = result.data;
  return { transport: { host: env.SMTP_HOST, port: env.SMTP_PORT, secure: env.SMTP_SECURE === "true", requireTLS: env.SMTP_SECURE === "false", auth: { user: env.SMTP_USER, pass: env.SMTP_PASS }, connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 20000, dnsTimeout: 10000, disableFileAccess: true, disableUrlAccess: true, logger: false, debug: false }, fromName: env.CONTACT_FROM_NAME, fromEmail: env.CONTACT_FROM_EMAIL, toEmail: env.CONTACT_TO_EMAIL };
}
let mailer;
function getMailer() {
  if (!mailer) { const config = getMailConfiguration(); mailer = { config, transport: nodemailer.createTransport(config.transport) }; }
  return mailer;
}
export async function sendContactMail(data) {
  const { config, transport } = getMailer();
  const result = await transport.sendMail(buildContactEmail(data, config));
  if (!result.accepted?.length || result.rejected?.length) throw Object.assign(new Error("Recipient was not accepted."), { code: "EENVELOPE" });
}
export async function verifyContactTransport() { return getMailer().transport.verify(); }
export function logContactFailure(error) {
  const allowed = ["CONTACT_CONFIG", "EAUTH", "ECONNECTION", "ETIMEDOUT", "ESOCKET", "EENVELOPE", "EMESSAGE", "EDNS", "ETLS"];
  const code = allowed.includes(error?.code) ? error.code : "MAIL_ERROR";
  console.error("Contact email failed", { code, timestamp: new Date().toISOString(), ...(code === "CONTACT_CONFIG" ? { fields: error.fields } : {}) });
}
