export type NotificationKind = "uploaded" | "approved" | "rejected" | "commented";

/** Who is looking at the bell; there is no auth, the route decides. */
export type Audience = "participant" | "admin";

export type Notification = {
  /** Stable per event: a new comment or re-decision on the same file gets a new id. */
  id: string;
  kind: NotificationKind;
  title: string;
  fileName: string;
  /** Folder key (requirement id), also the route segment. */
  folder: string;
  participantId: string;
  /** When the event happened (ms since epoch). */
  at: number;
};
