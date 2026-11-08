import { beforeEach, describe, expect, it, vi } from "vitest";

const db = new Map<string, unknown>();
vi.mock("idb-keyval", () => ({
  get: async (k: string) => db.get(k),
  set: async (k: string, v: unknown) => void db.set(k, v),
  del: async (k: string) => void db.delete(k),
}));

import { filesKey, LEGACY_FILES_KEY, loadFiles, loadPendingCounts } from "./persistence";

const file = (id: string, status?: string) => ({
  id,
  name: `${id}.png`,
  size: 1,
  type: "image/png",
  addedAt: 1,
  blob: new Blob(["x"]),
  ...(status ? { status } : {}),
});

describe("filesKey", () => {
  it("scopes by owner", () => {
    expect(filesKey("p-01")).toBe("artbo:files:v1:p-01");
    expect(LEGACY_FILES_KEY).toBe("artbo:files:v1");
  });
});

describe("loadFiles with legacy migration", () => {
  beforeEach(() => db.clear());

  it("moves legacy data to the owned key as pending and deletes the legacy key", async () => {
    db.set(LEGACY_FILES_KEY, { logos: [file("a", "approved")] });
    const folders = await loadFiles("p-01", { migrateLegacy: true });
    expect(folders.logos[0].status).toBe("pending");
    expect((db.get(filesKey("p-01")) as { logos: { status: string }[] }).logos[0].status).toBe("pending");
    expect(db.has(LEGACY_FILES_KEY)).toBe(false);
  });

  it("keeps review and comment fields through the migration", async () => {
    db.set(LEGACY_FILES_KEY, { logos: [{ ...file("a"), reviewedAt: 5, comment: "ok", commentedAt: 6 }] });
    const folders = await loadFiles("p-01", { migrateLegacy: true });
    expect(folders.logos[0]).toMatchObject({ reviewedAt: 5, comment: "ok", commentedAt: 6 });
  });

  it("does not overwrite existing owned data and leaves legacy alone", async () => {
    db.set(filesKey("p-01"), { logos: [file("owned", "approved")] });
    db.set(LEGACY_FILES_KEY, { logos: [file("old")] });
    const folders = await loadFiles("p-01", { migrateLegacy: true });
    expect(folders.logos.map((f) => f.id)).toEqual(["owned"]);
    expect(db.get(filesKey("p-01"))).toEqual({ logos: [expect.objectContaining({ id: "owned" })] });
  });

  it("is idempotent", async () => {
    db.set(LEGACY_FILES_KEY, { logos: [file("a")] });
    await loadFiles("p-01", { migrateLegacy: true });
    const second = await loadFiles("p-01", { migrateLegacy: true });
    expect(second.logos.map((f) => f.id)).toEqual(["a"]);
    expect(db.has(LEGACY_FILES_KEY)).toBe(false);
  });

  it("ignores an empty legacy key and does not migrate unless asked", async () => {
    db.set(LEGACY_FILES_KEY, { logos: [] });
    expect(await loadFiles("p-01", { migrateLegacy: true })).toEqual({});
    expect(db.has(filesKey("p-01"))).toBe(false);
    db.set(LEGACY_FILES_KEY, { logos: [file("a")] });
    expect(await loadFiles("p-01")).toEqual({});
    expect(db.has(LEGACY_FILES_KEY)).toBe(true);
  });

  it("reads an owner key without writing anything", async () => {
    db.set(filesKey("p-02"), { logos: [file("a")] });
    const folders = await loadFiles("p-02");
    expect(folders.logos[0].status).toBe("pending");
  });
});

describe("loadPendingCounts", () => {
  beforeEach(() => db.clear());

  it("counts pending files per owner across folders without writing", async () => {
    db.set(filesKey("p-01"), { logos: [file("a"), file("b", "approved")], oculta: [file("c")] });
    db.set(filesKey("p-02"), { logos: [file("d", "rejected")] });
    const writes = vi.spyOn(Map.prototype, "set");
    const counts = await loadPendingCounts(["p-01", "p-02", "p-03"]);
    expect(counts).toEqual({ "p-01": 2, "p-02": 0, "p-03": 0 });
    expect(writes).not.toHaveBeenCalled();
    writes.mockRestore();
  });
});
