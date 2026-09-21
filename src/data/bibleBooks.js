import { TESTAMENT } from './sections.js';

/**
 * The 66 books, in canonical order - the single source of truth of the app.
 *
 * `order` is the source of truth for adjacency: neighbours are derived
 * (order - 1 / order + 1) rather than stored, so the data can never disagree
 * with itself.
 *
 * `tier1` marks the high-frequency books a beginner should master first.
 * Telugu names follow the Bible Society of India Telugu edition.
 */
const raw = [
  // ---------------- Old Testament : Law ----------------
  ['genesis', 'Genesis', 'ఆదికాండము', 'law', true],
  ['exodus', 'Exodus', 'నిర్గమకాండము', 'law', true],
  ['leviticus', 'Leviticus', 'లేవీయకాండము', 'law', false],
  ['numbers', 'Numbers', 'సంఖ్యాకాండము', 'law', false],
  ['deuteronomy', 'Deuteronomy', 'ద్వితీయోపదేశకాండము', 'law', false],

  // ---------------- Old Testament : History ----------------
  ['joshua', 'Joshua', 'యెహోషువ', 'ot-history', false],
  ['judges', 'Judges', 'న్యాయాధిపతులు', 'ot-history', false],
  ['ruth', 'Ruth', 'రూతు', 'ot-history', false],
  ['1-samuel', '1 Samuel', '1 సమూయేలు', 'ot-history', false],
  ['2-samuel', '2 Samuel', '2 సమూయేలు', 'ot-history', false],
  ['1-kings', '1 Kings', '1 రాజులు', 'ot-history', false],
  ['2-kings', '2 Kings', '2 రాజులు', 'ot-history', false],
  ['1-chronicles', '1 Chronicles', '1 దినవృత్తాంతములు', 'ot-history', false],
  ['2-chronicles', '2 Chronicles', '2 దినవృత్తాంతములు', 'ot-history', false],
  ['ezra', 'Ezra', 'ఎజ్రా', 'ot-history', false],
  ['nehemiah', 'Nehemiah', 'నెహెమ్యా', 'ot-history', false],
  ['esther', 'Esther', 'ఎస్తేరు', 'ot-history', false],

  // ---------------- Old Testament : Poetry & Wisdom ----------------
  ['job', 'Job', 'యోబు', 'poetry', false],
  ['psalms', 'Psalms', 'కీర్తనల గ్రంథము', 'poetry', true],
  ['proverbs', 'Proverbs', 'సామెతలు', 'poetry', true],
  ['ecclesiastes', 'Ecclesiastes', 'ప్రసంగి', 'poetry', false],
  ['song-of-solomon', 'Song of Solomon', 'పరమగీతము', 'poetry', false],

  // ---------------- Old Testament : Major Prophets ----------------
  ['isaiah', 'Isaiah', 'యెషయా', 'major-prophets', true],
  ['jeremiah', 'Jeremiah', 'యిర్మీయా', 'major-prophets', true],
  ['lamentations', 'Lamentations', 'విలాపవాక్యములు', 'major-prophets', false],
  ['ezekiel', 'Ezekiel', 'యెహెజ్కేలు', 'major-prophets', false],
  ['daniel', 'Daniel', 'దానియేలు', 'major-prophets', false],

  // ---------------- Old Testament : Minor Prophets ----------------
  ['hosea', 'Hosea', 'హోషేయ', 'minor-prophets', false],
  ['joel', 'Joel', 'యోవేలు', 'minor-prophets', false],
  ['amos', 'Amos', 'ఆమోసు', 'minor-prophets', false],
  ['obadiah', 'Obadiah', 'ఓబద్యా', 'minor-prophets', false],
  ['jonah', 'Jonah', 'యోనా', 'minor-prophets', false],
  ['micah', 'Micah', 'మీకా', 'minor-prophets', false],
  ['nahum', 'Nahum', 'నహూము', 'minor-prophets', false],
  ['habakkuk', 'Habakkuk', 'హబక్కూకు', 'minor-prophets', false],
  ['zephaniah', 'Zephaniah', 'జెఫన్యా', 'minor-prophets', false],
  ['haggai', 'Haggai', 'హగ్గయి', 'minor-prophets', false],
  ['zechariah', 'Zechariah', 'జెకర్యా', 'minor-prophets', false],
  ['malachi', 'Malachi', 'మలాకీ', 'minor-prophets', false],

  // ---------------- New Testament : Gospels ----------------
  ['matthew', 'Matthew', 'మత్తయి', 'gospels', true],
  ['mark', 'Mark', 'మార్కు', 'gospels', true],
  ['luke', 'Luke', 'లూకా', 'gospels', true],
  ['john', 'John', 'యోహాను', 'gospels', true],

  // ---------------- New Testament : Church History ----------------
  ['acts', 'Acts', 'అపొస్తలుల కార్యములు', 'nt-history', true],

  // ---------------- New Testament : Paul's Letters ----------------
  ['romans', 'Romans', 'రోమీయులకు', 'pauline', true],
  ['1-corinthians', '1 Corinthians', '1 కొరింథీయులకు', 'pauline', true],
  ['2-corinthians', '2 Corinthians', '2 కొరింథీయులకు', 'pauline', false],
  ['galatians', 'Galatians', 'గలతీయులకు', 'pauline', false],
  ['ephesians', 'Ephesians', 'ఎఫెసీయులకు', 'pauline', true],
  ['philippians', 'Philippians', 'ఫిలిప్పీయులకు', 'pauline', true],
  ['colossians', 'Colossians', 'కొలొస్సయులకు', 'pauline', false],
  ['1-thessalonians', '1 Thessalonians', '1 థెస్సలొనీకయులకు', 'pauline', false],
  ['2-thessalonians', '2 Thessalonians', '2 థెస్సలొనీకయులకు', 'pauline', false],
  ['1-timothy', '1 Timothy', '1 తిమోతి', 'pauline', false],
  ['2-timothy', '2 Timothy', '2 తిమోతి', 'pauline', false],
  ['titus', 'Titus', 'తీతుకు', 'pauline', false],
  ['philemon', 'Philemon', 'ఫిలేమోనుకు', 'pauline', false],

  // ---------------- New Testament : General Letters ----------------
  ['hebrews', 'Hebrews', 'హెబ్రీయులకు', 'general', true],
  ['james', 'James', 'యాకోబు', 'general', true],
  ['1-peter', '1 Peter', '1 పేతురు', 'general', true],
  ['2-peter', '2 Peter', '2 పేతురు', 'general', false],
  ['1-john', '1 John', '1 యోహాను', 'general', true],
  ['2-john', '2 John', '2 యోహాను', 'general', false],
  ['3-john', '3 John', '3 యోహాను', 'general', false],
  ['jude', 'Jude', 'యూదా', 'general', false],

  // ---------------- New Testament : Prophecy ----------------
  ['revelation', 'Revelation', 'ప్రకటన గ్రంథము', 'prophecy', true],
];

const OLD_TESTAMENT_BOOK_COUNT = 39;

export const bibleBooks = Object.freeze(
  raw.map(([id, en, te, sectionId, tier1], index) => ({
    id,
    order: index + 1,
    name: { en, te },
    sectionId,
    testament: index < OLD_TESTAMENT_BOOK_COUNT ? TESTAMENT.OLD : TESTAMENT.NEW,
    tier1,
  })),
);

export const TOTAL_BOOKS = bibleBooks.length;
