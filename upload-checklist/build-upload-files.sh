#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$ROOT_DIR/upload-checklist"

THUMB_SRC="$ROOT_DIR/thumbnail-80x80.png"
INLINE_SRC_JPG="$ROOT_DIR/preview-590x300.jpg"
INLINE_SRC_PNG="$ROOT_DIR/preview-590x300.png"

if [[ ! -f "$THUMB_SRC" ]]; then
  echo "Error: thumbnail source not found at $THUMB_SRC" >&2
  exit 1
fi

INLINE_SRC=""
if [[ -f "$INLINE_SRC_JPG" ]]; then
  INLINE_SRC="$INLINE_SRC_JPG"
elif [[ -f "$INLINE_SRC_PNG" ]]; then
  INLINE_SRC="$INLINE_SRC_PNG"
else
  echo "Error: inline preview source not found (expected preview-590x300.jpg or .png in project root)." >&2
  exit 1
fi

mkdir -p \
  "$OUT_DIR/thumbnail" \
  "$OUT_DIR/inline-preview-image" \
  "$OUT_DIR/main-files" \
  "$OUT_DIR/preview-screenshots" \
  "$OUT_DIR/optional-live-preview" \
  "$OUT_DIR/optional-video-preview"

cp -f "$THUMB_SRC" "$OUT_DIR/thumbnail/thumbnail-80x80.png"
cp -f "$INLINE_SRC" "$OUT_DIR/inline-preview-image/preview-590x300.jpg"

MAIN_ZIP="$OUT_DIR/main-files/warungwa-main-files.zip"
SCREEN_ZIP="$OUT_DIR/preview-screenshots/warungwa-preview-screenshots.zip"
LIVE_ZIP="$OUT_DIR/optional-live-preview/warungwa-live-preview.zip"

rm -f "$MAIN_ZIP" "$SCREEN_ZIP" "$LIVE_ZIP"

TMP_MAIN_LIST="$(mktemp)"
trap 'rm -f "$TMP_MAIN_LIST" "$TMP_MAIN_LIST.filtered"' EXIT

git -C "$ROOT_DIR" ls-files > "$TMP_MAIN_LIST"
rg -v '(^|/)thumbnail-80x80\.png$|(^|/)preview-590x300\.(png|jpg)$|^preview-screenshots/|^upload-checklist/' "$TMP_MAIN_LIST" > "$TMP_MAIN_LIST.filtered"
zip -q "$MAIN_ZIP" -@ < "$TMP_MAIN_LIST.filtered"

(
  cd "$ROOT_DIR"
  zip -q -r "$SCREEN_ZIP" preview-screenshots \
    -i 'preview-screenshots/*.png' 'preview-screenshots/*.jpg' 'preview-screenshots/descriptions.txt'
)

(
  cd "$ROOT_DIR"
  zip -q -r "$LIVE_ZIP" live-preview
)

echo "Generated upload checklist binaries under: $OUT_DIR"
echo "- thumbnail/thumbnail-80x80.png"
echo "- inline-preview-image/preview-590x300.jpg"
echo "- main-files/warungwa-main-files.zip"
echo "- preview-screenshots/warungwa-preview-screenshots.zip"
echo "- optional-live-preview/warungwa-live-preview.zip"
