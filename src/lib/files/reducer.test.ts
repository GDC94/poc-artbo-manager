import { describe, expect, it } from "vitest";
import { MAX_FILE_BYTES } from "./constants";
import {
  countPending,
  createEntries,
  emptyState,
  filesReducer,
  folderFiles,
  type StoredFile,
} from "./reducer";

const entry = (id: string, size = 10): StoredFile => ({
  id,
  name: `${id}.png`,
  size,
  type: "image/png",
  addedAt: 1,
  blob: new Blob(["x"]),
  status: "pending",
});

describe("filesReducer", () => {
  it("starts with no files in any folder", () => {
    expect(folderFiles(emptyState(), "imagenes")).toEqual([]);
    expect(folderFiles(emptyState(), "plantillas")).toEqual([]);
  });

  it("treats a folder absent from the map as empty and lets it receive files", () => {
    const state = emptyState();
    expect(folderFiles(state, "contratos")).toEqual([]);
    const added = filesReducer(state, { type: "add", folder: "contratos", entries: [entry("a")] });
    expect(folderFiles(added, "contratos").map((f) => f.id)).toEqual(["a"]);
    expect(filesReducer(state, { type: "remove", folder: "nada", id: "x" })).toBe(state);
  });

  it("keeps stored files for folders it does not know on hydrate", () => {
    const next = filesReducer(emptyState(), { type: "hydrate", folders: { viejo: [entry("a")] } });
    expect(folderFiles(next, "viejo")).toHaveLength(1);
  });

  it("adds entries to a folder without touching others", () => {
    const next = filesReducer(emptyState(), { type: "add", folder: "logos", entries: [entry("a")] });
    expect(next.folders.logos.map((f) => f.id)).toEqual(["a"]);
    expect(folderFiles(next, "imagenes")).toEqual([]);
  });

  it("puts the newest entries first", () => {
    let state = filesReducer(emptyState(), { type: "add", folder: "logos", entries: [entry("a")] });
    state = filesReducer(state, { type: "add", folder: "logos", entries: [entry("b")] });
    expect(state.folders.logos.map((f) => f.id)).toEqual(["b", "a"]);
  });

  it("drops entries over the per-file limit", () => {
    const next = filesReducer(emptyState(), {
      type: "add",
      folder: "logos",
      entries: [entry("big", MAX_FILE_BYTES + 1), entry("ok", MAX_FILE_BYTES)],
    });
    expect(next.folders.logos.map((f) => f.id)).toEqual(["ok"]);
  });

  it("removes one entry by id", () => {
    let state = filesReducer(emptyState(), {
      type: "add",
      folder: "logos",
      entries: [entry("a"), entry("b")],
    });
    state = filesReducer(state, { type: "remove", folder: "logos", id: "a" });
    expect(state.folders.logos.map((f) => f.id)).toEqual(["b"]);
  });

  it("ignores removal of an unknown id", () => {
    const state = filesReducer(emptyState(), { type: "add", folder: "logos", entries: [entry("a")] });
    expect(filesReducer(state, { type: "remove", folder: "logos", id: "zzz" })).toBe(state);
  });

  it("hydrates from persisted folders, filling missing ones", () => {
    const next = filesReducer(emptyState(), {
      type: "hydrate",
      folders: { iconos: [entry("i")] },
    });
    expect(next.folders.iconos.map((f) => f.id)).toEqual(["i"]);
    expect(folderFiles(next, "logos")).toEqual([]);
    expect(next.hydrated).toBe(true);
  });
});

describe("createEntries", () => {
  it("splits accepted and rejected files by size", () => {
    const small = new File(["abc"], "a.txt", { type: "text/plain" });
    const huge = { name: "huge.bin", size: MAX_FILE_BYTES + 1, type: "" } as File;
    let n = 0;
    const { accepted, rejected } = createEntries([small, huge], {
      makeId: () => `id-${++n}`,
      now: () => 42,
    });
    expect(accepted).toHaveLength(1);
    expect(accepted[0]).toMatchObject({ id: "id-1", name: "a.txt", size: 3, addedAt: 42 });
    expect(rejected.map((f) => f.name)).toEqual(["huge.bin"]);
  });

  it("falls back to a generic mime type", () => {
    const f = new File(["abc"], "a.bin");
    const { accepted } = createEntries([f], { makeId: () => "x", now: () => 0 });
    expect(accepted[0].type).toBe("application/octet-stream");
  });
});

