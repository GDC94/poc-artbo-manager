/**
 * Splits a full name as admin stores it ("Valentina Ospina Duarte") into the
 * first/last pair the profile and greeting use. Whitespace is collapsed; the
 * first token is the first name and everything after it is the last name.
 */
export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const [firstName = "", ...rest] = fullName.trim().split(/\s+/).filter(Boolean);
  return { firstName, lastName: rest.join(" ") };
}
