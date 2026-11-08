import { describe, expect, it } from "vitest";

import { notificationHref } from "./destination";
import type { Notification } from "./types";

const n = (over: Partial<Notification>): Notification => ({
  id: "x",
  kind: "approved",
  title: "t",
  fileName: "f.png",
  folder: "logos",
  participantId: "p-01",
  at: 1,
  ...over,
});

describe("notificationHref", () => {
  it("sends the participant to their folder page", () => {
    expect(notificationHref(n({}), "participant")).toBe("/documentos/logos");
  });
  it("sends the admin to the participant's folder page", () => {
    expect(notificationHref(n({ participantId: "p-02" }), "admin")).toBe(
      "/admin/participantes/p-02/documentos/logos",
    );
  });
});
