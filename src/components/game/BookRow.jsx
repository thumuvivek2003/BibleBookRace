import { cn } from '@/utils/cn.js';

/** One book in a list: index chip, name, and whatever the screen wants on the right. */
export function BookRow({ index, name, caption, tone = 'bg-primary-soft text-primary-strong', right, onClick, className }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition',
        onClick && 'hover:bg-surface-sunken active:scale-[0.99]',
        className,
      )}
    >
      {index !== undefined && (
        <span
          className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold',
            tone,
          )}
        >
          {index}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block break-words font-display font-bold leading-tight">{name}</span>
        {caption && <span className="block text-xs text-ink-muted">{caption}</span>}
      </span>
      {right}
    </Tag>
  );
}
