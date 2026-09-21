import { cn } from '@/utils/cn.js';

/**
 * Generic "pick one of these" grid used for language, theme, goal and pool.
 * One component instead of four bespoke pickers.
 *
 * `columns` is a layout intent, not a fixed number - each preset widens on
 * bigger screens.
 *
 * @param {{ options: {id: string, label: string, hint?: string, preview?: React.ReactNode}[] }} props
 */
const COLUMNS = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-4',
};

export function OptionGrid({ options, value, onChange, columns = 2, name }) {
  return (
    <div
      role="radiogroup"
      aria-label={name}
      className={cn('grid gap-2', COLUMNS[columns] ?? COLUMNS[2])}
    >
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.id)}
            className={cn(
              'rounded-card border-2 p-3 text-left transition active:scale-[0.98]',
              active
                ? 'border-primary bg-primary-soft'
                : 'border-transparent bg-surface-sunken hover:brightness-95',
            )}
          >
            {option.preview}
            <span className="block font-display text-sm font-extrabold leading-tight">{option.label}</span>
            {option.hint && <span className="block text-[11px] text-ink-muted">{option.hint}</span>}
          </button>
        );
      })}
    </div>
  );
}
