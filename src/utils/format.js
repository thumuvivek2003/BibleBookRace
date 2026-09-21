import { clamp } from './array.js';

/**
 * Formatting helpers. They take an explicit `locale` instead of reading a
 * global, so they stay pure and testable.
 */

/** 8432 -> "00:08.4" */
export function formatStopwatch(ms) {
  const safe = Math.max(0, ms);
  const minutes = Math.floor(safe / 60000);
  const seconds = Math.floor((safe % 60000) / 1000);
  const tenths = Math.floor((safe % 1000) / 100);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${tenths}`;
}

/** 8432 -> "8.4s" */
export function formatSeconds(ms, locale = 'en') {
  const seconds = Math.max(0, ms) / 1000;
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(seconds)}s`;
}

/** 0.923 -> "92%" */
export function formatPercent(ratio, locale = 'en') {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: 0,
  }).format(clamp(ratio || 0, 0, 1));
}

/** @param {number} value */
export function formatNumber(value, locale = 'en') {
  return new Intl.NumberFormat(locale).format(value);
}

/** Local calendar day key, e.g. "2026-09-21" - used for streaks and daily goals. */
export function toDayKey(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

/** Whole days between two day keys. */
export function daysBetween(fromDayKey, toDayKeyValue) {
  const from = new Date(`${fromDayKey}T00:00:00`);
  const to = new Date(`${toDayKeyValue}T00:00:00`);
  return Math.round((to - from) / 86400000);
}
