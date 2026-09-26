import header from "@/data/header.json";
import { links } from "@/utils/links";

export const siteConfig = {
  name: header.logo,
  fullName: header.logo,

  jobTitle: "Full Stack Software Engineer",

  title: `${header.logo} | Full Stack Software Engineer | Web, APIs & AI Integrations`,

  description: `${header.logo} is a Full Stack Software Engineer with 6+ years of experience building scalable web applications, robust APIs, backend systems, and AI-powered integrations that solve real-world business problems.`,

  locale: "en_US",

  social: links,

  defaultImage: "/api/og/default",
};
