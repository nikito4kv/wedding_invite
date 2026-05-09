import { promises as fs } from 'node:fs';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';

type Viewport = {
  width: number;
  height: number;
};

test.setTimeout(60_000);

const mobileViewport = { width: 390, height: 844 };
const evidenceDirectory = path.resolve(process.cwd(), '.sisyphus', 'evidence');

async function saveEvidence(page: Page, fileName: string, options: Parameters<Page['screenshot']>[0] = {}) {
  await fs.mkdir(evidenceDirectory, { recursive: true });
  await page.screenshot({ path: path.join(evidenceDirectory, fileName), ...options });
}

async function expectNoHorizontalOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
}

async function expectVisibleFocus(locator: ReturnType<Page['locator']>) {
  const focusStyles = await locator.evaluate((element) => {
    const computedStyles = window.getComputedStyle(element);

    return {
      boxShadow: computedStyles.boxShadow,
      outlineStyle: computedStyles.outlineStyle,
      outlineWidth: computedStyles.outlineWidth
    };
  });

  expect(
    focusStyles.outlineStyle !== 'none' || focusStyles.outlineWidth !== '0px' || focusStyles.boxShadow !== 'none'
  ).toBe(true);
}

async function expectMetadata(page: Page) {
  const metadata = await page.evaluate(() => {
    return {
      description: document.querySelector('meta[name="description"]')?.getAttribute('content') ?? null,
      ogDescription: document.querySelector('meta[property="og:description"]')?.getAttribute('content') ?? null,
      ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content') ?? null
    };
  });

  expect(metadata.description).toMatch(/14 июля 2026/);
  expect(metadata.ogTitle).toMatch(/Никита/);
  expect(metadata.ogDescription).toMatch(/Квариати/);
}

async function mockMediaPlayback(page: Page, mode: 'success' | 'block-first') {
  await page.addInitScript((selectedMode) => {
    let playCalls = 0;

    Object.defineProperty(HTMLMediaElement.prototype, 'paused', {
      configurable: true,
      get() {
        return (this as HTMLMediaElement & { __omoPaused?: boolean }).__omoPaused ?? true;
      }
    });

    HTMLMediaElement.prototype.play = function () {
      playCalls += 1;

      if (selectedMode === 'block-first' && playCalls === 1) {
        return Promise.reject(new DOMException('Playback was blocked.', 'NotAllowedError'));
      }

      (this as HTMLMediaElement & { __omoPaused?: boolean }).__omoPaused = false;
      this.dispatchEvent(new Event('play'));
      return Promise.resolve();
    };

    HTMLMediaElement.prototype.pause = function () {
      (this as HTMLMediaElement & { __omoPaused?: boolean }).__omoPaused = true;
      this.dispatchEvent(new Event('pause'));
    };
  }, mode);
}

async function openIntro(page: Page, viewport: Viewport = mobileViewport, revealTimeoutMs = 1000) {
  const introRoot = page.locator('[data-intro-state]');

  await page.setViewportSize(viewport);
  await page.goto('/');

  await expectNoHorizontalOverflow(page);
  await expect(introRoot).toHaveAttribute('data-intro-state', 'ready');
  await expect(page.getByTestId('wedding-title')).toHaveText(/Вы приглашены\s*на свадьбу/);
  await expect(page.getByTestId('wedding-title')).toBeVisible({ timeout: revealTimeoutMs });
  await expect(page.getByTestId('childhood-polaroids')).toBeVisible();

  await page.getByTestId('hero-region').scrollIntoViewIfNeeded();
  await expect(page.getByTestId('hero-region')).toBeVisible({ timeout: revealTimeoutMs });
  await expectNoHorizontalOverflow(page);
}

test('mobile title sheet keeps the rest of the invitation reachable', async ({ page }) => {
  await openIntro(page);

  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Никита\s*&\s*София/);

  const countdownRoot = page.getByTestId('countdown-root');
  await countdownRoot.scrollIntoViewIfNeeded();
  await expect(countdownRoot).toBeVisible();
  await saveEvidence(page, 'task-4-title-sheet.png', { fullPage: true });
});

