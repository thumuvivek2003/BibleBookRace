import { cn } from '@/utils/cn.js';

/**
 * One tappable answer.
 *
 * `state` is decided by the round, not by the button: 'idle' | 'selected' |
 * 'correct' | 'wrong' | 'muted'. Keeping the decision outside means the same
 * component serves every question type.
 */
const STATE_STYLES = {
  idle: 'bg-surface-sunken text-ink hover:brightness-95 active:scale-[0.99]',
  selected: 'bg-primary text-on-primary shadow-pop',
  correct: 'bg-success text-white shadow-pop',
  wrong: 'bg-danger text-white animate-wiggle',
  muted: 'bg-surface-sunken text-ink-subtle opacity-60',
};

export function AnswerOption({ children, state = 'idle', onClick, disabled, className, ...rest }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={state === 'selected'}
      className={cn(
        'w-full rounded-2xl px-4 py-3.5 text-center font-display text-base font-bold',
        'transition-all duration-150 disabled:cursor-default',
        STATE_STYLES[state],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
