import { MAX_FILE_BYTES } from "./constants";
import { FOLDER_KEYS, type FolderKey } from "./folders";

export type StoredFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  addedAt: number;
  blob: Blob;
};

export type FilesState = {
  folders: Record<FolderKey, StoredFile[]>;
  /** True once the persisted copy has been read (or failed to). */
  hydrated: boolean;
};

export type FilesAction =
  | { type: "add"; folder: FolderKey; entries: StoredFile[] }
  | { type: "remove"; folder: FolderKey; id: string }
  | { type: "hydrate"; folders: Partial<Record<FolderKey, StoredFile[]>> };

export function emptyFolders(): Record<FolderKey, StoredFile[]> {
  return Object.fromEntries(FOLDER_KEYS.map((k) => [k, []])) as unknown as Record<
    FolderKey,
    StoredFile[]
  >;
}

export function emptyState(): FilesState {
  return { folders: emptyFolders(), hydrated: false };
}

export function filesReducer(state: FilesState, action: FilesAction): FilesState {
  switch (action.type) {
    case "add": {
      const accepted = action.entries.filter((e) => e.size <= MAX_FILE_BYTES);
      if (accepted.length === 0) return state;
      return {
        ...state,
        folders: {
          ...state.folders,
          // Newest first.
          [action.folder]: [...accepted.slice().reverse(), ...state.folders[action.folder]],
        },
      };
    }
    case "remove": {
      const current = state.folders[action.folder];
      if (!current.some((f) => f.id === action.id)) return state;
      return {
        ...state,
        folders: { ...state.folders, [action.folder]: current.filter((f) => f.id !== action.id) },
      };
    }
    case "hydrate":
      return { folders: { ...emptyFolders(), ...action.folders }, hydrated: true };
  }
}

/** Turns picked/dropped files into store entries, splitting off the ones over the cap. */
export function createEntries(
  files: readonly File[],
  deps: { makeId: () => string; now: () => number },
): { accepted: StoredFile[]; rejected: File[] } {
  const accepted: StoredFile[] = [];
  const rejected: File[] = [];
  for (const file of files) {
    if (file.size > MAX_FILE_BYTES) {
      rejected.push(file);
      continue;
    }
    accepted.push({
      id: deps.makeId(),
      name: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
      addedAt: deps.now(),
      blob: file,
    });
  }
  return { accepted, rejected };
}
