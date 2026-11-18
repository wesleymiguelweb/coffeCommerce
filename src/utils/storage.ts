type StorageKind = 'local' | 'session'

function resolveStorage(kind: StorageKind): Storage | null {
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage
  } catch {
    return null
  }
}

/**
 * Reads and validates a JSON value from storage. Corrupted, tampered or
 * outdated entries are discarded instead of breaking the app.
 */
export function readStoredValue<T>(
  key: string,
  guard: (value: unknown) => value is T,
  kind: StorageKind = 'local',
): T | null {
  const storage = resolveStorage(kind)
  if (!storage) return null

  try {
    const raw = storage.getItem(key)
    if (raw === null) return null

    const parsed: unknown = JSON.parse(raw)
    return guard(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function writeStoredValue<T>(
  key: string,
  value: T,
  kind: StorageKind = 'local',
): void {
  const storage = resolveStorage(kind)
  if (!storage) return

  try {
    storage.setItem(key, JSON.stringify(value))
  } catch {
    /* Storage may be full or blocked; the app keeps working in memory. */
  }
}

export function removeStoredValue(key: string, kind: StorageKind = 'local'): void {
  const storage = resolveStorage(kind)
  if (!storage) return

  try {
    storage.removeItem(key)
  } catch {
    /* no-op */
  }
}
