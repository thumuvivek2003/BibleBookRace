import { cn } from '@/utils/cn.js';

export function StarRating({ value = 0, total = 3, label, className }) {
  return (
    <div className={cn('flex justify-center gap-1', className)} aria-label={label} role="img">
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={cn('text-3xl transition', index < value ? 'animate-pop-in' : 'opacity-25 grayscale')}
          style={{ animationDelay: `${index * 120}ms` }}
          aria-hidden="true"
        >
          ⭐
        </span>
      ))}
    </div>
  );
}
