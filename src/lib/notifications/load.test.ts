// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

const db = new Map<string, unknown>();
vi.mock("idb-keyval", () => ({
  get: async (k: string) => db.get(k),
  set: async (k: string, v: unknown) => void db.set(k, v),
  del: async (k: string) => void db.delete(k),
}));

import { PARTICIPANTS_KEY } from "@/lib/admin/storage";
import { filesKey } from "@/lib/files/persistence";
import { MOCK_USER } from "@/lib/mock/user";

import { loadNotifications } from "./load";

const stored = (id: string, extra: object = {}) => ({
  id,
  name: `${id}.png`,
  size: 1,
  type: "image/png",
  addedAt: 10,
  blob: new Blob(["x"]),
  status: "pending",
  ...extra,
});

const participant = (id: string, fullName: string) => ({
  id,
  fullName,
  type: "Galería",
  event: "ARTBO Feria",
  email: "a@b.c",
  institution: "X",
  phone: "1",
  city: "Bogotá",
  country: "Colombia",
});

describe("loadNotifications", () => {
  beforeEach(() => {
    db.clear();
    window.localStorage.clear();
  });

  it("derives the participant's decisions from their own files only", async () => {
    db.set(filesKey(MOCK_USER.participantId), { logos: [stored("a", { status: "approved", reviewedAt: 5 })] });
    db.set(filesKey("p-02"), { logos: [stored("b", { status: "approved", reviewedAt: 6 })] });
    const out = await loadNotifications("participant");
    expect(out.map((n) => n.fileName)).toEqual(["a.png"]);
  });

  it("derives admin uploads across the stored participant list", async () => {
    window.localStorage.setItem(
      PARTICIPANTS_KEY,
      JSON.stringify([participant("p-x", "Ana Pérez"), participant("p-y", "Luis Gómez")]),
    );
    db.set(filesKey("p-x"), { logos: [stored("a")] });
    db.set(filesKey("p-y"), { logos: [stored("b", { status: "approved" })] });
    const out = await loadNotifications("admin");
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ participantId: "p-x", kind: "uploaded" });
    expect(out[0].title).toContain("Ana Pérez");
  });

  it("falls back to the seeded participants when nothing is stored", async () => {
    const out = await loadNotifications("admin");
    expect(out).toEqual([]);
  });
});
