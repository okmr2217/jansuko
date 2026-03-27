import { Page } from 'playwright';
import { capture } from '../utils/capture';
import { CONFIG } from '../config';

const BASE_URL = CONFIG.BASE_URL;

export async function runPcScenarios(page: Page): Promise<void> {
  // home-sessions-pc
  try {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    await capture(page, 'home-sessions-pc', 'pc');
  } catch (e) {
    console.error('❌ home-sessions-pc failed:', e);
  }

  // session-new-form-pc
  try {
    await page.goto(`${BASE_URL}/sections/new`);
    await page.waitForLoadState('networkidle');
    await capture(page, 'session-new-form-pc', 'pc');
  } catch (e) {
    console.error('❌ session-new-form-pc failed:', e);
  }

  // session-detail-pc: navigate to first section
  try {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    const firstSection = page.locator('a[href^="/sections/"], [data-section-item] a, li a[href*="/sections/"]').first();
    await firstSection.click({ timeout: 5000 });
    await page.waitForLoadState('networkidle');
    await capture(page, 'session-detail-pc', 'pc');

    // score-input-form (PC) - from section detail
    try {
      const scoreBtn = page.locator('button:has-text("点数入力"), button:has-text("記録"), button[aria-label*="点数"]').first();
      await scoreBtn.click({ timeout: 5000 });
      await page.waitForTimeout(300);
      await capture(page, 'score-input-form-pc', 'pc');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
    } catch (e) {
      console.error('❌ score-input-form-pc failed:', e);
    }

    // session-close-dialog (PC) - from section detail
    try {
      const closeBtn = page.locator('button:has-text("終了"), button[aria-label*="終了"]').first();
      await closeBtn.click({ timeout: 5000 });
      await page.waitForTimeout(300);
      await capture(page, 'session-close-dialog-pc', 'pc');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
    } catch (e) {
      console.error('❌ session-close-dialog-pc failed:', e);
    }

    // session-edit-dialog (PC) - from section detail
    try {
      const editBtn = page.locator('button:has-text("編集"), button[aria-label*="編集"]').first();
      await editBtn.click({ timeout: 5000 });
      await page.waitForTimeout(300);
      await capture(page, 'session-edit-dialog-pc', 'pc');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
    } catch (e) {
      console.error('❌ session-edit-dialog-pc failed:', e);
    }

    // game-delete-dialog (PC) - from section detail
    try {
      const gameDeleteBtn = page.locator('button:has-text("削除"), button[aria-label*="削除"]').first();
      await gameDeleteBtn.click({ timeout: 5000 });
      await page.waitForTimeout(300);
      await capture(page, 'game-delete-dialog-pc', 'pc');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
    } catch (e) {
      console.error('❌ game-delete-dialog-pc failed:', e);
    }
  } catch (e) {
    console.error('❌ session-detail-pc failed:', e);
  }

  // session-delete-dialog (PC) - from home
  try {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    const deleteBtn = page.locator('button:has-text("削除"), button[aria-label*="削除"]').first();
    await deleteBtn.click({ timeout: 5000 });
    await page.waitForTimeout(300);
    await capture(page, 'session-delete-dialog-pc', 'pc');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  } catch (e) {
    console.error('❌ session-delete-dialog-pc failed:', e);
  }

  // stats-pc
  try {
    await page.goto(`${BASE_URL}/stats`);
    await page.waitForLoadState('networkidle');
    await capture(page, 'stats-pc', 'pc');
  } catch (e) {
    console.error('❌ stats-pc failed:', e);
  }

  // stats-period-filter (PC)
  try {
    await page.goto(`${BASE_URL}/stats`);
    await page.waitForLoadState('networkidle');
    const periodFilter = page.locator('[role="combobox"], button:has-text("期間"), select').first();
    await periodFilter.click({ timeout: 5000 });
    await page.waitForTimeout(300);
    await capture(page, 'stats-period-filter', 'pc');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  } catch (e) {
    console.error('❌ stats-period-filter failed:', e);
  }

  // users-list (PC)
  try {
    await page.goto(`${BASE_URL}/users`);
    await page.waitForLoadState('networkidle');
    await capture(page, 'users-list-pc', 'pc');
  } catch (e) {
    console.error('❌ users-list-pc failed:', e);
  }

  // settings (PC)
  try {
    await page.goto(`${BASE_URL}/settings`);
    await page.waitForLoadState('networkidle');
    await capture(page, 'settings', 'pc');
  } catch (e) {
    console.error('❌ settings (skipped - route may not exist):', e);
  }
}

