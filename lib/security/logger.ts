/** Structured security/audit logging with secret redaction. Edge-safe. */
const SENSITIVE = /(secret|token|key|password|passwd|authorization|cookie|signature|card|cvv)/i;

export function redact(value: unknown, depth = 0): unknown {
  if (depth > 4) return "[TRUNCATED]";
  if (Array.isArray(value)) return value.slice(0, 20).map((v) => redact(v, depth + 1));
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = SENSITIVE.test(k) ? "[REDACTED]" : redact(v, depth + 1);
    }
    return out;
  }
  if (typeof value === "string" && value.length > 300) return value.slice(0, 300) + "…";
  return value;
}

function emit(level: "info" | "warn" | "error", event: string, fields: Record<string, unknown>) {
  const line = JSON.stringify({ ts: new Date().toISOString(), level, event, ...(redact(fields) as object) });
  (level === "error" ? console.error : level === "warn" ? console.warn : console.log)(line);
}

/** Security-relevant events: auth failures, rate limits, validation rejections, blocked origins. */
export const logSecurity = (event: string, fields: Record<string, unknown> = {}) => emit("warn", `security.${event}`, fields);
export const logInfo = (event: string, fields: Record<string, unknown> = {}) => emit("info", event, fields);

/** Logs name + message only (never request bodies, headers or stack traces from upstream calls). */
export function logError(event: string, err: unknown, fields: Record<string, unknown> = {}) {
  const e = err instanceof Error ? { name: err.name, message: err.message.slice(0, 300) } : { message: String(err).slice(0, 300) };
  emit("error", event, { ...fields, error: e });
}
