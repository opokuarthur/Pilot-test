#!/usr/bin/env bash
# Copy the real photos for "Five Thousand Plates" from ~/Downloads into
# public/assets/rnaq/ with the names the video expects:
#   "jamestown accra.jpeg"  → jamestown-lighthouse.jpg
#   "rnaq bugatti.jpeg"     → rnaq-bugatti.jpg
#   "delay interview.png"   → delay-interview.png
# If an exact name is missing, the closest match (case-insensitive, by key
# words) is used and reported. "dirty plates.png" is never imported
# (stock-site watermarks).
#   scripts/import-rnaq-photos.sh [downloads-dir]
set -euo pipefail
src="${1:-$HOME/Downloads}"
dest="$(cd "$(dirname "$0")/.." && pwd)/public/assets/rnaq"
mkdir -p "$dest"

import() { # <exact name> <target> <key words…>
  local exact="$1" target="$2"; shift 2
  local found=""
  if [[ -f "$src/$exact" ]]; then
    found="$src/$exact"
  else
    # Closest match: every key word appears in the name; never the watermarked plates image.
    while IFS= read -r -d '' f; do
      local name; name="$(basename "$f" | tr '[:upper:]' '[:lower:]')"
      [[ "$name" == *dirty*plate* ]] && continue
      local ok=1
      for w in "$@"; do [[ "$name" == *"$w"* ]] || ok=0; done
      if (( ok )); then found="$f"; break; fi
    done < <(find "$src" -maxdepth 1 -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.webp' \) -print0)
    [[ -n "$found" ]] && echo "note: \"$exact\" not found, using closest match: \"$(basename "$found")\""
  fi
  if [[ -z "$found" ]]; then
    echo "MISSING: \"$exact\" (no close match in $src) — the video keeps its illustrated version"
    return 0
  fi
  case "$target" in
    *.jpg) [[ "$found" =~ \.(jpe?g|JPE?G)$ ]] && cp "$found" "$dest/$target" || convert "$found" "$dest/$target" ;;
    *.png) [[ "$found" =~ \.(png|PNG)$ ]] && cp "$found" "$dest/$target" || convert "$found" "$dest/$target" ;;
  esac
  echo "ok: $(basename "$found") → public/assets/rnaq/$target"
}

import "jamestown accra.jpeg" jamestown-lighthouse.jpg jamestown
import "rnaq bugatti.jpeg" rnaq-bugatti.jpg bugatti
import "delay interview.png" delay-interview.png delay
