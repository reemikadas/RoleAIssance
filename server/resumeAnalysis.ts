export type ResumeAnalysis = {
  fullName: string;
  email: string;
  linkedinUrl: string;
  githubUrl: string;
  education: string;
  workExperience: string;
  projects: string;
  skills: string[];
  textPreview: string;
};

const KNOWN_SKILLS = [
  "A/B testing",
  "AWS",
  "Azure",
  "Data analysis",
  "Docker",
  "Figma",
  "Git",
  "Java",
  "JavaScript",
  "Kubernetes",
  "Machine learning",
  "Microsoft Excel",
  "Node.js",
  "Power BI",
  "Product strategy",
  "Python",
  "React",
  "Roadmapping",
  "SQL",
  "Tableau",
  "TypeScript",
  "User research",
];

function firstMatch(text: string, pattern: RegExp) {
  return text.match(pattern)?.[0] ?? "";
}

function escapePattern(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

type SectionKey = "education" | "workExperience" | "projects" | "skills";

const SECTION_HEADINGS: Record<string, SectionKey> = {
  EDUCATION: "education",
  "PROFESSIONAL EXPERIENCE": "workExperience",
  "WORK EXPERIENCE": "workExperience",
  EXPERIENCE: "workExperience",
  PROJECTS: "projects",
  PROJECT: "projects",
  "TECHNICAL SKILLS": "skills",
  SKILLS: "skills",
};

export function extractCareerSections(rawText: string) {
  const headingPattern =
    /(EDUCATION|PROFESSIONAL EXPERIENCE|WORK EXPERIENCE|EXPERIENCE|PROJECTS?|TECHNICAL SKILLS|SKILLS)/g;
  const prepared = rawText.replace(headingPattern, "\n$1\n");
  const sections: Record<SectionKey, string[]> = {
    education: [],
    workExperience: [],
    projects: [],
    skills: [],
  };
  let active: SectionKey | null = null;

  for (const rawLine of prepared.split(/\n+/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const heading = SECTION_HEADINGS[line.toUpperCase()];
    if (heading) {
      active = heading;
      continue;
    }
    if (active) sections[active].push(line);
  }

  return {
    education: sections.education.join("\n").trim(),
    workExperience: sections.workExperience.join("\n").trim(),
    projects: sections.projects.join("\n").trim(),
    skills: sections.skills.join("\n").trim(),
  };
}

export function analyzeResumeText(rawText: string): ResumeAnalysis {
  const text = rawText.replace(/\r/g, "").replace(/[ \t]+/g, " ").trim();
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const lineName =
    lines.find(
      (line) =>
        /^[A-Za-z][A-Za-z.'-]+(?:\s+[A-Za-z][A-Za-z.'-]+){1,3}$/.test(line) &&
        line.split(/\s+/).every((word) => /^[A-Z]/.test(word)) &&
        !/[.!?:]$/.test(line) &&
        line.length <= 80,
    ) ?? "";
  const inlineName =
    text.match(
      /^([A-Z][A-Za-z.'-]+\s+[A-Z][A-Za-z.'-]+)(?=\s+[\w.+-]+@)/,
    )?.[1] ?? "";
  const lowerText = text.toLowerCase();
  const careerSections = extractCareerSections(text);
  const skills = KNOWN_SKILLS.filter((skill) =>
    new RegExp(`\\b${escapePattern(skill.toLowerCase())}\\b`, "i").test(
      lowerText,
    ),
  );

  return {
    fullName: lineName || inlineName,
    email: firstMatch(text, /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/),
    linkedinUrl: firstMatch(
      text,
      /https?:\/\/(?:www\.)?linkedin\.com\/in\/[^\s),;]+/i,
    ),
    githubUrl: firstMatch(
      text,
      /https?:\/\/(?:www\.)?github\.com\/[A-Za-z0-9-]+/i,
    ),
    education: careerSections.education,
    workExperience: careerSections.workExperience,
    projects: careerSections.projects,
    skills,
    textPreview: text.slice(0, 1200),
  };
}
