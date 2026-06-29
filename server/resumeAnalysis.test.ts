import { describe, expect, it } from "vitest";
import { analyzeResumeText } from "./resumeAnalysis.js";

describe("resume analysis", () => {
  it("creates reviewable contact and skill suggestions from extracted text", () => {
    const analysis = analyzeResumeText(`
      Reemika Das
      reemika@example.com
      https://www.linkedin.com/in/reemika-das/
      https://github.com/reemikadas

      Product leader using Python, SQL, Power BI, product strategy,
      roadmapping, user research, and A/B testing.
    `);

    expect(analysis.fullName).toBe("Reemika Das");
    expect(analysis.email).toBe("reemika@example.com");
    expect(analysis.linkedinUrl).toContain("linkedin.com/in/reemika-das");
    expect(analysis.githubUrl).toBe("https://github.com/reemikadas");
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
    const analysis = analyzeResumeText("Experience\nBuilt useful products.");
    expect(analysis.fullName).toBe("");
    expect(analysis.email).toBe("");
    expect(analysis.linkedinUrl).toBe("");
    expect(analysis.githubUrl).toBe("");
    expect(analysis.skills).toEqual([]);
  });

  it("handles single-line PDF text without inferring Git from GitHub", () => {
    const analysis = analyzeResumeText(
      "Reemika Das reemika@example.com https://github.com/reemikadas Python SQL",
    );
    expect(analysis.fullName).toBe("Reemika Das");
    expect(analysis.skills).toEqual(["Python", "SQL"]);
  });
});
