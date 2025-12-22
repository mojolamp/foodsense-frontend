#!/bin/bash

###############################################################################
# UI Scope Lock Guard
#
# Purpose: Prevent forbidden fields from appearing in LawCore/Monitoring code
#
# Forbidden terms in LawCore v1.0:
# - limit_amount, dosage, unit (as field names, not UI text)
# - food_category, fuzzy (as field names)
#
# Allowed in monitoring:
# - threshold (SLA threshold is legitimate monitoring term)
# - compliance (SLA compliance is legitimate monitoring term)
#
# This script is meant to run in CI/CD pipeline
# Exit code 1 = violation found
###############################################################################

set -e

# Terms forbidden in LawCore only (not monitoring)
LAWCORE_FORBIDDEN=(
  "limit_amount"
  "dosage"
  "unit"
  "food_category"
  "fuzzy"
)

# Terms forbidden everywhere (should never appear as field names)
GLOBAL_FORBIDDEN=(
  "max_limit"
  "min_limit"
)

LAWCORE_PATHS=(
  "src/app/(dashboard)/lawcore"
  "src/components/lawcore"
  "src/lib/api/lawcore.ts"
)

echo "🔒 Running UI Scope Lock Guard..."
echo ""

VIOLATIONS_FOUND=0

# Check LawCore-specific terms
for term in "${LAWCORE_FORBIDDEN[@]}"; do
  for path in "${LAWCORE_PATHS[@]}"; do
    if [ -e "$path" ]; then
      # Exclude comment lines (//,  *, /**) and search only in actual code
      MATCHES=$(grep -r -n "$term" "$path" 2>/dev/null | grep -v "//" | grep -v "^\s*\*" | grep -v "\/\*\*" || true)

      if [ -n "$MATCHES" ]; then
        echo "❌ VIOLATION: Found forbidden term '$term' in LawCore path: $path"
        echo "$MATCHES"
        echo ""
        VIOLATIONS_FOUND=$((VIOLATIONS_FOUND + 1))
      fi
    fi
  done
done

# Check globally forbidden terms
for term in "${GLOBAL_FORBIDDEN[@]}"; do
  MATCHES=$(grep -r -n "$term" "src/" 2>/dev/null | grep -v "//" | grep -v "^\s*\*" | grep -v "\/\*\*" || true)

  if [ -n "$MATCHES" ]; then
    echo "❌ VIOLATION: Found globally forbidden term '$term'"
    echo "$MATCHES"
    echo ""
    VIOLATIONS_FOUND=$((VIOLATIONS_FOUND + 1))
  fi
done

if [ $VIOLATIONS_FOUND -gt 0 ]; then
  echo ""
  echo "❌ Scope Lock Guard FAILED: $VIOLATIONS_FOUND violation(s) found"
  echo ""
  echo "LawCore v1.0 is Presence Gate ONLY."
  echo "Forbidden terms in LawCore: limit_amount, dosage, unit, food_category, fuzzy"
  echo "Globally forbidden: max_limit, min_limit"
  echo ""
  echo "Note: Comments and doc strings are excluded from checks."
  exit 1
else
  echo "✅ Scope Lock Guard PASSED: No violations found"
  exit 0
fi
