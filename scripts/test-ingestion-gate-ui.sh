#!/bin/bash
# IngestionGate UI 測試腳本

set -e

echo "🔍 IngestionGate UI 測試"
echo "================================"
echo ""

# 顏色定義
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 檢查後端 API
echo "1️⃣  檢查後端 API..."
if curl -s -f http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 後端 API 正在運行${NC}"
else
    echo -e "${RED}❌ 後端 API 無法連線${NC}"
    exit 1
fi

# 檢查前端
echo ""
echo "2️⃣  檢查前端..."
if curl -s -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 前端正在運行${NC}"
else
    echo -e "${YELLOW}⚠️  前端未運行（可選）${NC}"
fi

# 測試 API 端點
echo ""
echo "3️⃣  測試 IngestionGate API 端點..."

# 測試 Review Queue
echo "   📋 測試 GET /api/v1/review-queue"
RESPONSE=$(curl -s -w "\n%{http_code}" \
    -H "X-Tenant-Id: $(uuidgen)" \
    http://localhost:8000/api/v1/review-queue?limit=5)
CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$CODE" = "200" ]; then
    echo -e "   ${GREEN}✅ Review Queue API 正常 (HTTP $CODE)${NC}"
    COUNT=$(echo "$BODY" | jq '. | length' 2>/dev/null || echo "0")
    echo "   記錄數: $COUNT"
else
    echo -e "   ${YELLOW}⚠️  Review Queue API 回應: HTTP $CODE${NC}"
fi

# 測試 Entity Suggest
echo ""
echo "   🔍 測試 GET /api/v1/entity/suggest"
RESPONSE=$(curl -s -w "\n%{http_code}" \
    -H "X-Tenant-Id: $(uuidgen)" \
    "http://localhost:8000/api/v1/entity/suggest?q=大豆&namespace=ingredients")
CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$CODE" = "200" ]; then
    echo -e "   ${GREEN}✅ Entity Suggest API 正常 (HTTP $CODE)${NC}"
else
    echo -e "   ${YELLOW}⚠️  Entity Suggest API 回應: HTTP $CODE${NC}"
fi

echo ""
echo "=" * 60
echo -e "${GREEN}✅ UI 測試完成${NC}"
echo "=" * 60









