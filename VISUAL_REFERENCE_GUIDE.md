# Visual Reference Guide - Monitoring Time Picker v2

**What You Should See When Testing**

---

## 1. Default State (Closed Dropdown)

```
┌─────────────────────────────────────────────────────────────┐
│  Application Performance (L2)                      ┌────────┐ │
│  Per-endpoint latency, error rates, and SLA       │最近 1 小時│ │
│                                                    │    ▼    │ │
│                                                    └────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**What to look for**:
- Button shows current selection (default: "最近 1 小時")
- Down arrow (▼) indicates it's a dropdown
- Button has border and hover effect

---

## 2. Dropdown Open (All 6 Options)

```
┌─────────────────────────────────────────────────────────────┐
│  Application Performance (L2)                      ┌────────┐ │
│  Per-endpoint latency, error rates, and SLA       │最近 1 小時│ │
│                                                    │    ▼    │ │
│                                                    └────────┘ │
│                                                    ┌──────────┐
│                                                    │🕐 最近 1 小時│ ✓
│                                                    │  Last 1 hour │
│                                                    ├──────────┤
│                                                    │🕐 最近 6 小時│
│                                                    │  Last 6 hours│
│                                                    ├──────────┤
│                                                    │🕐 最近 24 小時│
│                                                    │  Last 24 hours│
│                                                    ├──────────┤
│                                                    │🕐 最近 7 天  │
│                                                    │  Last 7 days │
│                                                    ├──────────┤
│                                                    │🕐 最近 30 天 │
│                                                    │  Last 30 days│
│                                                    ├──────────┤
│                                                    │📅 自定義範圍 │
│                                                    │  Custom range│
│                                                    └──────────┘
```

**What to look for**:
- 6 options total
- Clock icon (🕐) for time presets
- Calendar icon (📅) for custom range
- Check mark (✓) on selected option
- Blue background on selected option
- Gray hover state when mouse over options
- English description below each option

---

## 3. Custom Range Modal

```
                ┌──────────────────────────────────┐
                │  選擇時間範圍                 ✕  │
                ├──────────────────────────────────┤
                │                                  │
                │  開始時間                        │
                │  ┌────────────────────────────┐ │
                │  │ 2026-01-05T00:00          │ │
                │  └────────────────────────────┘ │
                │                                  │
                │  結束時間                        │
                │  ┌────────────────────────────┐ │
                │  │ 2026-01-06T00:00          │ │
                │  └────────────────────────────┘ │
                │                                  │
                │         ┌──────┐  ┌──────┐     │
                │         │ 取消 │  │ 確認 │     │
                │         └──────┘  └──────┘     │
                │                                  │
                └──────────────────────────────────┘
        [Blurred backdrop behind modal]
```

**What to look for**:
- Modal centered on screen
- Blurred backdrop (rest of page is dimmed)
- Close button (✕) in top-right
- Two datetime-local inputs
- Cancel button (gray)
- Confirm button (blue/primary color)
- Rounded corners on modal

---

## 4. Custom Range Selected

```
┌─────────────────────────────────────────────────────────────┐
│  Application Performance (L2)                               │
│  Per-endpoint latency, error rates                          │
│                        ┌─────────────────────────────────┐  │
│                        │ 2026-01-05 00:00 ~ 2026-01-06 00:00 │ │
│                        │              ▼                   │  │
│                        └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

