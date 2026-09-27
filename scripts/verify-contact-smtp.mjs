import { verifyContactTransport, logContactFailure } from "../lib/mailer.js";
try {
  await verifyContactTransport();
  console.log("SMTP connection and authentication verified. No email was sent.");
} catch (error) { logContactFailure(error); process.exitCode = 1; }
