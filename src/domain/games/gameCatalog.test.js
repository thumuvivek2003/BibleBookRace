import { describe, expect, it } from 'vitest';
import { getAllBooks, getBookById } from '@/domain/books/bookRepository.js';
import { createRandomSelector, createRound } from '@/domain/questions/questionFactory.js';
import { QUESTION_TYPE } from '@/domain/questions/questionTypes.js';
import { createSeededRng } from '@/utils/random.js';
import { GAME_ID, getGame, getGames, getGamesByGroup, resolveStage } from './gameCatalog.js';

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

  it('lets the ordering game grow from three books to five', () => {
    const game = getGame(GAME_ID.ORDER);
    const lengths = Array.from({ length: game.questionsPerRound }, (_, index) =>
      resolveStage(game, index, game.questionsPerRound).params.length,
    );
    expect(lengths[0]).toBe(3);
    expect(lengths.at(-1)).toBe(5);
    // Never gets easier as the round goes on.
    expect([...lengths].sort((a, b) => a - b)).toEqual(lengths);
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
