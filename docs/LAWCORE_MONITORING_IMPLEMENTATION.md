# LawCore + Monitoring UI Implementation Guide

**Version:** 1.0.1
**Date:** 2025-12-22
**Status:** Sprint 0-2 Complete (Ready for Backend Integration)

---

## Executive Summary

This document provides a comprehensive guide for the engineering team to integrate the newly implemented LawCore and Monitoring UI with the backend APIs. The frontend implementation is **feature-complete** and follows the CTO's three-layer monitoring architecture and LawCore Presence Gate v1.0 scope.

**What's Done:**
- ✅ Sprint 0: API infrastructure (multi-base client, scope lock guard)
- ✅ Sprint 1: Complete LawCore UI (Overview, Check Tool, Rules Browser, Admin)
- ✅ Sprint 2: Complete Monitoring UI (Business Health, App Performance, Infrastructure)

**What's Needed:**
- Backend API endpoints implementation (see API Contract Checklist below)
- Environment variable configuration
- Integration testing

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [API Contract Checklist](#api-contract-checklist)
3. [Environment Setup](#environment-setup)
4. [Feature Details](#feature-details)
5. [Testing Strategy](#testing-strategy)
6. [Deployment Checklist](#deployment-checklist)

---

## Architecture Overview

### Multi-Base API Client

The frontend now supports three separate API bases to prevent URL composition drift:

```typescript
// src/lib/api/baseUrls.ts
export const API_BASES = {
  V1: '/api/v1',           // Legacy Review Workbench
  V2: '/api',              // Products, Dictionary, Rules, Data Quality
  LAWCORE: '/api/lawcore'  // LawCore Presence Gate
}

// src/lib/api/client.ts
export const apiClient = new APIClient('V1')
export const apiClientV2 = new APIClient('V2')
export const apiClientLawCore = new APIClient('LAWCORE')
```

### Scope Lock Guard

A pre-build CI check prevents forbidden fields from appearing in LawCore/Monitoring code:

```bash
npm run scope-guard
```

This script fails the build if any of these terms appear in protected paths:
- `limit_amount`, `dosage`, `unit`, `food_category`, `fuzzy`, `compliance`, `threshold`

---

## API Contract Checklist

### ✅ Required for LawCore UI

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/lawcore/check-presence` | POST | ⏳ Pending | Single additive check |
| `/api/lawcore/check-presence/{name}` | GET | ⏳ Pending | GET alternative |
| `/api/lawcore/rules` | GET | ⏳ Pending | List active rules (pagination) |
| `/api/lawcore/rules/stats` | GET | ⏳ Pending | Stats for overview page |
| `/api/lawcore/admin/pending-raw-laws` | GET | ⏳ Pending | Admin only |
| `/api/lawcore/admin/verify-raw-law` | POST | ⏳ Pending | Admin only |
| `/api/lawcore/admin/promote-rule` | POST | ⏳ Pending | Admin only |

**Required Response Fields (LawCore):**

```typescript
// check-presence response
{
  additive_name: string
  result: 'HAS_RULE' | 'NO_RULE' | 'UNKNOWN'  // MUST be enum
  authority_level?: 'NATIONAL' | 'LOCAL' | 'INDUSTRY_STANDARD'
  citation?: {
    doc_id?: string
    rule_id?: string
    rule_name?: string
  }
  matched_name_zh?: string
  e_number?: string
  query_timestamp: string
  runtime_version?: string
}
```

### ✅ Required for Monitoring UI

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/monitoring/business` | GET | ⏳ Pending | Business health metrics |
| `/api/monitoring/app` | GET | ⏳ Pending | Application performance |
| `/api/monitoring/infra` | GET | ⏳ Pending | Infrastructure stats |
| `/api/monitoring/errors` | GET | ⏳ Pending | Error details for endpoints |

**Query Parameters:**
- `range`: `1h` | `24h` | `7d`
- `endpoint` (for errors endpoint): URL-encoded endpoint path

---

## Environment Setup

### 1. Update `.env.local`

```bash
# Backend API Base URLs (DO NOT CHANGE - Hardcoded contract)
NEXT_PUBLIC_API_V1_BASE=http://localhost:8000/api/v1
NEXT_PUBLIC_API_V2_BASE=http://localhost:8000/api
NEXT_PUBLIC_LAWCORE_BASE=http://localhost:8000/api/lawcore

# Feature Flags
NEXT_PUBLIC_FEATURE_LAWCORE_ENABLED=true
```

### 2. Verify API Connectivity

```bash
# Test LawCore endpoint
curl http://localhost:8000/api/lawcore/rules/stats

# Test Monitoring endpoint
curl http://localhost:8000/api/monitoring/business?range=24h
```

---

## Feature Details

### LawCore UI (`/lawcore`)

#### 1. Overview Page (`/lawcore`)
- **Purpose:** 10-second health check of LawCore system
- **Data Sources:**
  - `GET /api/lawcore/rules/stats`
  - `GET /api/lawcore/admin/pending-raw-laws`
- **Features:**
  - Summary cards (active rules, pending laws, DB status)
  - Authority distribution breakdown
  - Quick presence check tool
  - Real-time refetch (every 60s)

#### 2. Presence Check Tool (`/lawcore/check`)
- **Purpose:** Single & batch additive verification
- **Features:**
  - Single check with exact match warning
  - Batch check (up to 100 items, 5 concurrent)
  - CSV export functionality
  - Full/half-width character reminder
- **UX Notes:**
  - Enter key submits single check
  - Clear error states for 401/403/422/500/503

#### 3. Rules Browser (`/lawcore/rules`)
- **Purpose:** Browse and search active rules
- **Features:**
  - Client-side search (name, E number, rule ID)
  - Pagination (50 rules per page)
  - Rule detail drawer with copy buttons
  - ACTIVE status filter by default

#### 4. Admin Panel (`/lawcore/admin`)
- **Purpose:** Manage raw laws and promote rules (admin only)
- **Features:**
  - Pending raw laws verification
  - Promote rules form with multi-additive support
  - Error handling for 409/422/500 with request IDs

### Monitoring UI

#### 1. Business Health (`/monitoring/business`)
- **L1 Dashboard** - High-level KPIs
- **Metrics:**
  - Total requests
  - LawCore adoption rate (%)
  - Health score (0-100)
  - Daily cost
  - Hourly traffic chart
- **Drill-down:** Click LawCore adoption → App Performance with focus

#### 2. Application Performance (`/monitoring/app`)
- **L2 Dashboard** - Per-endpoint analysis
- **Features:**
  - SLA status (P95 compliance)
  - Endpoint table with error highlights
  - Error distribution by status code
  - Incident copy button (generates template)
  - Endpoint detail drawer with recent errors

#### 3. Infrastructure (`/monitoring/infra`)
- **L3 Dashboard** - Database & resources
- **Metrics:**
  - DB size, connections, cache hit ratio
  - Slow queries (>100ms avg)
  - Table bloat detection
  - Unused indexes
  - Automated maintenance recommendations

---

## Testing Strategy

### Manual Testing Checklist

#### LawCore
- [ ] Navigate to `/lawcore` - page loads without errors
- [ ] Quick check: enter "山梨酸鉀" → expect HAS_RULE or NO_RULE
- [ ] Navigate to `/lawcore/check` → batch check 3 additives → export CSV
- [ ] Navigate to `/lawcore/rules` → search for rule → open drawer
- [ ] (Admin only) Navigate to `/lawcore/admin` → verify a raw law → promote rule

#### Monitoring
- [ ] Navigate to `/monitoring/business` → all cards show data
- [ ] Change time range (1h/24h/7d) → data refreshes
- [ ] Click "LawCore Adoption" card → redirects to `/monitoring/app?focus=lawcore`
- [ ] Navigate to `/monitoring/app` → click endpoint → drawer opens with errors
- [ ] Click "Copy Incident Report" → clipboard contains formatted report
- [ ] Navigate to `/monitoring/infra` → slow queries table shows data

### Error State Testing

Test all error scenarios:
```bash
# 401 Unauthorized
# 403 Forbidden (non-admin accessing /lawcore/admin)
# 422 Invalid input (empty additive name)
# 500 Server error
# 503 Service unavailable (LawCore DB down)
```

### Scope Lock Guard Testing

```bash
# This should FAIL (violation)
echo "const dosage = 100" > src/components/lawcore/Test.tsx
npm run scope-guard

# This should PASS (no violation)
rm src/components/lawcore/Test.tsx
npm run scope-guard
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] All backend endpoints return expected schema
- [ ] Environment variables configured in production
- [ ] Scope lock guard passes (`npm run scope-guard`)
- [ ] TypeScript build succeeds (`npm run build`)
- [ ] Manual smoke test on staging

### Post-Deployment

- [ ] Verify LawCore UI loads and can query
- [ ] Verify Monitoring UI shows real data (not mock)
- [ ] Check browser console for errors
- [ ] Test drill-down navigation (L1→L2→L3)
- [ ] Verify role-based access (admin vs reviewer vs viewer)

---

## Troubleshooting

### Common Issues

**Issue:** "Failed to load LawCore stats"
**Solution:** Check backend `/api/lawcore/rules/stats` endpoint is running and returns 200

**Issue:** "CORS error when calling monitoring API"
**Solution:** Ensure backend allows origin `http://localhost:3000` in dev

**Issue:** "Scope lock guard fails in CI"
**Solution:** Check `src/components/lawcore` or `src/components/monitoring` for forbidden terms

**Issue:** "Admin panel shows 403"
**Solution:** Verify user has `admin` role claim in Supabase Auth or backend authorization

---

## Next Steps (Sprint 3)

Sprint 3 is optional but recommended for production readiness:

1. **E2E Tests**
   - Playwright test for LawCore check flow
   - Playwright test for monitoring drill-down

2. **Performance Optimization**
   - Virtualize long tables (rules browser, endpoint table)
   - Lazy load charts in monitoring

3. **UX Enhancements**
   - Keyboard shortcuts (Cmd+K for search, Enter for submit)
   - More copy buttons (doc_id, trace_id)
   - Bulk export for rules browser

---

## Contact & Support

For questions or issues:
- **Frontend:** Check this document and `src/lib/api/` type definitions
- **Backend:** See API contract checklist above
- **CI/CD:** Run `npm run scope-guard` before pushing

---

**Document Version:** 1.0.1
**Last Updated:** 2025-12-22
**Maintained By:** Product Engineering Team
