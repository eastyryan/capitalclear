// Shared result type for Server Actions and other fallible operations.
// Discriminated on `ok` so callers can narrow without throwing.

export type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string };

/** Build a successful ActionResult. */
export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

/** Build a failed ActionResult. */
export function err(error: string): ActionResult<never> {
  return { ok: false, error };
}
