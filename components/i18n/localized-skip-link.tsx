'use client';

import { useLocaleUi } from '@/lib/i18n/locale-context';

export function LocalizedSkipLink() {
  const ui = useLocaleUi();

  return (
    <a className="skip-link" data-testid="skip-link" href="#main-content">
      {ui.skipLink}
    </a>
  );
}
