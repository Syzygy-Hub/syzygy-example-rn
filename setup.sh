#!/usr/bin/env bash
# setup.sh - rename this example app to "Syzygy Example".
#
# Usage:
#   ./setup.sh           dry run: print every planned change and change nothing (default)
#   ./setup.sh --apply   perform the changes; refuses to overwrite an existing path
#
# Skips: CHANGELOG.md (history), setup.sh, .git, build outputs, Pods, node_modules, .gradle, .dart_tool.
# All collisions are checked before any change, so an error leaves the tree untouched.
# Writes only inside this repository.
set -euo pipefail

APPLY=0
case "${1:-}" in
  "") ;;
  --apply) APPLY=1 ;;
  -h|--help) echo "Usage: $0 [--apply]"; exit 0 ;;
  *) echo "Usage: $0 [--apply]" >&2; exit 2 ;;
esac

cd "$(dirname "${BASH_SOURCE[0]}")"
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Error: not inside a git work tree." >&2
  exit 2
fi

# ---- platform configuration -------------------------------------------------
# Path prefix renames: OLD_PREFIX|NEW_PREFIX (applied to tracked paths).
PATH_PREFIX_RULES=('android/app/src/main/java/com/aks/syzygybase/|android/app/src/main/java/com/syzygyhub/example/'  "|")
# Display-name rules, applied before the general rules: OLD|NEW (exact text).
DISPLAY_RULES=('"name": "SyzygyBase"|"name": "syzygy-example"' '"displayName": "SyzygyBase"|"displayName": "Syzygy Example"' '<string name="app_name">SyzygyBase</string>|<string name="app_name">Syzygy Example</string>' '<string>SyzygyBase</string>|<string>Syzygy Example</string>'  "|")
# Files whose content is never rewritten (their paths may still be renamed).
CONTENT_SKIP=("CHANGELOG.md" "setup.sh")
# Tracked paths that are never renamed.
PATH_SKIP=("|")
# Informational warnings printed on every run.
WARNINGS=('MISMATCH: android/app/src/main/java/com/aks/syzygybase/ declared package com.syzygyhub.base. The directory and the package are both moved to com/syzygyhub/example and com.syzygyhub.example.' 'package.json name becomes SyzygyExample. npm package names must be lowercase, so review that value.'  "|")
# ---- general rules (applied after the display rules) -------------------------
COMMON_RULES=(
  "com.syzygyhub.base|com.syzygyhub.example"
  "Syzygy Base|Syzygy Example"
  "syzygy_base|syzygy_example"
  "syzygy-base|syzygy-example"
  "SyzygyBase|SyzygyExample"
)
LEFTOVER_PATTERN='SyzygyBase|syzygy-base|syzygy_base|com\.syzygyhub\.base|Boilerplate|boilerplate|com\.aks'

# ---- helpers ------------------------------------------------------------------
in_list() {  # in_list VALUE ITEM...  (succeeds if VALUE equals an ITEM)
  local v="$1" item; shift
  for item in "$@"; do [ "$v" = "$item" ] && return 0; done
  return 1
}

is_text() { grep -Iq . "$1" 2>/dev/null; }

new_path_of() {  # print the post-rename path of a tracked path
  local p="$1" r old new
  if in_list "$p" "${PATH_SKIP[@]+"${PATH_SKIP[@]}"}"; then printf '%s' "$p"; return; fi
  for r in "${PATH_PREFIX_RULES[@]+"${PATH_PREFIX_RULES[@]}"}"; do
    [ "$r" = "|" ] && continue
    old="${r%%|*}"; new="${r#*|}"
    case "$p" in "$old"*) p="$new${p#"$old"}" ;; esac
  done
  p="${p//SyzygyBase/SyzygyExample}"
  printf '%s' "$p"
}

