import { cn } from '@/utils/cn.js';
import { Button } from '@/components/ui/index.js';

/**
 * Ordering exercise: tap books in canonical order.
 *
 * Tapping is used instead of drag-and-drop on purpose - it works with a thumb,
 * on a cheap touchscreen, and with a keyboard.
 *
 * @param {{
 *   pool: {id: string, label: string}[],
 *   picked: string[],
 *   onPick: (id: string) => void,
 *   onClear: () => void,
 *   labels: { hint: string, yourOrder: string, clear: string },
 *   locked?: boolean,
 * }} props
 */
export function SequenceBuilder({ pool, picked, onPick, onClear, labels, locked = false }) {
  const pickedSet = new Set(picked);

  return (
    <div className="space-y-3">
      <p className="text-center text-xs font-semibold text-ink-muted">{labels.hint}</p>

      <ol className="min-h-[3.5rem] space-y-2 rounded-card bg-surface-sunken p-2">
        {picked.length === 0 && (
          <li className="py-3 text-center text-xs text-ink-subtle">{labels.yourOrder}</li>
        )}
        {picked.map((id, index) => (
          <li
            key={id}
            className="flex items-center gap-2 rounded-xl bg-surface px-3 py-2 font-display font-bold shadow-card"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs text-primary-strong">
              {index + 1}
            </span>
            <span className="min-w-0 break-words">{pool.find((item) => item.id === id)?.label}</span>
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap justify-center gap-2">
        {pool.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={locked || pickedSet.has(item.id)}
            onClick={() => onPick(item.id)}
            className={cn(
              'rounded-pill px-3.5 py-2 font-display text-sm font-bold transition',
              pickedSet.has(item.id)
                ? 'bg-surface-sunken text-ink-subtle opacity-50'
                : 'bg-primary-soft text-primary-strong hover:brightness-95 active:scale-95',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {picked.length > 0 && !locked && (
        <div className="flex justify-center">
          <Button variant="ghost" size="sm" onClick={onClear}>
            {labels.clear}
          </Button>
        </div>
      )}
    </div>
  );
}
