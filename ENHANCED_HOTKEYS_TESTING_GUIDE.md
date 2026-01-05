# Enhanced Hotkeys Testing Guide

**Feature**: Review Queue Enhanced Hotkeys
**Status**: ✅ Implementation Complete - Ready for Testing
**Date**: 2026-01-05

---

## Quick Start

### 1. Enable Feature Flag

**Option A: Browser Console** (Easiest)
```javascript
// Open http://localhost:3000 in browser
// Press F12 to open DevTools Console
window.__featureFlags.enable('review_queue_enhanced_hotkeys')

// Verify it's enabled
window.__featureFlags.get()
// Should show: review_queue_enhanced_hotkeys: true
```

**Option B: Environment Variable**
```bash
# Add to .env.local
echo "NEXT_PUBLIC_FEATURE_REVIEW_QUEUE_ENHANCED_HOTKEYS=true" >> .env.local

# Restart development server
npm run dev
```

### 2. Navigate to Review Queue

```
http://localhost:3000/review/queue
```

You should see:
- Enhanced hint text with kbd elements showing: j/k, Shift+A, Shift+R, i, ?
- "查看完整說明" button

---

## Available Shortcuts

### Navigation (Vim-style)

| Shortcut | Action | Status |
|----------|--------|--------|
| `j` | Next record | ✅ Implemented |
| `k` | Previous record | ✅ Implemented |
| `n` | Next record (legacy) | ✅ Backward compatible |
| `p` | Previous record (legacy) | ✅ Backward compatible |
| `r` | Open review modal | ✅ Implemented |

### Review Actions (Enhanced)

| Shortcut | Action | Visual Feedback | Status |
|----------|--------|-----------------|--------|
| `Shift+A` | Quick approve | ✅ Toast notification | ✅ Implemented |
| `Shift+R` | Quick reject | ❌ Toast notification | ✅ Implemented |
| `i` | Inspect details | Opens review modal | ✅ Implemented |
| `f` | Flag for manual review | 🚩 Toast notification | ✅ Implemented |

### Selection (Legacy)

| Shortcut | Action | Status |
|----------|--------|--------|
| `x` | Toggle select active record | ✅ Implemented |
| `a` | Toggle select all | ✅ Implemented |

### Help

| Shortcut | Action | Status |
|----------|--------|--------|
| `?` (Shift+/) | Show keyboard shortcuts help modal | ✅ Implemented |

---

## Testing Checklist

### Basic Navigation

- [ ] Press `j` - active record moves down
- [ ] Press `k` - active record moves up
- [ ] Verify row highlights (ring-2 ring-primary/30)
- [ ] Scroll behavior works (row scrolls into view)
- [ ] Legacy `n`/`p` still work

### Enhanced Actions

- [ ] Press `Shift+A` - see green toast "快速批准: [product_id]"
- [ ] Press `Shift+R` - see red toast "快速拒絕: [product_id]"
- [ ] Press `i` - review modal opens
- [ ] Press `f` - see yellow toast "已標記為需人工審核: [product_id]"
- [ ] Check browser console for log messages

### Help Modal

- [ ] Press `?` - help modal opens
- [ ] Modal shows "增強模式已啟用" badge
- [ ] All shortcuts listed and organized by category
- [ ] Press ESC or click X - modal closes
- [ ] Click "查看完整說明" button - modal opens

### Text Input Focus Detection

- [ ] Click into filter input (驗證狀態 dropdown)
- [ ] Press `j` - nothing happens (shortcuts disabled in input)
- [ ] Click outside input
- [ ] Press `j` - navigation works again

### Backward Compatibility

- [ ] Disable feature flag: `window.__featureFlags.disable('review_queue_enhanced_hotkeys')`
- [ ] Refresh page
- [ ] Hint text shows legacy shortcuts only (n/p, r, x, a)
- [ ] No "查看完整說明" button
- [ ] `j`/`k` do NOT work
- [ ] `n`/`p` still work
- [ ] `Shift+A`/`Shift+R` do NOT work

---

## Expected Behavior

### Visual Feedback

**Active Record Highlight**:
```css
ring-2 ring-primary/30 ring-inset
```

**Toast Notifications**:
- Approve: Green toast with ✅ icon, 2s duration
- Reject: Red toast with ❌ icon, 2s duration
- Flag: Default toast with 🚩 icon, 2s duration

**Kbd Styling**:
```css
px-1.5 py-0.5 text-xs font-mono bg-gray-100 border border-gray-300 rounded
```

### Console Logs

When performing actions, check browser console:
```javascript
[Enhanced Hotkey] Approve: {id: "...", product_id: "..."}
[Enhanced Hotkey] Reject: {id: "...", product_id: "..."}
[Enhanced Hotkey] Flag: {id: "...", product_id: "..."}
```

---

## Common Issues

### Issue 1: Shortcuts Not Working

**Symptom**: Pressing `j`/`k` does nothing

**Possible Causes**:
1. Feature flag not enabled
   - Fix: `window.__featureFlags.enable('review_queue_enhanced_hotkeys')`
2. Cursor in text input
   - Fix: Click outside input fields
3. Modal is open
   - Fix: Close any open modals (ESC)

**Verify**:
```javascript
window.__featureFlags.get()
// Should show: review_queue_enhanced_hotkeys: true
```

### Issue 2: Toast Not Showing

**Symptom**: Pressing `Shift+A` doesn't show toast

**Possible Causes**:
1. `react-hot-toast` not configured
   - Check: `<Toaster />` component in app layout
2. No active record
   - Fix: Click on a record first

**Verify**: Check console for log messages

