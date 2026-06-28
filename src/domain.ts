export type JobStatus =
  | "Discovered"
  | "Matched"
  | "Prepared"
  | "Approved"
  | "Submitted"
  | "Interviewing"
  | "Offer"
  | "Rejected"
  | "Withdrawn";

export type Job = {
  id: number;
  company: string;
  role: string;
  location: string;
  salary: string;
  source: string;
  posted: string;
  logo: string;
  logoColor: string;
  skills: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  seniorityMatch: number;
  preferenceMatch: number;
  status: JobStatus;
  summary: string;
};

export function scoreJob(job: Job, candidateSkills: string[]) {
  const normalized = new Set(candidateSkills.map((skill) => skill.toLowerCase()));
  const requiredMatches = job.requiredSkills.filter((skill) =>
    normalized.has(skill.toLowerCase()),
  ).length;
  const preferredMatches = job.preferredSkills.filter((skill) =>
    normalized.has(skill.toLowerCase()),
  ).length;
  const requiredScore = job.requiredSkills.length
    ? requiredMatches / job.requiredSkills.length
    : 1;
  const preferredScore = job.preferredSkills.length
    ? preferredMatches / job.preferredSkills.length
    : 1;

  return Math.round(
    requiredScore * 55 +
      preferredScore * 15 +
      job.seniorityMatch * 0.15 +
      job.preferenceMatch * 0.15,
  );
}

export function recommendation(score: number) {
  if (score >= 80) return "Apply";
  if (score >= 60) return "Review";
  return "Skip";
}

export function nextStatus(status: JobStatus): JobStatus {
  const path: JobStatus[] = [
    "Discovered",
    "Matched",
    "Prepared",
    "Approved",
    "Submitted",
    "Interviewing",
    "Offer",
  ];
  const index = path.indexOf(status);
  return index >= 0 && index < path.length - 1 ? path[index + 1] : status;
}
