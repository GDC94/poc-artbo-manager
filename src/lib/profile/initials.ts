/** "VO" for Valentina Ospina Duarte: the user's avatar is always their initials. */
export function getInitials(firstName: string, lastName: string): string {
  return [firstName, lastName]
    .map((name) => name.trim().charAt(0))
    .join("")
    .toUpperCase();
}
