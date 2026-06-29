export type ProfileData = {
  fullName: string;
  headline: string;
  email: string;
  location: string;
  workAuthorization: string;
  targetRoles: string[];
  skills: string[];
  education: string;
  workExperience: string;
  projects: string;
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
  remotePreference: "Remote" | "Hybrid" | "On-site" | "Flexible";
  updatedAt?: string;
};

type ProfileResponse = { profile: ProfileData };

async function parseResponse(response: Response): Promise<ProfileResponse> {
  const data = (await response.json()) as ProfileResponse & {
    error?: string;
    fields?: Record<string, string[]>;
  };
  if (!response.ok) {
    const fieldMessage = Object.entries(data.fields ?? {})
      .flatMap(([field, messages]) =>
        messages.map((message) => `${field}: ${message}`),
      )
      .join("; ");
    throw new Error(
      fieldMessage || data.error || "Unable to save profile",
    );
  }
  return data;
}

export async function getProfile() {
  return parseResponse(await fetch("/api/profile"));
}

export async function updateProfile(profile: ProfileData) {
  return parseResponse(
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    }),
  );
}

export type ResumeData = {
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  extractionStatus: "ready" | "failed";
  analysis: {
    fullName: string;
    email: string;
    linkedinUrl: string;
    githubUrl: string;
    education: string;
    workExperience: string;
    projects: string;
    skills: string[];
    textPreview: string;
  } | null;
};

export async function getMasterResume() {
  const response = await fetch("/api/resume");
  if (!response.ok) throw new Error("Unable to load master resume");
  return (await response.json()) as { resume: ResumeData | null };
}

export async function uploadMasterResume(file: File) {
  const body = new FormData();
  body.append("resume", file);
  const response = await fetch("/api/resume", { method: "POST", body });
  const data = (await response.json()) as { resume?: ResumeData; error?: string };
  if (!response.ok || !data.resume) {
    throw new Error(data.error ?? "Unable to upload master resume");
  }
  return data.resume;
}

export async function deleteMasterResume() {
  const response = await fetch("/api/resume", { method: "DELETE" });
  if (!response.ok && response.status !== 404) {
    throw new Error("Unable to delete master resume");
  }
}
