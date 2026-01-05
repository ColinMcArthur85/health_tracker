# Master Execution Checklist: Health Journal Upgrade Plan

**Document Version:** 1.0  
**Last Updated:** 2026-01-04  
**Status:** Planning Phase

---

## Overview

This is the master execution checklist for upgrading the Health Journal application with TDD, BDD, security hardening, and design improvements based on Eric Kennedy's "Antigravity" design principles.

**Technology Stack:**
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL via Prisma ORM
- **Storage:** Vercel Blob
- **AI:** OpenAI API (GPT-4)
- **Styling:** Tailwind CSS v4

**Legend:**
- 🔴 **CRITICAL** - Security or blocking issue
- 🟠 **HIGH** - Important for code quality
- 🟡 **MEDIUM** - Recommended improvement
- 🟢 **LOW** - Nice to have

---

## Phase Summary

| Phase | Title | Status | Priority |
|-------|-------|--------|----------|
| 0 | Prerequisites & Environment | [x] **Complete** | 🔴 CRITICAL |
| 1 | TDD Infrastructure | [x] **Complete** | 🟠 HIGH |
| 2 | Security Hardening | [ ] Not Started | 🔴 CRITICAL |
| 3 | BDD Feature Specifications | [ ] Not Started | 🟠 HIGH |
| 4 | Core Unit Tests | [ ] Not Started | 🟠 HIGH |
| 5 | API Route Tests | [ ] Not Started | 🟠 HIGH |
| 6 | Integration Tests | [ ] Not Started | 🟡 MEDIUM |
| 7 | Design System Overhaul | [ ] Not Started | 🟡 MEDIUM |
| 8 | Performance Optimization | [ ] Not Started | 🟡 MEDIUM |
| 9 | Documentation & Finalization | [ ] Not Started | 🟢 LOW |

---

## Phase 0: Prerequisites & Environment ⚙️

> Reference: [01_TDD_STRATEGY.md](./01_TDD_STRATEGY.md)

### Environment Verification

- [x] **0.1** Verify Node.js version is 20+ (`node -v`) — **v24.11.1** ✅
- [x] **0.2** Verify npm is up to date (`npm -v`) — **v11.6.2** ✅
- [x] **0.3** Verify TypeScript version (`npx tsc --version`) — **v5.9.3** ✅
- [x] **0.4** Verify Prisma is working (`npx prisma --version`) — **v5.22.0** ✅
- [x] **0.5** Run existing build to establish baseline (`npm run build`) — **Build succeeded** ✅ (fixed TypeScript error in photos/page.tsx)

### Git Setup

- [x] **0.6** Create backup branch (`git checkout -b backup/pre-tdd-upgrade`) — ✅
- [x] **0.7** Return to main branch (`git checkout main`) — ✅
- [x] **0.8** Create upgrade branch (`git checkout -b feature/tdd-security-upgrade`) — ✅

### Document Current State

- [x] **0.9** Run `npm audit` and document vulnerabilities — **0 vulnerabilities** ✅
- [x] **0.10** Document current test coverage (if any) — **No test framework installed** ✅
- [x] **0.11** Take screenshots of current UI for comparison — *Skipped (optional)* ✅

---

## Phase 1: TDD Infrastructure 🧪

> Reference: [01_TDD_STRATEGY.md](./01_TDD_STRATEGY.md)

### Testing Framework Setup

- [x] **1.1** Install Jest and React Testing Library — **324 packages added, 0 vulnerabilities** ✅
  ```bash
  npm install --save-dev jest @types/jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event ts-jest
  ```

- [x] **1.2** Create `jest.config.js` with Next.js configuration — ✅

- [x] **1.3** Create `jest.setup.ts` with global mocks — ✅

- [x] **1.4** Update `package.json` with test scripts — ✅
  - `test` ✅
  - `test:watch` ✅
  - `test:coverage` ✅
  - `test:ci` ✅
  - `test:unit` ✅
  - `test:api` ✅
  - `test:integration` ✅
  - `test:security` ✅

- [x] **1.5** Create test directory structure — ✅
  ```
  __tests__/
  ├── unit/
  │   ├── lib/
  │   └── components/
  ├── api/
  ├── integration/
  └── security/
  ```

