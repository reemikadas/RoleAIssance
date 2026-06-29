import { describe, expect, it } from "vitest";
import { analyzeResumeText } from "./resumeAnalysis.js";

describe("resume analysis", () => {
  it("creates reviewable contact and skill suggestions from extracted text", () => {
    const analysis = analyzeResumeText(`
      Reemika Das
      reemika@example.com
      https://www.linkedin.com/in/reemika-das/
      https://github.com/reemikadas

      EDUCATION
      Santa Clara University — M.S. Business Analytics
      PROFESSIONAL EXPERIENCE
      Research Assistant — Built data products with Python and SQL
      PROJECTS
      Churn prediction — Power BI and machine learning
      SKILLS
      Product strategy, roadmapping, user research, and A/B testing.
    `);

    expect(analysis.fullName).toBe("Reemika Das");
    expect(analysis.email).toBe("reemika@example.com");
    expect(analysis.linkedinUrl).toContain("linkedin.com/in/reemika-das");
    expect(analysis.githubUrl).toBe("https://github.com/reemikadas");
    expect(analysis.education).toContain("Santa Clara University");
    expect(analysis.workExperience).toContain("Research Assistant");
    expect(analysis.projects).toContain("Churn prediction");
    expect(analysis.skills).toEqual(
      expect.arrayContaining([
        "A/B testing",
        "Power BI",
        "Product strategy",
        "Python",
        "SQL",
        "User research",
      ]),
    );
  });

  it("returns empty suggestions instead of inventing absent facts", () => {
    const analysis = analyzeResumeText("Built useful products.");
    expect(analysis.fullName).toBe("");
    expect(analysis.email).toBe("");
    expect(analysis.linkedinUrl).toBe("");
    expect(analysis.githubUrl).toBe("");
    expect(analysis.education).toBe("");
    expect(analysis.workExperience).toBe("");
    expect(analysis.projects).toBe("");
    expect(analysis.skills).toEqual([]);
  });

  it("handles single-line PDF text without inferring Git from GitHub", () => {
    const analysis = analyzeResumeText(
      "Reemika Das reemika@example.com https://github.com/reemikadas Python SQL",
    );
    expect(analysis.fullName).toBe("Reemika Das");
    expect(analysis.skills).toEqual(["Python", "SQL"]);
  });

  it("separates flattened PDF text into independent career sections", () => {
    const analysis = analyzeResumeText(
      "EDUCATION Santa Clara University M.S. Analytics " +
        "PROFESSIONAL EXPERIENCE Data Analyst Built dashboards " +
        "PROJECTS Forecasting project TECHNICAL SKILLS Python, SQL",
    );
    expect(analysis.education).toBe("Santa Clara University M.S. Analytics");
    expect(analysis.workExperience).toBe("Data Analyst Built dashboards");
    expect(analysis.projects).toBe("Forecasting project");
    expect(analysis.skills).toEqual(["Python", "SQL"]);
  });
});
