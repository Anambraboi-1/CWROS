// In-memory refresh-token store, replacing the Redis dependency from the old
// MVP. README §4.4 treats Redis as an optional supporting service and
// requires core functionality (login, shortest-path) to not depend on it —
// this keeps the same session-tracking behaviour without an external service.

interface Entry {
  userId: string;
  expiresAt: number;
}

const store = new Map<string, Entry>();

export function saveRefreshToken(userId: string, token: string, ttlSeconds: number): void {
  store.set(token, { userId, expiresAt: Date.now() + ttlSeconds * 1000 });
}

export function isRefreshTokenValid(userId: string, token: string): boolean {
  const entry = store.get(token);
  if (!entry) return false;
  if (entry.expiresAt < Date.now()) {
    store.delete(token);
    return false;
  }
  return entry.userId === userId;
}
