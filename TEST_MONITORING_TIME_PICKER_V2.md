# Test Execution: Monitoring Time Picker v2

**Date**: 2026-01-06
**Tester**: [Your Name]
**Feature Flag**: `monitoring_time_picker_v2`

---

## Pre-Test Setup

### 1. Start Development Server

```bash
cd /Users/morganmojo/Desktop/FoodSsnse/foodsense-frontend
npm run dev
```

**Expected**: Server starts on http://localhost:3000

### 2. Enable Feature Flag

Open browser console (F12) at http://localhost:3000 and run:

```javascript
window.__featureFlags.enable('monitoring_time_picker_v2')
window.__featureFlags.get()
```

**Expected Output**:
```javascript
{
  review_queue_enhanced_hotkeys: false,
  monitoring_time_picker_v2: true,  // ✅ Should be true
  empty_states_v2: false,
  // ... other flags
}
```

---

## Test Suite 1: Basic Preset Selection

### Test 1.1: Navigate to Application Performance Page

**Steps**:
1. Navigate to http://localhost:3000/monitoring/app
2. Locate the time range selector in the top-right corner

**Expected**:
- [ ] Page loads without errors
- [ ] Time range selector is visible
- [ ] Default selection is "最近 1 小時" (1h)
- [ ] Dropdown button shows current selection

**Actual Result**: ________________

**Screenshot**: [ ] Taken

---

### Test 1.2: Open Dropdown

**Steps**:
1. Click the time range selector dropdown button

**Expected**:
- [ ] Dropdown opens smoothly
- [ ] Shows 6 options: 最近 1 小時, 最近 6 小時, 最近 24 小時, 最近 7 天, 最近 30 天, 自定義範圍
- [ ] Current selection (1h) is highlighted with blue background
- [ ] Each option has a description in English below

**Actual Result**: ________________

**Screenshot**: [ ] Taken

---

### Test 1.3: Select "最近 6 小時" (NEW Preset)

**Steps**:
1. Click on "最近 6 小時" option

**Expected**:
- [ ] Dropdown closes immediately
- [ ] Button text updates to "最近 6 小時"
- [ ] Page shows loading state (skeleton)
- [ ] Data refetches from API
- [ ] Metrics update on page
- [ ] No console errors

**Actual Result**: ________________

**API Call Check**:
- [ ] Check Network tab - should see API call with `range=1h` (converted from 6h)

**Screenshot**: [ ] Taken

---

### Test 1.4: Select "最近 30 天" (NEW Preset)

**Steps**:
1. Open dropdown again
2. Click on "最近 30 天" option

**Expected**:
- [ ] Dropdown closes
- [ ] Button text updates to "最近 30 天"
- [ ] Data refetches
- [ ] Metrics update
- [ ] No console errors

**Actual Result**: ________________

**API Call Check**:
- [ ] Network tab - should see API call with `range=7d` (converted from 30d)

**Screenshot**: [ ] Taken

---

### Test 1.5: Cycle Through All Legacy Presets

**Steps**:
1. Select "最近 1 小時"
2. Wait for data load
3. Select "最近 24 小時"
4. Wait for data load
5. Select "最近 7 天"
6. Wait for data load

**Expected**:
- [ ] All selections work smoothly
- [ ] Data refetches each time
- [ ] No console errors
- [ ] No visual glitches

**Actual Result**: ________________

---

## Test Suite 2: Custom Range Picker

### Test 2.1: Open Custom Range Modal

**Steps**:
1. Open dropdown
2. Click "自定義範圍" option

**Expected**:
- [ ] Modal opens with backdrop blur
- [ ] Modal shows title "選擇時間範圍"
- [ ] Two datetime-local inputs visible (開始時間, 結束時間)
- [ ] Inputs are pre-populated with reasonable defaults (e.g., last 24 hours)
- [ ] "確認" and "取消" buttons visible

**Actual Result**: ________________

**Screenshot**: [ ] Taken

---