- [x] **1.6** Create first sanity test to verify setup — Created `__tests__/unit/sanity.test.ts` ✅

- [x] **1.7** Run `npm test` to verify infrastructure works — **8 tests passed** ✅

---

## Phase 2: Security Hardening 🔒

> Reference: [02_SECURITY_HARDENING.md](./02_SECURITY_HARDENING.md)

### High Priority (Authentication)

- [ ] **2.1** 🔴 Install NextAuth.js or Clerk
- [ ] **2.2** 🔴 Create authentication middleware
- [ ] **2.3** 🔴 Protect `/dashboard/*` routes
- [ ] **2.4** 🔴 Protect all API routes with auth checks
- [ ] **2.5** 🔴 Implement Demo Mode (read-only guest access)

### Security Headers

- [ ] **2.6** Add security headers to `next.config.ts`
  - X-Frame-Options
  - X-Content-Type-Options
  - Content-Security-Policy
  - Referrer-Policy

### Input Validation

- [ ] **2.7** Create `lib/validation.ts` utility
- [ ] **2.8** Create `lib/sanitize.ts` utility
- [ ] **2.9** Add Zod schemas for all API inputs
- [ ] **2.10** Add file upload validation (type, size)

### Rate Limiting

- [ ] **2.11** Add rate limiting to AI endpoints
- [ ] **2.12** Add rate limiting to upload endpoints

---

## Phase 3: BDD Feature Specifications 📝

> Reference: [03_BDD_FEATURES.md](./03_BDD_FEATURES.md)

### Core Features

- [ ] **3.1** Define F01: Daily Log Management feature
- [ ] **3.2** Define F02: Photo Upload & Analysis feature
- [ ] **3.3** Define F03: Nutrition Tracking feature
- [ ] **3.4** Define F04: Workout Logging feature
- [ ] **3.5** Define F05: Protocol Management feature
- [ ] **3.6** Define F06: Dream Journal feature
- [ ] **3.7** Define F07: AI Chat Assistant feature
- [ ] **3.8** Define F08: Demo Mode feature

---

## Phase 4: Core Unit Tests 🔬

> Reference: [01_TDD_STRATEGY.md](./01_TDD_STRATEGY.md)

### Utility Tests

- [ ] **4.1** Create tests for `lib/prisma.ts`
- [ ] **4.2** Create tests for `lib/validation.ts`
- [ ] **4.3** Create tests for `lib/sanitize.ts`
- [ ] **4.4** Create tests for date utilities

### Component Tests

- [ ] **4.5** Create tests for `EmptyState` component
- [ ] **4.6** Create tests for `StatCard` component
- [ ] **4.7** Create tests for `PhotoGallery` component
- [ ] **4.8** Create tests for `MealList` component
- [ ] **4.9** Create tests for form components

### Coverage Goal

- [ ] **4.10** Achieve 60% coverage on `/lib` utilities
- [ ] **4.11** Achieve 60% coverage on core components

---

## Phase 5: API Route Tests 🌐

> Reference: [01_TDD_STRATEGY.md](./01_TDD_STRATEGY.md)

### CRUD API Tests

- [ ] **5.1** Test `/api/log/*` routes
- [ ] **5.2** Test `/api/photos/*` routes
- [ ] **5.3** Test `/api/protocols/*` routes
- [ ] **5.4** Test `/api/upload/*` routes
- [ ] **5.5** Test `/api/chat/*` routes

### Error Handling Tests

- [ ] **5.6** Test 400 responses for invalid input
- [ ] **5.7** Test 401 responses for unauthenticated requests
- [ ] **5.8** Test 404 responses for missing resources
- [ ] **5.9** Test 500 error handling

---

## Phase 6: Integration Tests 🔗

> Reference: [03_BDD_FEATURES.md](./03_BDD_FEATURES.md)

### User Flow Tests

- [ ] **6.1** Test daily log creation flow
- [ ] **6.2** Test photo upload and analysis flow
- [ ] **6.3** Test nutrition logging flow
- [ ] **6.4** Test workout logging flow
- [ ] **6.5** Test demo mode user experience

### Security Integration Tests

- [ ] **6.6** Test XSS prevention in all input fields
- [ ] **6.7** Test authentication across all protected routes
- [ ] **6.8** Test file upload security

