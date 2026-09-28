import header from "@/data/header.json";
import { links } from "@/utils/links";

export const siteConfig = {
  name: header.logo,
  fullName: header.logo,

  jobTitle: "Full Stack Software Engineer",

  title: `${header.logo} | Full Stack Engineer, Next.js & AWS`,

  description: `${header.logo} is a Full Stack Software Engineer building scalable Next.js apps, APIs and AI integrations, with AWS EC2 and GitHub Actions CI/CD experience.`,

  keywords: [
    "Full Stack Software Engineer",
    "Next.js developer",
    "React developer",
    "AWS EC2 deployment",
    "Nginx reverse proxy",
    "PM2 process management",
    "GitHub Actions CI/CD",
    "HTTPS and SSL",
    "REST API development",
    "FastAPI",
    ".NET",
    "AI API integration",
  ],

  locale: "en_US",

  social: links,

  defaultImage: "/api/og/default",
};
