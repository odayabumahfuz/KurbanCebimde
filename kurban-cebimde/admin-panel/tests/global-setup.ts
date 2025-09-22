import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E test global setup...');
  
  // Verify environment variables
  const requiredEnvVars = [
    'BASE_URL',
    'API_BASE',
    'ADMIN_PANEL_EMAIL',
    'ADMIN_PANEL_PASSWORD',
    'STREAM_DURATION_SECONDS',
    'E2E_TEST'
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  console.log('✅ Environment variables verified');
  console.log(`📡 Base URL: ${process.env.BASE_URL}`);
  console.log(`🔌 API Base: ${process.env.API_BASE}`);
  console.log(`⏱️ Stream Duration: ${process.env.STREAM_DURATION_SECONDS}s`);

  // Test API connectivity (simplified)
  try {
    const response = await fetch(`${process.env.API_BASE}/health`);
    if (!response.ok) {
      throw new Error(`API health check failed: ${response.status}`);
    }
    console.log('✅ API connectivity verified');
  } catch (error) {
    console.error('❌ API connectivity check failed:', error);
    throw error;
  }

  console.log('🎉 Global setup completed successfully');
}

export default globalSetup;
