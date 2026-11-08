import { MAX_FILE_BYTES } from "./constants";
import type { FolderKey } from "./folders";

export type FileStatus = "pending" | "approved" | "rejected";

export type StoredFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  addedAt: number;
  blob: Blob;
  status: FileStatus;
  /** When the admin last decided (approved/rejected). Absent on files nobody has reviewed. */
  reviewedAt?: number;
  /** The admin's note to the participant; absent when there is none. */
  comment?: string;
  commentedAt?: number;
};

type StoredFileInput = Omit<StoredFile, "status"> & { status?: FileStatus };

export type FilesState = {
  folders: Record<FolderKey, StoredFile[]>;
  /** True once the persisted copy has been read (or failed to). */
  hydrated: boolean;
  /** Counts user edits only (not hydrate/refresh), so persistence knows when there is something to write. */
  revision: number;
};

export type FilesAction =
  | { type: "add"; folder: FolderKey; entries: StoredFile[] }
  | { type: "remove"; folder: FolderKey; id: string }
  /** `at` is the decision time, passed in so the reducer stays pure. */
  | { type: "setStatus"; folder: FolderKey; id: string; status: FileStatus; at: number }
  /** Empty (after trimming) clears the comment. `at` is the time of the edit. */
  | { type: "setComment"; folder: FolderKey; id: string; comment: string; at: number }
  | { type: "hydrate"; folders: StoredFolders }
  /** Re-read from storage while mounted: replaces the files without counting as an edit. */
  | { type: "refresh"; folders: StoredFolders };

export type StoredFolders = Partial<Record<FolderKey, StoredFileInput[]>>;

const NO_FILES: StoredFile[] = [];

/** Files of one folder; a folder absent from the map is simply empty. */
export function folderFiles(state: FilesState, folder: FolderKey): StoredFile[] {
  return state.folders[folder] ?? NO_FILES;
}

export function emptyState(): FilesState {
  return { folders: {}, hydrated: false, revision: 0 };
}

/** Files stored before review existed have no status; they count as pending. */
export function normalizeFolders(stored: StoredFolders): Record<FolderKey, StoredFile[]> {
  const out: Record<FolderKey, StoredFile[]> = {};
  for (const [folder, files] of Object.entries(stored)) {
    if (!files) continue;
    out[folder] = files.map((f) => (f.status ? (f as StoredFile) : { ...f, status: "pending" }));
  }
  return out;
}

/** Pending files across every folder, including folders hidden from the participant. */
export function countPending(state: { folders: StoredFolders }): number {
  let total = 0;
  for (const files of Object.values(state.folders)) {
    for (const f of files ?? []) if (!f.status || f.status === "pending") total += 1;
  }
  return total;
}

function sameFolders(a: Record<FolderKey, StoredFile[]>, b: Record<FolderKey, StoredFile[]>): boolean {
  const keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) return false;
  return keys.every((key) => {
    const x = a[key];
    const y = b[key];
    return (
      y !== undefined &&
      x.length === y.length &&
      x.every(
        (f, i) =>
          f.id === y[i].id &&
          f.status === y[i].status &&
          f.reviewedAt === y[i].reviewedAt &&
          f.comment === y[i].comment &&
          f.commentedAt === y[i].commentedAt,
      )
    );
  });
}

export function filesReducer(state: FilesState, action: FilesAction): FilesState {
  switch (action.type) {
    case "add": {
      const accepted = action.entries.filter((e) => e.size <= MAX_FILE_BYTES);
      if (accepted.length === 0) return state;
      return {
        ...state,
        revision: state.revision + 1,
        folders: {
          ...state.folders,
          // Newest first.
          [action.folder]: [...accepted.slice().reverse(), ...folderFiles(state, action.folder)],
        },
      };
    }
    case "remove": {
      const current = folderFiles(state, action.folder);
      if (!current.some((f) => f.id === action.id)) return state;
      return {
        ...state,
        revision: state.revision + 1,
        folders: { ...state.folders, [action.folder]: current.filter((f) => f.id !== action.id) },
      };
    }
    case "setStatus": {
      const current = folderFiles(state, action.folder);
      if (!current.some((f) => f.id === action.id)) return state;
      return {
        ...state,
        revision: state.revision + 1,
        folders: {
          ...state.folders,
          [action.folder]: current.map((f) => (f.id === action.id ? { ...f, status: action.status, reviewedAt: action.at } : f)),
        },
      };
    }
    case "setComment": {
      const current = folderFiles(state, action.folder);
      const target = current.find((f) => f.id === action.id);
      if (!target) return state;
      const comment = action.comment.trim();
      if (comment === (target.comment ?? "")) return state;
      return {
        ...state,
        revision: state.revision + 1,
        folders: {
          ...state.folders,
          [action.folder]: current.map((f) => {
            if (f.id !== action.id) return f;
            // An empty comment removes both fields so the file looks as if never commented.
            const next: StoredFile = { ...f };
            delete next.comment;
            delete next.commentedAt;
            return comment ? { ...next, comment, commentedAt: action.at } : next;
          }),
        },
      };
    }
    case "hydrate":
      return { ...state, folders: normalizeFolders(action.folders), hydrated: true };
    case "refresh": {
      const folders = normalizeFolders(action.folders);
      return sameFolders(state.folders, folders) ? state : { ...state, folders };
    }
  }
}

/** Turns picked/dropped files into store entries, splitting off the ones over the cap. */
export function createEntries(
  files: readonly File[],
  deps: { makeId: () => string; now: () => number; status?: FileStatus },
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
      status: deps.status ?? "pending",
    });
  }
  return { accepted, rejected };
}
