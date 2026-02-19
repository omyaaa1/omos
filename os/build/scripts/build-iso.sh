#!/usr/bin/env bash
set -euo pipefail

PROFILE="${1:-full}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PROFILES_DIR="$ROOT_DIR/os/build/profiles"
PACKAGES_DIR="$ROOT_DIR/os/packages"
BUILD_DIR="$ROOT_DIR/os/build/live-build"

PYTHON_BIN="${PYTHON_BIN:-python3}"

if [[ ! -f "$PROFILES_DIR/${PROFILE}.yaml" ]]; then
  echo "Unknown profile: $PROFILE" >&2
  exit 1
fi

echo "[build] profile=$PROFILE"

# Generate merged package list for live-build
$PYTHON_BIN "$ROOT_DIR/os/build/scripts/gen-package-list.py" \
  --profile "$PROFILE" \
  --profiles-dir "$PROFILES_DIR" \
  --packages-dir "$PACKAGES_DIR" \
  --out "$BUILD_DIR/config/package-lists/omos.list.chroot"

# TODO: generate additional hooks/configs based on profile features

# Run live-build
if command -v lb >/dev/null 2>&1; then
  echo "[build] running live-build"
  (cd "$BUILD_DIR" && lb clean --purge && lb config && lb build)
else
  echo "[build] live-build not installed; generated package list only"
fi
