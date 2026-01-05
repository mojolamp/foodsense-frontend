# Monitoring Time Picker v2 Testing Guide

**Feature**: Monitoring Enhanced Time Range Selector
**Status**: ✅ Implementation Complete - Ready for Testing
**Date**: 2026-01-06

---

## Quick Start

### 1. Enable Feature Flag

**Option A: Browser Console** (Easiest)
```javascript
// Open http://localhost:3000 in browser
// Press F12 to open DevTools Console
window.__featureFlags.enable('monitoring_time_picker_v2')

// Verify it's enabled
window.__featureFlags.get()
// Should show: monitoring_time_picker_v2: true
```

**Option B: Environment Variable**
```bash
# Add to .env.local
echo "NEXT_PUBLIC_FEATURE_MONITORING_TIME_PICKER_V2=true" >> .env.local

# Restart development server
npm run dev
```

### 2. Navigate to Monitoring Pages

```
http://localhost:3000/monitoring/app       # Application Performance (L2)
http://localhost:3000/monitoring/business  # Business Health (L1)
http://localhost:3000/monitoring/infra     # Infrastructure (L3)
```

You should see:
- Enhanced dropdown with 6 presets (1h, 6h, 24h, 7d, 30d, 自定義範圍)
- Headless UI styled dropdown with icons
- Custom range option at the bottom

---

## Available Time Range Options

### Standard Presets (Enhanced from 3 to 5)

| Preset | Label | Description | Status |
|--------|-------|-------------|--------|
| `1h` | 最近 1 小時 | Last 1 hour | ✅ Legacy + v2 |
| `6h` | 最近 6 小時 | Last 6 hours | ✅ **NEW** |
| `24h` | 最近 24 小時 | Last 24 hours | ✅ Legacy + v2 |
| `7d` | 最近 7 天 | Last 7 days | ✅ Legacy + v2 |
| `30d` | 最近 30 天 | Last 30 days | ✅ **NEW** |

### Custom Range

| Option | Label | Description | Status |
|--------|-------|-------------|--------|
| `custom` | 自定義範圍 | Custom date/time range | ✅ **NEW** |

---

## Testing Checklist

### Basic Preset Selection

- [ ] Click time picker dropdown - opens smoothly
- [ ] Select "最近 1 小時" - page refetches data
- [ ] Select "最近 6 小時" - new preset works
- [ ] Select "最近 24 小時" - refetches correctly
- [ ] Select "最近 7 天" - refetches correctly
- [ ] Select "最近 30 天" - new preset works
- [ ] Verify dropdown closes after selection
- [ ] Verify selected option is highlighted

### Custom Range Picker

- [ ] Select "自定義範圍" - modal opens
- [ ] Modal shows "選擇時間範圍" title
- [ ] Start date/time input is present
- [ ] End date/time input is present
- [ ] Enter start time (e.g., 2026-01-05T00:00)
- [ ] Enter end time (e.g., 2026-01-06T00:00)
- [ ] Click "確認" - modal closes
- [ ] Dropdown shows "2026-01-05 00:00 ~ 2026-01-06 00:00"
- [ ] Page refetches data with custom range

### URL Parameter Persistence

**Custom Range**:
- [ ] Select custom range (e.g., 2026-01-05 00:00 ~ 2026-01-06 00:00)
- [ ] Check URL - should contain `?start_time=2026-01-05T00:00:00.000Z&end_time=2026-01-06T00:00:00.000Z`
- [ ] Refresh page - custom range persists
- [ ] Copy URL and open in new tab - same custom range loads

**Preset Ranges**:
- [ ] Select "最近 1 小時" preset
- [ ] Check URL - no time parameters in URL
- [ ] Select "最近 6 小時" preset
- [ ] Check URL - no time parameters in URL
- [ ] Refresh page - preset selection persists via component state

### Backward Compatibility (Feature Flag OFF)

- [ ] Disable feature flag: `window.__featureFlags.disable('monitoring_time_picker_v2')`
- [ ] Refresh page
- [ ] Time picker shows legacy v1 (3 buttons: 1h, 24h, 7d)
- [ ] No dropdown UI
- [ ] No custom range option
- [ ] Legacy preset buttons work
- [ ] Enable feature flag again - v2 returns

