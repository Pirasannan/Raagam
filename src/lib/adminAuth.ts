import { createHash, timingSafeEqual } from 'node:crypto';

const digest = (value: string) => createHash('sha256').update(value).digest();

/** Constant-time check of a supplied key against ADMIN_SECRET_KEY. Always false when unset. */
export function isAdminKey(candidate: string | null | undefined): boolean {
  const expected = process.env.ADMIN_SECRET_KEY;
  if (!expected || !candidate) return false;
  return timingSafeEqual(digest(candidate), digest(expected));
}

/** Reads the admin key from the `x-admin-key` request header. */
export function isAdminRequest(req: Request): boolean {
  return isAdminKey(req.headers.get('x-admin-key'));
}
