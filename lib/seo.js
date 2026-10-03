import { siteConfig } from "./site-config";
import { cleanText, siteUrl } from "./utils";

export function buildPageMetadata({ title, description, path, image = siteConfig.defaultImage, ogTitle = title, ogDescription = description, imageAlt = ogTitle, article }) {
  const url = siteUrl(path);
  const imageUrl = new URL(image, siteUrl()).href;
  return {
    title,
    description: cleanText(description),
    alternates: { canonical: url },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
    openGraph: {
      title: ogTitle, description: cleanText(ogDescription), url,
      siteName: siteConfig.name, locale: siteConfig.locale,
      type: article ? "article" : "website",
      images: [{ url: imageUrl, alt: imageAlt }],
      ...(article || {}),
    },
    twitter: { card: "summary_large_image", title: ogTitle, description: cleanText(ogDescription), images: [{ url: imageUrl, alt: imageAlt }] },
  };
}

export function isoDate(value) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

// Prevent user-authored text from terminating the JSON-LD script element.
export function serializeJsonLd(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function breadcrumbData(items) {
  return {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...items].map((item, index) => ({
      "@type": "ListItem", position: index + 1, name: item.name, item: siteUrl(item.path),
    })),
  };
}

export function authorData() {
  return { "@type": "Person", "@id": siteUrl("/#person"), name: siteConfig.fullName, url: siteUrl("/") };
}

export function homeStructuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      { ...authorData(), jobTitle: siteConfig.jobTitle, sameAs: Object.values(siteConfig.social), knowsAbout: siteConfig.expertise, address: { "@type": "PostalAddress", ...siteConfig.address } },
      { "@type": "ProfilePage", "@id": siteUrl("/#profile"), url: siteUrl("/"), name: siteConfig.title, mainEntity: { "@id": siteUrl("/#person") } },
      { "@type": "WebSite", "@id": siteUrl("/#website"), url: siteUrl("/"), name: siteConfig.name, alternateName: [...siteConfig.alternateNames, new URL(siteUrl()).hostname], publisher: { "@id": siteUrl("/#person") } },
    ],
  };
}
