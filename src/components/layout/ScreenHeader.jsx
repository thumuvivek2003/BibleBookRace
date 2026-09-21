import { useNavigate } from 'react-router-dom';
import { IconButton } from '@/components/ui/index.js';
import { useTranslation } from '@/i18n/I18nProvider.jsx';
import { cn } from '@/utils/cn.js';

/**
 * Screen title with an optional back arrow.
 *
 * Centred on phones (thumb-reachable back button on the left), left-aligned
 * from `lg` where the side rail already anchors the eye.
 *
 * @param {{ title: string, subtitle?: string, backTo?: string|number, right?: React.ReactNode }} props
 */
export function ScreenHeader({ title, subtitle, backTo, right, className }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <header className={cn('relative flex items-center gap-2 py-4 lg:py-6', className)}>
      <div className={cn('w-10 shrink-0', backTo === undefined && 'lg:hidden')}>
        {backTo !== undefined && (
          <IconButton
            label={t('a11y.goBack')}
            onClick={() => (typeof backTo === 'string' ? navigate(backTo) : navigate(backTo ?? -1))}
          >
            <span aria-hidden="true">‹</span>
          </IconButton>
        )}
      </div>

      <div className="min-w-0 flex-1 text-center lg:text-left">
        <h1 className="truncate font-display text-2xl font-extrabold leading-tight lg:text-3xl">
          {title}
        </h1>
        {subtitle && <p className="truncate text-xs text-ink-muted lg:text-sm">{subtitle}</p>}
      </div>

      <div className="flex w-10 shrink-0 justify-end">{right}</div>
    </header>
  );
}
