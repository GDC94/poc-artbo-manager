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
  it("is false for a legacy admin upload (approved, never reviewed, no source)", () => {
    expect(isParticipantUpload(file("a", { status: "approved" }))).toBe(false);
  });
  it("trusts uploadedBy over status when present", () => {
    expect(isParticipantUpload(file("a", { uploadedBy: "participant", status: "approved" }))).toBe(true);
    expect(isParticipantUpload(file("a", { uploadedBy: "admin", status: "pending" }))).toBe(false);
    // An admin upload the admin later re-decided is still an admin upload.
    expect(isParticipantUpload(file("a", { uploadedBy: "admin", status: "rejected", reviewedAt: 9 }))).toBe(false);
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

  it("emits no decision or comment notifications for admin uploads", () => {
    const out = deriveParticipantNotifications(
      { logos: [file("a", { uploadedBy: "admin", status: "rejected", reviewedAt: 9, comment: "x", commentedAt: 10 })] },
      "p-01",
    );
    expect(out).toEqual([]);
  });

  it("notifies about a deletion request approved or rejected by the admin", () => {
    const approved = deriveParticipantNotifications(
      { logos: [file("a", { status: "approved", deletionRequest: { status: "approved", requestedAt: 5, resolvedAt: 50 } })] },
      "p-01",
    );
    expect(approved).toHaveLength(1);
    expect(approved[0]).toMatchObject({
      kind: "deletion_approved",
      at: 50,
      title: "Puedes eliminar a.png: tu solicitud fue aprobada",
      fileName: "a.png",
      folder: "logos",
      participantId: "p-01",
    });
    expect(approved[0].id).toContain("a");
    expect(approved[0].id).toContain("50");
    const rejected = deriveParticipantNotifications(
      { logos: [file("a", { status: "approved", deletionRequest: { status: "rejected", requestedAt: 5, resolvedAt: 60 } })] },
      "p-01",
    );
    expect(rejected[0]).toMatchObject({ kind: "deletion_rejected", at: 60, title: "Tu solicitud para eliminar a.png fue rechazada" });
  });

  it("adds the deletion notification next to the decision one, including for admin uploads", () => {
    const request = { status: "approved", requestedAt: 5, resolvedAt: 50 } as const;
    const participantFile = deriveParticipantNotifications(
      { l: [file("a", { status: "approved", reviewedAt: 20, deletionRequest: request })] },
      "p",
    );
    expect(participantFile.map((n) => n.kind).sort()).toEqual(["approved", "deletion_approved"]);
    const adminFile = deriveParticipantNotifications(
      { l: [file("b", { uploadedBy: "admin", status: "approved", deletionRequest: request })] },
      "p",
    );
    expect(adminFile.map((n) => n.kind)).toEqual(["deletion_approved"]);
  });

  it("does not notify the participant while a request is still waiting", () => {
    expect(
      deriveParticipantNotifications(
        { l: [file("a", { status: "approved", deletionRequest: { status: "requested", requestedAt: 5 } })] },
        "p",
      ).filter((n) => n.kind.startsWith("deletion")),
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

describe("deriveAdminNotifications for deletion requests", () => {
  const request = { status: "requested", requestedAt: 80 } as const;
  const owner = (f: StoredFile) => [{ participantId: "p-01", name: "Ana Pérez", folders: { logos: [f] } }];

  it("lists a pending request, titled with the participant and file, at the request time", () => {
    const out = deriveAdminNotifications(owner(file("a", { addedAt: 10, uploadedBy: "participant", status: "approved", deletionRequest: request })));
    const n = out.find((x) => x.kind === "deletion_requested");
    expect(n).toMatchObject({
      title: "Ana Pérez solicitó eliminar a.png",
      at: 80,
      fileName: "a.png",
      folder: "logos",
      participantId: "p-01",
    });
    expect(n?.id).toContain("a");
    expect(n?.id).toContain("80");
    // The upload notification stays.
    expect(out.some((x) => x.kind === "uploaded")).toBe(true);
  });

  it("also applies to admin uploads, but not to the upload notification", () => {
    const out = deriveAdminNotifications(
      owner(file("a", { uploadedBy: "admin", status: "approved", deletionRequest: request })),
    );
    expect(out.map((n) => n.kind)).toEqual(["deletion_requested"]);
  });

  it("drops it once resolved, and gives a new request a new id", () => {
    const resolved = deriveAdminNotifications(
      owner(file("a", { uploadedBy: "admin", status: "approved", deletionRequest: { ...request, status: "approved", resolvedAt: 90 } })),
    );
    expect(resolved).toEqual([]);
    const first = deriveAdminNotifications(owner(file("a", { uploadedBy: "admin", status: "approved", deletionRequest: request })));
    const second = deriveAdminNotifications(
      owner(file("a", { uploadedBy: "admin", status: "approved", deletionRequest: { ...request, requestedAt: 99 } })),
    );
    expect(first[0].id).not.toBe(second[0].id);
  });
});
