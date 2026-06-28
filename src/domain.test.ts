import { describe, expect, it } from "vitest";
import { nextStatus, recommendation, scoreJob, type Job } from "./domain";

const job: Job = {
  id: 1,
  company: "Acme",
  role: "Product Manager",
  location: "Remote",
  salary: "$100k-$120k",
  source: "Company",
  posted: "Today",
  logo: "A",
  logoColor: "#000",
  skills: [],
  requiredSkills: ["SQL", "Product strategy"],
  preferredSkills: ["Figma"],
  seniorityMatch: 100,
  preferenceMatch: 100,
  status: "Matched",
  summary: "",
};

describe("job matching", () => {
  it("gives a perfect score when all evidence and preferences match", () => {
    expect(scoreJob(job, ["SQL", "Product strategy", "Figma"])).toBe(100);
  });

  it("weights required skills more heavily than preferred skills", () => {
    expect(scoreJob(job, ["Figma"])).toBe(45);
    expect(scoreJob(job, ["SQL", "Product strategy"])).toBe(85);
  });

  it("maps scores to explainable recommendations", () => {
    expect(recommendation(88)).toBe("Apply");
    expect(recommendation(67)).toBe("Review");
    expect(recommendation(39)).toBe("Skip");
  });
});

describe("application workflow", () => {
  it("advances along the happy path without advancing terminal states", () => {
    expect(nextStatus("Prepared")).toBe("Approved");
    expect(nextStatus("Interviewing")).toBe("Offer");
    expect(nextStatus("Rejected")).toBe("Rejected");
  });
});
