import { describe, expect, it } from 'vitest';
import { siteDescription, siteName, siteOgImage, siteTitle, siteUrl } from '@/lib/site';

describe('site metadata', () => {
  it('exports the expected title', () => {
    expect(siteTitle).toBe('Никита & София — свадебное приглашение');
  });

  it('exports the expected sharing metadata', () => {
    expect(siteName).toBe('Никита & София');
    expect(siteDescription).toContain('14 июля 2026');
    expect(siteDescription).toContain('RSVP');
    expect(siteOgImage).toBe('/placeholders/photos/og-invite.svg');
    expect(siteUrl).toBe('https://nikita-sofia-invite.example');
  });
});
