import { describe, expect, it } from "vitest";

import type { StoredFile } from "@/lib/files/reducer";

import { deriveAdminNotifications, deriveParticipantNotifications, isParticipantUpload } from "./derive";

const file = (id: string, extra: Partial<StoredFile> = {}): StoredFile => ({
  id,
  name: `${id}.png`,
  size: 1,
  type: "image/png",
  addedAt: 100,
  blob: new Blob(["x"]),
  status: "pending",
  ...extra,
});

describe("isParticipantUpload", () => {
  it("is true while pending and stays true after a decision", () => {
    expect(isParticipantUpload(file("a"))).toBe(true);
    expect(isParticipantUpload(file("a", { status: "approved", reviewedAt: 5 }))).toBe(true);
  });
  it("is false for an admin upload (approved, never reviewed)", () => {
    expect(isParticipantUpload(file("a", { status: "approved" }))).toBe(false);
  });
});

describe("deriveParticipantNotifications", () => {
  it("merges a decision and a later comment into one notification", () => {
    const out = deriveParticipantNotifications(
      { logos: [file("a", { status: "approved", reviewedAt: 200, comment: "ok", commentedAt: 300 })] },
      "p-01",
    );
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ kind: "approved", folder: "logos", participantId: "p-01", fileName: "a.png", at: 300 });
    expect(out[0].title).toContain("aprobado con un comentario");
    expect(out[0].id).toContain("200");
    expect(out[0].id).toContain("300");
  });

  it("merges a rejection and an earlier comment into one notification at the decision time", () => {
    const out = deriveParticipantNotifications(
      { logos: [file("a", { status: "rejected", reviewedAt: 500, comment: "no", commentedAt: 400 })] },
      "p-01",
    );
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ kind: "rejected", at: 500 });
    expect(out[0].title).toContain("rechazado con un comentario");
  });

  it("emits one notification when decision and comment share a timestamp", () => {
    const out = deriveParticipantNotifications(
      { logos: [file("a", { status: "approved", reviewedAt: 200, comment: "ok", commentedAt: 200 })] },
      "p-01",
    );
    expect(out).toHaveLength(1);
    expect(out[0].at).toBe(200);
  });

  it("keeps a comment on a pending file as a commented notification", () => {
    const out = deriveParticipantNotifications(
      { logos: [file("a", { comment: "hola", commentedAt: 300 })] },
      "p-01",
    );
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ kind: "commented", at: 300, id: "commented:a:300" });
  });

  it("changes the id when a decided file gets a new comment", () => {
    const decided = { status: "approved", reviewedAt: 200 } as const;
    const first = deriveParticipantNotifications({ l: [file("a", { ...decided, comment: "x", commentedAt: 300 })] }, "p");
    const second = deriveParticipantNotifications({ l: [file("a", { ...decided, comment: "y", commentedAt: 400 })] }, "p");
    expect(first[0].id).not.toBe(second[0].id);
  });

  it("reports rejections", () => {
    const out = deriveParticipantNotifications({ logos: [file("a", { status: "rejected", reviewedAt: 9 })] }, "p-01");
    expect(out[0]).toMatchObject({ kind: "rejected", at: 9 });
  });

  it("ignores pending files and admin uploads without a decision", () => {
    expect(
      deriveParticipantNotifications(
        { logos: [file("a"), file("b", { status: "approved" })] },
        "p-01",
      ),
    ).toEqual([]);
  });

  it("gives a re-decision and a new comment fresh ids", () => {
    const before = deriveParticipantNotifications({ l: [file("a", { status: "approved", reviewedAt: 1 })] }, "p");
    const after = deriveParticipantNotifications({ l: [file("a", { status: "rejected", reviewedAt: 2 })] }, "p");
    expect(before[0].id).not.toBe(after[0].id);
  });

  it("sorts newest first across folders", () => {
    const out = deriveParticipantNotifications(
      {
        a: [file("x", { status: "approved", reviewedAt: 10 })],
        b: [file("y", { status: "approved", reviewedAt: 30 })],
        c: [file("z", { status: "rejected", reviewedAt: 20 })],
      },
      "p",
    );
    expect(out.map((n) => n.at)).toEqual([30, 20, 10]);
  });
});

describe("deriveAdminNotifications", () => {
  const owners = [
    { participantId: "p-01", name: "Ana Pérez", folders: { logos: [file("a", { addedAt: 10 })] } },
    {
      participantId: "p-02",
      name: "Luis Gómez",
      folders: {
        logos: [
          file("b", { addedAt: 50, status: "approved", reviewedAt: 60 }),
          file("c", { addedAt: 70, status: "approved" }),
        ],
      },
    },
  ];

  it("lists participant uploads only, including already-decided ones, newest first", () => {
    const out = deriveAdminNotifications(owners);
    expect(out.map((n) => n.fileName)).toEqual(["b.png", "a.png"]);
    expect(out.every((n) => n.kind === "uploaded")).toBe(true);
    expect(out[0]).toMatchObject({ participantId: "p-02", folder: "logos", at: 50 });
  });

  it("puts the participant name in the title", () => {
    expect(deriveAdminNotifications(owners)[1].title).toContain("Ana Pérez");
  });

  it("keeps the id stable when the admin decides later", () => {
    const pending = deriveAdminNotifications([owners[0]])[0];
    const decided = deriveAdminNotifications([
      { ...owners[0], folders: { logos: [file("a", { addedAt: 10, status: "approved", reviewedAt: 99 })] } },
    ])[0];
    expect(decided.id).toBe(pending.id);
  });
});