### Cross-Page Testing

**Application Performance (L2)**:
- [ ] Navigate to `/monitoring/app`
- [ ] Select "最近 6 小時"
- [ ] Verify metrics update
- [ ] Check endpoint table updates
- [ ] Check SLA status updates

**Business Health (L1)**:
- [ ] Navigate to `/monitoring/business`
- [ ] Select "最近 30 天"
- [ ] Verify hourly traffic chart updates
- [ ] Check LawCore adoption metrics
- [ ] Check health score

**Infrastructure (L3)**:
- [ ] Navigate to `/monitoring/infra`
- [ ] Select custom range (last 2 hours)
- [ ] Verify DB stats update
- [ ] Check slow queries table
- [ ] Check table bloat data

### Error Handling

- [ ] Select custom range with invalid dates (end before start)
- [ ] Browser validation should prevent submission
- [ ] Close custom range modal without selecting - dropdown reverts to previous value
- [ ] Select custom range, then select preset - URL parameters clear

---

## Expected Behavior

### Visual Feedback

**Dropdown (Headless UI Listbox)**:
```css
/* Selected option */
bg-primary text-primary-foreground

/* Hover option */
bg-muted

/* Dropdown panel */
absolute mt-1 max-h-60 overflow-auto rounded-md bg-popover shadow-lg
```

**Custom Range Modal**:
```css
/* Backdrop */
bg-black/30 backdrop-blur-sm

/* Modal panel */
bg-white rounded-2xl shadow-xl p-6
```

**datetime-local Input**:
```css
/* Input styling */
px-3 py-2 border border-input rounded-md
```

### URL Parameter Format

**Custom Range**:
```
?start_time=2026-01-05T00:00:00.000Z&end_time=2026-01-06T00:00:00.000Z
```

**Presets**:
```
No URL parameters (handled by component state)
```

### API Integration

**Current Limitation**:
- API only supports 3 legacy TimeRange values: `'1h' | '24h' | '7d'`
- TimeRangeSelector converts new presets to closest legacy value:
  - `6h` → `1h` (closest)
  - `30d` → `7d` (closest)
  - `custom` → `24h` (fallback)

**Future Enhancement** (requires backend changes):
- API should accept `start_time` and `end_time` parameters
- Would enable true custom range filtering
- Current implementation prepares for this future enhancement

---

## Common Issues

### Issue 1: Time Picker Not Showing v2

**Symptom**: Still seeing legacy 3-button picker

**Possible Causes**:
1. Feature flag not enabled
   - Fix: `window.__featureFlags.enable('monitoring_time_picker_v2')`
2. Need to refresh page
   - Fix: Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
3. Browser cache
   - Fix: Clear cache and reload

**Verify**:
```javascript
window.__featureFlags.get()
// Should show: monitoring_time_picker_v2: true
```

### Issue 2: Custom Range Modal Not Opening

**Symptom**: Clicking "自定義範圍" does nothing

**Possible Causes**:
1. JavaScript error in console
   - Fix: Check browser console for errors
2. Modal state management issue
   - Fix: Refresh page

**Verify**: Check browser console for errors

### Issue 3: URL Parameters Not Persisting

**Symptom**: Refreshing page loses custom range

**Possible Causes**:
1. URL parameters not being read on mount
   - Check: `useEffect` in TimeRangeSelector is running
2. Invalid date format in URL
   - Fix: URL params must be valid ISO 8601 format

**Verify**:
```javascript
// Check URL after selecting custom range
console.log(window.location.search)
// Should show: ?start_time=...&end_time=...
```

### Issue 4: Dropdown Not Closing After Selection

**Symptom**: Dropdown stays open after clicking an option

**Possible Causes**:
1. Headless UI event handling issue
   - Fix: Click outside dropdown to close
2. Browser compatibility
   - Fix: Use Chrome/Firefox/Safari latest version

---

## Performance Testing

### BEFORE Baseline (Collect First!)

**Test Scenario**: Investigate error spike in last 6 hours using legacy picker

