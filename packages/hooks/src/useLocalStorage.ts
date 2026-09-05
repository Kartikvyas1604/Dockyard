"use client";

import { useEffect, useState } from "react";

/** persisted state hook backed by @dockyard/utils storage. */
export function useLocalStorage<T>(key: string, initial: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(initial);

  useEffect(() => {
    import("@dockyard/utils").then(({ loadJSON }) => {
      setValue(loadJSON<T>(key, initial));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = (v: T) => {
    setValue(v);
    void import("@dockyard/utils").then(({ saveJSON }) => saveJSON(key, v));
  };

  return [value, update];
}
