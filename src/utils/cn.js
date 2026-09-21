/**
 * Joins class names, dropping falsy values.
 * Keeps conditional Tailwind lists readable without pulling in a dependency.
 */
export function cn(...values) {
  return values.filter(Boolean).join(' ');
}
