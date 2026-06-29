export type ResumeAnalysis = {
  fullName: string;
  email: string;
  linkedinUrl: string;
  githubUrl: string;
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
    skills,
    textPreview: text.slice(0, 1200),
  };
}
