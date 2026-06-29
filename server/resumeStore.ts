import Database from "better-sqlite3";
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import { basename, extname, join } from "node:path";
import { randomUUID } from "node:crypto";
import { analyzeResumeText, type ResumeAnalysis } from "./resumeAnalysis.js";
import { extractResumeText } from "./resumeText.js";

export type ResumeRecord = {
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  extractionStatus: "ready" | "failed";
  analysis: ResumeAnalysis | null;
};

type StoredResume = ResumeRecord & {
  storedName: string;
  extractedText: string;
};

const PDF_MIME = "application/pdf";
const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export class ResumeValidationError extends Error {}

export class ResumeStore {
  private readonly database: Database.Database;

  constructor(
    filename: string,
    private readonly uploadDirectory: string,
  ) {
    mkdirSync(uploadDirectory, { recursive: true });
    this.database = new Database(filename);
    this.database.pragma("journal_mode = WAL");
    this.database.exec(`
      CREATE TABLE IF NOT EXISTS resumes (
        id TEXT PRIMARY KEY,
        original_name TEXT NOT NULL,
        stored_name TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        size INTEGER NOT NULL,
        uploaded_at TEXT NOT NULL,
        extracted_text TEXT NOT NULL DEFAULT '',
        extraction_status TEXT NOT NULL DEFAULT 'failed'
      )
    `);
    const columns = this.database.pragma("table_info(resumes)") as Array<{
      name: string;
    }>;
    if (!columns.some((column) => column.name === "extracted_text")) {
      this.database.exec(
        "ALTER TABLE resumes ADD COLUMN extracted_text TEXT NOT NULL DEFAULT ''",
      );
    }
    if (!columns.some((column) => column.name === "extraction_status")) {
      this.database.exec(
        "ALTER TABLE resumes ADD COLUMN extraction_status TEXT NOT NULL DEFAULT 'failed'",
      );
    }
  }

  find(): StoredResume | null {
    const row = this.database
      .prepare("SELECT * FROM resumes WHERE id = ?")
      .get("master") as Record<string, string | number> | undefined;
    if (!row) return null;
    const extractedText = String(row.extracted_text);
    const extractionStatus = String(
      row.extraction_status,
    ) as StoredResume["extractionStatus"];
    return {
      originalName: String(row.original_name),
      storedName: String(row.stored_name),
      mimeType: String(row.mime_type),
      size: Number(row.size),
      uploadedAt: String(row.uploaded_at),
      extractedText,
      extractionStatus,
      analysis:
        extractionStatus === "ready" && extractedText
          ? analyzeResumeText(extractedText)
          : null,
    };
  }

  async save(file: Express.Multer.File): Promise<StoredResume> {
    const extension = extname(file.originalname).toLowerCase();
    const isPdf =
      extension === ".pdf" &&
      file.mimetype === PDF_MIME &&
      file.buffer.subarray(0, 5).toString() === "%PDF-";
    const isDocx =
      extension === ".docx" &&
      file.mimetype === DOCX_MIME &&
      file.buffer.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]));

    if (!isPdf && !isDocx) {
      throw new ResumeValidationError("Only valid PDF and DOCX resumes are accepted");
    }

    let extractedText = "";
    let extractionStatus: StoredResume["extractionStatus"] = "failed";
    try {
      extractedText = await extractResumeText(file);
      if (extractedText) extractionStatus = "ready";
    } catch {
      extractionStatus = "failed";
    }

    const previous = this.find();
    const storedName = `${randomUUID()}${extension}`;
    writeFileSync(join(this.uploadDirectory, storedName), file.buffer, {
      flag: "wx",
      mode: 0o600,
    });

    const record: StoredResume = {
      originalName: basename(file.originalname).replaceAll('"', ""),
      storedName,
      mimeType: file.mimetype,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      extractedText,
      extractionStatus,
      analysis:
        extractionStatus === "ready" ? analyzeResumeText(extractedText) : null,
    };

    this.database.prepare(`
      INSERT INTO resumes (
        id, original_name, stored_name, mime_type, size, uploaded_at,
        extracted_text, extraction_status
      ) VALUES (
        'master', @originalName, @storedName, @mimeType, @size, @uploadedAt,
        @extractedText, @extractionStatus
      )
      ON CONFLICT(id) DO UPDATE SET
        original_name = excluded.original_name,
        stored_name = excluded.stored_name,
        mime_type = excluded.mime_type,
        size = excluded.size,
        uploaded_at = excluded.uploaded_at,
        extracted_text = excluded.extracted_text,
        extraction_status = excluded.extraction_status
    `).run(record);

    if (previous) this.deleteFile(previous.storedName);
    return record;
  }

  filePath() {
    const stored = this.find();
    if (!stored) throw new Error("Resume file not found");
    return join(this.uploadDirectory, stored.storedName);
  }

  metadata(): ResumeRecord | null {
    const record = this.find();
    if (!record) return null;
    return {
      originalName: record.originalName,
      mimeType: record.mimeType,
      size: record.size,
      uploadedAt: record.uploadedAt,
      extractionStatus: record.extractionStatus,
      analysis: record.analysis,
    };
  }

  delete() {
    const record = this.find();
    if (!record) return false;
    this.database.prepare("DELETE FROM resumes WHERE id = ?").run("master");
    this.deleteFile(record.storedName);
    return true;
  }

  close() {
    this.database.close();
  }

  private deleteFile(storedName: string) {
    const path = join(this.uploadDirectory, storedName);
    if (existsSync(path)) unlinkSync(path);
  }
}
