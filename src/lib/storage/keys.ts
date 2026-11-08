/**
 * Storage key for data that can belong to a participant profile viewed by an admin.
 * No owner keeps the base key, so what the participant-side app already saved
 * keeps working; an owner id appends `:<id>` to isolate each participant's copy.
 */
export function ownerKey(base: string, ownerId?: string): string {
  return ownerId ? `${base}:${ownerId}` : base;
}
