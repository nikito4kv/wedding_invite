'use client';

import { useLocale, type Locale } from '@/lib/i18n/locale-context';
import styles from './language-switcher.module.css';

const options: Array<{ locale: Locale; label: string }> = [
  { locale: 'ru', label: 'RU' },
  { locale: 'uk', label: 'UA' }
];

export function LanguageSwitcher() {
  const { locale, setLocale, ui } = useLocale();

  return (
    <div className={styles.switcher} aria-label={ui.switcherLabel} role="group">
      {options.map((option) => (
        <button
          key={option.locale}
          className={`${styles.option} ${locale === option.locale ? styles.optionActive : ''}`}
          type="button"
          aria-pressed={locale === option.locale}
          onClick={() => setLocale(option.locale)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
