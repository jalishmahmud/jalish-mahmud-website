import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import profile from "@/data/hero.json";

export const metadata = buildPageMetadata({
  title: "Privacy Policy",
  description: `How ${siteConfig.fullName}'s portfolio and blog handle contact information, cookies, hosting data and links to other services.`,
  path: "/privacy-policy",
});

export default function PrivacyPolicy() {
  return <>
    <h1>Privacy Policy</h1>
    <p>Last updated: <time dateTime="2026-09-24">September 24, 2026</time></p>
    <p>This notice describes information handled when you visit the personal portfolio and blog operated by {siteConfig.fullName}, based in {profile.location}. For privacy questions, email <a href={`mailto:${profile.email}`}>{profile.email}</a>.</p>

    <h2>Information you choose to share</h2>
    <p>The contact links open your email application. If you send a message, your email address, name if provided, message and attachments are handled through email to respond to your enquiry and any resulting professional correspondence. Please avoid sending sensitive information that is not needed for your enquiry.</p>
    <p>Reading articles does not require an account. The site currently has no public registration, comment form, newsletter signup or payment feature.</p>

    <h2>Technical information and hosting</h2>
    <p>Your browser sends technical information when requesting pages or images, such as an IP address, browser information and the requested URL. Hosting infrastructure may record this information with request times, response status and referrer information to deliver the site, diagnose errors and protect it from abuse.</p>
    <p>Hosting, email and any external content providers handle the information necessary to provide their services. Depending on the provider, processing may take place outside your country.</p>

    <h2>Cookies and browser storage</h2>
    <p>The website does not currently include analytics or advertising scripts. Its theme switch operates in memory and does not save your choice in a cookie or local storage.</p>
    <p>A cookie named <code>jalish_admin_session</code> is set when the site administrator signs in. It keeps that private workspace authenticated, lasts up to seven days and is cleared on sign-out. Visitors do not need this cookie to read the portfolio or blog.</p>

    <h2>Images, external links and sharing</h2>
    <p>Some images come from external providers, including Unsplash. Many are delivered through this website, while images loaded directly from another provider cause your browser to contact that provider. That provider may receive your IP address and request information and applies its own privacy practices.</p>
    <p>Project and social-profile links take you to other websites. Social-sharing buttons open the selected service when clicked; they do not embed a social feed. Those services handle the information you send under their own policies. The copy-link button writes the article URL to your clipboard when you click it.</p>

    <h2>Retention and your choices</h2>
    <p>Email correspondence may remain in the email account and its backups after a reply. Hosting logs follow the hosting configuration and provider retention practices; the application does not set a visitor-log retention period. Contact me to ask about information relating to you or to request its correction or deletion.</p>
    <p>Depending on the law applicable to you, you may have rights to access, correct or erase personal information, restrict or object to processing, or complain to a relevant data-protection authority. Requests are considered under the applicable law, and identity verification may be needed before information is disclosed or changed.</p>

    <h2>Changes and contact</h2>
    <p>This notice will be updated when the website’s information practices change. The date above identifies the latest revision. Questions can be sent to <a href={`mailto:${profile.email}`}>{profile.email}</a>.</p>
    <p>See also the <Link href="/terms-and-conditions">Terms and Conditions</Link>.</p>
  </>;
}
