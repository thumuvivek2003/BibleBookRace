import { useState } from 'react';
import { Button, Card } from '@/components/ui/index.js';
import { normaliseSetting } from '@/domain/games/gameCatalog.js';
import { useTranslation } from '@/i18n/I18nProvider.jsx';
import { cn } from '@/utils/cn.js';

/**
 * Asks a configurable game's one question before the round starts - currently
 * "how many books?" for Put In Order.
 *
 * The presets cover what most people want; the custom field goes up to the
 * whole canon. Whatever is typed passes through `normaliseSetting`, so the
 * round can never be handed a size it cannot build.
 */
export function GameSetup({ game, onStart }) {
  const { t } = useTranslation();
  const { presets, default: fallback, min, max } = game.setting;

  const [choice, setChoice] = useState(fallback);
  const [custom, setCustom] = useState('');

  const isCustom = choice === 'custom';
  const resolved = isCustom ? normaliseSetting(game, custom) : choice;
  const customIsValid = !isCustom || (custom !== '' && String(resolved) === String(Math.floor(Number(custom))));

  return (
    <div className="space-y-4">
      <Card className="space-y-4 p-5 sm:p-6">
        <div className="text-center">
          <span className="text-4xl" aria-hidden="true">
            {game.emoji}
          </span>
          <h2 className="mt-2 font-display text-xl font-extrabold sm:text-2xl">
            {t('setup.howMany')}
          </h2>
          <p className="mt-1 text-sm text-ink-muted">{t(`games.${game.id}.description`)}</p>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {presets.map((preset) => (
            <SizeButton
              key={preset}
              active={choice === preset}
              onClick={() => setChoice(preset)}
              label={preset}
            />
          ))}
          <SizeButton
            active={isCustom}
            onClick={() => setChoice('custom')}
            label={t('setup.custom')}
            small
          />
        </div>

        {isCustom && (
          <label className="block">
            <span className="mb-1 block px-1 text-xs font-bold uppercase tracking-wide text-ink-muted">
              {t('setup.range', { min, max })}
            </span>
            <input
              type="number"
              inputMode="numeric"
              min={min}
              max={max}
              value={custom}
              onChange={(event) => setCustom(event.target.value)}
              placeholder={String(fallback)}
              className={cn(
                'w-full rounded-2xl bg-surface-sunken px-4 py-3 text-center font-display text-xl font-extrabold outline-none',
                !customIsValid && custom !== '' && 'text-danger-strong',
              )}
            />
            {!customIsValid && custom !== '' && (
              <span className="mt-1 block px-1 text-xs font-semibold text-danger-strong">
                {t('setup.corrected', { value: resolved })}
              </span>
            )}
          </label>
        )}
      </Card>

      <Button tone="success" size="lg" fullWidth onClick={() => onStart({ [game.setting.key]: resolved })}>
        {t('setup.start', { count: resolved })}
      </Button>
    </div>
  );
}

function SizeButton({ active, onClick, label, small = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-2xl py-3 font-display font-extrabold transition active:scale-95',
        small ? 'text-xs' : 'text-lg',
        active ? 'bg-primary text-on-primary shadow-pop' : 'bg-surface-sunken text-ink hover:brightness-95',
      )}
    >
      {label}
    </button>
  );
}
