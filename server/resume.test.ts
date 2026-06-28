import request from "supertest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "./app.js";
import { ProfileRepository } from "./database.js";
import { ResumeStore } from "./resumeStore.js";

let directory: string;
let profileRepository: ProfileRepository;
let resumeStore: ResumeStore;

beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), "roleaissance-resume-"));
  profileRepository = new ProfileRepository(":memory:");
  resumeStore = new ResumeStore(":memory:", directory);
});

afterEach(() => {
  resumeStore.close();
  profileRepository.close();
  rmSync(directory, { recursive: true, force: true });
});

describe("master resume API", () => {
  it("uploads, returns, and downloads a valid PDF", async () => {
    const app = createApp(profileRepository, resumeStore);
    const upload = await request(app)
      .post("/api/resume")
      .attach("resume", Buffer.from("%PDF-1.4\nresume"), {
        filename: "Reemika_Das_Master_Resume.pdf",
        contentType: "application/pdf",
      });
    expect(upload.status).toBe(201);
    expect(upload.body.resume.originalName).toBe(
      "Reemika_Das_Master_Resume.pdf",
    );

    const metadata = await request(app).get("/api/resume");
    expect(metadata.body.resume.mimeType).toBe("application/pdf");

    const download = await request(app).get("/api/resume/download");
    expect(download.status).toBe(200);
    expect(download.headers["content-disposition"]).toContain(
      "Reemika_Das_Master_Resume.pdf",
    );
  });

  it("rejects files whose contents do not match PDF or DOCX", async () => {
    const response = await request(createApp(profileRepository, resumeStore))
      .post("/api/resume")
      .attach("resume", Buffer.from("not a resume"), {
        filename: "resume.pdf",
        contentType: "application/pdf",
      });
    expect(response.status).toBe(400);
    expect(response.body.error).toContain("valid PDF and DOCX");
  });

  it("replaces and deletes the master resume", async () => {
    const app = createApp(profileRepository, resumeStore);
    await request(app)
      .post("/api/resume")
      .attach("resume", Buffer.from("%PDF-1.4\nfirst"), {
        filename: "first.pdf",
        contentType: "application/pdf",
      });
    const replacement = await request(app)
      .post("/api/resume")
      .attach("resume", Buffer.from("%PDF-1.4\nsecond"), {
        filename: "second.pdf",
        contentType: "application/pdf",
      });
    expect(replacement.body.resume.originalName).toBe("second.pdf");

    expect((await request(app).delete("/api/resume")).status).toBe(204);
    expect((await request(app).get("/api/resume")).body.resume).toBeNull();
  });
});
