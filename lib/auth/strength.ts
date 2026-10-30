/** UX hint only (the server enforces its own rules). */
export function passwordStrength(pw: string): { score: 0 | 1 | 2 | 3 | 4; label: string } {
  if (!pw) return { score: 0, label: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if ((/[a-z]/.test(pw) && /[A-Z]/.test(pw)) || (/[a-zA-Z]/.test(pw) && /\d/.test(pw))) score++;
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 16) score++;
  if (pw.length < 8) score = Math.min(score, 1);
  const s = Math.min(4, score) as 0 | 1 | 2 | 3 | 4;
  return { score: s, label: ["Too short", "Weak", "Okay", "Good", "Strong"][s] };
}
