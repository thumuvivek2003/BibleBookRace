/**
 * Tone -> Tailwind classes.
 *
 * Tailwind cannot see dynamically built class names, so every combination is
 * written out once here. Components then take a semantic `tone` prop
 * ("success", "danger"...) and stay free of raw colours - swapping the theme or
 * a section's colour is a data change, never a component change.
 */
export const TONE_STYLES = Object.freeze({
  primary: {
    solid: 'bg-primary text-on-primary',
    solidHover: 'hover:bg-primary-strong',
    soft: 'bg-primary-soft text-primary-strong',
    text: 'text-primary',
    border: 'border-primary/40',
    dot: 'bg-primary',
    ring: 'ring-primary/40',
  },
  success: {
    solid: 'bg-success text-white',
    solidHover: 'hover:bg-success-strong',
    soft: 'bg-success-soft text-success-strong',
    text: 'text-success-strong',
    border: 'border-success/40',
    dot: 'bg-success',
    ring: 'ring-success/40',
  },
  danger: {
    solid: 'bg-danger text-white',
    solidHover: 'hover:bg-danger-strong',
    soft: 'bg-danger-soft text-danger-strong',
    text: 'text-danger-strong',
    border: 'border-danger/40',
    dot: 'bg-danger',
    ring: 'ring-danger/40',
  },
  warning: {
    solid: 'bg-warning text-white',
    solidHover: 'hover:brightness-95',
    soft: 'bg-warning-soft text-warning',
    text: 'text-warning',
    border: 'border-warning/40',
    dot: 'bg-warning',
    ring: 'ring-warning/40',
  },
  accent: {
    solid: 'bg-accent text-white',
    solidHover: 'hover:brightness-110',
    soft: 'bg-accent-soft text-accent',
    text: 'text-accent',
    border: 'border-accent/40',
    dot: 'bg-accent',
    ring: 'ring-accent/40',
  },
  info: {
    solid: 'bg-info text-white',
    solidHover: 'hover:brightness-110',
    soft: 'bg-info-soft text-info',
    text: 'text-info',
    border: 'border-info/40',
    dot: 'bg-info',
    ring: 'ring-info/40',
  },
  neutral: {
    solid: 'bg-surface-sunken text-ink',
    solidHover: 'hover:brightness-95',
    soft: 'bg-surface-sunken text-ink-muted',
    text: 'text-ink-muted',
    border: 'border-line',
    dot: 'bg-ink-subtle',
    ring: 'ring-ink-subtle/40',
  },
  'ink-subtle': {
    solid: 'bg-ink-subtle text-white',
    solidHover: 'hover:brightness-95',
    soft: 'bg-surface-sunken text-ink-subtle',
    text: 'text-ink-subtle',
    border: 'border-line',
    dot: 'bg-ink-subtle',
    ring: 'ring-ink-subtle/40',
  },
});

export const DEFAULT_TONE = 'primary';

export function toneStyles(tone) {
  return TONE_STYLES[tone] ?? TONE_STYLES[DEFAULT_TONE];
}