1. Start timer
2. Current options: 1h (too short), 24h (too long), 7d (way too long)
3. Have to manually estimate time or use 1h and scroll through multiple refreshes
4. Record total time to find 6-hour window

**Expected**:
- Time to find window: ~120-180 seconds (2-3 minutes)
- Click count: 10-15 (multiple preset changes, scrolling)
- User frustration: High (no exact time window)

### AFTER Enhanced (With Feature Flag)

**Test Scenario**: Same error spike investigation with v2

1. Enable feature flag
2. Start timer
3. Select "最近 6 小時" preset - instant
4. Or select custom range: specify exact 6-hour window
5. Record total time

**Target**:
- Time to find window: ~15-30 seconds (80-85% faster)
- Click count: 2-3 (90% reduction)
- User satisfaction: High (exact time window)

### Metrics to Collect

| Metric | BEFORE | AFTER | Improvement |
|--------|--------|-------|-------------|
| Time to investigate | 120-180s | 15-30s | 80-85% faster |
| Click count | 10-15 | 2-3 | 90% reduction |
| Preset options | 3 | 6 | 100% increase |
| Custom range support | No | Yes | ∞ (new feature) |
| URL sharing support | No | Yes | ∞ (new feature) |

---

## Evidence Collection Template

### Screen Recording Script

**BEFORE Recording**:
```
1. Open Monitoring App page (feature flag OFF)
2. Show current 3-button picker (1h, 24h, 7d)
3. Simulate investigating 6-hour error spike
4. Show difficulty of approximating time window
5. Time the investigation process
6. Count clicks
```

**AFTER Recording**:
```
1. Enable feature flag in console
2. Show enhanced dropdown with 6 presets
3. Click dropdown - show all options
4. Select "最近 6 小時" - show instant data update
5. Select "自定義範圍" - show modal
6. Enter custom date/time range
7. Show URL parameter update
8. Refresh page - show persistence
9. Time the same investigation (should be <30s)
```

### Screenshot Checklist

- [ ] Enhanced dropdown with 6 presets
- [ ] Custom range modal (full view)
- [ ] URL bar showing time parameters
- [ ] Each monitoring page with v2 picker
- [ ] Dropdown open state
- [ ] Dropdown closed with selection shown

---

## Developer Notes

### Files Created

1. **src/components/monitoring/TimeRangePickerV2.tsx** (NEW)
   - 6 presets (1h, 6h, 24h, 7d, 30d, custom)
   - Headless UI Listbox dropdown
   - Custom date/time picker modal
   - date-fns integration

2. **src/components/monitoring/TimeRangeSelector.tsx** (NEW)
   - Smart wrapper with feature flag switching
   - URL parameter synchronization
   - Type conversion (v2 → legacy)
   - Uses Next.js router for URL updates

### Files Modified

1. **src/app/(dashboard)/monitoring/app/page.tsx**
   - Replaced TimeRangePicker with TimeRangeSelector

2. **src/app/(dashboard)/monitoring/business/page.tsx**
   - Replaced TimeRangePicker with TimeRangeSelector

3. **src/app/(dashboard)/monitoring/infra/page.tsx**
   - Replaced TimeRangePicker with TimeRangeSelector

### Feature Flag Configuration

```typescript
// src/lib/featureFlags.ts
export interface FeatureFlags {
  monitoring_time_picker_v2: boolean
  // ... other flags
}
```

**Production Deployment**:
```bash
# .env.production
NEXT_PUBLIC_FEATURE_MONITORING_TIME_PICKER_V2=false  # Default OFF
```

**Gradual Rollout Plan**:
1. Week 1-2: Internal testing only (localStorage flag)
2. Week 3: 10% of users (A/B test)
3. Week 4: 50% of users
4. Week 5: 100% rollout (set env var to true)

---

## API Enhancement Proposal (Future)

### Current API

```typescript
// Only supports 3 presets
monitoringAPI.getAppPerformance(range: '1h' | '24h' | '7d')
```

### Proposed API Enhancement

```typescript
// Support custom time range
monitoringAPI.getAppPerformance({
  range?: '1h' | '6h' | '24h' | '7d' | '30d',
  start_time?: string, // ISO 8601 format
  end_time?: string,   // ISO 8601 format
})
```