test('reduced motion keeps the title sheet visible instantly without an opening button', async ({ page }) => {
  const introRoot = page.locator('[data-intro-state]');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize(mobileViewport);
  await page.goto('/');

  await expect(page.getByTestId('envelope-open-button')).toHaveCount(0);
  await expect(page.getByTestId('wedding-title')).toBeVisible({ timeout: 250 });
  await expect(introRoot).toHaveAttribute('data-intro-state', 'ready');
  await saveEvidence(page, 'task-4-title-reduced-motion.png', { fullPage: true });
});

test('music control is visible from the start and keeps a working manual toggle', async ({ page }) => {
  await mockMediaPlayback(page, 'success');
  await openIntro(page);

  const musicControl = page.getByTestId('music-control');
  const musicToggle = page.getByTestId('music-toggle');
  const musicStatus = page.getByTestId('music-status');

  await expect(musicControl).toBeVisible();
  await expect(musicToggle).toHaveAttribute('aria-pressed', 'false');
  await expect(musicStatus).toContainText('готова к запуску');

  await musicToggle.click();

  await expect(musicToggle).toHaveAttribute('aria-pressed', 'true');
  await expect(musicStatus).toContainText('Сейчас звучит');

  await musicToggle.click();

  await expect(musicToggle).toHaveAttribute('aria-pressed', 'false');
  await expect(musicStatus).toContainText('Музыка выключена');
});

test('blocked manual playback falls back to a visible retryable music toggle', async ({ page }) => {
  await mockMediaPlayback(page, 'block-first');
  await openIntro(page);

  const musicToggle = page.getByTestId('music-toggle');
  const musicStatus = page.getByTestId('music-status');

  await expect(page.getByTestId('music-control')).toBeVisible();
  await expect(musicToggle).toHaveAttribute('aria-pressed', 'false');
  await expect(musicStatus).toContainText('готова к запуску');

  await musicToggle.click();

  await expect(musicToggle).toHaveAttribute('aria-pressed', 'false');
  await expect(musicStatus).toContainText('Браузер заблокировал запуск музыки');

  await musicToggle.click();

  await expect(musicToggle).toHaveAttribute('aria-pressed', 'true');
  await expect(musicStatus).toContainText('Сейчас звучит');
});

test('placeholder audio does not emit a console 404 on the title sheet', async ({ page }) => {
  const consoleErrors: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  await openIntro(page);
  await page.waitForTimeout(300);

  expect(
    consoleErrors.filter(
      (message) => message.includes('/music/walks-sebastian-jautschus.mp3') || message.includes('404 (Not Found)')
    )
  ).toEqual([]);
});

test('responsive widths keep the layout stable and the airy hero invitation readable', async ({ page }) => {
  const viewports: Viewport[] = [
    { width: 360, height: 780 },
    mobileViewport,
    { width: 820, height: 1180 },
    { width: 1440, height: 1200 }
  ];

  for (const viewport of viewports) {
    await openIntro(page, viewport, 1500);

    const hero = page.getByTestId('hero-region');
    await hero.scrollIntoViewIfNeeded();
    await expect(hero).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Никита\s*&\s*София/);
    await expect(page.getByText('День, когда море, солнце и любовь')).toBeVisible();
    await expectNoHorizontalOverflow(page);

    if (viewport.width === 1440) {
      await saveEvidence(page, 'task-10-responsive-grid.png');
    }
  }
});

test('semantic landmarks, metadata, and heading structure remain coherent', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Никита\s*&\s*София/);
  await expectMetadata(page);

  await openIntro(page, mobileViewport, 1500);

  await expect(page.getByRole('main')).toBeVisible();

  const headingLevels = await page.locator('h1, h2, h3').evaluateAll((elements) => {
    return elements.map((element) => Number.parseInt(element.tagName.replace('H', ''), 10));
  });

  expect(headingLevels.filter((level) => level === 1)).toHaveLength(1);
  expect(headingLevels.includes(2)).toBe(true);
});

