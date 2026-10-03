import profile from "@/data/hero.json";
import header from "@/data/header.json";
import { links } from "@/utils/links";

export const siteConfig = {
  name: header.logo,
  fullName: header.logo,

  jobTitle: "Full Stack Software Engineer",

  title: `${header.logo} | Full Stack Software Engineer, AWS & System Design`,

  description: `${header.logo} is a Full Stack Software Engineer based in ${profile.location}, building React and Next.js applications, APIs and AWS deployment workflows.`,

  alternateNames: ["Jalish"],
  location: profile.location,
  // Only the already-public city/country, never a private street address.
  address: { addressLocality: profile.location.split(",")[0].trim(), addressCountry: profile.location.split(",").slice(1).join(",").trim() },
  expertise: ["React", "Next.js", "JavaScript", "TypeScript", "Full Stack Development", "REST APIs", "AWS EC2", "CI/CD"],

  locale: "en_US",

  social: links,

  defaultImage: "/api/og/default",
};
