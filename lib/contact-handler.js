import "server-only";
import { contactSchema, contactErrors } from "./contact-validation.js";
import { logContactFailure } from "./mailer.js";
const MAX_BYTES = 64 * 1024;
const response = (body, status) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
async function readBody(request) {
  if (Number(request.headers.get("content-length")) > MAX_BYTES) throw new RangeError();
  if (!request.body) throw new SyntaxError();
  const reader = request.body.getReader(); const chunks = []; let size = 0;
  try { while (true) { const { value, done } = await reader.read(); if (done) break; size += value.byteLength; if (size > MAX_BYTES) { await reader.cancel(); throw new RangeError(); } chunks.push(value); } }
  finally { reader.releaseLock(); }
  return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks)));
}
export async function handleContactRequest(request, { sendMail, allowedOrigin }) {
  if (request.headers.get("origin") !== allowedOrigin) return response({ error: "Please submit the form from this website." }, 403);
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") return response({ error: "Please submit the contact form." }, 415);
  let input;
  try { input = await readBody(request); } catch (error) { return response({ error: "Please check your message and try again." }, error instanceof RangeError ? 413 : 400); }
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return response({ error: "Please check the highlighted fields.", fields: contactErrors(parsed.error) }, 400);
  try { await sendMail(parsed.data); return response({ ok: true }, 200); }
  catch (error) { logContactFailure(error); return response({ error: "Unable to send your message right now. Please try again or contact me directly by email." }, 503); }
}