test('keyboard focus remains visible on the skip path and interactive controls', async ({ page }) => {
  await page.goto('/');

  const skipLink = page.getByTestId('skip-link');
  await skipLink.focus();
  await expect(skipLink).toBeVisible();
  await expectVisibleFocus(skipLink);

  await openIntro(page, mobileViewport, 1500);

  const musicToggle = page.getByTestId('music-toggle');
  await musicToggle.focus();
  await expect(musicToggle).toBeFocused();
  await expectVisibleFocus(musicToggle);

  const mapsLink = page.getByTestId('maps-link');
  await mapsLink.scrollIntoViewIfNeeded();
  await mapsLink.focus();
  await expect(mapsLink).toBeFocused();
  await expectVisibleFocus(mapsLink);
  await saveEvidence(page, 'task-10-focus-flow.png', { fullPage: true });
});

test('key interactions stay free of browser console errors after reveal', async ({ page }) => {
  const consoleErrors: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  await mockMediaPlayback(page, 'success');
  await openIntro(page);

  await page.getByTestId('music-toggle').click();
  await page.getByTestId('music-toggle').click();
  await page.getByTestId('maps-link').scrollIntoViewIfNeeded();
  await page.getByTestId('maps-link').focus();

  expect(consoleErrors).toEqual([]);
});

test('logistics section and external links are visible and safe after the intro', async ({ page }) => {
  await openIntro(page);

  await expect(page.getByText('Georgia, Kvariati, ul. Ioane Lazi, 27')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Вопросы' })).toBeVisible();
  await expect(page.getByText('Нужны ли цветы? 💐')).toBeVisible();
  await expect(page.getByText('Можно ли остаться на ночь? 🏡')).toBeVisible();

  const mapsLink = page.getByTestId('maps-link');
  await expect(mapsLink).toBeVisible();
  await expect(mapsLink).toHaveAttribute('href', /https:\/\/www\.google\.com\/maps\/dir\//);
  await expect(mapsLink).toHaveAttribute('target', '_blank');
  await expect(mapsLink).toHaveAttribute('rel', /noopener/);
  await expect(mapsLink).toHaveAttribute('rel', /noreferrer/);

  const telegramLink = page.getByTestId('telegram-chat-link');
  await expect(telegramLink).toBeVisible();
  await expect(telegramLink).toHaveAttribute('href', /https:\/\/t\.me\//);
  await expect(telegramLink).toHaveAttribute('target', '_blank');
  await expect(telegramLink).toHaveAttribute('rel', /noopener/);
  await expect(telegramLink).toHaveAttribute('rel', /noreferrer/);
});

test('mobile RSVP submits trimmed values and shows a success state', async ({ page }) => {
  let requestCount = 0;
  let submittedPayload: unknown;

  await page.route('**/api/rsvp', async (route) => {
    requestCount += 1;
    submittedPayload = route.request().postDataJSON();

    await page.waitForTimeout(180);

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        message: 'Спасибо! Мы получили ваш ответ и свяжемся, если понадобятся детали.'
      })
    });
  });

  await openIntro(page);

  const form = page.getByTestId('rsvp-form');
  const submitButton = page.getByTestId('rsvp-submit');
  const fullNameInput = page.getByLabel(/^Имя и фамилия$/);
  const plusOneInput = page.getByLabel(/^Имя и фамилия гостя \+1$/);

  await form.scrollIntoViewIfNeeded();
  await expect(form).toBeVisible();
  await expect(plusOneInput).toHaveCount(0);

  await fullNameInput.fill('  Анна Иванова  ');
  await page.getByLabel('С радостью приду').check();
  await page.getByLabel('Приду с парой').check();
  await expect(plusOneInput).toBeVisible();
  await plusOneInput.fill('  Иван Иванов  ');
  await page.getByLabel('Белое вино').check();
  await page.getByLabel('Игристое').check();

  await submitButton.click();

  await expect(submitButton).toBeDisabled();
  await expect(page.getByTestId('rsvp-success-state')).toContainText('Спасибо, мы вас записали');
  await expect(page.getByTestId('rsvp-success-state')).toContainText(
    'Спасибо! Мы получили ваш ответ и свяжемся, если понадобятся детали.'
  );
  await saveEvidence(page, 'task-8-rsvp-success.png', { fullPage: true });

  expect(requestCount).toBe(1);
  expect(submittedPayload).toEqual({
    fullName: 'Анна Иванова',
    attendance: 'yes',
    guestMode: 'plusOne',
    plusOneName: 'Иван Иванов',
    alcoholPreferences: ['Белое вино', 'Игристое']
  });
});

