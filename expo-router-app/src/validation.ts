/** Trail IDs are short slugs: letters, digits and hyphens only. */
const TRAIL_ID = /^[a-z0-9-]{1,64}$/i;

export function isValidTrailId(id: unknown): id is string {
  return typeof id === 'string' && TRAIL_ID.test(id);
}

/** Allowlist for the optional ?ref= campaign parameter. */
const REF = /^[a-z0-9_-]{1,32}$/i;

export function sanitizeRef(ref: unknown): string | undefined {
  return typeof ref === 'string' && REF.test(ref) ? ref : undefined;
}
