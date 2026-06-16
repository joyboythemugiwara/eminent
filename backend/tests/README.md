# Tests Structure

This directory contains the comprehensive test suite for Eminent Tutorials backend.

## Directory Structure

```
tests/
├── fixtures/           # Test utilities and helpers
│   ├── database.ts     # Database setup/cleanup
│   ├── helpers.ts      # API call helpers (login, create, etc)
│   └── types.ts        # TypeScript interfaces
├── integration/        # Integration tests (API endpoints)
│   ├── health.test.ts
│   ├── auth.test.ts
│   ├── public-api.test.ts
│   ├── crud.test.ts
│   └── ...
└── unit/              # Unit tests (individual functions)
    ├── r2-config.test.ts
    └── ...
```

## Running Tests

```bash
# Run all tests
bun run test

# Run only integration tests
bun run test:integration

# Run only unit tests
bun run test:unit

# Watch mode (re-run on file changes)
bun run test:watch
```

## Test Requirements

### Before Running Tests

1. **PostgreSQL Running**: You must have PostgreSQL running locally or configured in .env
   ```bash
   # On macOS with Homebrew
   brew services start postgresql
   
   # Or run in Docker
   docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:latest
   ```

2. **Backend Server Running**: Tests require the backend to be running on port 3001
   ```bash
   # In another terminal
   bun run dev
   ```

3. **.env Configured**: Set up your DATABASE_URL
   ```bash
   DATABASE_URL=postgresql://localhost/eminent_tutorials
   JWT_SECRET=your-secret-key
   ```

## Test Organization

### Fixtures (`fixtures/`)
Reusable utilities for tests:
- **database.ts**: Database initialization and cleanup
- **helpers.ts**: API call wrappers (login, create class, etc)
- **types.ts**: TypeScript interfaces for API responses

### Integration Tests (`integration/`)
Tests that verify API endpoints work correctly:
- **health.test.ts**: Health check endpoint
- **public-api.test.ts**: Public read-only endpoints
- **auth.test.ts**: Login, logout, authentication
- **crud.test.ts**: Create, read, update, delete operations

### Unit Tests (`unit/`)
Tests for individual modules:
- **r2-config.test.ts**: Cloudflare R2 utilities

## Test Flow

1. **Setup**: `beforeAll()` initializes database and creates test data
2. **Tests**: Individual `test()` blocks verify functionality
3. **Cleanup**: `afterAll()` removes test data and closes connections

## Example: Adding a New Test

```typescript
// tests/integration/new-feature.test.ts
import { test, expect, describe, beforeAll, afterAll } from "bun:test";
import { initializeTestDatabase, closeTestDatabase } from "../fixtures/database";

describe("New Feature", () => {
  beforeAll(async () => {
    await initializeTestDatabase();
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  test("should do something", async () => {
    const response = await fetch("http://localhost:3001/api/v1/endpoint");
    expect(response.status).toBe(200);
  });
});
```

## Common Issues

### "Connection refused" Error
- Backend server is not running. Start with `bun run dev`
- Check .env DATABASE_URL points to running PostgreSQL

### "Database does not exist" Error
- Create database: `createdb eminent_tutorials`
- Or it will be created automatically on first server start

### Tests Hanging
- Kill any other test processes: `pkill -f "bun test"`
- Ensure backend is responsive: `curl http://localhost:3001/health`

### Port 3001 Already in Use
- Kill existing process: `lsof -i :3001 | grep LISTEN | awk '{print $2}' | xargs kill -9`
- Or change PORT in .env and package.json scripts
