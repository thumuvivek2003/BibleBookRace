import { describe, expect, it } from 'vitest';
import { IMGS } from './imgs.js';

describe('IMGS', () => {
  it('resolves every image to a bundled URL', () => {
    // A missing file would fail the import above; this guards against an entry
    // being emptied out or renamed to nothing.
    Object.entries(IMGS).forEach(([key, url]) => {
      expect(typeof url, key).toBe('string');
      expect(url.length, key).toBeGreaterThan(0);
    });
  });

  it('exposes the screens that use it', () => {
    expect(Object.keys(IMGS).sort()).toEqual(['icon', 'main_screen']);
  });

  it('is frozen, so a screen cannot reassign an image at runtime', () => {
    expect(Object.isFrozen(IMGS)).toBe(true);
  });
});
