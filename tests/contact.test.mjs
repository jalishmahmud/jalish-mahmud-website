import test from "node:test";
import assert from "node:assert/strict";
import nodemailer from "nodemailer";
import { contactSchema } from "../lib/contact-validation.js";
import { buildContactEmail } from "../lib/contact-email.js";
import { getMailConfiguration } from "../lib/mailer.js";
import { handleContactRequest } from "../lib/contact-handler.js";
const valid = { source: "full", inquiryType: "business", name: "Test Visitor", email: "visitor@example.com", message: "A sufficiently detailed project inquiry.", website: "" };
const origin = "https://portfolio.example";
const request = (body, headers = {}) => new Request(origin + "/api/contact", { method: "POST", headers: { origin, "content-type": "application/json", ...headers }, body: typeof body === "string" ? body : JSON.stringify(body) });

test("all inquiry types; full Other requires subject; inactive fields are stripped", () => {
  for (const inquiryType of ["business", "hiring", "collaboration", "personal", "other"]) assert(contactSchema.safeParse({ ...valid, inquiryType, subject: "Question" }).success);
  assert(!contactSchema.safeParse({ ...valid, inquiryType: "other" }).success);
  assert(contactSchema.safeParse({ ...valid, source: "quick", inquiryType: "other" }).success);
  assert(!("company" in contactSchema.parse({ ...valid, inquiryType: "personal", company: "Old company" })));
});
test("validation rejects invalid values, header injection and honeypot", () => {
  for (const change of [{ name: "" }, { email: "not-email" }, { message: "short" }, { message: "x".repeat(10001) }, { name: "User\r\nBcc: another@example.com" }, { website: "bot.example" }, { inquiryType: "unknown" }]) assert(!contactSchema.safeParse({ ...valid, ...change }).success);
});
test("escaped HTML, plain text, fixed sender/recipient and visitor replyTo", async () => {
  const data = contactSchema.parse({ ...valid, name: "<Visitor>", message: '<script>alert("x")</script>\nA project question.' });
  const email = buildContactEmail(data, { fromName: "Portfolio", fromEmail: "sender@example.com", toEmail: "owner@example.com" });
  assert.equal(email.from.address, "sender@example.com"); assert.equal(email.to, "owner@example.com"); assert.equal(email.replyTo.address, valid.email);
  assert(!email.html.includes("<script>")); assert(email.html.includes("&lt;script&gt;")); assert(email.text.includes(data.message));
  const output = await nodemailer.createTransport({ streamTransport: true, buffer: true }).sendMail(email);
  const mime = output.message.toString();
  assert(mime.includes("Reply-To:")); assert(mime.includes(valid.email)); assert(mime.includes("multipart/alternative")); assert(mime.includes("text/plain")); assert(mime.includes("text/html"));
});
test("SMTP configuration rejects missing values and keeps TLS required", () => {
  assert.throws(() => getMailConfiguration({}), /configuration/);
  const env = { SMTP_HOST: "smtp.example.com", SMTP_PORT: "587", SMTP_SECURE: "false", SMTP_USER: "test", SMTP_PASS: "test-only-placeholder", CONTACT_FROM_EMAIL: "sender@example.com", CONTACT_FROM_NAME: "Portfolio", CONTACT_TO_EMAIL: "owner@example.com" };
  assert.equal(getMailConfiguration(env).transport.requireTLS, true);
  assert.throws(() => getMailConfiguration({ ...env, SMTP_PORT: "465" }));
  assert.equal(getMailConfiguration({ ...env, SMTP_PORT: "465", SMTP_SECURE: "true" }).transport.secure, true);
});
test("API checks origin, bounded body, validation and sends once", async () => {
  let sent = 0;
  const deps = { allowedOrigin: origin, sendMail: async () => { sent++; } };
  assert.equal((await handleContactRequest(request(valid, { origin: "https://evil.example" }), deps)).status, 403);
  assert.equal((await handleContactRequest(request(valid, { "content-type": "text/plain" }), deps)).status, 415);
  assert.equal((await handleContactRequest(request("{bad json"), deps)).status, 400);
  assert.equal((await handleContactRequest(request("x".repeat(65537)), deps)).status, 413);
  assert.equal((await handleContactRequest(request({ ...valid, website: "spam" }), deps)).status, 400);
  assert.equal(sent, 0); assert.equal((await handleContactRequest(request(valid), deps)).status, 200); assert.equal(sent, 1);
});
test("SMTP failure returns a friendly error without leaking credentials into logs", async () => {
  const previous = console.error; const logs = []; console.error = (...args) => logs.push(JSON.stringify(args));
  try {
    const response = await handleContactRequest(request(valid), { allowedOrigin: origin, sendMail: async () => { throw Object.assign(new Error("SECRET credential"), { code: "EAUTH" }); } });
    assert.equal(response.status, 503); assert(!(await response.text()).includes("SECRET")); assert(!logs.join("").includes("SECRET")); assert(logs.join("").includes("EAUTH"));
  } finally { console.error = previous; }
});
