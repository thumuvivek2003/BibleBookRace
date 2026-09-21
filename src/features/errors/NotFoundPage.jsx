import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell.jsx';
import { Button, EmptyState } from '@/components/ui/index.js';
import { useTranslation } from '@/i18n/I18nProvider.jsx';
import { ROUTES } from '@/app/routes.js';

export function NotFoundPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <AppShell width="narrow" className="justify-center">
      <EmptyState
        emoji="🧭"
        title={t('errors.notFound')}
        action={
          <Button className="mt-3" onClick={() => navigate(ROUTES.home)}>
            {t('errors.goHome')}
          </Button>
        }
      />
    </AppShell>
  );
}
