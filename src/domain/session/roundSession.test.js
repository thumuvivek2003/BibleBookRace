import { describe, expect, it } from 'vitest';
import { ANSWER_MODE } from '@/domain/questions/questionTypes.js';
import {
  advance,
  createRoundSession,
  isFinished,
  ROUND_STATUS,
  submitAnswer,
  summariseRound,
} from './roundSession.js';

const choice = (id, correctOptionId) => ({
  id,
  bookId: 'ephesians',
  gameId: 'bible-map',
  type: 'section-of-book',
  answerMode: ANSWER_MODE.CHOICE,
  correctOptionId,
  options: [],
});

describe('round session', () => {
  it('moves asking -> reviewing -> asking -> finished', () => {
    let session = createRoundSession([choice('q1', 'a'), choice('q2', 'b')]);
    expect(session.status).toBe(ROUND_STATUS.ASKING);

    session = submitAnswer(session, { optionId: 'a', timeMs: 1200 });
    expect(session.status).toBe(ROUND_STATUS.REVIEWING);
    expect(session.lastAnswer.correct).toBe(true);

    session = advance(session);
    expect(session.status).toBe(ROUND_STATUS.ASKING);
    expect(session.index).toBe(1);

    session = advance(submitAnswer(session, { optionId: 'wrong', timeMs: 900 }));
    expect(isFinished(session)).toBe(true);
  });

  it('ignores answers submitted while reviewing', () => {
    const session = submitAnswer(createRoundSession([choice('q1', 'a')]), { optionId: 'a' });
    expect(submitAnswer(session, { optionId: 'a' })).toBe(session);
  });

  it('summarises accuracy, timing and the books to revisit', () => {
    let session = createRoundSession([choice('q1', 'a'), choice('q2', 'b')]);
    session = advance(submitAnswer(session, { optionId: 'a', timeMs: 1000 }));
    session = advance(submitAnswer(session, { optionId: 'nope', timeMs: 3000 }));

    const summary = summariseRound(session);
    expect(summary).toMatchObject({ total: 2, correct: 1, wrong: 1, accuracy: 0.5, bestStreak: 1 });
    expect(summary.averageTimeMs).toBe(2000);
    expect(summary.missedBookIds).toEqual(['ephesians']);
  });

  it('marks a sequence answer correct only in the exact order', () => {
    const question = {
      id: 'q1',
      bookId: 'ephesians',
      answerMode: ANSWER_MODE.SEQUENCE,
      sequence: { correct: ['galatians', 'ephesians', 'philippians'], shuffled: [] },
    };
    const right = submitAnswer(createRoundSession([question]), {
      sequence: ['galatians', 'ephesians', 'philippians'],
    });
    const wrong = submitAnswer(createRoundSession([question]), {
      sequence: ['ephesians', 'galatians', 'philippians'],
    });
    expect(right.lastAnswer.correct).toBe(true);
    expect(wrong.lastAnswer.correct).toBe(false);
  });
});