---

## Phase 7: Design System Overhaul 🎨

> Reference: [04_DESIGN_IMPLEMENTATION.md](./04_DESIGN_IMPLEMENTATION.md)

### Color & Theme

- [ ] **7.1** Create brand-saturated color palette
- [ ] **7.2** Update CSS variables for dark/light mode
- [ ] **7.3** Implement "light from the sky" shadow system

### Components

- [ ] **7.4** Update button styles with proper states
- [ ] **7.5** Update card styles with hover effects
- [ ] **7.6** Update form input styles

### Layout

- [ ] **7.7** Increase whitespace in sections
- [ ] **7.8** Add visual motifs (dot grid, etc.)
- [ ] **7.9** Improve dashboard card layouts

---

## Phase 8: Performance Optimization ⚡

> Reference: [05_PERFORMANCE_OPTIMIZATION.md](./05_PERFORMANCE_OPTIMIZATION.md) (uses existing audit)

### Database

- [ ] **8.1** Add recommended indexes to Prisma schema
- [ ] **8.2** Run migration for indexes
- [ ] **8.3** Verify query performance

### Caching

- [ ] **8.4** Implement revalidation strategy for pages
- [ ] **8.5** Add caching headers to API responses

### Images

- [ ] **8.6** Verify lazy loading on photo galleries
- [ ] **8.7** Optimize image sizes

---

## Phase 9: Documentation & Finalization 📖

### Code Quality

- [ ] **9.1** Run `npm run lint` and fix all errors
- [ ] **9.2** Run `npm run build` and verify success
- [ ] **9.3** Run full test suite with coverage

### Documentation

- [ ] **9.4** Update `README.md` with testing instructions
- [ ] **9.5** Document API endpoints
- [ ] **9.6** Update `.agent/agents.md` with new guidelines

### Deploy

- [ ] **9.7** Create pull request
- [ ] **9.8** Review and merge
- [ ] **9.9** Verify Vercel deployment
- [ ] **9.10** Run post-deployment verification

---

## Quick Reference Commands

```bash
# Testing
npm test                          # Run all tests
npm run test:watch                # Watch mode
npm run test:coverage             # With coverage

# Development
npm run dev                       # Start dev server
npm run build                     # Production build

# Database
npx prisma studio                 # Database GUI
npx prisma migrate dev            # Run migrations
npx prisma db push                # Push schema changes

# Security
npm audit                         # Check vulnerabilities
npm audit fix                     # Auto-fix vulns
```

---

## Success Criteria

| Metric | Target | Actual |
|--------|--------|--------|
| Unit Test Coverage | ≥60% | ___% |
| API Test Coverage | ≥80% | ___% |
| Security Tests Pass | 100% | ___% |
| npm audit (high+) | 0 vulnerabilities | ____ |
| Lighthouse Performance | ≥90 | ____ |
| Build Success | Yes | [ ] |

---

## Related Documents

1. [01_TDD_STRATEGY.md](./01_TDD_STRATEGY.md) - Testing infrastructure and templates
2. [02_SECURITY_HARDENING.md](./02_SECURITY_HARDENING.md) - Security implementation plan
3. [03_BDD_FEATURES.md](./03_BDD_FEATURES.md) - Feature specifications (Gherkin)
4. [04_DESIGN_IMPLEMENTATION.md](./04_DESIGN_IMPLEMENTATION.md) - Antigravity design plan
5. [05_DEPENDENCY_AUDIT.md](./05_DEPENDENCY_AUDIT.md) - Dependency cleanup

---

## Completion Sign-Off

| Phase | Completed | Date | Verified By |
|-------|-----------|------|-------------|
| Phase 0: Prerequisites | [ ] | | |
| Phase 1: TDD Infrastructure | [ ] | | |
| Phase 2: Security Hardening | [ ] | | |
| Phase 3: BDD Features | [ ] | | |
| Phase 4: Core Unit Tests | [ ] | | |
| Phase 5: API Route Tests | [ ] | | |
| Phase 6: Integration Tests | [ ] | | |
| Phase 7: Design System | [ ] | | |
| Phase 8: Performance | [ ] | | |
| Phase 9: Documentation | [ ] | | |

**Final Sign-Off:** ________________  
**Date:** ________________
