import { useEffect } from 'react';
import { cn } from '@/utils/cn.js';

/**
 * Bottom sheet dialog. Closes on Escape and on backdrop tap, and traps nothing
 * else - the app never stacks two of these.
 */
export function Modal({ open, onClose, title, children, className }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => event.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'relative w-full max-w-md animate-slide-up rounded-t-card bg-surface p-5 shadow-float',
          'safe-bottom sm:rounded-card',
          className,
        )}
      >
        {title && <h2 className="mb-3 font-display text-xl font-extrabold">{title}</h2>}
        {children}
      </div>
    </div>
  );
}
