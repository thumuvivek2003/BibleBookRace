import { cn } from '@/utils/cn.js';
import { toneStyles } from '@/theme/tones.js';

/**
 * The one button in the app.
 *
 * Variants describe intent ("solid", "soft", "ghost") and `tone` picks the
 * colour family; neither knows any concrete colour, so every theme works.
 */

const SIZES = {
  sm: 'h-10 px-4 text-sm rounded-xl',
  md: 'h-12 px-5 text-base rounded-2xl',
  lg: 'h-14 px-6 text-lg rounded-2xl',
};

export function Button({
  children,
  tone = 'primary',
  variant = 'solid',
  size = 'lg',
  fullWidth = false,
  disabled = false,
  leading = null,
  trailing = null,
  className,
  type = 'button',
  ...rest
}) {
  const styles = toneStyles(tone);

  const variants = {
    solid: cn(styles.solid, styles.solidHover, 'shadow-pop active:translate-y-[2px] active:shadow-none'),
    soft: cn(styles.soft, 'hover:brightness-95'),
    outline: cn('bg-surface text-ink border-2', styles.border, 'hover:bg-surface-sunken'),
    ghost: 'bg-transparent text-ink-muted hover:bg-surface-sunken',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        'inline-flex select-none items-center justify-center gap-2 font-display font-bold',
        'transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none',
        SIZES[size],
        variants[variant],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {leading}
      <span className="truncate">{children}</span>
      {trailing}
    </button>
  );
}

/** Square, icon-only button - used for back arrows and the settings cog. */
export function IconButton({ children, label, className, tone = 'neutral', ...rest }) {
  const styles = toneStyles(tone);
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-full text-lg',
        'bg-surface text-ink shadow-card transition hover:brightness-95 active:scale-95',
        styles.ring,
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
