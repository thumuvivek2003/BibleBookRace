import { cn } from '@/utils/cn.js';
import { BottomNav } from './BottomNav.jsx';
import { NavRail } from './NavRail.jsx';

/**
 * The responsive frame every screen sits in.
 *
 * - phone: one column, navigation fixed to the bottom
 * - tablet: same column, wider gutters and more room per card
 * - desktop (`lg`): a persistent side rail, with the content centred beside it
 *
 * `width` says how wide the reading column may grow. Focused screens (a
 * question, a quest run) stay narrow at every size because a 1200px-wide
 * multiple choice is harder to answer, not easier.
 */
const WIDTHS = {
  narrow: 'max-w-lg',
  default: 'max-w-2xl',
  wide: 'max-w-5xl',
};

export function AppShell({ children, withNav = false, width = 'default', className }) {
  return (
    <div className="min-h-[100dvh] app-gradient">
      <div className="mx-auto flex w-full max-w-[90rem]">
        {withNav && <NavRail />}

        <div
          className={cn(
            'flex min-h-[100dvh] w-full min-w-0 flex-1 flex-col px-4 safe-top sm:px-6 lg:px-8',
            withNav ? 'pb-20 lg:pb-8' : 'safe-bottom',
            className,
          )}
        >
          <div className={cn('mx-auto flex w-full flex-1 flex-col', WIDTHS[width])}>{children}</div>
        </div>
      </div>

      {withNav && <BottomNav />}
    </div>
  );
}

/** Scrollable body below the header. */
export function ScreenBody({ children, className }) {
  return <main className={cn('flex-1 pb-6', className)}>{children}</main>;
}