URL: /monitoring/app?start_time=2026-01-05T00:00:00.000Z&end_time=2026-01-06T00:00:00.000Z
```

**What to look for**:
- Custom range displayed in button
- Format: "YYYY-MM-DD HH:MM ~ YYYY-MM-DD HH:MM"
- URL bar contains `start_time` and `end_time` parameters
- Parameters are in ISO 8601 format

---

## 5. Legacy v1 (Feature Flag OFF)

```
┌─────────────────────────────────────────────────────────────┐
│  Application Performance (L2)                               │
│  Per-endpoint latency, error rates                          │
│                                  ┌──┐ ┌───┐ ┌──┐           │
│                                  │1h│ │24h│ │7d│           │
│                                  └──┘ └───┘ └──┘           │
└─────────────────────────────────────────────────────────────┘
```

**What to look for**:
- Three separate buttons (not a dropdown)
- Simple button design
- No dropdown arrow
- No custom range option

---

## 6. Loading State

```
┌─────────────────────────────────────────────────────────────┐
│  Application Performance (L2)                               │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐│
│  │                │  │                │  │                ││
│  │  [Skeleton]    │  │  [Skeleton]    │  │  [Skeleton]    ││
│  │                │  │                │  │                ││
│  └────────────────┘  └────────────────┘  └────────────────┘│
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                                                        │ │
│  │  [Skeleton Table Loading...]                          │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**What happens**:
- After selecting time range, page shows gray animated skeleton
- Indicates data is being refetched
- Should last ~1-2 seconds (depending on API)
- Then real data appears

---

## 7. Browser DevTools - Console

```
Console:
  [FeatureFlags] monitoring_time_picker_v2: true

  > window.__featureFlags.get()
  {
    review_queue_enhanced_hotkeys: false,
    monitoring_time_picker_v2: true,  ← Should be true
    empty_states_v2: false,
    ...
  }
```

**What to check**:
- No red errors
- Feature flag shows as `true`
- No warnings

---

## 8. Browser DevTools - Network Tab

```
Network:
  Name                          Status    Type    Size
  ──────────────────────────────────────────────────
  metrics?range=1h              200       xhr     5.2kB
  metrics?range=1h              200       xhr     5.1kB
  metrics?range=7d              200       xhr     12.4kB
  ...
```

**What to check**:
- When selecting time range, new API call appears
- Status: 200 OK (green)
- Query parameter shows `range=1h` or `range=24h` or `range=7d`
- For new presets (6h, 30d, custom), shows converted value

---

## 9. Color & Styling Reference

### Dropdown Selected Option
```
Background: bg-primary (blue)
Text: text-primary-foreground (white)
Border: None
Check icon: White ✓
```

### Dropdown Hover Option
```
Background: bg-muted (light gray)
Text: text-foreground (dark)
Border: None
```

### Dropdown Normal Option
```
Background: transparent/white
Text: text-foreground (dark)
Border: None
```

### Custom Range Modal
```
Backdrop: black/30 with backdrop-blur-sm
Modal: bg-white with shadow-xl
Modal border-radius: rounded-2xl (large)
Buttons: Primary (blue) + Secondary (gray)
```

---

## 10. Comparison: v1 vs v2

### v1 (Legacy)
```
┌──────────────────────────────┐
│  [1h] [24h] [7d]            │  ← 3 buttons only
└──────────────────────────────┘

Pros: Simple, fast
Cons: Limited options, no custom range
```

### v2 (Enhanced)
```
┌──────────────────────────────┐
│  [最近 1 小時 ▼]             │  ← Dropdown
│   ├ 1h                       │
│   ├ 6h     (NEW!)            │
│   ├ 24h                      │
│   ├ 7d                       │
│   ├ 30d    (NEW!)            │
│   └ Custom (NEW!)            │
└──────────────────────────────┘

Pros: More options, custom range, URL sharing
Cons: Slightly more complex (still very usable)
```

---

## 11. Mobile View (Responsive)

```
Mobile (390px width):

┌──────────────────────┐
│ Application          │
│ Performance          │
│                      │
│ ┌──────────────────┐ │
│ │ 最近 1 小時  ▼  │ │
│ └──────────────────┘ │
│                      │
│ [Dropdown opens      │
│  full width]         │
└──────────────────────┘
```

**Note**: Mobile optimization may need refinement in future

---

## 12. Accessibility Features

**Keyboard Navigation** (Future Enhancement):
- Tab to focus dropdown
- Enter to open
- Arrow keys to navigate options
- Enter to select
- Escape to close

