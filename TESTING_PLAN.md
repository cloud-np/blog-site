# Testing Plan for Blog Site (Astro Project)

## Overview

This document outlines the testing strategy for our Astro blog site. Based on industry best practices for Astro projects, we'll implement a comprehensive testing approach using **Vitest** for unit/component testing and **Playwright** for end-to-end (E2E) testing.

## Testing Stack

| Tool | Purpose | Why |
|------|---------|-----|
| **Vitest** | Unit & Component Tests | Native Vite integration, fast, works with Astro's `getViteConfig()` |
| **Playwright** | E2E Tests | Cross-browser support, modern API, recommended by Astro docs |
| **Happy-DOM** | DOM Environment | Lightweight DOM implementation for component tests |

## Testing Layers

### 1. Unit Tests (Vitest)
Test individual functions and utilities in isolation.

**Target Areas:**
- `src/libs/` - Utility functions (cookies, image processing, post management)
- `src/utils/` - Helper functions
- `src/i18n/` - Internationalization utilities
- `src/config/` - Configuration validators

**Examples:**
- Reading time calculation
- Cookie management functions
- Image URL transformations
- i18n translation functions

### 2. Component Tests (Vitest + Container API)
Test Astro and Svelte components in isolation using Astro's Container API.

**Target Areas:**
- `src/components/` - UI components (Astro & Svelte)
- `src/layouts/` - Page layouts

**Astro Components:**
- Use Astro Container API for server-side rendering
- Test component output HTML structure
- Verify props handling

**Svelte Components:**
- Use `@testing-library/svelte` for interactive components
- Test user interactions (clicks, inputs)
- Verify state changes

### 3. E2E Tests (Playwright)
Test complete user flows and page functionality.

**Target Areas:**
- Page navigation and routing
- Blog post rendering (MDX content)
- Interactive features (carousel, accordion, chess game)
- Cookie consent functionality
- Dark mode toggle
- Contact form submission
- RSS feed generation

**Test Scenarios:**
| Page | Test Cases |
|------|------------|
| Home (/) | Navigation works, hero section renders, bento grid displays |
| Blog (/blog) | Post list renders, pagination works, search/filter |
| Blog Post (/blog/[slug]) | Content renders, code blocks work, math (KaTeX) renders |
| Portfolio | Projects display correctly |

## Directory Structure

```
blog-site/
├── tests/
│   ├── unit/              # Unit tests for utilities
│   │   └── libs/
│   │       └── posts.test.ts
│   ├── components/        # Component tests
│   │   ├── astro/
│   │   └── svelte/
│   └── e2e/               # E2E tests
│       ├── home.spec.ts
│       ├── blog.spec.ts
│       └── navigation.spec.ts
├── vitest.config.ts       # Vitest configuration
├── playwright.config.ts   # Playwright configuration
└── package.json           # Updated with test scripts
```

## Configuration Files

### vitest.config.ts
```typescript
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    include: ['tests/unit/**/*.test.ts', 'tests/components/**/*.test.ts'],
    environment: 'happy-dom',
    globals: true,
  },
});
```

### playwright.config.ts
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://localhost:4321',
  },
});
```

## NPM Scripts

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "vitest run && playwright test"
  }
}
```

## Test Priorities

### Phase 1: Foundation (Current Sprint)
- [x] Set up Vitest configuration
- [x] Set up Playwright configuration
- [x] Create sample unit test
- [x] Create sample E2E test

### Phase 2: Core Coverage
- [ ] Unit tests for `src/libs/posts.ts` functions
- [ ] Unit tests for `src/libs/cookies.ts` functions
- [ ] E2E tests for home page
- [ ] E2E tests for blog listing and posts

### Phase 3: Interactive Components
- [ ] Svelte component tests (Carousel, Accordion)
- [ ] E2E tests for interactive features
- [ ] Cookie consent flow testing

### Phase 4: Full Coverage
- [ ] Layout component tests
- [ ] MDX content rendering tests
- [ ] Accessibility tests (a11y)
- [ ] Visual regression tests

## Running Tests

```bash
# Run all unit tests
pnpm test

# Run unit tests in watch mode
pnpm test:watch

# Run E2E tests
pnpm test:e2e

# Run E2E tests with UI
pnpm test:e2e:ui

# Run all tests
pnpm test:all
```

## CI/CD Integration

For GitHub Actions, add a workflow:

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm build
      - run: pnpm test
      - run: pnpm test:e2e
```

## Resources

- [Astro Testing Documentation](https://docs.astro.build/en/guides/testing/)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Astro Container API](https://docs.astro.build/en/reference/container-reference/)
