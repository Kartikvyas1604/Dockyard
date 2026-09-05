/**
 * Unified key/value storage.
 * Web/extension use localStorage; React Native swaps in AsyncStorage via
 * setBackend() from a .native override at app bootstrap.
 */

type KV = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

let backend: KV | null = null;

export function setBackend(custom: KV): void {
  backend = custom;
}

function kv(): KV | null {
  if (backend) return backend;
  if (typeof window !== "undefined" && window.localStorage) {
    return {
      getItem: (k) => window.localStorage.getItem(k),
      setItem: (k, v) => window.localStorage.setItem(k, v),
      removeItem: (k) => window.localStorage.removeItem(k),
    };
  }
  return null;
}

export function loadJSON<T>(key: string, fallback: T): T {
  const store = kv();
  if (!store) return fallback;
  try {
    const raw = store.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveJSON(key: string, value: unknown): void {
  const store = kv();
  if (!store) return;
  try {
    store.setItem(key, JSON.stringify(value));
  } catch {
    // quota or serialization failure — storage is best-effort by design
  }
}

export function removeKey(key: string): void {
  kv()?.removeItem(key);
}
