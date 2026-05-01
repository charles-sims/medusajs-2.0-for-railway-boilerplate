#!/bin/bash
# Fix pnpm duplicate @medusajs/core-flows in dev mode
# Run this after `pnpm install` to prevent "Workflow already exists" errors
FIRST=$(find node_modules/.pnpm -maxdepth 1 -name "@medusajs+core-flows*" -type d 2>/dev/null | head -1)
for DIR in $(find node_modules/.pnpm -maxdepth 1 -name "@medusajs+core-flows*" -type d 2>/dev/null | tail -n +2); do
  TARGET="$DIR/node_modules/@medusajs/core-flows"
  SOURCE="$FIRST/node_modules/@medusajs/core-flows"
  if [ ! -L "$TARGET" ]; then
    rm -rf "$TARGET"
    ln -s "$SOURCE" "$TARGET"
    echo "Symlinked $(basename $DIR) -> $(basename $FIRST)"
  fi
done
echo "Core-flows deduplication complete"
