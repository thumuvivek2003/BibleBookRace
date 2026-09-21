export function EmptyState({ emoji = '📖', title, body, action }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-card bg-surface p-8 text-center shadow-card">
      <span className="text-4xl" aria-hidden="true">
        {emoji}
      </span>
      {title && <p className="font-display text-lg font-extrabold">{title}</p>}
      {body && <p className="text-sm text-ink-muted">{body}</p>}
      {action}
    </div>
  );
}
