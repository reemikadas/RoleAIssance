import express from "express";
import multer from "multer";
import type { ProfileRepository } from "./database.js";
import { profileSchema } from "./profile.js";
import {
  ResumeStore,
  ResumeValidationError,
} from "./resumeStore.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
});

export function createApp(
  repository: ProfileRepository,
  resumeStore?: ResumeStore,
) {
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

  if (resumeStore) {
    app.get("/api/resume", (_request, response) => {
      const resume = resumeStore.metadata();
      response.json({ resume });
    });

    app.post("/api/resume", upload.single("resume"), async (request, response) => {
      if (!request.file) {
        response.status(400).json({ error: "Choose a PDF or DOCX resume" });
        return;
      }
      try {
        await resumeStore.save(request.file);
        response.status(201).json({ resume: resumeStore.metadata() });
      } catch (error) {
        if (error instanceof ResumeValidationError) {
          response.status(400).json({ error: error.message });
          return;
        }
        throw error;
      }
    });

    app.get("/api/resume/download", (_request, response) => {
      const resume = resumeStore.find();
      if (!resume) {
        response.status(404).json({ error: "No master resume uploaded" });
        return;
      }
      response.type(resume.mimeType);
      response.download(resumeStore.filePath(), resume.originalName);
    });

    app.delete("/api/resume", (_request, response) => {
      if (!resumeStore.delete()) {
        response.status(404).json({ error: "No master resume uploaded" });
        return;
      }
      response.status(204).end();
    });
  }

  app.use(
    (
      error: unknown,
      _request: express.Request,
      response: express.Response,
      next: express.NextFunction,
    ) => {
      if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
        response.status(413).json({ error: "Resume must be 10 MB or smaller" });
        return;
      }
      next(error);
    },
  );

  app.use((_request, response) => {
    response.status(404).json({ error: "Not found" });
  });

  return app;
}
