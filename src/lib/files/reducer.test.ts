import { describe, expect, it } from "vitest";
import { MAX_FILE_BYTES } from "./constants";
import { createEntries, emptyState, filesReducer, type StoredFile } from "./reducer";

const entry = (id: string, size = 10): StoredFile => ({
  id,
  name: `${id}.png`,
  size,
  type: "image/png",
  addedAt: 1,
  blob: new Blob(["x"]),
});

describe("filesReducer", () => {
  it("starts empty for every folder", () => {
    expect(emptyState().folders.imagenes).toEqual([]);
    expect(emptyState().folders.plantillas).toEqual([]);
  });

  it("adds entries to a folder without touching others", () => {
    const next = filesReducer(emptyState(), { type: "add", folder: "logos", entries: [entry("a")] });
    expect(next.folders.logos.map((f) => f.id)).toEqual(["a"]);
    expect(next.folders.imagenes).toEqual([]);
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
    expect(next.folders.logos).toEqual([]);
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
