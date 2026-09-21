import { TOTAL_BOOKS } from '@/domain/books/bookRepository.js';
import { QUESTION_TYPE } from '@/domain/questions/questionTypes.js';

/**
 * The games and their rules (game logic, therefore domain - `src/data` stays
 * pure Bible knowledge).
 *
 * Each game asks ONE kind of question. Mixing "which testament?", "which
 * section?" and "which neighbours?" into a single round made every screen feel
 * like a different exercise, so they are now four separate games a learner can
 * pick and repeat until it sticks.
 *
 * Within a game, difficulty still moves on its own: a game declares stages with
 * a `share` of the round and the planner walks through them. That is how "Put
 * In Order" grows from three books to five without becoming a different game.
 *
 * Copy (titles, descriptions) lives in `src/i18n`, keyed by `games.<id>.*`.
 */
export const GAME_ID = Object.freeze({
  TESTAMENT: 'testament',
  SECTION: 'section',
  NEIGHBOURHOOD: 'neighbourhood',
  ORDER: 'order-books',
  NEIGHBOUR: 'brain-neighbour',
  HAND: 'hand-geography',
});

/** Games are grouped by the skill they build, in the order they should be met. */
export const GAME_GROUP = Object.freeze({
  MAP: 'map',
  NEIGHBOURS: 'neighbours',
  HAND: 'hand',
});

export const gameGroups = Object.freeze([
  { id: GAME_GROUP.MAP, emoji: '🗺️' },
  { id: GAME_GROUP.NEIGHBOURS, emoji: '🧠' },
  { id: GAME_GROUP.HAND, emoji: '✋' },
]);

const single = (type, params) => [{ id: 'main', share: 1, type, ...(params ? { params } : {}) }];

export const games = Object.freeze([
  {
    id: GAME_ID.TESTAMENT,
    group: GAME_GROUP.MAP,
    number: 1,
    emoji: '📜',
    tone: 'primary',
    questionsPerRound: 10,
    stages: single(QUESTION_TYPE.TESTAMENT_OF_BOOK),
  },
  {
    id: GAME_ID.SECTION,
    group: GAME_GROUP.MAP,
    number: 2,
    emoji: '🗂️',
    tone: 'accent',
    questionsPerRound: 10,
    stages: single(QUESTION_TYPE.SECTION_OF_BOOK),
  },
  {
    id: GAME_ID.NEIGHBOURHOOD,
    group: GAME_GROUP.MAP,
    number: 3,
    emoji: '🏘️',
    tone: 'info',
    questionsPerRound: 8,
    stages: single(QUESTION_TYPE.NEIGHBOURHOOD_OF_BOOK),
  },
  {
    id: GAME_ID.ORDER,
    group: GAME_GROUP.MAP,
    number: 4,
    emoji: '🎯',
    tone: 'warning',
    questionsPerRound: 8,
    // How many books to order is the learner's call, not a hidden ramp.
    setting: {
      key: 'length',
      presets: [3, 4, 5],
      default: 3,
      min: 3,
      max: TOTAL_BOOKS,
    },
    stages: single(QUESTION_TYPE.ORDER_BOOKS, { length: 3 }),
  },
  {
    id: GAME_ID.NEIGHBOUR,
    group: GAME_GROUP.NEIGHBOURS,
    number: 5,
    emoji: '🔗',
    tone: 'success',
    questionsPerRound: 10,
    // Ordering moved out to its own game, so this one is purely "which book
    // sits next to which".
    stages: [
      { id: 'after', share: 0.34, type: QUESTION_TYPE.BOOK_AFTER },
      { id: 'before', share: 0.33, type: QUESTION_TYPE.BOOK_BEFORE },
      { id: 'between', share: 0.33, type: QUESTION_TYPE.BOOK_BETWEEN },
    ],
  },
  {
    id: GAME_ID.HAND,
    group: GAME_GROUP.HAND,
    number: 6,
    emoji: '📖',
    tone: 'danger',
    questionsPerRound: 8,
    needsPhysicalBible: true,
    // One clock for the whole run, and no review card between books: the
    // point is how fast you get through them, so stopping to confirm each
    // find would measure the app's dialogs rather than the learner.
    continuousTimer: true,
    autoAdvance: true,
    stages: single(QUESTION_TYPE.FIND_IN_BIBLE),
  },
]);

const gameById = new Map(games.map((game) => [game.id, game]));

export function getGame(gameId) {
  return gameById.get(gameId) ?? null;
}

export function getGames() {
  return games;
}

/** Games in play order, bucketed by group - what the Training screen renders. */
export function getGamesByGroup() {
  return gameGroups.map((group) => ({
    ...group,
    games: games.filter((game) => game.group === group.id),
  }));
}

/**
 * Which stage does question #index of a round belong to?
 * @param {object} game
 * @param {number} index zero based
 * @param {number} total questions in the round
 */
/**
 * Coerces a learner-entered setting into something the game can actually run.
 *
 * Lives here rather than in the input field so "between 3 and 66" is one rule
 * with one test, not a `min`/`max` attribute that a paste or an arrow key can
 * walk straight past.
 *
 * @param {object} game
 * @param {unknown} value
 * @returns {number} a whole number within range, or the game's default
 */
export function normaliseSetting(game, value) {
  const spec = game?.setting;
  if (!spec) return undefined;

  const number = Math.floor(Number(value));
  if (!Number.isFinite(number)) return spec.default;
  return Math.min(spec.max, Math.max(spec.min, number));
}

/**
 * How many questions a round should hold for a given setting.
 *
 * Ordering three books eight times is a good round; ordering sixty-six books
 * eight times is a punishment. The count shrinks as the puzzle grows.
 */
export function resolveRoundLength(game, settings = {}) {
  const size = settings[game.setting?.key];
  if (!game.setting || !size) return game.questionsPerRound;
  return Math.max(3, Math.min(game.questionsPerRound, Math.round(24 / size)));
}

export function resolveStage(game, index, total) {
  const position = total > 0 ? (index + 0.5) / total : 0;
  let cumulative = 0;
  for (const stage of game.stages) {
    cumulative += stage.share;
    if (position <= cumulative) return stage;
  }
  return game.stages[game.stages.length - 1];
}
