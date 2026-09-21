/**
 * Randomness is isolated here so game logic stays deterministic and testable:
 * every generator accepts an injectable `rng` (Dependency Inversion).
 */

/** @typedef {() => number} Rng A function returning a float in [0, 1). */

/** @type {Rng} */
export const defaultRng = () => Math.random();

/**
 * Deterministic pseudo random generator (mulberry32) - used by tests and by
 * the "daily session" so the same day always yields the same warm-up.
 * @param {number} seed
 * @returns {Rng}
 */
export function createSeededRng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * @param {number} maxExclusive
 * @param {Rng} [rng]
 */
export function randomInt(maxExclusive, rng = defaultRng) {
  return Math.floor(rng() * maxExclusive);
}

/**
 * @template T
 * @param {readonly T[]} items
 * @param {Rng} [rng]
 * @returns {T | undefined}
 */
export function pickOne(items, rng = defaultRng) {
  if (!items.length) return undefined;
  return items[randomInt(items.length, rng)];
}

/**
 * Fisher-Yates on a copy - never mutates the input.
 * @template T
 * @param {readonly T[]} items
 * @param {Rng} [rng]
 * @returns {T[]}
 */
export function shuffle(items, rng = defaultRng) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1, rng);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * @template T
 * @param {readonly T[]} items
 * @param {number} count
 * @param {Rng} [rng]
 * @returns {T[]}
 */
export function pickMany(items, count, rng = defaultRng) {
  return shuffle(items, rng).slice(0, Math.max(0, count));
}

/**
 * Picks `count` distinct items, preferring those the caller ranks first but
 * keeping some variety.
 * @template T
 * @param {readonly T[]} pool
 * @param {readonly T[]} exclude
 * @param {number} count
 * @param {Rng} [rng]
 */
export function pickManyExcluding(pool, exclude, count, rng = defaultRng) {
  const blocked = new Set(exclude);
  return pickMany(
    pool.filter((item) => !blocked.has(item)),
    count,
    rng,
  );
}
