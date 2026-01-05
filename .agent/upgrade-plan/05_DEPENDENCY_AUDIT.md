# Dependency Audit for Health Journal

**Document Version:** 1.0  
**Last Updated:** 2026-01-04  
**Status:** Planning Phase

---

## 📦 Current Dependencies

### Production Dependencies

```json
{
  "dependencies": {
    "@prisma/client": "^5.22.0",   // ✅ Keep - Core database client
    "@vercel/blob": "^2.0.0",      // ✅ Keep - Photo storage
    "clsx": "^2.1.1",              // ✅ Keep - Utility for class merging
    "date-fns": "^4.1.0",          // ✅ Keep - Date manipulation
    "lucide-react": "^0.555.0",    // ✅ Keep - Icon library
    "next": "^16.1.1",             // ✅ Keep - Core framework
    "openai": "^6.9.1",            // ✅ Keep - AI integration
    "react": "19.2.0",             // ✅ Keep - Core library
    "react-dom": "19.2.0",         // ✅ Keep - Core library
    "recharts": "^3.5.0",          // ✅ Keep - Data visualization
    "tailwind-merge": "^3.4.0"     // ✅ Keep - Tailwind class merging
  }
}
```

### Dev Dependencies

```json
{
  "devDependencies": {
    "@tailwindcss/postcss": "^4",        // ✅ Keep - Tailwind PostCSS
    "@types/node": "^20",                // ✅ Keep - Node types
    "@types/react": "^19",               // ✅ Keep - React types
    "@types/react-dom": "^19",           // ✅ Keep - React DOM types
    "baseline-browser-mapping": "^2.9.11", // ⚠️ Review - Unknown usage
    "eslint": "^9",                      // ✅ Keep - Linting
    "eslint-config-next": "16.0.5",      // ✅ Keep - Next.js ESLint
    "prisma": "^5.22.0",                 // ✅ Keep - Database toolkit
    "tailwindcss": "^4",                 // ✅ Keep - CSS framework
    "typescript": "^5"                   // ✅ Keep - TypeScript
  }
}
```

---

## ⚠️ Dependencies to Review

### 1. `baseline-browser-mapping` - **Potentially Unused**

- **Current Version:** ^2.9.11
- **Purpose:** Maps browser version baselines for CSS/JS transpilation
- **Assessment:** 
  - [ ] Check if referenced in any configuration files
  - [ ] Check if used in build process
- **Action:** Research usage, remove if unused

```bash
# Search for usage
grep -r "baseline-browser-mapping" .
grep -r "baseline" vite.config* next.config* postcss.config*
```

---

## ✅ Dependencies Confirmed Needed

All production dependencies are actively used:

| Dependency | Used In | Purpose |
|------------|---------|---------|
| @prisma/client | All API routes, lib/prisma.ts | Database access |
| @vercel/blob | /api/upload, /api/photos | Photo storage |
| clsx | All components | Conditional classnames |
| date-fns | Dashboard, logs, charts | Date formatting/calculations |
| lucide-react | All pages | Icons |
| next | Entire app | Framework |
| openai | /api/chat, AI analysis | AI integration |
| react/react-dom | Entire app | UI library |
| recharts | Dashboard charts | Data visualization |
| tailwind-merge | Component utilities | Merge Tailwind classes |

---

## 🔧 New Dependencies to Add

For the TDD/BDD/Security upgrade, the following dependencies are needed:

### Testing Framework

```bash
npm install --save-dev jest @types/jest jest-environment-jsdom
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install --save-dev ts-jest jest-mock-extended
```

| Package | Purpose | Category |
|---------|---------|----------|
| jest | Test runner | Testing Core |
| @types/jest | TypeScript types for Jest | Testing Core |
| jest-environment-jsdom | DOM simulation | Testing Core |
| @testing-library/react | React component testing | Testing Utilities |
| @testing-library/jest-dom | DOM matchers | Testing Utilities |
| @testing-library/user-event | User interaction simulation | Testing Utilities |
| ts-jest | TypeScript support for Jest | Testing Core |
| jest-mock-extended | Advanced mocking for Prisma | Testing Utilities |

