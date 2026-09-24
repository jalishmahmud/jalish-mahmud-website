import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import profile from "@/data/hero.json";

export const metadata = buildPageMetadata({
  title: "Terms and Conditions",
  description: `Information about using ${siteConfig.fullName}'s portfolio and blog, including technical examples, content ownership and external links.`,
  path: "/terms-and-conditions",
});

export default function TermsAndConditions() {
  return <>
    <h1>Terms and Conditions</h1>
    <p>Last updated: <time dateTime="2026-09-24">September 24, 2026</time></p>
    <p>This website is {siteConfig.fullName}’s personal portfolio and software-engineering blog. These terms explain the intended use of its content. Questions can be sent to <a href={`mailto:${profile.email}`}>{profile.email}</a>.</p>

    <h2>Articles and technical examples</h2>
    <p>Articles share personal experience and general educational information. Software, APIs and recommended approaches can change, so an older article may not describe the latest version. Check the relevant official documentation and test examples in an appropriate environment before using them in production.</p>
    <p>Content is provided without a promise that it is complete, error-free or suitable for a particular project. Nothing on the site creates a consulting, employment or client relationship. Any professional engagement requires a separate agreement.</p>

    <h2>Content ownership and reuse</h2>
    <p>Original articles and portfolio text belong to their respective copyright holders. Project names, company logos, photographs, quotations and other third-party material remain subject to their owners’ rights.</p>
    <p>You may link to articles. For code or projects with a stated licence, follow that licence. Where no licence is provided, contact me before republishing substantial content or distributing it as your own product. These terms do not restrict uses permitted by applicable law.</p>

    <h2>Responsible use</h2>
    <p>Please do not use this site to distribute malicious content, interfere with its availability or attempt unauthorised access to its administration features. If you notice an error or security concern, report it by email.</p>

    <h2>External websites</h2>
    <p>Links to projects, repositories and social platforms are provided for context. Their content, availability and policies are controlled by their operators. A portfolio reference describes work or experience; it does not imply ownership of a client’s product or endorsement of everything on an external website.</p>

    <h2>Availability and updates</h2>
    <p>The website and its content may change or be temporarily unavailable. Nothing in these terms excludes rights or responsibilities that cannot lawfully be excluded. Updates to these terms will appear here with a revised date.</p>
    <p>For information about personal data, read the <Link href="/privacy-policy">Privacy Policy</Link>.</p>
  </>;
}
