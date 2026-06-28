import Database from "better-sqlite3";
import { defaultProfile, type Profile } from "./profile.js";

export type ProfileRecord = Profile & {
  updatedAt: string;
};

export class ProfileRepository {
  private readonly database: Database.Database;

  constructor(filename: string) {
    this.database = new Database(filename);
    this.database.pragma("journal_mode = WAL");
    this.database.exec(`
      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        headline TEXT NOT NULL,
        email TEXT NOT NULL,
        location TEXT NOT NULL,
        work_authorization TEXT NOT NULL,
        target_roles TEXT NOT NULL,
        skills TEXT NOT NULL,
        github_url TEXT NOT NULL,
        linkedin_url TEXT NOT NULL,
        portfolio_url TEXT NOT NULL,
        remote_preference TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
    const columns = this.database.pragma("table_info(profiles)") as Array<{ name: string }>;
    if (!columns.some((column) => column.name === "linkedin_url")) {
      this.database.exec(
        "ALTER TABLE profiles ADD COLUMN linkedin_url TEXT NOT NULL DEFAULT ''",
      );
    }
    if (!this.find()) this.save(defaultProfile);
  }

  find(): ProfileRecord | null {
    const row = this.database
      .prepare("SELECT * FROM profiles WHERE id = ?")
      .get("default") as Record<string, string> | undefined;
    if (!row) return null;
    return {
      fullName: row.full_name,
      headline: row.headline,
      email: row.email,
      location: row.location,
      workAuthorization: row.work_authorization,
      targetRoles: JSON.parse(row.target_roles) as string[],
      skills: JSON.parse(row.skills) as string[],
      githubUrl: row.github_url,
      linkedinUrl: row.linkedin_url,
      portfolioUrl: row.portfolio_url,
      remotePreference: row.remote_preference as Profile["remotePreference"],
      updatedAt: row.updated_at,
    };
  }

  save(profile: Profile): ProfileRecord {
    const updatedAt = new Date().toISOString();
    this.database.prepare(`
      INSERT INTO profiles (
        id, full_name, headline, email, location, work_authorization,
        target_roles, skills, github_url, linkedin_url, portfolio_url, remote_preference, updated_at
      ) VALUES (
        @id, @fullName, @headline, @email, @location, @workAuthorization,
        @targetRoles, @skills, @githubUrl, @linkedinUrl, @portfolioUrl, @remotePreference, @updatedAt
      )
      ON CONFLICT(id) DO UPDATE SET
        full_name = excluded.full_name,
        headline = excluded.headline,
        email = excluded.email,
        location = excluded.location,
        work_authorization = excluded.work_authorization,
        target_roles = excluded.target_roles,
        skills = excluded.skills,
        github_url = excluded.github_url,
        linkedin_url = excluded.linkedin_url,
        portfolio_url = excluded.portfolio_url,
        remote_preference = excluded.remote_preference,
        updated_at = excluded.updated_at
    `).run({
      id: "default",
      ...profile,
      targetRoles: JSON.stringify(profile.targetRoles),
      skills: JSON.stringify(profile.skills),
      updatedAt,
    });
    return { ...profile, updatedAt };
  }

  close() {
    this.database.close();
  }
}
