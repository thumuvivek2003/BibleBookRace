import { cn } from '@/utils/cn.js';

/**
 * Two-or-three way switch (Overview / Books).
 * @param {{ options: {id: string, label: string}[], value: string, onChange: (id: string) => void }} props
 */
export function SegmentedControl({ options, value, onChange, className }) {
  return (
    <div
      role="tablist"
      className={cn('flex gap-1 rounded-pill bg-surface-sunken p-1', className)}
    >
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.id)}
            className={cn(
              'flex-1 rounded-pill px-3 py-2 text-sm font-bold transition',
              active ? 'bg-accent text-white shadow-card' : 'text-ink-muted hover:text-ink',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
