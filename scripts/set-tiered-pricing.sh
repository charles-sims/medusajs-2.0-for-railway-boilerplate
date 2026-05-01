#!/usr/bin/env bash
# Set volume-based tiered pricing on all product variants.
#
# Tiers (per line item quantity):
#   1-3  vials → base price (no discount)
#   4-5  vials → 10% off
#   6-9  vials → 15% off
#   10+  vials → 20% off
#
# Uses Medusa's built-in min_quantity/max_quantity pricing rules.
#
# Usage:
#   MEDUSA_BACKEND_URL=https://your-backend.up.railway.app \
#   MEDUSA_ADMIN_EMAIL=admin@example.com \
#   MEDUSA_ADMIN_PASS=secret \
#   bash scripts/set-tiered-pricing.sh

set -euo pipefail

BACKEND="${MEDUSA_BACKEND_URL:-http://localhost:9000}"
EMAIL="${MEDUSA_ADMIN_EMAIL:-admin@yourmail.com}"
PASS="${MEDUSA_ADMIN_PASS:?MEDUSA_ADMIN_PASS is required}"

echo "=== CaliLean – Tiered Volume Pricing ==="
echo "Backend: $BACKEND"
echo ""

# Authenticate
TOKEN=$(curl -s -X POST "$BACKEND/auth/user/emailpass" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}" | jq -r '.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "FATAL: Authentication failed"
  exit 1
fi
echo "Authenticated."
echo ""

# Fetch all products with variants and prices
OFFSET=0
UPDATED=0
SKIPPED=0

while true; do
  RESPONSE=$(curl -s "$BACKEND/admin/products?limit=50&offset=$OFFSET&fields=id,handle,title,variants.id,variants.title,variants.prices.*" \
    -H "Authorization: Bearer $TOKEN")

  PRODUCTS=$(echo "$RESPONSE" | jq '.products // []')
  COUNT=$(echo "$PRODUCTS" | jq 'length')

  if [ "$COUNT" -eq 0 ]; then
    break
  fi

  for i in $(seq 0 $((COUNT - 1))); do
    HANDLE=$(echo "$PRODUCTS" | jq -r ".[$i].handle")
    TITLE=$(echo "$PRODUCTS" | jq -r ".[$i].title")
    PRODUCT_ID=$(echo "$PRODUCTS" | jq -r ".[$i].id")

    VARIANTS=$(echo "$PRODUCTS" | jq ".[$i].variants // []")
    VCOUNT=$(echo "$VARIANTS" | jq 'length')

    for v in $(seq 0 $((VCOUNT - 1))); do
      VARIANT_ID=$(echo "$VARIANTS" | jq -r ".[$v].id")
      VARIANT_TITLE=$(echo "$VARIANTS" | jq -r ".[$v].title")

      # Get the base USD price (no min_quantity set)
      BASE_PRICE=$(echo "$VARIANTS" | jq -r "[.[$v].prices[] | select(.currency_code == \"usd\" and (.min_quantity == null or .min_quantity == 1))][0].amount // empty")

      if [ -z "$BASE_PRICE" ]; then
        echo "  SKIP $TITLE / $VARIANT_TITLE (no USD base price found)"
        SKIPPED=$((SKIPPED + 1))
        continue
      fi

      # Check if tiered prices already exist
      HAS_TIERS=$(echo "$VARIANTS" | jq "[.[$v].prices[] | select(.currency_code == \"usd\" and .min_quantity != null and .min_quantity > 1)] | length")

      if [ "$HAS_TIERS" -gt "0" ]; then
        echo "  SKIP $TITLE / $VARIANT_TITLE (tiers already set)"
        SKIPPED=$((SKIPPED + 1))
        continue
      fi

      # Calculate tiered prices (round to nearest cent)
      PRICE_10=$(echo "$BASE_PRICE * 0.90" | bc -l | xargs printf "%.2f")
      PRICE_15=$(echo "$BASE_PRICE * 0.85" | bc -l | xargs printf "%.2f")
      PRICE_20=$(echo "$BASE_PRICE * 0.80" | bc -l | xargs printf "%.2f")

      # Build prices array: base + 3 tiers
      PRICES_JSON=$(cat <<ENDJSON
{
  "prices": [
    {
      "amount": $BASE_PRICE,
      "currency_code": "usd"
    },
    {
      "amount": $PRICE_10,
      "currency_code": "usd",
      "min_quantity": 4,
      "max_quantity": 5
    },
    {
      "amount": $PRICE_15,
      "currency_code": "usd",
      "min_quantity": 6,
      "max_quantity": 9
    },
    {
      "amount": $PRICE_20,
      "currency_code": "usd",
      "min_quantity": 10
    }
  ]
}
ENDJSON
)

      # Update variant with tiered prices
      RESULT=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
        "$BACKEND/admin/products/$PRODUCT_ID/variants/$VARIANT_ID" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "$PRICES_JSON")

      if [ "$RESULT" = "200" ]; then
        echo "  SET  $TITLE / $VARIANT_TITLE → \$$BASE_PRICE | 4-5: \$$PRICE_10 | 6-9: \$$PRICE_15 | 10+: \$$PRICE_20"
        UPDATED=$((UPDATED + 1))
      else
        echo "  FAIL $TITLE / $VARIANT_TITLE (HTTP $RESULT)"
      fi
    done
  done

  OFFSET=$((OFFSET + 50))
  if [ "$COUNT" -lt 50 ]; then
    break
  fi
done

echo ""
echo "=== Done ==="
echo "Updated: $UPDATED variants"
echo "Skipped: $SKIPPED variants"