### Test 2.2: Enter Custom Date Range

**Steps**:
1. Clear start time input
2. Enter: `2026-01-05T00:00`
3. Clear end time input
4. Enter: `2026-01-06T00:00`
5. Click "確認" button

**Expected**:
- [ ] Modal closes
- [ ] Dropdown button shows "2026-01-05 00:00 ~ 2026-01-06 00:00"
- [ ] Page refetches data
- [ ] URL updates to include `?start_time=2026-01-05T00:00:00.000Z&end_time=2026-01-06T00:00:00.000Z`

**Actual Result**: ________________

**URL Check**:
```
Expected: /monitoring/app?start_time=2026-01-05T00:00:00.000Z&end_time=2026-01-06T00:00:00.000Z
Actual: ________________
```

**API Call Check**:
- [ ] Network tab - should see API call with `range=24h` (fallback for custom)

**Screenshot**: [ ] Taken

---

### Test 2.3: Cancel Custom Range Selection

**Steps**:
1. Open dropdown
2. Click "自定義範圍"
3. Modal opens
4. Click "取消" button (or press ESC)

**Expected**:
- [ ] Modal closes
- [ ] Dropdown reverts to previous selection
- [ ] No URL parameter changes
- [ ] No API refetch

**Actual Result**: ________________

---

### Test 2.4: Invalid Date Range (End Before Start)

**Steps**:
1. Open custom range modal
2. Enter start: `2026-01-06T00:00`
3. Enter end: `2026-01-05T00:00` (earlier than start)
4. Try to click "確認"

**Expected**:
- [ ] Browser HTML5 validation prevents submission
- [ ] OR Modal shows error message
- [ ] Cannot confirm invalid range

**Actual Result**: ________________

---

## Test Suite 3: URL Parameter Persistence

### Test 3.1: Page Refresh with Custom Range

**Steps**:
1. Select custom range (e.g., 2026-01-05 00:00 ~ 2026-01-06 00:00)
2. Verify URL contains time parameters
3. Press browser refresh (Cmd+R or Ctrl+R)

**Expected**:
- [ ] Page reloads
- [ ] Custom range persists in dropdown
- [ ] URL parameters remain
- [ ] Data loads with custom range

**Actual Result**: ________________

**URL After Refresh**: ________________

---

### Test 3.2: Copy URL and Open in New Tab

**Steps**:
1. With custom range selected, copy URL from address bar
2. Open new browser tab
3. Paste URL and navigate

**Expected**:
- [ ] Page loads with custom range already selected
- [ ] Dropdown shows custom range
- [ ] Data loads correctly

**Actual Result**: ________________

---

### Test 3.3: Switch to Preset Clears URL Parameters

**Steps**:
1. Start with custom range (URL has time parameters)
2. Open dropdown
3. Select "最近 1 小時" preset

**Expected**:
- [ ] Dropdown updates to "最近 1 小時"
- [ ] URL parameters `start_time` and `end_time` are removed
- [ ] URL becomes clean: `/monitoring/app` (no query params)

**Actual Result**: ________________

**URL After Switch**: ________________

---

## Test Suite 4: Cross-Page Consistency

### Test 4.1: Business Health Page

**Steps**:
1. Navigate to http://localhost:3000/monitoring/business
2. Open time range dropdown

**Expected**:
- [ ] Dropdown shows all 6 options
- [ ] Default is "最近 24 小時"
- [ ] Selecting options works
- [ ] Custom range works

**Actual Result**: ________________

**Screenshot**: [ ] Taken

---

### Test 4.2: Infrastructure Page

**Steps**:
1. Navigate to http://localhost:3000/monitoring/infra
2. Open time range dropdown

**Expected**:
- [ ] Dropdown shows all 6 options
- [ ] Default is "最近 1 小時"
- [ ] Selecting options works
- [ ] Custom range works

**Actual Result**: ________________

**Screenshot**: [ ] Taken

---

