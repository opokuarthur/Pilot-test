#!/usr/bin/env bash
# Render still frames of a composition into out/previews/ for quick checks.
#   scripts/preview-stills.sh <CompositionId> <frame> [<frame> ...]
# Optional: BROWSER=/path/to/chrome to use a specific Chrome/Chromium binary.
# Optional: SCALE=0.5 to render at half resolution (faster).
set -euo pipefail
comp="$1"; shift
mkdir -p out/previews
extra=()
[[ -n "${REMOTION_CONFIG:-}" ]] && extra+=(--config "$REMOTION_CONFIG")
[[ -n "${BROWSER:-}" ]] && extra+=(--browser-executable "$BROWSER")
for f in "$@"; do
  npx remotion still "$comp" "out/previews/${comp}-f${f}.png" --frame="$f" --scale="${SCALE:-1}" "${extra[@]}" --log=error
  echo "out/previews/${comp}-f${f}.png"
done
