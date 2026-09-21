/**
 * @template T
 * @param {readonly T[]} items
 * @param {(item: T) => string} keyOf
 * @returns {Record<string, T[]>}
 */
export function groupBy(items, keyOf) {
  return items.reduce((acc, item) => {
    const key = keyOf(item);
    (acc[key] ||= []).push(item);
    return acc;
  }, {});
}

/**
 * @template T
 * @param {readonly T[]} items
 * @param {number} size
 * @returns {T[][]}
 */
export function chunk(items, size) {
  const out = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/** @param {readonly number[]} values */
export function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/** @param {number} value @param {number} min @param {number} max */
export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/** True when two arrays hold the same values in the same order. */
export function sameOrder(a, b) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}