### Authentication

```bash
npm install next-auth @auth/prisma-adapter
```

| Package | Purpose | Category |
|---------|---------|----------|
| next-auth | Authentication framework | Security |
| @auth/prisma-adapter | Prisma adapter for NextAuth | Security |

### Validation

```bash
npm install zod
```

| Package | Purpose | Category |
|---------|---------|----------|
| zod | Schema validation | Security |

### Rate Limiting (Optional)

```bash
npm install @upstash/ratelimit @upstash/redis
```

| Package | Purpose | Category |
|---------|---------|----------|
| @upstash/ratelimit | Request rate limiting | Security |
| @upstash/redis | Redis client for Upstash | Security |

### Animation (Optional)

```bash
npm install framer-motion
```

| Package | Purpose | Category |
|---------|---------|----------|
| framer-motion | Advanced animations | UX Enhancement |

---

## 📊 Dependency Analysis

### Bundle Size Impact

Run bundle analysis after adding new dependencies:

```bash
# Install bundle analyzer
npm install --save-dev @next/bundle-analyzer

# Add to next.config.ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);

# Run analysis
ANALYZE=true npm run build
```

### Security Analysis

```bash
# Check for vulnerabilities
npm audit

# Check for outdated packages
npm outdated

# Fix automatically
npm audit fix
```

---

## 🧹 Cleanup Commands

After reviewing and confirming each removal:

```bash
# Step 1: Check if baseline-browser-mapping is used
grep -r "baseline" . --include="*.ts" --include="*.tsx" --include="*.js" --include="*.json"

# Step 2: If unused, remove it
npm uninstall baseline-browser-mapping

# Step 3: Verify build still works
npm run build

# Step 4: Verify dev server works
npm run dev
```

---

## 📋 Post-Cleanup Verification Checklist

After any dependency changes:

- [ ] `npm run build` completes without errors
- [ ] `npm run dev` starts correctly
- [ ] All pages render properly
- [ ] All API routes work
- [ ] Database operations work
- [ ] Photo upload works
- [ ] AI chat works
- [ ] No console errors

---

## 🎯 Target package.json Structure

After upgrade:

```json
{
  "name": "health-journal",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "dev:clean": "pkill -f 'next dev' || true && rm -rf .next && next dev",
    "build": "prisma generate && prisma migrate deploy && next build",
    "start": "next start",
    "lint": "eslint",
    "postinstall": "prisma generate",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage",
    "test:unit": "jest --testPathPattern='__tests__/unit'",
    "test:api": "jest --testPathPattern='__tests__/api'",
    "test:integration": "jest --testPathPattern='__tests__/integration'",
    "test:security": "jest --testPathPattern='__tests__/security'",
    "audit": "npm audit",
    "audit:fix": "npm audit fix"
  },
  "dependencies": {
    "@prisma/client": "^5.22.0",
    "@vercel/blob": "^2.0.0",
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "lucide-react": "^0.555.0",
    "next": "^16.1.1",
    "next-auth": "^5.0.0",
    "openai": "^6.9.1",
    "react": "19.2.0",
    "react-dom": "19.2.0",
    "recharts": "^3.5.0",
    "tailwind-merge": "^3.4.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@auth/prisma-adapter": "^2.0.0",
    "@tailwindcss/postcss": "^4",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/react": "^15.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@types/jest": "^29.0.0",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.0.5",
    "jest": "^29.0.0",
    "jest-environment-jsdom": "^29.0.0",
    "jest-mock-extended": "^3.0.0",
    "prisma": "^5.22.0",
    "tailwindcss": "^4",
    "ts-jest": "^29.0.0",
    "typescript": "^5"
  }
}
```

---

## 📚 Related Documents

- [00_MASTER_CHECKLIST.md](./00_MASTER_CHECKLIST.md) - Overall project checklist
- [01_TDD_STRATEGY.md](./01_TDD_STRATEGY.md) - Testing dependencies details
- [02_SECURITY_HARDENING.md](./02_SECURITY_HARDENING.md) - Security dependencies details
