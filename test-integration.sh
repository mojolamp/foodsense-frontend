#!/bin/bash
# FoodSense 前後端整合測試腳本

set -e

echo "🔍 FoodSense 前後端整合測試"
echo "================================"
echo ""

# 顏色定義
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 檢查後端 API 是否運行
echo "1️⃣  檢查後端 API 連線..."
if curl -s -f http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 後端 API 正在運行${NC}"
else
    echo -e "${RED}❌ 後端 API 無法連線 (http://localhost:8000)${NC}"
    echo "   請先啟動後端: cd foodsense-bacend/backend && uvicorn app.main:app --reload --port 8000"
    exit 1
fi

echo ""
echo "2️⃣  測試 Review Workbench API 端點..."

# 測試 stats 端點
echo "   📊 測試 GET /api/v1/admin/review/stats"
STATS_RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:8000/api/v1/admin/review/stats)
STATS_CODE=$(echo "$STATS_RESPONSE" | tail -n1)
STATS_BODY=$(echo "$STATS_RESPONSE" | sed '$d')

if [ "$STATS_CODE" = "200" ]; then
    echo -e "   ${GREEN}✅ Stats API 回應正常 (HTTP $STATS_CODE)${NC}"
    echo "   回應預覽: $(echo "$STATS_BODY" | head -c 100)..."
else
    echo -e "   ${YELLOW}⚠️  Stats API 回應異常 (HTTP $STATS_CODE)${NC}"
    echo "   回應: $STATS_BODY"
fi

# 測試 queue 端點
echo ""
echo "   📋 測試 GET /api/v1/admin/review/queue"
QUEUE_RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:8000/api/v1/admin/review/queue)
QUEUE_CODE=$(echo "$QUEUE_RESPONSE" | tail -n1)
QUEUE_BODY=$(echo "$QUEUE_RESPONSE" | sed '$d')

if [ "$QUEUE_CODE" = "200" ]; then
    echo -e "   ${GREEN}✅ Queue API 回應正常 (HTTP $QUEUE_CODE)${NC}"
    # 檢查是否為陣列
    if echo "$QUEUE_BODY" | jq -e '. | type == "array"' > /dev/null 2>&1; then
        ARRAY_LENGTH=$(echo "$QUEUE_BODY" | jq '. | length' 2>/dev/null || echo "0")
        echo "   佇列記錄數: $ARRAY_LENGTH"
    else
        echo "   回應格式: $(echo "$QUEUE_BODY" | head -c 100)..."
    fi
else
    echo -e "   ${YELLOW}⚠️  Queue API 回應異常 (HTTP $QUEUE_CODE)${NC}"
    echo "   回應: $QUEUE_BODY"
fi

# 測試 history 端點
echo ""
echo "   📜 測試 GET /api/v1/admin/review/history"
HISTORY_RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:8000/api/v1/admin/review/history)
HISTORY_CODE=$(echo "$HISTORY_RESPONSE" | tail -n1)
HISTORY_BODY=$(echo "$HISTORY_RESPONSE" | sed '$d')

if [ "$HISTORY_CODE" = "200" ]; then
    echo -e "   ${GREEN}✅ History API 回應正常 (HTTP $HISTORY_CODE)${NC}"
    if echo "$HISTORY_BODY" | jq -e '. | type == "array"' > /dev/null 2>&1; then
        ARRAY_LENGTH=$(echo "$HISTORY_BODY" | jq '. | length' 2>/dev/null || echo "0")
        echo "   歷史記錄數: $ARRAY_LENGTH"
    fi
else
    echo -e "   ${YELLOW}⚠️  History API 回應異常 (HTTP $HISTORY_CODE)${NC}"
    echo "   回應: $HISTORY_BODY"
fi

# 測試 gold-samples 端點
echo ""
echo "   ⭐ 測試 GET /api/v1/admin/review/gold-samples"
GOLD_RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:8000/api/v1/admin/review/gold-samples)
GOLD_CODE=$(echo "$GOLD_RESPONSE" | tail -n1)
GOLD_BODY=$(echo "$GOLD_RESPONSE" | sed '$d')

if [ "$GOLD_CODE" = "200" ]; then
    echo -e "   ${GREEN}✅ Gold Samples API 回應正常 (HTTP $GOLD_CODE)${NC}"
    if echo "$GOLD_BODY" | jq -e '. | type == "array"' > /dev/null 2>&1; then
        ARRAY_LENGTH=$(echo "$GOLD_BODY" | jq '. | length' 2>/dev/null || echo "0")
        echo "   黃金樣本數: $ARRAY_LENGTH"
    fi
else
    echo -e "   ${YELLOW}⚠️  Gold Samples API 回應異常 (HTTP $GOLD_CODE)${NC}"
    echo "   回應: $GOLD_BODY"
fi

echo ""
echo "3️⃣  檢查 CORS 設定..."
CORS_HEADERS=$(curl -s -I -X OPTIONS -H "Origin: http://localhost:3000" \
    -H "Access-Control-Request-Method: GET" \
    http://localhost:8000/api/v1/admin/review/stats | grep -i "access-control")

if echo "$CORS_HEADERS" | grep -i "allow-origin" > /dev/null; then
    echo -e "   ${GREEN}✅ CORS 已正確設定${NC}"
    echo "   Headers: $CORS_HEADERS"
else
    echo -e "   ${YELLOW}⚠️  CORS headers 未檢測到（可能是預檢請求失敗）${NC}"
fi

echo ""
echo "4️⃣  檢查前端環境變數..."
if [ -f ".env.local" ]; then
    echo -e "   ${GREEN}✅ .env.local 檔案存在${NC}"
    if grep -q "NEXT_PUBLIC_API_URL" .env.local; then
        API_URL=$(grep "NEXT_PUBLIC_API_URL" .env.local | cut -d '=' -f2 | tr -d '"' | tr -d "'")
        echo "   API URL: $API_URL"
    else
        echo -e "   ${YELLOW}⚠️  NEXT_PUBLIC_API_URL 未設定，將使用預設值${NC}"
    fi
else
    echo -e "   ${YELLOW}⚠️  .env.local 檔案不存在${NC}"
fi

echo ""
echo "================================"
echo -e "${GREEN}✅ 整合測試完成${NC}"
echo ""
echo "📝 下一步:"
echo "   1. 啟動前端: npm run dev"
echo "   2. 訪問 http://localhost:3000"
echo "   3. 測試登入與 API 功能"
echo ""

