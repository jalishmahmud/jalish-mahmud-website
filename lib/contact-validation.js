import { z } from "zod";
export const inquiryTypes = [["business", "Business / Project"], ["hiring", "Job / Hiring"], ["collaboration", "Collaboration"], ["personal", "Personal"], ["other", "Other"]];
export const inquiryFields = {
  business: [
    { name: "company", label: "Company / Organization", autoComplete: "organization" },
    { name: "projectType", label: "Project type", options: ["Website development", "Frontend development", "Next.js development", "React development", "Consultation", "Other"] },
    { name: "budget", label: "Budget range", options: ["Under USD 1,000", "USD 1,000–5,000", "USD 5,000–10,000", "USD 10,000+", "Let’s discuss"] },
    { name: "timeline", label: "Expected timeline" },
  ],
  hiring: [{ name: "company", label: "Company", autoComplete: "organization" }, { name: "position", label: "Position / Opportunity" }, { name: "employmentType", label: "Employment type", options: ["Full-time", "Part-time", "Contract", "Freelance", "Other"] }],
  collaboration: [{ name: "company", label: "Organization / Project", autoComplete: "organization" }, { name: "collaborationType", label: "Collaboration type", options: ["Open-source project", "Technical writing", "Community / Event", "Product collaboration", "Other"] }],
  personal: [{ name: "subject", label: "Subject" }], other: [{ name: "subject", label: "Subject", required: true }],
};
const line = (max) => z.string().trim().max(max, `Use ${max} characters or fewer.`).refine((v) => !/[\r\n\u0000-\u001f\u007f]/.test(v), "Use a single line of text.");
const optionalLine = line(160).optional().default("");
const choice = (type, name) => z.enum(["", ...inquiryFields[type].find((f) => f.name === name).options]).optional().default("");
export const contactSchema = z.object({
  source: z.enum(["full", "quick"]), inquiryType: z.enum(inquiryTypes.map(([value]) => value)),
  name: line(100).min(2, "Please enter at least 2 characters."), email: line(254).email("Enter a valid email address."),
  message: z.string().trim().min(10, "Please include at least 10 characters.").max(10000, "Use 10,000 characters or fewer.").refine((v) => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(v), "Remove unsupported control characters."),
  website: z.string().max(200).optional().default(""), company: optionalLine, position: optionalLine, timeline: optionalLine, subject: optionalLine,
  projectType: choice("business", "projectType"), budget: choice("business", "budget"), employmentType: choice("hiring", "employmentType"), collaborationType: choice("collaboration", "collaborationType"),
}).superRefine((data, ctx) => {
  if (data.website) ctx.addIssue({ code: "custom", path: ["website"], message: "Unable to submit this form." });
  if (data.source === "full" && data.inquiryType === "other" && !data.subject) ctx.addIssue({ code: "custom", path: ["subject"], message: "Please add a subject." });
}).transform((data) => ({ source: data.source, inquiryType: data.inquiryType, name: data.name, email: data.email, message: data.message, website: data.website, ...Object.fromEntries((data.source === "full" ? inquiryFields[data.inquiryType] : []).map(({ name }) => [name, data[name]])) }));
export function contactErrors(error) { return Object.fromEntries(error.issues.map((issue) => [issue.path[0], issue.message])); }
