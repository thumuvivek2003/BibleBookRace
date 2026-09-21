import { Button } from '@/components/ui/index.js';
import { cn } from '@/utils/cn.js';

/**
 * The celebration / correction card shown after every answer.
 * Wrong answers are never scolded - they simply show where the book lives.
 */
export function FeedbackPanel({ correct, title, explanation, detail, actionLabel, onContinue }) {
  return (
    <div className="animate-pop-in space-y-4 text-center">
      <div className="relative py-2">
        {correct && <Confetti />}
        <span
          className={cn(
            'inline-block text-7xl sm:text-8xl',
            correct ? 'animate-cheer-pulse' : 'animate-wiggle',
          )}
          aria-hidden="true"
        >
          {correct ? '🌟' : '💡'}
        </span>
      </div>

      <p
        className={cn(
          'font-display text-3xl font-extrabold sm:text-4xl',
          correct ? 'text-success-strong' : 'text-warning',
        )}
      >
        {title}
      </p>

      {explanation && (
        <div className="flex items-start gap-3 rounded-card bg-warning-soft p-4 text-left">
          <span className="text-2xl" aria-hidden="true">
            📖
          </span>
          <div className="min-w-0">
            <p className="break-words font-display text-base font-bold leading-snug">
              {explanation}
            </p>
            {detail && <p className="mt-1 break-words text-sm text-ink-muted">{detail}</p>}
          </div>
        </div>
      )}

      <Button tone="success" fullWidth onClick={onContinue}>
        {actionLabel}
      </Button>
    </div>
  );
}

/** Cheap, dependency-free confetti: eight coloured dots on a spring. */
function Confetti() {
  const pieces = ['bg-primary', 'bg-success', 'bg-warning', 'bg-accent', 'bg-danger', 'bg-info'];
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {pieces.map((colour, index) => (
        <span
          key={colour}
          className={cn('absolute h-2 w-2 animate-pop-in rounded-sm', colour)}
          style={{
            left: `${12 + index * 14}%`,
            top: `${index % 2 === 0 ? 8 : 62}%`,
            animationDelay: `${index * 60}ms`,
            transform: `rotate(${index * 37}deg)`,
          }}
        />
      ))}
    </div>
  );
}
