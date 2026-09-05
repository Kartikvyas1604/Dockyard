"use client";

import { useState } from "react";
import { loadJSON, saveJSON } from "@dockyard/utils";

/**
 * Persisted state hook backed by @dockyard/utils storage.
 * Lazy initializer reads storage synchronously on the client; on the server
 * loadJSON falls back to the seed value, so no effect-cascade is needed.
 */
export function useLocalStorage<T>(key: string, initial: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(() => loadJSON(key, initial));

  const update = (v: T) => {
    setValue(v);
    saveJSON(key, v);
  };

  return [value, update];
}
