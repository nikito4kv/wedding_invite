import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Manrope, Marck_Script } from 'next/font/google';
import { LanguageSwitcher } from '@/components/i18n/language-switcher';
import { LocalizedSkipLink } from '@/components/i18n/localized-skip-link';
import { LayoutShell } from '@/components/layout/layout-shell';
import { LanguageProvider } from '@/lib/i18n/locale-context';
import { siteDescription, siteName, siteOgImage, siteTitle, siteUrl } from '@/lib/site';
import './globals.css';

const bodyFont = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-body-base'
});

const displayFont = Cormorant_Garamond({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-display-accent',
  weight: ['400', '500', '600', '700']
});

const scriptFont = Marck_Script({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-script-accent',
  weight: '400'
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  alternates: {
    canonical: '/'
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    locale: 'ru_RU',
    siteName,
    type: 'website',
    images: [
      {
        url: siteOgImage,
        width: 1200,
        height: 630,
        alt: 'Свадебное приглашение Никиты и Софии',
        type: 'image/svg+xml'
      }
    ]
  }
};

export const viewport: Viewport = {
  themeColor: '#173a34'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${bodyFont.variable} ${displayFont.variable} ${scriptFont.variable}`}>
      <body>
        <LanguageProvider>
          <LocalizedSkipLink />
          <LanguageSwitcher />
          <LayoutShell>{children}</LayoutShell>
        </LanguageProvider>
      </body>
    </html>
  );
}