**Backend Changes Required**:
1. Add query parameter parsing for `start_time` and `end_time`
2. Modify SQL queries to use custom time range
3. Maintain backward compatibility with preset ranges
4. Add validation for date ranges

**Benefits**:
- True custom time range filtering (not just UI)
- Better incident investigation (exact time windows)
- Support for historical analysis
- More flexible monitoring capabilities

**Timeline**: Phase 2 backend enhancement (not part of P1)

---

## Next Steps

### Immediate (Today)

1. [ ] Enable feature flag locally
2. [ ] Test all 6 presets on 3 monitoring pages
3. [ ] Test custom range picker
4. [ ] Test URL parameter persistence
5. [ ] Verify backward compatibility (flag OFF)
6. [ ] Collect BEFORE baseline metrics

### This Week

7. [ ] Record BEFORE video (legacy picker)
8. [ ] Record AFTER video (v2 picker)
9. [ ] Collect time/click metrics
10. [ ] Share with team for internal testing
11. [ ] Collect user feedback
12. [ ] Fix any bugs discovered

### Next Phase (Future)

13. [ ] Propose API enhancement to backend team
14. [ ] Implement true custom range filtering (requires backend)
15. [ ] Add more presets if needed (e.g., 48h, 14d)
16. [ ] Add date range presets (this week, last week, this month)
17. [ ] Add comparison mode (compare two time ranges)

---

## Success Criteria

**Minimum Requirements** (Must Pass):
- [x] 6 presets available (1h, 6h, 24h, 7d, 30d, custom)
- [x] Custom range picker modal works
- [x] URL parameter persistence for custom range
- [x] Feature flag controls v1/v2 switching
- [x] Backward compatible (legacy picker works)
- [x] Integration complete on all 3 monitoring pages
- [ ] BEFORE baseline collected
- [ ] AFTER metrics show >= 80% improvement

**Stretch Goals** (Nice to Have):
- [ ] >= 90% investigation speed improvement
- [ ] >= 90% click reduction
- [ ] >80% user satisfaction
- [ ] Zero critical bugs
- [ ] Mobile responsive design verified
- [ ] Keyboard navigation (arrow keys in dropdown)

---

## Troubleshooting Commands

```javascript
// Check feature flags
window.__featureFlags.get()

// Enable monitoring time picker v2
window.__featureFlags.enable('monitoring_time_picker_v2')

// Disable monitoring time picker v2
window.__featureFlags.disable('monitoring_time_picker_v2')

// Reset all flags
window.__featureFlags.reset()

// Check if feature is enabled
window.__featureFlags.check('monitoring_time_picker_v2')
```

```bash
# Restart dev server
npm run dev

# Clear Next.js cache
rm -rf .next
npm run dev

# Check for TypeScript errors
npm run lint
```

---

## Technical Architecture

### Component Hierarchy

```
TimeRangeSelector (wrapper with feature flag)
├── TimeRangePicker (legacy v1)
│   └── 3 preset buttons (1h, 24h, 7d)
└── TimeRangePickerV2 (enhanced v2)
    ├── Headless UI Listbox (dropdown)
    │   ├── 5 preset options (1h, 6h, 24h, 7d, 30d)
    │   └── 1 custom option
    └── Headless UI Dialog (modal)
        ├── Start datetime-local input
        ├── End datetime-local input
        └── Confirm/Cancel buttons
```

### Type Conversion Flow

```
User selects "6h" in TimeRangePickerV2
  ↓
TimeRangeValue = { preset: '6h' }
  ↓
TimeRangeSelector.convertToLegacy()
  ↓
TimeRange = '1h' (closest legacy value)
  ↓
API receives '1h' (current limitation)
```

### Future (with API enhancement):

```
User selects "6h" in TimeRangePickerV2
  ↓
TimeRangeValue = { preset: '6h' }
  ↓
API receives { range: '6h' }
  ↓
Backend calculates Date.now() - 6 hours
  ↓
Returns filtered metrics
```

---

**Document Version**: v1.0
**Created**: 2026-01-06
**Status**: Ready for Testing
**Next Review**: After collecting evidence
