import { Browser, BrowserContext, Page, chromium } from '@playwright/test';
import { ApiClient } from './apiClient';
import { AuthHelper } from './auth';
import { SeedHelper } from './seed';

export interface TestActors {
  adminPanel: {
    browser: Browser;
    context: BrowserContext;
    page: Page;
    apiClient: ApiClient;
    authHelper: AuthHelper;
    seedHelper: SeedHelper;
  };
  adminApp: {
    apiClient: ApiClient;
    authHelper: AuthHelper;
  };
  userApp: {
    browser: Browser;
    context: BrowserContext;
    page: Page;
    apiClient: ApiClient;
    authHelper: AuthHelper;
  };
}

export class ActorManager {
  private actors: TestActors | null = null;

  async createActors(): Promise<TestActors> {
    const baseURL = process.env.BASE_URL || 'http://localhost:3000';
    const apiBase = process.env.API_BASE || 'http://localhost:8000/api/v1';

    // Create browsers
    const adminPanelBrowser = await chromium.launch();
    const userAppBrowser = await chromium.launch();

    // Create contexts
    const adminPanelContext = await adminPanelBrowser.newContext({
      storageState: undefined, // Will be set after login
    });

    const userAppContext = await userAppBrowser.newContext({
      storageState: undefined, // Will be set after login
    });

    // Create pages
    const adminPanelPage = await adminPanelContext.newPage();
    const userAppPage = await userAppContext.newPage();

    // Create API clients
    const adminPanelApiClient = new ApiClient(apiBase);
    const adminAppApiClient = new ApiClient(apiBase);
    const userAppApiClient = new ApiClient(apiBase);

    // Create helpers
    const adminPanelAuthHelper = new AuthHelper(adminPanelApiClient);
    const adminAppAuthHelper = new AuthHelper(adminAppApiClient);
    const userAppAuthHelper = new AuthHelper(userAppApiClient);

    const adminPanelSeedHelper = new SeedHelper(adminPanelApiClient);

    this.actors = {
      adminPanel: {
        browser: adminPanelBrowser,
        context: adminPanelContext,
        page: adminPanelPage,
        apiClient: adminPanelApiClient,
        authHelper: adminPanelAuthHelper,
        seedHelper: adminPanelSeedHelper,
      },
      adminApp: {
        apiClient: adminAppApiClient,
        authHelper: adminAppAuthHelper,
      },
      userApp: {
        browser: userAppBrowser,
        context: userAppContext,
        page: userAppPage,
        apiClient: userAppApiClient,
        authHelper: userAppAuthHelper,
      },
    };

    return this.actors;
  }

  async cleanup(): Promise<void> {
    if (this.actors) {
      await this.actors.adminPanel.browser.close();
      await this.actors.userApp.browser.close();
      this.actors = null;
    }
  }

  getActors(): TestActors {
    if (!this.actors) {
      throw new Error('Actors not created. Call createActors() first.');
    }
    return this.actors;
  }
}

export const createActorManager = () => new ActorManager();
