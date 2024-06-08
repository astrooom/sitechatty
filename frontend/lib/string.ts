/**
 * Capitalizes the first letter of a given string.
 * 
 * @param str - The string to be capitalized.
 * @returns The capitalized string.
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export default capitalize;