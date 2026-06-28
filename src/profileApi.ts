export type ProfileData = {
  fullName: string;
  headline: string;
  email: string;
  location: string;
  workAuthorization: string;
  targetRoles: string[];
  skills: string[];
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
  remotePreference: "Remote" | "Hybrid" | "On-site" | "Flexible";
  updatedAt?: string;
};

type ProfileResponse = { profile: ProfileData };

async function parseResponse(response: Response): Promise<ProfileResponse> {
  const data = (await response.json()) as ProfileResponse & { error?: string };
  if (!response.ok) {
    throw new Error(data.error ?? "Unable to save profile");
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
