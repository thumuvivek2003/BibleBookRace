/** Every path in one place, so links never drift apart from the router. */
export const ROUTES = Object.freeze({
  welcome: '/welcome',
  home: '/',
  training: '/training',
  trainingLevel: (levelId = ':levelId') => `/training/${levelId}`,
  quest: '/quest',
  questRun: (questId = ':questId') => `/quest/${questId}`,
  progress: '/progress',
  map: '/map',
  settings: '/settings',
});
