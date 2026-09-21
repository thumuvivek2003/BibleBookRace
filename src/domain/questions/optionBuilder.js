import { shuffle } from '@/utils/random.js';

/**
 * Builds the shuffled option list shared by every multiple-choice generator.
 * Keeping it here means a new question type never re-implements shuffling,
 * id-ing or "which one is correct" bookkeeping.
 *
 * @template T
 * @param {object} params
 * @param {string} params.kind       one of OPTION_KIND
 * @param {T} params.correct         the correct value
 * @param {readonly T[]} params.distractors
 * @param {(value: T) => string} [params.idOf]
 * @param {import('@/utils/random.js').Rng} [params.rng]
 */
export function buildChoices({ kind, correct, distractors, idOf = String, rng }) {
  const correctId = idOf(correct);
  const seen = new Set([correctId]);
  const options = [{ id: correctId, kind, value: correct }];

  distractors.forEach((value) => {
    const id = idOf(value);
    if (seen.has(id)) return;
    seen.add(id);
    options.push({ id, kind, value });
  });

  return { options: shuffle(options, rng), correctOptionId: correctId };
}
