import Database from "better-sqlite3";
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import { basename, extname, join } from "node:path";
import { randomUUID } from "node:crypto";

export type ResumeRecord = {
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
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
        uploaded_at TEXT NOT NULL
      )
    `);
  }

  find(): ResumeRecord | null {
    const row = this.database
      .prepare("SELECT * FROM resumes WHERE id = ?")
      .get("master") as Record<string, string | number> | undefined;
    if (!row) return null;
    return {
      originalName: String(row.original_name),
      storedName: String(row.stored_name),
      mimeType: String(row.mime_type),
      size: Number(row.size),
      uploadedAt: String(row.uploaded_at),
    };
  }

  save(file: Express.Multer.File): ResumeRecord {
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

    const previous = this.find();
    const storedName = `${randomUUID()}${extension}`;
    writeFileSync(join(this.uploadDirectory, storedName), file.buffer, {
      flag: "wx",
      mode: 0o600,
    });

    const record: ResumeRecord = {
      originalName: basename(file.originalname).replaceAll('"', ""),
      storedName,
      mimeType: file.mimetype,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    };

    this.database.prepare(`
      INSERT INTO resumes (
        id, original_name, stored_name, mime_type, size, uploaded_at
      ) VALUES (
        'master', @originalName, @storedName, @mimeType, @size, @uploadedAt
      )
      ON CONFLICT(id) DO UPDATE SET
        original_name = excluded.original_name,
        stored_name = excluded.stored_name,
        mime_type = excluded.mime_type,
        size = excluded.size,
        uploaded_at = excluded.uploaded_at
    `).run(record);

    if (previous) this.deleteFile(previous.storedName);
    return record;
  }

  filePath(record: ResumeRecord) {
    return join(this.uploadDirectory, record.storedName);
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