export async function runMobileScenarios(page: Page): Promise<void> {
  // home-sessions-mobile
  try {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    await capture(page, 'home-sessions-mobile', 'mobile');
  } catch (e) {
    console.error('❌ home-sessions-mobile failed:', e);
  }

  // session-new-form-mobile
  try {
    await page.goto(`${BASE_URL}/sections/new`);
    await page.waitForLoadState('networkidle');
    await capture(page, 'session-new-form-mobile', 'mobile');
  } catch (e) {
    console.error('❌ session-new-form-mobile failed:', e);
  }

  // session-detail-mobile: navigate to first section
  try {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    const firstSection = page.locator('a[href^="/sections/"], [data-section-item] a, li a[href*="/sections/"]').first();
    await firstSection.click({ timeout: 5000 });
    await page.waitForLoadState('networkidle');
    await capture(page, 'session-detail-mobile', 'mobile');

    // score-input-form (mobile)
    try {
      const scoreBtn = page.locator('button:has-text("点数入力"), button:has-text("記録"), button[aria-label*="点数"]').first();
      await scoreBtn.click({ timeout: 5000 });
      await page.waitForTimeout(400);
      await capture(page, 'score-input-form-mobile', 'mobile');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
    } catch (e) {
      console.error('❌ score-input-form-mobile failed:', e);
    }

    // session-close-dialog (mobile)
    try {
      const closeBtn = page.locator('button:has-text("終了"), button[aria-label*="終了"]').first();
      await closeBtn.click({ timeout: 5000 });
      await page.waitForTimeout(400);
      await capture(page, 'session-close-dialog-mobile', 'mobile');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
    } catch (e) {
      console.error('❌ session-close-dialog-mobile failed:', e);
    }

    // session-edit-dialog (mobile)
    try {
      const editBtn = page.locator('button:has-text("編集"), button[aria-label*="編集"]').first();
      await editBtn.click({ timeout: 5000 });
      await page.waitForTimeout(400);
      await capture(page, 'session-edit-dialog-mobile', 'mobile');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
    } catch (e) {
      console.error('❌ session-edit-dialog-mobile failed:', e);
    }

    // game-delete-dialog (mobile)
    try {
      const gameDeleteBtn = page.locator('button:has-text("削除"), button[aria-label*="削除"]').first();
      await gameDeleteBtn.click({ timeout: 5000 });
      await page.waitForTimeout(400);
      await capture(page, 'game-delete-dialog-mobile', 'mobile');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
    } catch (e) {
      console.error('❌ game-delete-dialog-mobile failed:', e);
    }
  } catch (e) {
    console.error('❌ session-detail-mobile failed:', e);
  }

  // session-delete-dialog (mobile) - from home
  try {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    const deleteBtn = page.locator('button:has-text("削除"), button[aria-label*="削除"]').first();
    await deleteBtn.click({ timeout: 5000 });
    await page.waitForTimeout(400);
    await capture(page, 'session-delete-dialog-mobile', 'mobile');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  } catch (e) {
    console.error('❌ session-delete-dialog-mobile failed:', e);
  }

  // session-reopen-dialog (mobile)
  try {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    const reopenBtn = page.locator('button:has-text("再開"), button[aria-label*="再開"]').first();
    await reopenBtn.click({ timeout: 5000 });
    await page.waitForTimeout(400);
    await capture(page, 'session-reopen-dialog-mobile', 'mobile');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  } catch (e) {
    console.error('❌ session-reopen-dialog-mobile failed:', e);
  }

  // stats-mobile
  try {
    await page.goto(`${BASE_URL}/stats`);
    await page.waitForLoadState('networkidle');
    await capture(page, 'stats-mobile', 'mobile');
  } catch (e) {
    console.error('❌ stats-mobile failed:', e);
  }

  // users-list (mobile)
  try {
    await page.goto(`${BASE_URL}/users`);
    await page.waitForLoadState('networkidle');
    await capture(page, 'users-list-mobile', 'mobile');
  } catch (e) {
    console.error('❌ users-list-mobile failed:', e);
  }
}

export async function runLoginScenario(page: Page): Promise<void> {
  try {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    await capture(page, 'login', 'pc');
  } catch (e) {
    console.error('❌ login failed:', e);
  }
}
