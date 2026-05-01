#!/usr/bin/env bash
# Set variant weights for all products so ShipStation can calculate shipping rates.
#
# Weight unit: kilograms (Medusa default)
#   - Standard 3mL ampule: 0.05 kg (50g)
#   - 5mL vial (NAD+):     0.06 kg (60g)
#   - 10mL vial (Glutathione): 0.08 kg (80g)
#
# Usage:
#   MEDUSA_BACKEND_URL=https://your-backend.up.railway.app \
#   MEDUSA_ADMIN_EMAIL=admin@example.com \
#   MEDUSA_ADMIN_PASS=secret \
#   bash scripts/set-variant-weights.sh

set -euo pipefail

BACKEND="${MEDUSA_BACKEND_URL:-http://localhost:9000}"
EMAIL="${MEDUSA_ADMIN_EMAIL:-admin@yourmail.com}"
PASS="${MEDUSA_ADMIN_PASS:?MEDUSA_ADMIN_PASS is required}"

# Authenticate
TOKEN=$(curl -s -X POST "$BACKEND/auth/user/emailpass" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}" | jq -r '.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "FATAL: Authentication failed"
  exit 1
fi
echo "Authenticated."

# Weight overrides for specific product handles (larger vials)
declare -A WEIGHT_OVERRIDES=(
  ["nad"]=0.06
  ["glutathione"]=0.08
)
DEFAULT_WEIGHT=0.05

# Fetch all products with variants
OFFSET=0
UPDATED=0
while true; do
  RESPONSE=$(curl -s "$BACKEND/admin/products?limit=50&offset=$OFFSET&fields=id,handle,title,variants.id,variants.title,variants.weight" \
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

    # Determine weight for this product
    WEIGHT="${WEIGHT_OVERRIDES[$HANDLE]:-$DEFAULT_WEIGHT}"

    # Get variants
    VARIANTS=$(echo "$PRODUCTS" | jq ".[$i].variants // []")
    VCOUNT=$(echo "$VARIANTS" | jq 'length')

    for v in $(seq 0 $((VCOUNT - 1))); do
      VARIANT_ID=$(echo "$VARIANTS" | jq -r ".[$v].id")
      VARIANT_TITLE=$(echo "$VARIANTS" | jq -r ".[$v].title")
      CURRENT_WEIGHT=$(echo "$VARIANTS" | jq ".[$v].weight // 0")

      if [ "$(echo "$CURRENT_WEIGHT == $WEIGHT" | bc -l 2>/dev/null || echo 0)" = "1" ]; then
        echo "  SKIP $TITLE / $VARIANT_TITLE (already ${WEIGHT}kg)"
        continue
      fi

      # Update variant weight
      curl -s -X POST "$BACKEND/admin/products/$PRODUCT_ID/variants/$VARIANT_ID" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"weight\": $WEIGHT}" > /dev/null

      echo "  SET  $TITLE / $VARIANT_TITLE → ${WEIGHT}kg"
      UPDATED=$((UPDATED + 1))
    done
  done

  OFFSET=$((OFFSET + 50))
  if [ "$COUNT" -lt 50 ]; then
    break
  fi
done

echo ""
echo "Done. Updated $UPDATED variants."