**Screen Reader** (Already Working):
- Headless UI provides ARIA labels
- Announces "Listbox" role
- Announces selected option
- Announces modal dialog

---

## 13. Expected Behavior Timeline

```
User clicks dropdown
  ↓ (0ms)
Dropdown opens immediately
  ↓ (0ms)
User clicks "最近 6 小時"
  ↓ (0ms)
Dropdown closes immediately
  ↓ (10ms)
Skeleton loading appears
  ↓ (50ms)
API call starts
  ↓ (500-2000ms - depends on network)
API response received
  ↓ (50ms)
Data renders on page
  ↓ (100ms)
Animation completes
```

**Total time from click to data**: ~0.5-2 seconds (network dependent)

---

## 14. Common Visual Bugs to Check For

**Dropdown Issues**:
- [ ] Dropdown doesn't close after selection (BAD)
- [ ] Dropdown positioned incorrectly (off-screen, wrong alignment)
- [ ] Selected option not highlighted
- [ ] Icons missing or broken
- [ ] Text overflow/truncation

**Modal Issues**:
- [ ] Modal not centered
- [ ] Backdrop not blurred
- [ ] Modal doesn't close
- [ ] Datetime inputs not working
- [ ] Buttons overlap or misaligned

**General Issues**:
- [ ] Flashing/flickering on selection
- [ ] Wrong colors (not matching design system)
- [ ] Font sizes inconsistent
- [ ] Horizontal scroll appears
- [ ] Layout breaks on different screen sizes

---

## 15. What Success Looks Like

### ✅ Good Implementation

```
1. Dropdown opens smoothly (no lag)
2. All 6 options visible and clickable
3. Selected option has blue background + check mark
4. Hover states work (gray background)
5. Custom range modal centered with blur
6. URL updates correctly for custom range
7. Page refetches data after selection
8. No console errors
9. Backward compatible (v1 works when flag OFF)
10. Works on all 3 monitoring pages
```

### ❌ Bad Implementation

```
1. Dropdown stays open after selection
2. Wrong number of options (not 6)
3. No visual feedback on selection
4. Modal doesn't open or close
5. URL doesn't update
6. Data doesn't refetch
7. Console full of errors
8. Breaks when feature flag disabled
9. Only works on one page
10. Layout broken/misaligned
```

---

## 16. Performance Visual Indicators

### Fast Response (Good)
```
Click → Dropdown closes → Gray skeleton → Data appears
        ↑________________↑ < 100ms
                          ↑_____________↑ < 2 seconds
```

### Slow Response (Needs Investigation)
```
Click → (lag) → Dropdown closes → Long skeleton → Data appears
        ↑_______↑ > 500ms
                                ↑__________________↑ > 5 seconds
```

If you see slow response:
- Check Network tab for slow API calls
- Check Console for errors
- Check if backend is running correctly

---

## 17. Cross-Browser Visual Differences

### Chrome
- datetime-local has calendar picker icon
- Rounded corners sharp
- Blur effect strong

### Firefox
- datetime-local slightly different styling
- Rounded corners smooth
- Blur effect similar

### Safari
- datetime-local has different UI
- Needs Safari 14.1+ for datetime-local
- Blur effect may differ slightly

**All should be functionally identical**

---

## Quick Visual Checklist

Before saying "it works", verify:

- [ ] Dropdown has 6 options (not 3, not 7)
- [ ] Selected option has blue background
- [ ] Custom range modal opens/closes
- [ ] URL updates for custom range
- [ ] Data refetches on selection
- [ ] No console errors (red text)
- [ ] Works on all 3 monitoring pages
- [ ] Legacy v1 appears when flag OFF

---

**Visual Reference Version**: v1.0
**Created**: 2026-01-06
**Purpose**: Help testers know what to expect visually

**Tip**: Take screenshots and compare with this guide to ensure everything looks correct!