### Test 4.3: Navigation Between Pages Preserves Selection

**Steps**:
1. On App Performance page, select "最近 6 小時"
2. Navigate to Business Health page
3. Check time range selector

**Expected**:
- [ ] Business Health has its own independent state
- [ ] Shows default "最近 24 小時" (not 6h from previous page)
- [ ] Each page maintains separate selection

**Actual Result**: ________________

---

## Test Suite 5: Backward Compatibility

### Test 5.1: Disable Feature Flag

**Steps**:
1. In browser console, run:
   ```javascript
   window.__featureFlags.disable('monitoring_time_picker_v2')
   ```
2. Refresh page (Cmd+R or Ctrl+R)
3. Navigate to http://localhost:3000/monitoring/app

**Expected**:
- [ ] Time range selector shows LEGACY v1 design
- [ ] Three buttons visible: "1h", "24h", "7d"
- [ ] No dropdown UI
- [ ] No custom range option
- [ ] Clicking buttons works

**Actual Result**: ________________

**Screenshot**: [ ] Taken (showing legacy v1)

---

### Test 5.2: Re-enable Feature Flag

**Steps**:
1. In browser console, run:
   ```javascript
   window.__featureFlags.enable('monitoring_time_picker_v2')
   ```
2. Refresh page

**Expected**:
- [ ] v2 dropdown returns
- [ ] All 6 options available again
- [ ] Previous selection preserved (if state allows)

**Actual Result**: ________________

---

## Test Suite 6: Error Handling

### Test 6.1: API Error During Refetch

**Steps**:
1. Open browser DevTools Network tab
2. Set network to "Offline"
3. Select different time range

**Expected**:
- [ ] API call fails
- [ ] Error state component shows
- [ ] No JavaScript errors in console
- [ ] Error message is user-friendly

**Actual Result**: ________________

---

### Test 6.2: Rapid Clicking

**Steps**:
1. Rapidly click different time range options (5-10 clicks quickly)

**Expected**:
- [ ] UI remains responsive
- [ ] No race conditions
- [ ] Final selection is correct
- [ ] No duplicate API calls

**Actual Result**: ________________

---

## Test Suite 7: Visual & UX Testing

### Test 7.1: Dropdown Styling

**Visual Checklist**:
- [ ] Dropdown has proper shadow and border
- [ ] Selected option has blue background
- [ ] Hover state shows gray background
- [ ] Check icon appears next to selected option
- [ ] Clock icon appears next to each option
- [ ] Font sizes are consistent
- [ ] Colors match design system

**Screenshot**: [ ] Taken

---

### Test 7.2: Modal Styling

**Visual Checklist**:
- [ ] Modal has backdrop blur
- [ ] Modal is centered on screen
- [ ] Modal has rounded corners
- [ ] Inputs have proper border/focus states
- [ ] Buttons have correct colors (primary/secondary)
- [ ] Close X button in top-right works

**Screenshot**: [ ] Taken

---

### Test 7.3: Responsive Design (Desktop)

**Steps**:
1. Test at different desktop widths: 1920px, 1440px, 1024px

**Expected**:
- [ ] Dropdown position adjusts correctly
- [ ] Modal stays centered
- [ ] No horizontal scroll
- [ ] Text doesn't overflow

**Actual Result**: ________________

---

### Test 7.4: Responsive Design (Mobile - Optional)

**Steps**:
1. Open DevTools mobile emulation
2. Test on iPhone 12 Pro (390px width)

**Expected**:
- [ ] Dropdown is usable (may need optimization)
- [ ] Modal fits on screen
- [ ] Datetime inputs work on mobile

**Actual Result**: ________________

**Note**: Mobile optimization may be Phase 2 enhancement

---

## Test Suite 8: Performance Testing

### Test 8.1: BEFORE Baseline (Legacy Picker)

**Scenario**: Investigate error spike in last 6 hours using legacy picker

