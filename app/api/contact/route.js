import { handleContactRequest } from "@/lib/contact-handler";
import { sendContactMail } from "@/lib/mailer";
import { siteUrl } from "@/lib/utils";
export const runtime = "nodejs";
export async function POST(request) {
  const allowedOrigin = process.env.NODE_ENV === "production" ? new URL(siteUrl()).origin : new URL(request.url).origin;
  return handleContactRequest(request, { sendMail: sendContactMail, allowedOrigin });
}
