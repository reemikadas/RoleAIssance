import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "./app.js";
import { ProfileRepository } from "./database.js";
import { defaultProfile } from "./profile.js";

let repository: ProfileRepository;

beforeEach(() => {
  repository = new ProfileRepository(":memory:");
});

afterEach(() => {
  repository.close();
});

describe("profile API", () => {
  it("returns the seeded profile", async () => {
    const response = await request(createApp(repository)).get("/api/profile");
    expect(response.status).toBe(200);
    expect(response.body.profile.fullName).toBe(defaultProfile.fullName);
  });

  it("validates and persists profile updates", async () => {
    const updated = {
      ...defaultProfile,
      headline: "Senior Product Manager",
      skills: [...defaultProfile.skills, "User research"],
    };
    const save = await request(createApp(repository)).put("/api/profile").send(updated);
    expect(save.status).toBe(200);
    expect(save.body.profile.headline).toBe("Senior Product Manager");

    const read = await request(createApp(repository)).get("/api/profile");
    expect(read.body.profile.skills).toContain("User research");
  });

  it("rejects invalid profile updates without replacing saved data", async () => {
    const invalid = await request(createApp(repository))
      .put("/api/profile")
      .send({ ...defaultProfile, email: "not-an-email", skills: [] });
    expect(invalid.status).toBe(400);
    expect(invalid.body.fields.email).toBeDefined();
    expect(invalid.body.fields.skills).toBeDefined();

    const read = await request(createApp(repository)).get("/api/profile");
    expect(read.body.profile.email).toBe(defaultProfile.email);
  });
});
