"use client";

import { get, set } from "idb-keyval";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";

import { ownerKey } from "@/lib/storage/keys";

import type { FolderKey } from "./folders";
import {
  createEntries,
  emptyState,
  filesReducer,
  type FilesState,
  type StoredFile,
} from "./reducer";

const BASE_DB_KEY = "artbo:files:v1";

type Value = {
  state: FilesState;
  /** Adds files to a folder. Returns the files rejected for being over the size cap. */
  addFiles: (folder: FolderKey, files: File[]) => File[];
  removeFile: (folder: FolderKey, id: string) => void;
};

const FilesContext = createContext<Value | null>(null);

type ProviderProps = {
  children: React.ReactNode;
  /**
   * Whose files these are. Omitted for the participant-side app, which keeps the original
   * IndexedDB key; the admin passes a participant id (`artbo:files:v1:<id>`). Mount the
   * provider with `key={ownerId}` so switching owners starts from a clean state.
   */
  ownerId?: string;
};

export function FilesProvider({ children, ownerId }: ProviderProps) {
  const DB_KEY = ownerKey(BASE_DB_KEY, ownerId);
  const [state, dispatch] = useReducer(filesReducer, undefined, emptyState);
  const skipFirstPersist = useRef(true);

  // Hydrate from IndexedDB once; a failure just means starting empty.
  useEffect(() => {
    let cancelled = false;
    get<Partial<Record<FolderKey, StoredFile[]>>>(DB_KEY)
      .then((stored) => {
        if (!cancelled) dispatch({ type: "hydrate", folders: stored ?? {} });
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: "hydrate", folders: {} });
      });
    return () => {
      cancelled = true;
    };
  }, [DB_KEY]);

  // Persist after every change, but never before hydration (it would wipe the stored copy).
  useEffect(() => {
    if (!state.hydrated) return;
    if (skipFirstPersist.current) {
      skipFirstPersist.current = false;
      return;
    }
    set(DB_KEY, state.folders).catch(() => {
      /* quota or private mode: files stay in memory for this session */
    });
  }, [state.folders, state.hydrated, DB_KEY]);

  const addFiles = useCallback((folder: FolderKey, files: File[]) => {
    const { accepted, rejected } = createEntries(files, {
      makeId: () => crypto.randomUUID(),
      now: () => Date.now(),
    });
    if (accepted.length > 0) dispatch({ type: "add", folder, entries: accepted });
    return rejected;
  }, []);

  const removeFile = useCallback((folder: FolderKey, id: string) => {
    dispatch({ type: "remove", folder, id });
  }, []);

  const value = useMemo(() => ({ state, addFiles, removeFile }), [state, addFiles, removeFile]);
  return <FilesContext.Provider value={value}>{children}</FilesContext.Provider>;
}

export function useFiles(): Value {
  const ctx = useContext(FilesContext);
  if (!ctx) throw new Error("useFiles must be used inside <FilesProvider>");
  return ctx;
}

export function useFolderFiles(folder: FolderKey): StoredFile[] {
  return useFiles().state.folders[folder];
}