**Steps**:
1. Disable feature flag (use legacy v1)
2. Start timer
3. On App Performance page, try to find 6-hour window:
   - Select "1h" - too short, need more
   - Select "24h" - too long, need to estimate
   - Scroll through metrics
4. Stop timer when you feel you have the info

**Results**:
- Time taken: ________ seconds
- Click count: ________ clicks
- Satisfaction (1-5): ________ / 5
- Notes: ________________

---

### Test 8.2: AFTER Enhanced (v2 Picker)

**Scenario**: Same investigation with v2 picker

**Steps**:
1. Enable feature flag (use v2)
2. Start timer
3. On App Performance page:
   - Open dropdown
   - Select "最近 6 小時"
   - Done!
4. Stop timer

**Results**:
- Time taken: ________ seconds
- Click count: ________ clicks
- Satisfaction (1-5): ________ / 5
- Notes: ________________

---

### Test 8.3: Performance Comparison

| Metric | BEFORE (v1) | AFTER (v2) | Improvement |
|--------|-------------|------------|-------------|
| Time (seconds) | _________ | _________ | _________ % |
| Clicks | _________ | _________ | _________ % |
| Satisfaction | _____ / 5 | _____ / 5 | _________ |

**Target**: >= 80% time improvement, >= 90% click reduction

**Achievement**: [ ] Met target [ ] Below target

---

## Test Suite 9: Browser Compatibility

### Test 9.1: Chrome

**Browser**: Chrome (latest)
**Version**: _________

- [ ] All features work
- [ ] datetime-local input works
- [ ] No console errors
- [ ] Visual rendering correct

---

### Test 9.2: Firefox

**Browser**: Firefox (latest)
**Version**: _________

- [ ] All features work
- [ ] datetime-local input works
- [ ] No console errors
- [ ] Visual rendering correct

---

### Test 9.3: Safari

**Browser**: Safari (latest)
**Version**: _________

- [ ] All features work
- [ ] datetime-local input works
- [ ] No console errors
- [ ] Visual rendering correct

---

## Test Summary

### Overall Results

**Total Tests**: 30+
**Passed**: ________ / 30+
**Failed**: ________
**Blocked**: ________
**Pass Rate**: ________ %

---

### Critical Bugs Found

| Bug # | Severity | Description | Steps to Reproduce |
|-------|----------|-------------|-------------------|
| 1 | _______ | ___________ | _________________ |
| 2 | _______ | ___________ | _________________ |
| 3 | _______ | ___________ | _________________ |

---

### Minor Issues Found

| Issue # | Type | Description | Priority |
|---------|------|-------------|----------|
| 1 | _______ | ___________ | ________ |
| 2 | _______ | ___________ | ________ |
| 3 | _______ | ___________ | ________ |

---

### Recommendations

**Immediate Fixes Needed**:
1. ________________
2. ________________
3. ________________

**Future Enhancements**:
1. ________________
2. ________________
3. ________________

---

### Evidence Collected

**Screenshots**:
- [ ] Enhanced dropdown (open state)
- [ ] Enhanced dropdown (closed with selection)
- [ ] Custom range modal
- [ ] URL with time parameters
- [ ] Each monitoring page with v2
- [ ] Legacy v1 for comparison

**Screen Recordings**:
- [ ] BEFORE: Investigation with legacy picker
- [ ] AFTER: Investigation with v2 picker
- [ ] Custom range selection flow
- [ ] URL persistence demonstration

**Files**:
- [ ] Screenshots saved to: `/Users/morganmojo/Desktop/FoodSsnse/foodsense-frontend/evidence/monitoring-time-picker-v2/`
- [ ] Videos saved to: same directory

---

### Approval

**Tester Signature**: ________________
**Date**: 2026-01-06
**Status**: [ ] Approved for Production [ ] Needs Fixes [ ] Blocked

**Next Steps**: ________________

---

**Test Document Version**: v1.0
**Created**: 2026-01-06
**Related**: MONITORING_TIME_PICKER_V2_TESTING_GUIDE.md
