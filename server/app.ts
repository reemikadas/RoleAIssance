import express from "express";
import type { ProfileRepository } from "./database.js";
import { profileSchema } from "./profile.js";

export function createApp(repository: ProfileRepository) {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "250kb" }));

  app.get("/api/health", (_request, response) => {
    response.json({ status: "ok" });
  });

  app.get("/api/profile", (_request, response) => {
    response.json({ profile: repository.find() });
  });

  app.put("/api/profile", (request, response) => {
    const parsed = profileSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({
        error: "Profile validation failed",
        fields: parsed.error.flatten().fieldErrors,
      });
      return;
    }
    response.json({ profile: repository.save(parsed.data) });
  });

  app.use((_request, response) => {
    response.status(404).json({ error: "Not found" });
  });

  return app;
}
