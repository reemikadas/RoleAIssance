export function parseCommaList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function mergeProfileSkills(
  existing: string[],
  extracted: string[],
  limit = 50,
) {
  const seen = new Set<string>();
  return [...existing, ...extracted]
    .map((skill) => skill.trim())
    .filter((skill) => {
      const key = skill.toLocaleLowerCase();
      if (!skill || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, limit);
}
