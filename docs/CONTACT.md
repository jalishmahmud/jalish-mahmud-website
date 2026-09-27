# Contact system

## Architecture and UI

Next.js 16.3.2 App Router, JavaScript, CSS Modules, existing Manrope/theme/buttons and React Icons. Existing Zod supplies shared validation. No new design/form/toast/animation library. `data/hero.json` remains the public email/phone/location/availability source; site-config and utils/links supply identity/socials.

`/contact` combines contact cards and reusable `ContactForm`. Business: company/project type/optional USD budget/timeline. Hiring: company/position/employment type. Collaboration: organization/type. Personal: optional subject. Other: required subject in both forms. Common name/email/message survive type changes; irrelevant extras are stripped before sending. All other extra fields are optional.

FloatingContact lives in the shared public Footer, never admin. It lazy-loads the same complete form, including every inquiry-specific field and the same required-field rules as /contact. The floating layout uses one column and a shorter message textarea within the scrollable panel. Native dialog and explicit Tab wrapping provide focus containment and Escape; the implementation restores focus, locks background scrolling and offers an accessible close button. Mobile uses a scrollable bottom sheet, dynamic viewport height and safe-area padding. A link opens `/contact`; unsent form values are not transferred or persisted. Footer padding protects footer links from the floating button.

## Server and email

POST `/api/contact` → same-origin check → JSON + 64 KiB streamed body limit → shared validation/honeypot → Nodemailer → fixed inbox. Node.js runtime; `server-only` prevents client imports. No MongoDB use or contact-message storage. No autoresponder to unverified visitor emails.

SMTP environment validation is lazy: CI does not need mail secrets. Fixed `CONTACT_FROM_EMAIL`/`CONTACT_FROM_NAME` sender, fixed `CONTACT_TO_EMAIL` recipient, visitor in `replyTo`. Use an authenticated or provider-verified sender. Subjects identify inquiry type/name. Email has escaped HTML, plain text, inquiry-specific fields, full/quick source and UTC submission time. No visitor IP/device fingerprint is added. SMTP acceptance triggers success; it cannot guarantee inbox delivery.

## Environment and provider setup

Configure privately in EC2's existing `.env` or `.env.local`:

```env
SMTP_HOST=
SMTP_PORT=
SMTP_SECURE=
SMTP_USER=
SMTP_PASS=
CONTACT_FROM_EMAIL=
CONTACT_FROM_NAME=
CONTACT_TO_EMAIL=
NEXT_PUBLIC_SITE_URL=
```

Only the canonical site URL uses NEXT_PUBLIC. Never commit secrets or put SMTP settings in browser code. `.env.example` has blank SMTP values. Port 465 uses secure=true (immediate TLS); 587 uses secure=false with mandatory STARTTLS. Certificate verification remains on. Provider login/password, permitted sender and destination inbox are configurable; CONTACT_FROM_NAME may be “Portfolio Contact”. Configure SPF/DKIM/DMARC according to your provider. Change provider by editing variables and restarting; no frontend changes.

### Optional Gmail setup

Host `smtp.gmail.com`, port `465`, secure `true`, SMTP_USER your Gmail address and CONTACT_FROM_EMAIL the same or an authorized alias. Enable Google 2-Step Verification, create an App Password where supported and use it for SMTP_PASS, **not your normal Google password**. Some managed/Advanced Protection accounts do not support App Passwords; use another approved SMTP provider or a separately implemented OAuth flow. CONTACT_TO_EMAIL is your desired inbox.

[Google App Password guide](https://support.google.com/accounts/answer/185833), [Nodemailer SMTP guide](https://nodemailer.com/smtp).

## Validation and spam

Name 2–100 characters; email up to 254 with syntax validation; message 10–10,000; single-line extras up to 160. Header controls rejected, HTML escaped, choices allowlisted, unknown/irrelevant fields stripped. Empty honeypot required. Both client/server validate. JSON and exact Origin are required. These deter basic abuse; Origin is not bot authentication.

**Rate limiting requires a deployment step.** Merge `deploy/nginx/contact-rate-limit.conf.example` into existing nginx settings, run `sudo nginx -t`, then reload nginx. It supplies 3 requests/minute per IP plus a small burst and 429 responses, body size/time limits, and shared state across workers/PM2 processes. Keep Node port private against bypass. For a CDN, use only trusted real-IP configuration. For multiple servers, use shared edge limiting or a shared datastore.

No broken process-local limiter was added. Until nginx configuration is applied, application validation/honeypot/origin protections exist, but **rate limiting is not active**. This workspace cannot change your deployed nginx configuration. No CAPTCHA or visitor database.

## EC2 / PM2

Current deployment excludes `.env*`, preserving server credentials. CI needs the public domain only; no SMTP secrets should be in this workflow. `npm ci`, build and PM2 restart/reload after deployment. SMTP changes require process restart because settings are cached per process. If PM2 supplies environment variables, update its source and use `--update-env`; stale PM2 variables can override `.env`. Rebuild for NEXT_PUBLIC_SITE_URL changes. Allow outbound 465/587 to your provider; avoid EC2 port 25. Restrict `.env` file access to the deployment/app account.

Logs contain an allowlisted error code/time and invalid config field names only; no credentials, raw SMTP responses or visitor messages. Connection/greeting/DNS/socket timeouts are bounded. TLS certificate checks are never disabled.

## Testing

```sh
# No real mail or network required:
node --conditions=react-server --test tests/contact.test.mjs
npm run lint
NEXT_PUBLIC_SITE_URL=https://your-production-domain.example npm run build
# After private SMTP setup, checks connection/auth only, sends no email:
node --env-file=.env --conditions=react-server scripts/verify-contact-smtp.mjs
```

Tests generate MIME with Nodemailer's stream transport, check HTML/text/replyTo and mock the sending boundary for API success/failure/validation tests. After setup send **one** clearly labeled test from `/contact`, check inbox/spam and Reply destination. Verify does not prove final sender/recipient acceptance. Do not automate repeated real inbox submissions.

Browser checklist: each inquiry type; common fields survive switches; required/invalid fields; disabled submit/loading and duplicate clicks; success reset; failure/429 preserves input; public widget/admin absence; Escape/focus containment/restoration; full-form link; 320/375/768/1024/1440 layouts. Test the soft keyboard on a real phone; desktop viewport emulation is not a full phone keyboard test.

## Troubleshooting

400: fields/honeypot. 403: browser Origin does not match canonical domain. 413: body too large. 429: wait before retrying. 503: review CONTACT_CONFIG, EAUTH, ETLS, EDNS, ECONNECTION or ETIMEDOUT in server logs. Check variables, provider permission, firewall and port/TLS pairing. Never disable TLS to solve certificate failures. Success without inbox mail: check spam and provider delivery logs/SPF/DKIM. No automatic retry prevents accidental duplicates after uncertain delivery.

## SEO and privacy

Contact has shared indexable metadata, canonical/OG/X and default OG image, sitemap and smoke-check coverage. Header/hero contact buttons and footer link to `/contact`. The existing Person identity stays consistent; no extra private information is exposed. Privacy notice now explains form data, SMTP, no database storage, source/time and spam checks; verify provider/log retention against actual production practices.

## Implementation verification (2026-09-27)

Six contact tests passed without real mail delivery. Chrome verified all inquiry types, validation, common-field preservation, mocked send success/failure, loading/reset, quick Other subject validation, keyboard containment/Escape/focus restoration, admin exclusion, and widths 320/375/768/1024/1440. Lint and production build passed. Real SMTP delivery and a physical mobile keyboard remain deployment checks.
