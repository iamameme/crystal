import { useMemo, useState } from "react";

const STORAGE_KEYS = {
  SAVE_HEADERS_TEXT: "GraphileInspect:saveHeadersText",
  HEADERS_TEXT: "GraphileInspect:headersText",
  EXPLAIN: "GraphileInspect:explain",
};

export interface StoredKeys {
  saveHeaders: "true" | "";
  headers: string;
  explain: "true" | "";
  explorerIsOpen: "true" | "";
  query: string;
}

const KEYS: { [key in keyof StoredKeys]: string } = {
  saveHeaders: "GraphileInspect:saveHeadersText",
  headers: "GraphileInspect:headersText",
  explain: "GraphileInspect:explain",
  explorerIsOpen: "graphiql:explorerIsOpen",
  query: "graphiql:query",
};

const up = (v: number) => v + 1;

export interface GraphileInspectStorage {
  get<TKey extends keyof StoredKeys>(key: TKey): StoredKeys[TKey] | null;
  set<TKey extends keyof StoredKeys>(key: TKey, value: StoredKeys[TKey]): void;
  toggle<TKey extends keyof StoredKeys>(key: TKey): void;
}

export const useStorage = (): GraphileInspectStorage => {
  const storage = typeof window !== "undefined" ? window.localStorage : null;
  // Trigger re-render every time we set
  const [revision, bump] = useState(0);
  const [cache] = useState<Partial<StoredKeys>>({});

  return useMemo(() => {
    if (!storage) {
      return {
        _revision: revision,
        get(key) {
          return cache[key] ?? null;
        },
        set(key, value) {
          cache[key] = value;
        },
        toggle(key) {
          cache[key] = cache[key] ? "" : "true";
        },
      };
    }
    return {
      _revision: revision,
      get(key) {
        const val = storage.getItem(KEYS[key]) as any;
        if (val === "null" || val === "undefined") {
          storage.removeItem(KEYS[key]);
          return null;
        }
        return val ?? null;
      },
      set(key, value) {
        storage.set(KEYS[key], value);
        bump(up);
      },
      toggle(key) {
        if (this.get(key)) {
          this.set(key, "");
        } else {
          this.set(key, "true");
        }
      },
    };
  }, [storage, revision]);
};
