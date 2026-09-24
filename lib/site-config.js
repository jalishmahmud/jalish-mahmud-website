import header from "@/data/header.json";
import { links } from "@/utils/links";

export const siteConfig = {
  name: header.logo,
  fullName: header.logo,
  jobTitle: "Full Stack Software Engineer",
  title: `${header.logo} | Software Engineer & Frontend Developer`,
  description: `${header.logo}, a full stack software engineer specializing in React.js, Next.js, JavaScript and TypeScript. Explore projects, experience and engineering articles.`,
  locale: "en_US",
  social: links,
  defaultImage: "/api/og/default",
};
