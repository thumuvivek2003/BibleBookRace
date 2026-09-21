/**
 * Tailwind is configured against *semantic* tokens only (surface, primary, ink...).
 * The concrete colour values live in CSS custom properties in `src/theme/themes.css`,
 * one block per theme. Adding a new theme therefore never requires touching a
 * component (Open/Closed) - you add a `[data-theme="..."]` block and register it in
 * `src/theme/themes.js`.
 */
const token = (name) => `rgb(var(${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: token('--c-canvas'),
        'canvas-alt': token('--c-canvas-alt'),
        surface: token('--c-surface'),
        'surface-sunken': token('--c-surface-sunken'),
        line: token('--c-line'),
        ink: token('--c-ink'),
        'ink-muted': token('--c-ink-muted'),
        'ink-subtle': token('--c-ink-subtle'),
        primary: token('--c-primary'),
        'primary-strong': token('--c-primary-strong'),
        'primary-soft': token('--c-primary-soft'),
        'on-primary': token('--c-on-primary'),
        success: token('--c-success'),
        'success-strong': token('--c-success-strong'),
        'success-soft': token('--c-success-soft'),
        danger: token('--c-danger'),
        'danger-strong': token('--c-danger-strong'),
        'danger-soft': token('--c-danger-soft'),
        warning: token('--c-warning'),
        'warning-soft': token('--c-warning-soft'),
        accent: token('--c-accent'),
        'accent-soft': token('--c-accent-soft'),
        info: token('--c-info'),
        'info-soft': token('--c-info-soft'),
      },
      fontFamily: {
        sans: ['var(--font-ui)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '1.25rem',
        pill: '999px',
      },
      boxShadow: {
        card: '0 1px 2px rgb(15 23 42 / 0.04), 0 8px 24px -12px rgb(15 23 42 / 0.18)',
        pop: '0 4px 0 0 rgb(0 0 0 / 0.12)',
        float: '0 18px 40px -20px rgb(15 23 42 / 0.45)',
      },
      keyframes: {
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.94) translateY(8px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        'cheer-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.08)' },
        },
      },
      animation: {
        'pop-in': 'pop-in 220ms cubic-bezier(0.2, 0.9, 0.3, 1.4)',
        'slide-up': 'slide-up 260ms ease-out',
        wiggle: 'wiggle 320ms ease-in-out',
        'cheer-pulse': 'cheer-pulse 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
