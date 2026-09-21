/**
 * The Bible "neighbourhoods" a learner navigates by.
 * Pure data - no React, no storage, no side effects.
 */

export const TESTAMENT = Object.freeze({
  OLD: 'OT',
  NEW: 'NT',
});

export const testaments = Object.freeze([
  {
    id: TESTAMENT.OLD,
    order: 1,
    name: { en: 'Old Testament', te: 'పాత నిబంధన' },
    emoji: '📜',
  },
  {
    id: TESTAMENT.NEW,
    order: 2,
    name: { en: 'New Testament', te: 'క్రొత్త నిబంధన' },
    emoji: '✝️',
  },
]);

/**
 * `tone` maps a section to one of the semantic colour families declared in
 * `theme/themes.css`, so section colours follow the active theme automatically.
 */
export const sections = Object.freeze([
  {
    id: 'law',
    testament: TESTAMENT.OLD,
    order: 1,
    emoji: '📜',
    tone: 'primary',
    name: { en: 'Law', te: 'ధర్మశాస్త్రము' },
  },
  {
    id: 'ot-history',
    testament: TESTAMENT.OLD,
    order: 2,
    emoji: '🏰',
    tone: 'warning',
    name: { en: 'History', te: 'చరిత్ర' },
  },
  {
    id: 'poetry',
    testament: TESTAMENT.OLD,
    order: 3,
    emoji: '🎼',
    tone: 'accent',
    name: { en: 'Poetry & Wisdom', te: 'కావ్య, జ్ఞాన గ్రంథాలు' },
  },
  {
    id: 'major-prophets',
    testament: TESTAMENT.OLD,
    order: 4,
    emoji: '🔥',
    tone: 'danger',
    name: { en: 'Major Prophets', te: 'ప్రధాన ప్రవక్తలు' },
  },
  {
    id: 'minor-prophets',
    testament: TESTAMENT.OLD,
    order: 5,
    emoji: '✨',
    tone: 'info',
    name: { en: 'Minor Prophets', te: 'చిన్న ప్రవక్తలు' },
  },
  {
    id: 'gospels',
    testament: TESTAMENT.NEW,
    order: 6,
    emoji: '📖',
    tone: 'success',
    name: { en: 'The Gospels', te: 'సువార్తలు' },
  },
  {
    id: 'nt-history',
    testament: TESTAMENT.NEW,
    order: 7,
    emoji: '🕊️',
    tone: 'info',
    name: { en: 'Church History', te: 'సంఘ చరిత్ర' },
  },
  {
    id: 'pauline',
    testament: TESTAMENT.NEW,
    order: 8,
    emoji: '✉️',
    tone: 'primary',
    name: { en: "Paul's Letters", te: 'పౌలు పత్రికలు' },
  },
  {
    id: 'general',
    testament: TESTAMENT.NEW,
    order: 9,
    emoji: '💌',
    tone: 'accent',
    name: { en: 'General Letters', te: 'సాధారణ పత్రికలు' },
  },
  {
    id: 'prophecy',
    testament: TESTAMENT.NEW,
    order: 10,
    emoji: '👑',
    tone: 'warning',
    name: { en: 'Prophecy', te: 'ప్రవచనం' },
  },
]);
