# E2E Tests for Kurban Cebimde Admin Panel

## Overview

This directory contains end-to-end tests for the Kurban Cebimde admin panel, focusing on the live broadcast flow with multi-actor scenarios.

## Test Structure

- `live-broadcast.e2e.spec.ts` - Main E2E test for live broadcast flow
- `helpers/` - Test utilities and helpers
  - `apiClient.ts` - API client with domain-only mode guards
  - `auth.ts` - Authentication helpers
  - `seed.ts` - Test data seeding utilities
  - `actors.ts` - Multi-actor test management
- `global-setup.ts` - Global test setup
- `global-teardown.ts` - Global test cleanup

## Environment Variables

Create `.env.e2e` file with:

```env
BASE_URL=http://localhost:3000
API_BASE=http://localhost:8000/api/v1
ADMIN_PANEL_EMAIL=admin@kurbancebimde.com
ADMIN_PANEL_PASSWORD=admin123
ADMIN_APP_TOKEN=admin-token-123
USER_APP_TOKEN=user-token-456
STREAM_DURATION_SECONDS=5
E2E_TEST=true
```

## Running Tests

### Local Development

```bash
# Run all E2E tests
npm run test:e2e

# Run only live broadcast tests
npm run test:e2e:live

# Run with UI
npm run test:e2e:ui
```

### Domain Testing

For domain testing, update `.env.e2e`:

```env
BASE_URL=https://admin.kurbancebimde.com
API_BASE=https://admin.kurbancebimde.com/api/v1
```

## Test Scenarios

### Live Broadcast Flow (@live)

1. **Preconditions**
   - Ensure at least one donation exists
   - Log in admin panel
   - Prepare user app session

2. **Admin App creates broadcast**
   - Select donation
   - Create scheduled broadcast
   - Verify broadcast card appears

3. **Start broadcast**
   - Click start broadcast button
   - Verify active count increments
   - Verify live badge appears

4. **User notification**
   - Verify user receives notification
   - Navigate to broadcast page
   - Verify waiting state

5. **Broadcast lifecycle**
   - Wait for stream to go live
   - Verify live badge for user
   - Wait for automatic end
   - Verify counts update correctly

## Test Adapters

The backend includes test adapters (only available when `E2E_TEST=true`):

- `/testing/streams/{id}/state` - Get stream state
- `/testing/notifications/last` - Get last notification for user

## Quality Standards

- No localhost usage in domain-only mode
- No arbitrary sleeps - use state polling
- Precise assertions with user names, IDs, animals
- Tests complete under 60s using `STREAM_DURATION_SECONDS=5`
- Cleanup test data after completion

## Troubleshooting

### Common Issues

1. **API connectivity**: Ensure backend is running and accessible
2. **Authentication**: Verify admin credentials in `.env.e2e`
3. **Test data**: Check if donations exist or are created properly
4. **Timing**: Adjust `STREAM_DURATION_SECONDS` if tests are too slow/fast

### Debug Mode

Run with debug output:

```bash
DEBUG=pw:api npm run test:e2e:live
```
