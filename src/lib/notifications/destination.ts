import type { Audience, Notification } from "./types";

/** Folder page of the file: the participant's own, or the participant's folder as the admin sees it. */
export function notificationHref(notification: Notification, audience: Audience): string {
  return audience === "admin"
    ? `/admin/participantes/${notification.participantId}/documentos/${notification.folder}`
    : `/documentos/${notification.folder}`;
}
