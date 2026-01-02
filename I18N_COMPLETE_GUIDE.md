# Complete i18n Implementation Guide

## ✅ COMPLETED

### Infrastructure (100% Complete)
- ✅ Translation system (`lib/i18n/index.ts`)
- ✅ React hook (`hooks/useTranslation.ts`)
- ✅ Language switcher component
- ✅ RTL support for Arabic
- ✅ Language persistence (localStorage)

### Pages Translated (100% Complete)
- ✅ Homepage (`app/page.tsx`)
- ✅ Login (`app/app/login/page.tsx`)
- ✅ Signup (`app/app/signup/page.tsx`)
- ✅ TopBar (`components/layout/TopBar.tsx`)
- ✅ Main Dashboard (`app/app/dashboard/page.tsx` + `DashboardClient.tsx`)

### Translation Keys Structure
All keys are defined in `en.json`. French and Arabic files need to be updated to match.

## 📋 REMAINING WORK

### 1. Dashboard Pages Translation Integration

**Status**: Keys defined, pages need integration

**Pages to Update**:
- `app/app/dashboard/owner/page.tsx` - Owner dashboard
- `app/app/dashboard/kitchen/page.tsx` - Kitchen dashboard
- `app/app/dashboard/reception/page.tsx` - Reception dashboard
- `app/app/dashboard/waiter/page.tsx` - Waiter dashboard
- `app/app/dashboard/analytics/page.tsx` - Analytics dashboard
- `app/app/dashboard/inventory/page.tsx` - Inventory dashboard
- `app/app/dashboard/staff/page.tsx` - Staff dashboard
- `app/app/dashboard/tables/page.tsx` - Tables dashboard
- `app/app/dashboard/clients/page.tsx` - Clients dashboard
- `app/app/dashboard/settings/page.tsx` - Settings dashboard
- `app/app/dashboard/performance/page.tsx` - Performance dashboard
- `app/app/dashboard/operations/page.tsx` - Operations dashboard
- `app/app/dashboard/purchasing/page.tsx` - Purchasing dashboard

**How to Update Each Page**:

1. **For Server Components**: Create a client wrapper component
   ```typescript
   // Create: app/app/dashboard/owner/OwnerClient.tsx
   'use client'
   import { useTranslation } from '@/hooks/useTranslation'
   
   export default function OwnerClient({ analytics, user }) {
     const { t } = useTranslation()
     // Use t('dashboard.owner.*') for all strings
   }
   
   // Update: app/app/dashboard/owner/page.tsx
   import OwnerClient from './OwnerClient'
   
   export default async function OwnerDashboardPage() {
     const analytics = getOwnerAnalytics()
     return <OwnerClient analytics={analytics} user={user} />
   }
   ```

2. **For Client Components**: Add hook directly
   ```typescript
   'use client'
   import { useTranslation } from '@/hooks/useTranslation'
   
   export default function SomePage() {
     const { t } = useTranslation()
     // Replace all hardcoded strings
   }
   ```

### 2. Complete French Translations

**File**: `lib/i18n/fr.json`

**Status**: Structure exists, needs completion

**Action Required**:
1. Copy structure from `en.json`
2. Translate all values to professional French (SaaS terminology)
3. Ensure all keys match exactly

**Key Sections to Translate**:
- `dashboard.main.*` - Main dashboard
- `dashboard.owner.*` - Owner dashboard
- `dashboard.overview.*` - Overview metrics
- All other dashboard sections

### 3. Complete Arabic Translations

**File**: `lib/i18n/ar.json`

**Status**: Structure exists, needs completion

**Action Required**:
1. Copy structure from `en.json`
2. Translate all values to Modern Standard Arabic (MSA)
3. Use professional restaurant/business terminology
4. Ensure all keys match exactly

**Key Sections to Translate**:
- `dashboard.main.*` - Main dashboard
- `dashboard.owner.*` - Owner dashboard
- `dashboard.overview.*` - Overview metrics
- All other dashboard sections

### 4. Code Cleanup

**Tasks**:
- [ ] Remove unused imports across all files
- [ ] Remove `console.log` statements (keep `console.error` for error boundaries)
- [ ] Remove dead code
- [ ] Optimize re-renders with `React.memo` where needed
- [ ] Add lazy loading for heavy components

**Files to Check**:
- All dashboard pages
- All components
- All lib files

## 🎯 QUICK REFERENCE

### Translation Key Patterns

```typescript
// Common
t('common.appName')
t('common.save')
t('common.cancel')

// Homepage
t('home.hero.title')
t('home.features.qrOrdering.title')

// Auth
t('auth.login.title')
t('auth.signup.submit')

// Dashboard
t('dashboard.main.welcomeBack', { name: userName })
t('dashboard.overview.todayRevenue')
t('dashboard.owner.financialPerformance')

// Orders
t('dashboard.orders.pending')
t('dashboard.orders.accept')

// Inventory
t('dashboard.inventory.totalValuation')
t('dashboard.inventory.lowStockAlerts')

// Staff
t('dashboard.staff.title')
t('dashboard.staff.roles.owner')

// Analytics
t('dashboard.analytics.revenueGrowth')
t('dashboard.analytics.peakHours')
```

### RTL Support

Arabic automatically applies RTL:
- Language switcher updates `document.documentElement.dir`
- CSS handles layout automatically
- No additional code needed

### Language Persistence

- Stored in `localStorage` as `caffixo-language`
- Persists across page reloads
- Falls back to browser language

## 📊 PROGRESS TRACKING

- **Infrastructure**: 100% ✅
- **Translation Keys**: 100% ✅ (all keys defined in en.json)
- **Pages Translated**: ~30% (Homepage, Auth, Main Dashboard)
- **French Translations**: ~60% (needs dashboard.main and dashboard.owner)
- **Arabic Translations**: ~60% (needs dashboard.main and dashboard.owner)
- **Code Cleanup**: 0% (pending)

## 🚀 NEXT IMMEDIATE STEPS

1. **Update French translations** (`lib/i18n/fr.json`):
   - Add `dashboard.main.*` keys
   - Add `dashboard.owner.*` keys
   - Verify all keys match `en.json`

2. **Update Arabic translations** (`lib/i18n/ar.json`):
   - Add `dashboard.main.*` keys
   - Add `dashboard.owner.*` keys
   - Verify all keys match `en.json`

3. **Translate Owner Dashboard** (`app/app/dashboard/owner/page.tsx`):
   - Create `OwnerClient.tsx` wrapper
   - Replace all hardcoded strings with `t()` calls

4. **Code Cleanup**:
   - Run through all files
   - Remove unused imports
   - Remove console.logs

## ✅ VERIFICATION CHECKLIST

Before marking as complete:

- [ ] All pages work in English
- [ ] All pages work in French
- [ ] All pages work in Arabic (RTL)
- [ ] Language switcher works on all pages
- [ ] Language persists across reloads
- [ ] No hardcoded text remains
- [ ] Build passes with no errors
- [ ] No console errors in browser
- [ ] RTL layout correct for Arabic

## 📝 NOTES

- Server components need client wrappers for translations
- All translation keys must exist in all three languages
- Missing keys will fallback to English
- RTL is automatic for Arabic (no manual CSS needed)
- Language changes trigger page reload for RTL/LTR switch

