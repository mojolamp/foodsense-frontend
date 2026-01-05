# Quick Test Checklist - Monitoring Time Picker v2

**Server**: ✅ Running at http://localhost:3000
**Date**: 2026-01-06

---

## 1. Enable Feature Flag (30 seconds)

```javascript
// Open http://localhost:3000 in browser
// Press F12 → Console tab → Paste and run:

window.__featureFlags.enable('monitoring_time_picker_v2')
window.__featureFlags.get()
// Should show: monitoring_time_picker_v2: true ✓
```

---

## 2. Quick Visual Check (2 minutes)

### App Performance Page
**URL**: http://localhost:3000/monitoring/app

- [ ] Time picker is in top-right corner
- [ ] Click dropdown → See 6 options (1h, 6h, 24h, 7d, 30d, custom)
- [ ] Select "最近 6 小時" → Works
- [ ] Page refetches data

### Business Health Page
**URL**: http://localhost:3000/monitoring/business

- [ ] Same time picker appears
- [ ] Dropdown has 6 options
- [ ] Selecting options works

### Infrastructure Page
**URL**: http://localhost:3000/monitoring/infra

- [ ] Same time picker appears
- [ ] Dropdown has 6 options
- [ ] Selecting options works

---

## 3. Test Custom Range (2 minutes)

**On any monitoring page**:

1. [ ] Click time picker dropdown
2. [ ] Click "自定義範圍" (last option)
3. [ ] Modal opens with two date/time inputs
4. [ ] Enter start: `2026-01-05T00:00`
5. [ ] Enter end: `2026-01-06T00:00`
6. [ ] Click "確認"
7. [ ] Modal closes
8. [ ] Dropdown shows: "2026-01-05 00:00 ~ 2026-01-06 00:00"
9. [ ] **Check URL**: Should have `?start_time=...&end_time=...`

---

## 4. Test URL Persistence (1 minute)

1. [ ] With custom range selected (URL has parameters)
2. [ ] Press Cmd+R (Mac) or Ctrl+R (Windows) to refresh
3. [ ] Custom range persists after refresh
4. [ ] Copy URL → Open in new tab → Custom range loads

---

## 5. Test Backward Compatibility (1 minute)

```javascript
// Disable feature flag
window.__featureFlags.disable('monitoring_time_picker_v2')
```

1. [ ] Refresh page (Cmd+R or Ctrl+R)
2. [ ] Legacy 3-button picker appears (1h, 24h, 7d)
3. [ ] No dropdown
4. [ ] Buttons work

```javascript
// Re-enable
window.__featureFlags.enable('monitoring_time_picker_v2')
```

5. [ ] Refresh page
6. [ ] v2 dropdown returns

---

## 6. Performance Comparison (5 minutes)

### BEFORE (Legacy v1)

```javascript
// Disable v2
window.__featureFlags.disable('monitoring_time_picker_v2')
```

**Task**: "I need to see error data from the last 6 hours"

- Start timer
- Options: 1h (too short), 24h (too long), 7d (way too long)
- Try to figure it out...
- Stop timer

**My Time**: ________ seconds
**My Clicks**: ________ clicks
**Frustration Level (1-5)**: ________ / 5

---

### AFTER (Enhanced v2)

```javascript
// Enable v2
window.__featureFlags.enable('monitoring_time_picker_v2')
```

**Same Task**: "I need to see error data from the last 6 hours"

- Start timer
- Click dropdown
- Select "最近 6 小時"
- Done!
- Stop timer

**My Time**: ________ seconds
**My Clicks**: ________ clicks
**Satisfaction Level (1-5)**: ________ / 5

---

### My Results

| Metric | BEFORE | AFTER | Improvement |
|--------|--------|-------|-------------|
| Time | _____ s | _____ s | _____ % faster |
| Clicks | _____ | _____ | _____ % less |
| Experience | _____ /5 | _____ /5 | _____ |

**Target**: 80%+ time improvement, 90%+ click reduction
**Actual**: _____ % time, _____ % clicks
**Met Target?**: [ ] Yes [ ] No

---

## 7. Browser Console Check (1 minute)

**Open DevTools Console (F12)**:

- [ ] No red errors
- [ ] No warnings about feature flags
- [ ] API calls visible in Network tab

**Open Network Tab**:

- [ ] When selecting time range, see API call
- [ ] API call has `range` parameter (e.g., `range=1h`)
- [ ] Response status: 200 OK

---

## 8. Quick Bug Check (2 minutes)

Common issues to verify:

- [ ] Dropdown closes after selection (doesn't stay open)
- [ ] Custom range modal closes after "確認"
- [ ] URL parameters update correctly
- [ ] No JavaScript errors in console
- [ ] Data actually refetches (loading skeleton appears)
- [ ] All 6 options are selectable

---

## 9. Screenshot Evidence (2 minutes)

Take these 5 screenshots:

1. [ ] **Enhanced dropdown (open)** - showing all 6 options
2. [ ] **Custom range modal** - showing datetime inputs
3. [ ] **URL with parameters** - showing custom range in URL bar
4. [ ] **Legacy v1** - showing 3-button picker for comparison
5. [ ] **All 3 monitoring pages** - showing v2 picker on each

---

## 10. Final Verdict (1 minute)

### Does it work?

- [ ] **YES** - All features work, no critical bugs
- [ ] **NO** - Found critical bugs (list below)
- [ ] **MOSTLY** - Works but needs fixes (list below)

### Issues Found:

1. ____________________
2. ____________________
3. ____________________

### Recommendation:

- [ ] **Approved** - Ready for production rollout
- [ ] **Needs Fixes** - Fix bugs before proceeding
- [ ] **Major Issues** - Needs significant rework

---

## Total Test Time: ~15-20 minutes

**Tested By**: ________________
**Date**: 2026-01-06
**Status**: [ ] Complete [ ] In Progress

---

## Next Steps After Testing

**If Approved**:
1. Collect BEFORE/AFTER videos for evidence
2. Share with team for feedback
3. Proceed to P1 Task 3: Empty States v2

**If Needs Fixes**:
1. Document all bugs found
2. Report to developer
3. Re-test after fixes

---

## Quick Reference Commands

```javascript
// Enable v2
window.__featureFlags.enable('monitoring_time_picker_v2')

// Disable v2 (back to legacy)
window.__featureFlags.disable('monitoring_time_picker_v2')

// Check current state
window.__featureFlags.get()

// Reset all flags
window.__featureFlags.reset()
```

---

**Pro Tip**: Keep DevTools Console open during testing to catch any errors immediately!

**URLs**:
- App: http://localhost:3000/monitoring/app
- Business: http://localhost:3000/monitoring/business
- Infra: http://localhost:3000/monitoring/infra
- Review Queue: http://localhost:3000/review/queue (for Task 1)

---

**Document Version**: v1.0 - Quick Reference
**For Detailed Tests**: See TEST_MONITORING_TIME_PICKER_V2.md (30+ test cases)
