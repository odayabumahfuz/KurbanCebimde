import { test, expect } from '@playwright/test';
import { ActorManager } from './helpers/actors';
import { AuthHelper } from './helpers/auth';
import { SeedHelper } from './helpers/seed';
import { ApiClient } from './helpers/apiClient';

test.describe('Live Broadcast Flow', () => {
  let actorManager: ActorManager;
  let actors: any;

  test.beforeAll(async () => {
    actorManager = new ActorManager();
    actors = await actorManager.createActors();
  });

  test.afterAll(async () => {
    await actorManager.cleanup();
  });

  test('Complete live broadcast scenario @live', async () => {
    const { adminPanel, adminApp, userApp } = actors;
    
    // Preconditions
    await test.step('Given: Ensure at least one donation exists', async () => {
      const donation = await adminPanel.seedHelper.ensureDonationExists();
      expect(donation).toBeTruthy();
      expect(donation.status).toBe('pending');
    });

    await test.step('Given: Log in admin panel', async () => {
      await adminPanel.page.goto('/');
      
      // Wait for login form
      await expect(adminPanel.page.locator('input[type="email"], input[name="phoneOrEmail"]')).toBeVisible();
      
      // Fill login form
      await adminPanel.page.fill('input[type="email"], input[name="phoneOrEmail"]', process.env.ADMIN_PANEL_EMAIL!);
      await adminPanel.page.fill('input[type="password"]', process.env.ADMIN_PANEL_PASSWORD!);
      
      // Submit login
      await adminPanel.page.click('button[type="submit"], button:has-text("Giriş")');
      
      // Wait for dashboard
      await expect(adminPanel.page.locator('[data-testid="dashboard"], .dashboard')).toBeVisible({ timeout: 10000 });
    });

    await test.step('Given: Prepare user app session', async () => {
      // For now, we'll use API mode for user app
      // In a real scenario, this would be a mobile app or web app login
      const userToken = process.env.USER_APP_TOKEN!;
      userApp.apiClient.setAuthToken(userToken);
    });

    let streamId: string;
    let donationId: string;

    // Flow & Assertions
    await test.step('When: Admin App selects a donation and creates a broadcast', async () => {
      // Get a pending donation
      const donations = await adminPanel.apiClient.getDonations({ status: 'pending', limit: 1 });
      expect(donations.items.length).toBeGreaterThan(0);
      
      const donation = donations.items[0];
      donationId = donation.id;

      // Create broadcast via API (admin app mode)
      const streamData = {
        donationId: donation.id,
        scheduledAt: new Date().toISOString(),
        durationSeconds: parseInt(process.env.STREAM_DURATION_SECONDS!),
      };

      const stream = await adminApp.apiClient.createStream(streamData);
      expect(stream.id).toBeTruthy();
      expect(stream.status).toBe('scheduled');
      expect(stream.user.name).toBe(donation.userName);
      expect(stream.user.id).toBe(donation.userId);
      expect(stream.animal).toBe(donation.animal);

      streamId = stream.id;
    });

    await test.step('Then: Broadcast card appears in the "Yayınlar" page', async () => {
      // Navigate to broadcasts page
      await adminPanel.page.goto('/broadcasts');
      
      // Wait for broadcast card
      const broadcastCard = adminPanel.page.locator(`[data-testid="broadcast-card"]:has-text("${streamId}")`);
      await expect(broadcastCard).toBeVisible({ timeout: 10000 });

      // Assert fields are visible and correct
      await expect(broadcastCard.locator('[data-testid="field-user-name"]')).toHaveText(donations.items[0].userName);
      await expect(broadcastCard.locator('[data-testid="field-user-id"]')).toHaveText(donations.items[0].userId);
      await expect(broadcastCard.locator('[data-testid="field-animal"]')).toHaveText(donations.items[0].animal);
      
      const createdAtField = broadcastCard.locator('[data-testid="field-created-at"]');
      await expect(createdAtField).toBeVisible();
      const createdAtText = await createdAtField.textContent();
      expect(createdAtText).toMatch(/\d{4}-\d{2}-\d{2}/); // ISO date format
    });

    await test.step('When: Start broadcast from the card', async () => {
      const broadcastCard = adminPanel.page.locator(`[data-testid="broadcast-card"]:has-text("${streamId}")`);
      
      // Get initial active count
      const initialActiveCount = await adminPanel.page.locator('[data-testid="active-count"]').textContent();
      const initialActiveCountNum = parseInt(initialActiveCount || '0');

      // Click start broadcast
      await broadcastCard.locator('[data-testid="start-broadcast"]').click();

      // Assert broadcast is now active
      await expect(broadcastCard.locator('[data-testid="live-badge"]')).toBeVisible({ timeout: 5000 });

      // Assert active count incremented
      await expect(adminPanel.page.locator('[data-testid="active-count"]')).toHaveText((initialActiveCountNum + 1).toString());
    });

    await test.step('Then: User receives a push notification', async () => {
      // Wait for notification to be sent
      await adminPanel.page.waitForTimeout(2000);

      // Check last notification for user
      const notification = await userApp.apiClient.getLastNotification(donations.items[0].userId);
      expect(notification.message).toContain('Yayınınız 1 dk içerisinde başlıyor');
    });

    await test.step('When: User navigates to broadcast page', async () => {
      // Navigate to user app broadcast page
      await userApp.page.goto(`/broadcast/${streamId}`);
      
      // Should see waiting state initially
      await expect(userApp.page.locator('[data-testid="waiting-to-start"]')).toBeVisible();
    });

    await test.step('Then: Broadcast goes live and lasts for specified duration', async () => {
      // Wait for stream to go live
      await expect(async () => {
        const streamState = await adminPanel.apiClient.getStreamState(streamId);
        expect(streamState.status).toBe('live');
      }).toPass({ timeout: 10000 });

      // User should see live badge
      await expect(userApp.page.locator('[data-testid="live-badge"]')).toBeVisible();

      // Wait for stream to end (based on STREAM_DURATION_SECONDS)
      const duration = parseInt(process.env.STREAM_DURATION_SECONDS!) * 1000;
      await adminPanel.page.waitForTimeout(duration + 2000); // Add buffer
    });

    await test.step('Then: Broadcast ends automatically', async () => {
      // Get initial counts
      const initialActiveCount = await adminPanel.page.locator('[data-testid="active-count"]').textContent();
      const initialCompletedCount = await adminPanel.page.locator('[data-testid="completed-count"]').textContent();
      
      const initialActiveCountNum = parseInt(initialActiveCount || '0');
      const initialCompletedCountNum = parseInt(initialCompletedCount || '0');

      // Wait for stream to end
      await expect(async () => {
        const streamState = await adminPanel.apiClient.getStreamState(streamId);
        expect(streamState.status).toBe('ended');
      }).toPass({ timeout: 10000 });

      // Assert counts updated
      await expect(adminPanel.page.locator('[data-testid="active-count"]')).toHaveText((initialActiveCountNum - 1).toString());
      await expect(adminPanel.page.locator('[data-testid="completed-count"]')).toHaveText((initialCompletedCountNum + 1).toString());

      // Assert broadcast card moved to completed section or shows ended state
      const broadcastCard = adminPanel.page.locator(`[data-testid="broadcast-card"]:has-text("${streamId}")`);
      await expect(broadcastCard.locator('[data-testid="ended-badge"], [data-testid="completed-badge"]')).toBeVisible();
    });

    // Cleanup
    await test.step('Cleanup: Remove test data', async () => {
      await adminPanel.seedHelper.cleanupTestStream(streamId);
      // Note: We don't cleanup the donation as it might be needed for other tests
    });
  });

  // Negative checks
  test('Should prevent localhost usage in domain-only mode', async () => {
    expect(() => {
      new ApiClient('http://localhost:8000');
    }).toThrow('E2E tests should not use localhost in domain-only mode');
  });

  test('Should validate API responses are JSON', async () => {
    const { adminPanel } = actors;
    
    // This should fail if we get HTML instead of JSON
    await expect(async () => {
      await adminPanel.apiClient.get('/invalid-endpoint');
    }).rejects.toThrow('Expected JSON response');
  });
});