# Tracked files (paths as git currently knows them).
FILES=()
while IFS= read -r -d '' f; do
  case "$f" in
    .git/*|*/build/*|build/*|*/Pods/*|Pods/*|*/node_modules/*|node_modules/*|*/.gradle/*|.gradle/*|*/.dart_tool/*|.dart_tool/*) continue ;;
  esac
  [ -e "$f" ] || continue   # ignore index entries already renamed on disk
  FILES+=("$f")
done < <(git ls-files -z --cached --others --exclude-standard)

# ---- plan: path renames -------------------------------------------------------
MOVE_OLD=(); MOVE_NEW=()
for f in "${FILES[@]+"${FILES[@]}"}"; do
  nf="$(new_path_of "$f")"
  if [ "$nf" != "$f" ]; then
    MOVE_OLD+=("$f"); MOVE_NEW+=("$nf")
  fi
done

# ---- collision check: stop before any change ----------------------------------
ERRORS=0
i=0
for nf in "${MOVE_NEW[@]+"${MOVE_NEW[@]}"}"; do
  if [ -e "$nf" ]; then
    echo "ERROR: target already exists, refusing to rename: $nf (from ${MOVE_OLD[$i]})" >&2
    ERRORS=$((ERRORS+1))
  fi
  j=0
  for other in "${MOVE_NEW[@]+"${MOVE_NEW[@]}"}"; do
    if [ "$j" -ne "$i" ] && [ "$other" = "$nf" ]; then
      echo "ERROR: two files would both become: $nf" >&2
      ERRORS=$((ERRORS+1))
    fi
    j=$((j+1))
  done
  i=$((i+1))
done
if [ "$ERRORS" -gt 0 ]; then
  echo "Aborted with $ERRORS collision(s). Nothing was changed." >&2
  exit 1
fi

MODE="DRY RUN"; [ "$APPLY" -eq 1 ] && MODE="APPLY"
echo "setup.sh ($MODE): rename to 'Syzygy Example' (identifier com.syzygyhub.example)"
echo

for w in "${WARNINGS[@]+"${WARNINGS[@]}"}"; do
  [ "$w" = "|" ] && continue
  echo "WARNING: $w"
done
[ ${#WARNINGS[@]} -gt 1 ] && echo

# ---- plan + apply: content ----------------------------------------------------
RULES=("${DISPLAY_RULES[@]+"${DISPLAY_RULES[@]}"}" "${COMMON_RULES[@]+"${COMMON_RULES[@]}"}")
CONTENT_LINES=0
CONTENT_FILES=0
for f in "${FILES[@]+"${FILES[@]}"}"; do
  in_list "$f" "${CONTENT_SKIP[@]+"${CONTENT_SKIP[@]}"}" && continue
  [ -f "$f" ] || continue
  is_text "$f" || continue
  file_hit=0
  for r in "${RULES[@]+"${RULES[@]}"}"; do
    [ "$r" = "|" ] && continue
    old="${r%%|*}"; new="${r#*|}"
    while IFS= read -r line; do
      n="${line%%:*}"; text="${line#*:}"
      newtext="${text//"$old"/$new}"
      [ "$file_hit" -eq 0 ] && { echo "CONTENT $f"; file_hit=1; CONTENT_FILES=$((CONTENT_FILES+1)); }
      echo "    line $n"
      echo "      - $text"
      echo "      + $newtext"
      CONTENT_LINES=$((CONTENT_LINES+1))
    done < <(grep -nF -- "$old" "$f" 2>/dev/null)
    if [ "$APPLY" -eq 1 ] && grep -qF -- "$old" "$f" 2>/dev/null; then
      OLD_S="$old" NEW_S="$new" perl -0pi -e 's/\Q$ENV{OLD_S}\E/$ENV{NEW_S}/g' "$f"
    fi
  done
done

# ---- plan + apply: paths (deepest first, never overwrite) ---------------------
PATH_COUNT=${#MOVE_OLD[@]}
if [ "$PATH_COUNT" -gt 0 ]; then
  echo
fi
i=0
for old in "${MOVE_OLD[@]+"${MOVE_OLD[@]}"}"; do
  nf="${MOVE_NEW[$i]}"
  echo "RENAME  $old"
  echo "     -> $nf"
  if [ "$APPLY" -eq 1 ]; then
    mkdir -p "$(dirname "$nf")"
    mv -- "$old" "$nf"
    d="$(dirname "$old")"
    while [ "$d" != "." ] && [ -d "$d" ] && [ -z "$(ls -A "$d")" ]; do
      rmdir "$d"; d="$(dirname "$d")"
    done
  fi
  i=$((i+1))
done

# ---- leftover check -----------------------------------------------------------
echo
echo "Leftover check (tracked files, excluding CHANGELOG.md and setup.sh):"
LEFT=0
for f in "${FILES[@]+"${FILES[@]}"}"; do
  in_list "$f" "CHANGELOG.md" "setup.sh" && continue
  np="$(new_path_of "$f")"
  src="$f"
  if [ "$APPLY" -eq 1 ] && [ "$np" != "$f" ]; then src="$np"; fi
  if [ "$APPLY" -eq 0 ] && [ "$np" != "$f" ]; then src="$f"; fi
  if printf '%s' "$np" | grep -qE "$LEFTOVER_PATTERN"; then
    echo "  PATH    $np"; LEFT=$((LEFT+1))
  fi
  [ -f "$src" ] || continue
  is_text "$src" || continue
  while IFS= read -r line; do
    echo "  $src:${line}"; LEFT=$((LEFT+1))
  done < <(grep -nE -- "$LEFTOVER_PATTERN" "$src" 2>/dev/null)
done

# ---- summary ------------------------------------------------------------------
echo
echo "Summary: $CONTENT_LINES line change(s) in $CONTENT_FILES file(s); $PATH_COUNT path rename(s); $LEFT leftover match(es)."
if [ "$APPLY" -eq 0 ]; then
  echo "Dry run only. Nothing was changed. Run ./setup.sh --apply to apply."
fi
if [ "$LEFT" -gt 0 ]; then
  echo "Leftover names remain (see above). Exit 1."
  exit 1
fi
echo "No leftover names."
