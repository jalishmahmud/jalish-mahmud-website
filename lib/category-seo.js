import { siteConfig } from "./site-config";

// Introductions describe the category topic; they never create categories or routes.
const topics = {
  react: "React components, hooks, state management and building interactive applications.",
  "react-js": "React components, hooks, state management and building interactive applications.",
  "next-js": "Next.js application development, rendering, routing and deployment.",
  nextjs: "Next.js application development, rendering, routing and deployment.",
  aws: "AWS infrastructure and deploying and operating web applications in the cloud.",
  "system-design": "Software architecture, scalability and the trade-offs involved in designing reliable systems.",
  javascript: "JavaScript language features and practical patterns for web development.",
  typescript: "TypeScript types and maintainable application development.",
  devops: "Deployment workflows, automation and operating software in production.",
  "ci-cd": "Continuous integration, delivery pipelines and deployment automation.",
  git: "Version control, collaboration and everyday Git workflows.",
  engineering: "API integration, application architecture and practical software engineering decisions.",
  "ui-ux": "Translating interface designs into responsive, accessible web experiences.",
};

export function categorySeo(category) {
  const topic = topics[category.slug];
  return {
    title: `${category.name} Articles`,
    description: topic
      ? `${category.name} articles by ${siteConfig.fullName}. ${topic}`
      : `Explore ${category.name} articles by ${siteConfig.fullName}, with explanations and examples from software development.`,
  };
}