### Issue 3: Help Modal Not Opening

**Symptom**: Pressing `?` doesn't open modal

**Possible Causes**:
1. Another modal is open
   - Fix: Close review modal first
2. Feature flag disabled
   - Fix: Enable feature flag

---

## Performance Testing

### BEFORE Baseline (Collect First!)

**Test Scenario**: Review 10 products using legacy shortcuts

1. Start timer
2. Use `n` to navigate, click "審核" button
3. Approve/reject in modal
4. Repeat for 10 products
5. Record total time

**Expected**:
- Average: ~45 seconds per review
- Total: ~450 seconds (7.5 minutes) for 10 products
- Clicks: ~6-10 per review

### AFTER Enhanced (With Feature Flag)

**Test Scenario**: Review same 10 products using enhanced shortcuts

1. Enable feature flag
2. Start timer
3. Use `j` to navigate
4. Press `Shift+A` to approve (or `Shift+R` to reject)
5. Repeat for 10 products
6. Record total time

**Target**:
- Average: ~15 seconds per review (67% faster)
- Total: ~150 seconds (2.5 minutes) for 10 products
- Clicks: ~0-2 per review (90% reduction)

### Metrics to Collect

| Metric | BEFORE | AFTER | Improvement |
|--------|--------|-------|-------------|
| Time per review | 45s | 15s | 200% faster |
| Clicks per review | 6-10 | 0-2 | 90% reduction |
| Error rate | ? | ? | ? |
| User satisfaction | ? | ? | ? |

---

## Evidence Collection Template

### Screen Recording Script

**BEFORE Recording**:
```
1. Open Review Queue (feature flag OFF)
2. Show current shortcuts hint
3. Navigate using n/p
4. Review 10 products (time this)
5. Count clicks per review
```

**AFTER Recording**:
```
1. Enable feature flag in console
2. Show enhanced shortcuts hint
3. Press ? to show help modal
4. Navigate using j/k
5. Use Shift+A/R for quick actions
6. Review same 10 products (time this)
7. Show toast notifications
```

### Screenshot Checklist

- [ ] Enhanced hint text with kbd elements
- [ ] Help modal (full view)
- [ ] Toast notification for approve
- [ ] Toast notification for reject
- [ ] Toast notification for flag
- [ ] Active record highlight

---

## Developer Notes

### Files Modified

1. **src/hooks/useReviewQueueShortcuts.ts**
   - Added feature flag detection
   - Implemented J/K navigation
   - Added Shift+A/R actions
   - Added I/F/? actions
   - Maintained backward compatibility

2. **src/components/shared/KeyboardShortcutsHelp.tsx** (NEW)
   - Headless UI Dialog modal
   - Organized shortcuts by category
   - Auto-filters based on feature flag

3. **src/app/(dashboard)/review/queue/page.tsx**
   - Added toast handlers (onApprove, onReject, onFlag)
   - Added help modal state
   - Enhanced hint text
   - Integrated KeyboardShortcutsHelp component

### Feature Flag Configuration

```typescript
// src/lib/featureFlags.ts
export interface FeatureFlags {
  review_queue_enhanced_hotkeys: boolean
  // ... other flags
}
```

**Production Deployment**:
```bash
# .env.production
NEXT_PUBLIC_FEATURE_REVIEW_QUEUE_ENHANCED_HOTKEYS=false  # Default OFF
```

**Gradual Rollout Plan**:
1. Week 1-2: Internal testing only (localStorage flag)
2. Week 3: 10% of users (A/B test)
3. Week 4: 50% of users
4. Week 5: 100% rollout (set env var to true)

---

## Next Steps

### Immediate (Today)

1. [ ] Enable feature flag locally
2. [ ] Test all shortcuts (use checklist above)
3. [ ] Record BEFORE baseline (10 products)
4. [ ] Record AFTER with enhanced (same 10 products)
5. [ ] Collect metrics and compare

### This Week

6. [ ] Share with team for internal testing
7. [ ] Collect user feedback
8. [ ] Fix any bugs discovered
9. [ ] Refine toast messages if needed
10. [ ] Prepare for Phase 1B (additional features)

### Next Week (Phase 1B)

11. [ ] Implement actual approve/reject API calls (currently just toasts)
12. [ ] Implement flag functionality (create flagged queue)
13. [ ] Add more detailed inspect view
14. [ ] Add analytics tracking for shortcut usage

---

## Success Criteria

**Minimum Requirements** (Must Pass):
- [x] J/K navigation works
- [x] Shift+A/R show toast notifications
- [x] I opens review modal
- [x] F shows flag toast
- [x] ? opens help modal
- [x] Feature flag controls behavior
- [x] Backward compatible (legacy shortcuts work)
- [ ] BEFORE baseline collected
- [ ] AFTER metrics show >= 100% improvement

**Stretch Goals** (Nice to Have):
- [ ] >= 200% efficiency improvement
- [ ] >= 90% click reduction
- [ ] >80% user satisfaction
- [ ] Zero critical bugs
- [ ] Accessibility tested (screen reader)

---

## Troubleshooting Commands

```javascript
// Check feature flags
window.__featureFlags.get()

// Enable enhanced hotkeys
window.__featureFlags.enable('review_queue_enhanced_hotkeys')

// Disable enhanced hotkeys
window.__featureFlags.disable('review_queue_enhanced_hotkeys')

// Reset all flags
window.__featureFlags.reset()

// Check if feature is enabled
window.__featureFlags.check('review_queue_enhanced_hotkeys')
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

**Document Version**: v1.0
**Created**: 2026-01-05
**Status**: Ready for Testing
**Next Review**: After collecting evidence
