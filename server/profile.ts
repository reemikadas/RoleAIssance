import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  headline: z.string().trim().min(2).max(140),
  email: z.string().trim().email(),
  location: z.string().trim().min(2).max(120),
  workAuthorization: z.string().trim().min(2).max(120),
  targetRoles: z.array(z.string().trim().min(1).max(80)).max(12),
  skills: z.array(z.string().trim().min(1).max(80)).min(1).max(50),
  education: z.string().trim().max(10000),
  workExperience: z.string().trim().max(20000),
  projects: z.string().trim().max(15000),
  githubUrl: z.union([z.literal(""), z.string().trim().url().startsWith("https://github.com/")]),
  linkedinUrl: z.union([
    z.literal(""),
    z.string().trim().url().refine(
      (value) => new URL(value).hostname.endsWith("linkedin.com"),
      "Enter a valid LinkedIn URL",
    ),
  ]),
  portfolioUrl: z.union([z.literal(""), z.string().trim().url()]),
  remotePreference: z.enum(["Remote", "Hybrid", "On-site", "Flexible"]),
});

export type Profile = z.infer<typeof profileSchema>;

export const defaultProfile: Profile = {
  fullName: "Reemika Das",
  headline: "Product professional",
  email: "reemika@example.com",
  location: "San Francisco Bay Area",
  workAuthorization: "Authorized to work in the United States",
  targetRoles: ["Product Manager", "Technical Product Manager"],
  skills: [
    "Product strategy",
    "SQL",
    "Python",
    "Figma",
    "A/B testing",
    "Roadmapping",
    "Analytics",
  ],
  education: "",
  workExperience: "",
  projects: "",
  githubUrl: "https://github.com/reemikadas",
  linkedinUrl: "",
  portfolioUrl: "",
  remotePreference: "Flexible",
};
