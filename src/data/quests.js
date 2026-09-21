/**
 * Quest definitions - pure data. Titles and descriptions live in `src/i18n`
 * under `quests.<id>.*`.
 *
 * A quest either lists `bookIds` explicitly or describes how to build itself
 * (`generator`), which lets "Random Bible Run" and "Weak Spot Rescue" exist
 * without any extra code paths in the UI.
 */
export const quests = Object.freeze([
  {
    id: 'nt-run',
    emoji: '🚩',
    tone: 'danger',
    bookIds: ['john', 'romans', 'ephesians', 'james', 'revelation'],
    unlock: null,
  },
  {
    id: 'gospel-sprint',
    emoji: '📖',
    tone: 'success',
    bookIds: ['matthew', 'mark', 'luke', 'john', 'acts'],
    unlock: null,
  },
  {
    id: 'sunday-favourites',
    emoji: '⭐',
    tone: 'warning',
    bookIds: ['genesis', 'psalms', 'proverbs', 'isaiah', 'matthew', 'philippians'],
    unlock: { booksPractised: 6 },
  },
  {
    id: 'random-run',
    emoji: '🎲',
    tone: 'primary',
    generator: { kind: 'random', size: 5 },
    unlock: { booksPractised: 10 },
  },
  {
    id: 'minor-prophets-quest',
    emoji: '✨',
    tone: 'info',
    generator: { kind: 'section', sectionId: 'minor-prophets', size: 5 },
    unlock: { booksPractised: 15 },
  },
  {
    id: 'weak-spot',
    emoji: '🎯',
    tone: 'accent',
    generator: { kind: 'weak', size: 5 },
    unlock: { booksPractised: 20 },
  },
  {
    id: 'whole-bible-run',
    emoji: '👑',
    tone: 'accent',
    generator: { kind: 'random', size: 8 },
    unlock: { questsCompleted: 3 },
  },
]);