test('mobile RSVP hides, clears, and omits plus-one details when attendance changes to no', async ({ page }) => {
  let submittedPayload: unknown;

  await page.route('**/api/rsvp', async (route) => {
    submittedPayload = route.request().postDataJSON();

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        message: 'Спасибо! Мы получили ваш ответ и свяжемся, если понадобятся детали.'
      })
    });
  });

  await openIntro(page);

  const form = page.getByTestId('rsvp-form');
  const fullNameInput = page.getByLabel(/^Имя и фамилия$/);
  const plusOneInput = page.getByLabel(/^Имя и фамилия гостя \+1$/);

  await form.scrollIntoViewIfNeeded();
  await fullNameInput.fill('Анна Иванова');
  await page.getByLabel('С радостью приду').check();
  await page.getByLabel('Приду с парой').check();
  await expect(plusOneInput).toBeVisible();
  await plusOneInput.fill('Иван Иванов');

  await page.getByLabel('К сожалению, не смогу').check();
  await expect(plusOneInput).toHaveCount(0);

  await page.getByLabel('С радостью приду').check();
  await expect(plusOneInput).toBeVisible();
  await expect(plusOneInput).toHaveValue('');

  await page.getByLabel('К сожалению, не смогу').check();
  await page.getByLabel('Без алкоголя').check();
  await page.getByTestId('rsvp-submit').click();

  await expect(page.getByTestId('rsvp-success-state')).toBeVisible();
  expect(submittedPayload).toEqual({
    fullName: 'Анна Иванова',
    attendance: 'no',
    guestMode: 'plusOne',
    alcoholPreferences: ['Без алкоголя']
  });
});

test('mobile RSVP blocks invalid submissions, shows retry guidance after failure, and recovers on retry', async ({
  page
}) => {
  let requestCount = 0;

  await page.route('**/api/rsvp', async (route) => {
    requestCount += 1;

    if (requestCount === 1) {
      await route.fulfill({
        status: 502,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: false,
          error: {
            type: 'telegram',
            message: 'Не удалось отправить RSVP прямо сейчас. Попробуйте ещё раз немного позже.'
          }
        })
      });

      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        message: 'Спасибо! Мы получили ваш ответ и свяжемся, если понадобятся детали.'
      })
    });
  });

  await openIntro(page);

  const form = page.getByTestId('rsvp-form');
  const submitButton = page.getByTestId('rsvp-submit');
  const fullNameInput = page.getByLabel(/^Имя и фамилия$/);

  await form.scrollIntoViewIfNeeded();
  await submitButton.click();

  await expect(page.getByText('Укажите ваше имя и фамилию.')).toBeVisible();
  await expect(page.getByText('Выберите хотя бы один вариант по алкоголю.')).toBeVisible();
  expect(requestCount).toBe(0);

  await fullNameInput.fill('Мария Смирнова');
  await expect(page.getByText('Укажите ваше имя и фамилию.')).toHaveCount(0);
  await page.getByLabel('Приду один / одна').check();
  await page.getByLabel('Без алкоголя').check();

  await submitButton.click();

  await expect(page.getByTestId('rsvp-failure-state')).toContainText('Попробуйте отправить форму ещё раз');
  await expect(page.getByTestId('rsvp-failure-state')).toContainText('Главный контакт — Дарья');
  await expect(page.getByTestId('rsvp-failure-state')).toContainText('@Egor_Taranov');
  await expect(submitButton).toBeEnabled();
  await saveEvidence(page, 'task-8-rsvp-failure.png', { fullPage: true });
  expect(requestCount).toBe(1);

  await submitButton.click();

  await expect(page.getByTestId('rsvp-success-state')).toContainText(
    'Спасибо! Мы получили ваш ответ и свяжемся, если понадобятся детали.'
  );
  expect(requestCount).toBe(2);
});
