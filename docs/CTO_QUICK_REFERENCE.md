# CTO Quick Reference: LawCore + Monitoring UI

**Status:** ✅ Frontend Complete (Awaiting Backend Integration)
**Date:** 2025-12-22

---

## ⚡ 30-Second Summary

The frontend team has delivered a complete UI for:
1. **LawCore Presence Gate v1.0** (4 pages: Overview, Check, Rules, Admin)
2. **Three-Layer Monitoring** (Business Health, App Performance, Infrastructure)

**All scope locked to prevent feature creep.** Ready for backend integration.

---

## 🎯 What You Can Do Now

### As an Operator (Reviewer/Admin)

```bash
npm run dev
# Visit http://localhost:3000/lawcore
```

1. **Check if an additive is regulated:**
   - Go to `/lawcore/check`
   - Enter "山梨酸鉀" or "Potassium Sorbate"
   - See HAS_RULE / NO_RULE / UNKNOWN

2. **Monitor system health:**
   - Go to `/monitoring/business` → see request volume, adoption, health score
   - Click "LawCore Adoption" card → drill down to `/monitoring/app`
   - Click slow endpoint → see error traces
   - Go to `/monitoring/infra` → see DB size, slow queries, bloat

3. **Manage regulations (admin only):**
   - Go to `/lawcore/admin`
   - Verify pending raw laws
   - Promote rules to RuleLayer

---

## 🔒 Scope Lock Guarantees

**LawCore v1.0 UI will NEVER show:**
- ❌ `limit` / `dosage` / `unit`
- ❌ `food_category`
- ❌ `compliance` / `pass/fail` logic
- ❌ `fuzzy` matching concepts

**Enforcement:** CI pre-build check (`npm run scope-guard`) blocks any violations.

---

## 📊 Monitoring Three-Layer Architecture (As Designed)

| Layer | Route | Purpose | Drill-Down |
|-------|-------|---------|------------|
| **L1: Business** | `/monitoring/business` | High-level KPIs | Click adoption → L2 |
| **L2: Application** | `/monitoring/app` | Per-endpoint perf | Click endpoint → errors |
| **L3: Infrastructure** | `/monitoring/infra` | DB/query analysis | n/a |

**Key Feature:** Every anomaly is clickable and leads to deeper investigation.

---

## 🚀 Backend Integration Requirements

### Critical API Endpoints (Must Implement)

**LawCore (7 endpoints):**
1. `POST /api/lawcore/check-presence`
2. `GET /api/lawcore/check-presence/{name}`
3. `GET /api/lawcore/rules?limit&offset`
4. `GET /api/lawcore/rules/stats`
5. `GET /api/lawcore/admin/pending-raw-laws`
6. `POST /api/lawcore/admin/verify-raw-law`
7. `POST /api/lawcore/admin/promote-rule`

**Monitoring (4 endpoints):**
1. `GET /api/monitoring/business?range=1h|24h|7d`
2. `GET /api/monitoring/app?range=...`
3. `GET /api/monitoring/infra?range=...`
4. `GET /api/monitoring/errors?endpoint=...&limit=20`

**Full contract:** See `docs/LAWCORE_MONITORING_IMPLEMENTATION.md`

---

## 🔧 Environment Setup (One-Time)

```bash
# .env.local
NEXT_PUBLIC_API_V1_BASE=http://localhost:8000/api/v1
NEXT_PUBLIC_API_V2_BASE=http://localhost:8000/api
NEXT_PUBLIC_LAWCORE_BASE=http://localhost:8000/api/lawcore
NEXT_PUBLIC_FEATURE_LAWCORE_ENABLED=true
```

---

## ✅ Deployment Gate

**Before deploying to production:**

```bash
# 1. Scope lock guard must pass
npm run scope-guard

# 2. Build must succeed
npm run build

# 3. Backend endpoints must return 200 (not 404)
curl http://localhost:8000/api/lawcore/rules/stats
curl http://localhost:8000/api/monitoring/business?range=24h
```

---

## 📈 Success Metrics (Your Original Requirements)

### Business Health (L1)
- ✅ Total requests today
- ✅ LawCore adoption rate (%)
- ✅ Health score (0-100)
- ✅ Daily cost (DB + API)
- ✅ Hourly traffic chart (24h)

### Application Performance (L2)
- ✅ SLA status (P95 latency threshold)
- ✅ Per-endpoint metrics (avg, p95, p99, errors)
- ✅ Top 5 slowest endpoints
- ✅ Error distribution by status code
- ✅ Incident copy button (auto-generates report)

### Infrastructure (L3)
- ✅ DB size, connections, cache hit ratio
- ✅ Slow queries (>100ms avg)
- ✅ Table bloat detection
- ✅ Unused indexes
- ✅ Automated maintenance recommendations

---

## 🎨 UX Highlights

1. **10-Second Orientation**
   - LawCore Overview shows: Active rules count, pending laws, DB status, last update
   - Business Health shows: Requests, adoption, cost, health score

2. **30-Second Decision**
   - Presence Check: Enter additive → result in <1s
   - Monitoring: Spot anomaly (red card) → click → see root cause

3. **No Manual CLI Required**
   - All governance actions (verify/promote) are in UI
   - All monitoring drill-downs are clickable
   - CSV export for batch checks

---

## 🛡️ Role-Based Access (PRD Compliant)

| Role | LawCore Access | Monitoring Access | Admin Panel |
|------|---------------|-------------------|-------------|
| **viewer** | 👁️ Read-only | 👁️ Read-only | ❌ No |
| **reviewer** | ✅ Full | ✅ Full | ❌ No |
| **admin** | ✅ Full | ✅ Full | ✅ Yes |

**Enforcement:** Frontend checks role, backend must verify.

---

## 🐛 Known Limitations (By Design)

1. **Backend Mock Data**
   - Monitoring pages will show errors until backend implements aggregation endpoints
   - Alternative: Use Grafana iframe (short-term only)

2. **Pagination**
   - Rules browser: 50 per page (hardcoded)
   - Endpoint table: No virtualization yet (Sprint 3)

3. **Real-Time Updates**
   - Auto-refetch: 60s (business/infra), 30s (app)
   - Not WebSocket/SSE (not needed for v1.0)

---

## 📞 Next Actions

### For CTO
1. Review this doc + `/docs/LAWCORE_MONITORING_IMPLEMENTATION.md`
2. Approve backend API contract
3. Assign backend team to implement 11 endpoints

### For Backend Team
1. Read full implementation guide
2. Implement LawCore 7 endpoints (priority 1)
3. Implement Monitoring 4 endpoints (priority 2)
4. Test with frontend in staging

### For Frontend Team (Sprint 3 - Optional)
1. E2E tests (Playwright)
2. Performance optimization (virtualization)
3. UX enhancements (keyboard shortcuts, more exports)

---

## 📚 Documentation Index

- **Full Guide:** `docs/LAWCORE_MONITORING_IMPLEMENTATION.md`
- **API Types:** `src/lib/api/lawcore.ts`, `src/lib/api/monitoring.ts`
- **UI PRD:** Attached in original specification
- **Routing Tree:** `src/app/(dashboard)/lawcore/*`, `src/app/(dashboard)/monitoring/*`

---

**Quick Links:**
- LawCore Overview: `http://localhost:3000/lawcore`
- Monitoring Business: `http://localhost:3000/monitoring/business`
- Scope Guard: `npm run scope-guard`

**Version:** 1.0.1 | **Last Updated:** 2025-12-22
