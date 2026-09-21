import { QUESTION_TYPE } from '@/domain/questions/questionTypes.js';

/**
 * Level rules (game logic, therefore domain - `src/data` stays pure Bible
 * knowledge).
 *
 * Difficulty is *not* a list of hand-made levels: each level declares stages
 * with a `share` of the round, and the planner moves the learner through them
 * automatically - exactly the "Stage A -> D" progression from the design notes.
 *
 * Copy (titles, descriptions) lives in `src/i18n`, keyed by `levels.<id>.*`.
 */
export const LEVEL_ID = Object.freeze({
  MAP: 'bible-map',
  NEIGHBOUR: 'brain-neighbour',
  HAND: 'hand-geography',
});

export const levels = Object.freeze([
  {
    id: LEVEL_ID.MAP,
    number: 1,
    emoji: '🗺️',
    tone: 'primary',
    questionsPerRound: 10,
    stages: [
      { id: 'testament', share: 0.3, type: QUESTION_TYPE.TESTAMENT_OF_BOOK },
      { id: 'section', share: 0.4, type: QUESTION_TYPE.SECTION_OF_BOOK },
      { id: 'neighbourhood', share: 0.3, type: QUESTION_TYPE.NEIGHBOURHOOD_OF_BOOK },
    ],
  },
  {
    id: LEVEL_ID.NEIGHBOUR,
    number: 2,
    emoji: '🧠',
    tone: 'success',
    questionsPerRound: 10,
    stages: [
      { id: 'after', share: 0.25, type: QUESTION_TYPE.BOOK_AFTER },
      { id: 'before', share: 0.25, type: QUESTION_TYPE.BOOK_BEFORE },
      { id: 'between', share: 0.2, type: QUESTION_TYPE.BOOK_BETWEEN },
      { id: 'order-3', share: 0.2, type: QUESTION_TYPE.ORDER_BOOKS, params: { length: 3 } },
      { id: 'order-5', share: 0.1, type: QUESTION_TYPE.ORDER_BOOKS, params: { length: 5 } },
    ],
  },
  {
    id: LEVEL_ID.HAND,
    number: 3,
    emoji: '✋',
    tone: 'warning',
    questionsPerRound: 8,
    needsPhysicalBible: true,
    stages: [{ id: 'find', share: 1, type: QUESTION_TYPE.FIND_IN_BIBLE }],
  },
]);

const levelById = new Map(levels.map((level) => [level.id, level]));

export function getLevel(levelId) {
  return levelById.get(levelId) ?? null;
}

export function getLevels() {
  return levels;
}

/**
 * Which stage does question #index of a round belong to?
 * @param {object} level
 * @param {number} index zero based
 * @param {number} total questions in the round
 */
export function resolveStage(level, index, total) {
  const position = total > 0 ? (index + 0.5) / total : 0;
  let cumulative = 0;
  for (const stage of level.stages) {
    cumulative += stage.share;
    if (position <= cumulative) return stage;
  }
  return level.stages[level.stages.length - 1];
}
