import { describe, expect, it } from 'vitest';
import { getAllBooks, getBookById } from '@/domain/books/bookRepository.js';
import { createRandomSelector, createRound } from '@/domain/questions/questionFactory.js';
import { QUESTION_TYPE } from '@/domain/questions/questionTypes.js';
import { createSeededRng } from '@/utils/random.js';
import {
  GAME_ID,
  getGame,
  getGames,
  getGamesByGroup,
  normaliseSetting,
  resolveRoundLength,
} from './gameCatalog.js';

const rng = () => createSeededRng(7);

describe('game catalog', () => {
  it('numbers every game once, in play order', () => {
    expect(getGames().map((game) => game.number)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(new Set(getGames().map((game) => game.id)).size).toBe(6);
  });

  it('groups games without losing or duplicating any', () => {
    const grouped = getGamesByGroup().flatMap((group) => group.games);
    expect(grouped.map((game) => game.id)).toEqual(getGames().map((game) => game.id));
  });

  it('gives each map game exactly one kind of question', () => {
    // The whole point of the split: a round never mixes "which testament?"
    // with "which section?" again.
    const singleType = {
      [GAME_ID.TESTAMENT]: QUESTION_TYPE.TESTAMENT_OF_BOOK,
      [GAME_ID.SECTION]: QUESTION_TYPE.SECTION_OF_BOOK,
      [GAME_ID.NEIGHBOURHOOD]: QUESTION_TYPE.NEIGHBOURHOOD_OF_BOOK,
      [GAME_ID.ORDER]: QUESTION_TYPE.ORDER_BOOKS,
    };

    Object.entries(singleType).forEach(([gameId, type]) => {
      const round = createRound({
        gameId,
        selectBook: createRandomSelector(getAllBooks(), rng()),
        rng: rng(),
      });
      expect(round.length, gameId).toBeGreaterThan(0);
      expect([...new Set(round.map((question) => question.type))], gameId).toEqual([type]);
    });
  });

  it('lets the learner choose how many books to order', () => {
    const game = getGame(GAME_ID.ORDER);
    expect(game.setting).toMatchObject({ key: 'length', presets: [3, 4, 5], default: 3, min: 3 });
    // "Up to 66 only" - the whole Bible is the ceiling.
    expect(game.setting.max).toBe(66);

    const round = createRound({
      gameId: GAME_ID.ORDER,
      selectBook: createRandomSelector(getAllBooks(), rng()),
      settings: { length: 5 },
      rng: rng(),
    });
    round.forEach((question) => expect(question.sequence.correct).toHaveLength(5));
  });

  it('keeps a chosen size inside the allowed range, whatever is typed', () => {
    const game = getGame(GAME_ID.ORDER);
    expect(normaliseSetting(game, 4)).toBe(4);
    expect(normaliseSetting(game, 66)).toBe(66);
    expect(normaliseSetting(game, 500)).toBe(66);
    expect(normaliseSetting(game, 1)).toBe(3);
    expect(normaliseSetting(game, -8)).toBe(3);
    expect(normaliseSetting(game, 4.9)).toBe(4);
    expect(normaliseSetting(game, 'twelve')).toBe(3);
    expect(normaliseSetting(game, '')).toBe(3);
  });

  it('shortens the round as the puzzle grows', () => {
    const game = getGame(GAME_ID.ORDER);
    expect(resolveRoundLength(game, { length: 3 })).toBe(8);
    expect(resolveRoundLength(game, { length: 5 })).toBe(5);
    // Ordering the whole canon eight times over is a punishment, not a round.
    expect(resolveRoundLength(game, { length: 66 })).toBe(3);
  });

  it('runs the hand game as one continuous clock with no review card', () => {
    const game = getGame(GAME_ID.HAND);
    expect(game.continuousTimer).toBe(true);
    expect(game.autoAdvance).toBe(true);
  });

  it('keeps ordering out of the neighbour game, so each has one interaction', () => {
    const types = getGame(GAME_ID.NEIGHBOUR).stages.map((stage) => stage.type);
    expect(types).not.toContain(QUESTION_TYPE.ORDER_BOOKS);
  });

  it('builds a playable round for every game', () => {
    getGames().forEach((game) => {
      const round = createRound({
        gameId: game.id,
        selectBook: createRandomSelector(getAllBooks(), rng()),
        rng: rng(),
      });
      expect(round.length, game.id).toBe(game.questionsPerRound);
      round.forEach((question) => expect(getBookById(question.bookId)).not.toBeNull());
    });
  });
});
