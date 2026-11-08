"use client";

import { set } from "idb-keyval";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";

import type { FolderKey } from "./folders";
import { FILES_CHANGED_EVENT, filesKey, loadFiles } from "./persistence";
import {
  createEntries,
  emptyState,
  filesReducer,
  folderFiles,
  type FileStatus,
  type FilesState,
  type StoredFile,
} from "./reducer";

type Value = {
  state: FilesState;
  /** Adds files to a folder. Returns the files rejected for being over the size cap. */
  addFiles: (folder: FolderKey, files: File[]) => File[];
  removeFile: (folder: FolderKey, id: string) => void;
  /** Records the admin's decision on a file; unknown ids are ignored. */
  setFileStatus: (folder: FolderKey, id: string, status: FileStatus) => void;
  /** Sets the admin's comment on a file; an empty text clears it. Unknown ids are ignored. */
  setFileComment: (folder: FolderKey, id: string, comment: string) => void;
};

const FilesContext = createContext<Value | null>(null);

type ProviderProps = {
  children: React.ReactNode;
  /**
   * Whose files these are (`artbo:files:v1:<id>`). Mount with `key={ownerId}` so switching
   * owners starts clean. Mount it only around the surfaces that need it: a fresh mount
   * re-reads the stored copy, whereas a long-lived provider would hold stale state and
   * overwrite the other side's decisions on its next write.
   */
  ownerId?: string;
  /** Status given to files added through this provider. Admin uploads pass "approved". */
  initialFileStatus?: FileStatus;
  /** Moves the pre-ownership key into this owner's key on first load (participant side only). */
  migrateLegacy?: boolean;
};

export function FilesProvider({
  children,
  ownerId,
  initialFileStatus = "pending",
  migrateLegacy = false,
}: ProviderProps) {
  const [state, dispatch] = useReducer(filesReducer, undefined, emptyState);
  // Revision last written (or read); edits make `state.revision` run ahead of it.
  const persistedRevision = useRef(0);
  const latestRevision = useRef(0);
  const writesInFlight = useRef(0);
  const hydrated = useRef(false);
  const reading = useRef(false);

  // Hydrate once; a failure just means starting empty.
  useEffect(() => {
    let cancelled = false;
    loadFiles(ownerId, { migrateLegacy })
      .catch(() => ({}))
      .then((folders) => {
        if (!cancelled) dispatch({ type: "hydrate", folders });
      });
    return () => {
      cancelled = true;
    };
  }, [ownerId, migrateLegacy]);

  // Persist user edits only, and never before hydration (it would wipe the stored copy).
  // Hydrate/refresh don't bump the revision, so re-reading can't echo back as a write.
  // The write starts in the commit effect and IndexedDB finishes it after unmount.
  useEffect(() => {
    hydrated.current = state.hydrated;
    latestRevision.current = state.revision;
    if (!state.hydrated || state.revision === persistedRevision.current) return;
    persistedRevision.current = state.revision;
    writesInFlight.current += 1;
    set(filesKey(ownerId), state.folders)
      .then(() => {
        // Only once the data is readable by other surfaces.
        window.dispatchEvent(new Event(FILES_CHANGED_EVENT));
      })
      .catch(() => {
        /* quota or private mode: files stay in memory for this session */
      })
      .finally(() => {
        writesInFlight.current -= 1;
      });
  }, [state.folders, state.hydrated, state.revision, ownerId]);

  // Two-tab freshness: when the window comes back, adopt what the other tab saved. Skipped
  // while a write is pending or in flight, and dropped if an edit lands during the read.
  useEffect(() => {
    const idle = () =>
      hydrated.current &&
      writesInFlight.current === 0 &&
      latestRevision.current === persistedRevision.current;
    const refresh = () => {
      if (document.visibilityState === "hidden" || reading.current || !idle()) return;
      reading.current = true;
      const seen = latestRevision.current;
      loadFiles(ownerId)
        .then((folders) => {
          if (idle() && latestRevision.current === seen) dispatch({ type: "refresh", folders });
        })
        .catch(() => {})
        .finally(() => {
          reading.current = false;
        });
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [ownerId]);

  const addFiles = useCallback((folder: FolderKey, files: File[]) => {
    const { accepted, rejected } = createEntries(files, {
      makeId: () => crypto.randomUUID(),
      now: () => Date.now(),
      status: initialFileStatus,
    });
    if (accepted.length > 0) dispatch({ type: "add", folder, entries: accepted });
    return rejected;
  }, [initialFileStatus]);

  const removeFile = useCallback((folder: FolderKey, id: string) => {
    dispatch({ type: "remove", folder, id });
  }, []);

  const setFileStatus = useCallback((folder: FolderKey, id: string, status: FileStatus) => {
    dispatch({ type: "setStatus", folder, id, status, at: Date.now() });
  }, []);

  const setFileComment = useCallback((folder: FolderKey, id: string, comment: string) => {
    dispatch({ type: "setComment", folder, id, comment, at: Date.now() });
  }, []);

  const value = useMemo(
    () => ({ state, addFiles, removeFile, setFileStatus, setFileComment }),
    [state, addFiles, removeFile, setFileStatus, setFileComment],
  );
  return <FilesContext.Provider value={value}>{children}</FilesContext.Provider>;
}

export function useFiles(): Value {
  const ctx = useContext(FilesContext);
  if (!ctx) throw new Error("useFiles must be used inside <FilesProvider>");
  return ctx;
}

export function useFolderFiles(folder: FolderKey): StoredFile[] {
  return folderFiles(useFiles().state, folder);
}