describe("file review status", () => {
  const legacy = (id: string) => {
    const withoutStatus: Partial<StoredFile> = entry(id);
    delete withoutStatus.status;
    return withoutStatus as StoredFile;
  };

  it("hydrates stored files without a status as pending", () => {
    const next = filesReducer(emptyState(), { type: "hydrate", folders: { logos: [legacy("a")] } });
    expect(next.folders.logos[0].status).toBe("pending");
  });

  it("keeps a stored decision on hydrate", () => {
    const next = filesReducer(emptyState(), {
      type: "hydrate",
      folders: { logos: [{ ...entry("a"), status: "approved" }] },
    });
    expect(next.folders.logos[0].status).toBe("approved");
  });

  it("sets the status of one file", () => {
    let state = filesReducer(emptyState(), { type: "add", folder: "logos", entries: [entry("a"), entry("b")] });
    state = filesReducer(state, { type: "setStatus", folder: "logos", id: "a", status: "rejected", at: 50 });
    expect(Object.fromEntries(state.folders.logos.map((f) => [f.id, f.status]))).toEqual({
      a: "rejected",
      b: "pending",
    });
  });

  it("ignores a status change for an unknown id or folder", () => {
    const state = filesReducer(emptyState(), { type: "add", folder: "logos", entries: [entry("a")] });
    expect(filesReducer(state, { type: "setStatus", folder: "logos", id: "zzz", status: "approved", at: 1 })).toBe(state);
    expect(filesReducer(state, { type: "setStatus", folder: "nada", id: "a", status: "approved", at: 1 })).toBe(state);
  });

  it("stamps reviewedAt when a decision is recorded", () => {
    let state = filesReducer(emptyState(), { type: "add", folder: "logos", entries: [entry("a")] });
    state = filesReducer(state, { type: "setStatus", folder: "logos", id: "a", status: "approved", at: 77 });
    expect(state.folders.logos[0]).toMatchObject({ status: "approved", reviewedAt: 77 });
  });

  it("sets a trimmed comment with its timestamp", () => {
    let state = filesReducer(emptyState(), { type: "add", folder: "logos", entries: [entry("a")] });
    state = filesReducer(state, { type: "setComment", folder: "logos", id: "a", comment: "  Falta fondo  ", at: 9 });
    expect(state.folders.logos[0]).toMatchObject({ comment: "Falta fondo", commentedAt: 9 });
    expect(state.revision).toBe(2);
  });

  it("clears the comment and its timestamp when the text is empty", () => {
    let state = filesReducer(emptyState(), { type: "add", folder: "logos", entries: [entry("a")] });
    state = filesReducer(state, { type: "setComment", folder: "logos", id: "a", comment: "Hola", at: 9 });
    state = filesReducer(state, { type: "setComment", folder: "logos", id: "a", comment: "   ", at: 10 });
    expect(state.folders.logos[0]).not.toHaveProperty("comment");
    expect(state.folders.logos[0]).not.toHaveProperty("commentedAt");
  });

  it("ignores a comment for an unknown file and an unchanged comment", () => {
    let state = filesReducer(emptyState(), { type: "add", folder: "logos", entries: [entry("a")] });
    expect(filesReducer(state, { type: "setComment", folder: "logos", id: "zzz", comment: "x", at: 1 })).toBe(state);
    state = filesReducer(state, { type: "setComment", folder: "logos", id: "a", comment: "x", at: 1 });
    expect(filesReducer(state, { type: "setComment", folder: "logos", id: "a", comment: " x ", at: 2 })).toBe(state);
  });

  it("keeps review and comment fields through hydrate", () => {
    const next = filesReducer(emptyState(), {
      type: "hydrate",
      folders: { logos: [{ ...entry("a"), status: "approved", reviewedAt: 5, comment: "ok", commentedAt: 6 }] },
    });
    expect(next.folders.logos[0]).toMatchObject({ reviewedAt: 5, comment: "ok", commentedAt: 6 });
  });

  it("refresh adopts a comment or decision made elsewhere", () => {
    const base = filesReducer(emptyState(), { type: "hydrate", folders: { logos: [entry("a")] } });
    const commented = filesReducer(base, {
      type: "refresh",
      folders: { logos: [{ ...entry("a"), comment: "hola", commentedAt: 3 }] },
    });
    expect(commented.folders.logos[0].comment).toBe("hola");
    const redecided = filesReducer(commented, {
      type: "refresh",
      folders: { logos: [{ ...entry("a"), comment: "hola", commentedAt: 3, reviewedAt: 4 }] },
    });
    expect(redecided.folders.logos[0].reviewedAt).toBe(4);
  });

  it("stamps new entries with the given status", () => {
    const file = new File(["x"], "a.png", { type: "image/png" });
    const deps = { makeId: () => "id", now: () => 1 };
    expect(createEntries([file], { ...deps, status: "approved" }).accepted[0].status).toBe("approved");
    expect(createEntries([file], deps).accepted[0].status).toBe("pending");
  });

  it("counts pending files across every folder", () => {
    const folders = {
      logos: [entry("a"), { ...entry("b"), status: "approved" as const }],
      oculta: [entry("c"), legacy("d"), { ...entry("e"), status: "rejected" as const }],
    };
    expect(countPending({ folders })).toBe(3);
    expect(countPending(emptyState())).toBe(0);
  });

  it("refresh replaces the files but keeps the write counter, and is a no-op when nothing changed", () => {
    const base = filesReducer(emptyState(), { type: "hydrate", folders: { logos: [entry("a")] } });
    const same = filesReducer(base, { type: "refresh", folders: { logos: [entry("a")] } });
    expect(same).toBe(base);
    const changed = filesReducer(base, {
      type: "refresh",
      folders: { logos: [{ ...entry("a"), status: "approved" }] },
    });
    expect(changed.folders.logos[0].status).toBe("approved");
    expect(changed.revision).toBe(base.revision);
  });

  it("bumps the revision only on user edits", () => {
    const hydrated = filesReducer(emptyState(), { type: "hydrate", folders: {} });
    const added = filesReducer(hydrated, { type: "add", folder: "logos", entries: [entry("a")] });
    expect(added.revision).toBe(hydrated.revision + 1);
    const decided = filesReducer(added, { type: "setStatus", folder: "logos", id: "a", status: "approved", at: 1 });
    expect(decided.revision).toBe(added.revision + 1);
  });
});
