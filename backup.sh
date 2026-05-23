#!/usr/bin/env bash
# =============================================================================
# Interakktive Website — Backup Script
# =============================================================================
# Creates a lightweight, date-stamped tarball of the site (excluding heavy
# regenerable directories like node_modules, .next, .git, etc).
#
# USAGE:
#   ./backup.sh                              → backup with auto date label
#   ./backup.sh "war-room-retired"           → backup with custom label
#
# OUTPUT:
#   ~/OneDrive/Desktop/interakktive-backups/
#       interakktive-website_<label>_<YYYY-MM-DD>.tar.gz
#
# Typical size: 3-8 MB.
# =============================================================================

set -e  # exit on error

# ── Config ──────────────────────────────────────────────────────────────────
BACKUP_DIR="$HOME/OneDrive/Desktop/interakktive-backups"
REPO_NAME="interakktive-website"
DATE="$(date +%Y-%m-%d)"
LABEL="${1:-snapshot}"   # use $1 if provided, else "snapshot"

# Sanitize label — replace anything non-alphanumeric/dash/underscore with dash
LABEL="$(echo "$LABEL" | tr -c '[:alnum:]_-' '-' | sed 's/-\+/-/g; s/^-//; s/-$//')"

OUTFILE="$BACKUP_DIR/${REPO_NAME}_${LABEL}_${DATE}.tar.gz"

# ── Pre-flight checks ───────────────────────────────────────────────────────
# Must be run from repo root (where package.json lives)
if [ ! -f "package.json" ]; then
  echo "❌ Error: Must be run from the repo root (no package.json found here)."
  echo "   cd to ~/OneDrive/Desktop/interakktive-website/ first."
  exit 1
fi

# Verify we're in the right repo by checking for telltale files
if [ ! -d "app" ] || [ ! -d "app/affiliates" ]; then
  echo "❌ Error: This doesn't look like the interakktive-website repo."
  echo "   Missing app/ or app/affiliates/ directory."
  exit 1
fi

# Create backup dir if missing
mkdir -p "$BACKUP_DIR"

# Refuse to overwrite an existing same-named backup (rename instead)
if [ -f "$OUTFILE" ]; then
  COUNTER=2
  while [ -f "$BACKUP_DIR/${REPO_NAME}_${LABEL}_${DATE}_v${COUNTER}.tar.gz" ]; do
    COUNTER=$((COUNTER + 1))
  done
  OUTFILE="$BACKUP_DIR/${REPO_NAME}_${LABEL}_${DATE}_v${COUNTER}.tar.gz"
  echo "ℹ️  Same-name backup already exists, using suffix v${COUNTER}"
fi

# ── Build the tarball ───────────────────────────────────────────────────────
echo ""
echo "📦 Creating backup..."
echo "   Source: $(pwd)"
echo "   Output: $OUTFILE"
echo ""

# Use the parent dir as tar's working dir so the archive contains a top-level
# folder named "interakktive-website/" (matches your existing backups pattern).
PARENT_DIR="$(dirname "$(pwd)")"
CURRENT_FOLDER="$(basename "$(pwd)")"

cd "$PARENT_DIR"

tar -czf "$OUTFILE" \
  --exclude="${CURRENT_FOLDER}/node_modules" \
  --exclude="${CURRENT_FOLDER}/.next" \
  --exclude="${CURRENT_FOLDER}/.git" \
  --exclude="${CURRENT_FOLDER}/.vercel" \
  --exclude="${CURRENT_FOLDER}/out" \
  --exclude="${CURRENT_FOLDER}/dist" \
  --exclude="${CURRENT_FOLDER}/build" \
  --exclude="${CURRENT_FOLDER}/coverage" \
  --exclude="${CURRENT_FOLDER}/.turbo" \
  --exclude="${CURRENT_FOLDER}/.cache" \
  --exclude="*.log" \
  --exclude=".DS_Store" \
  --exclude="Thumbs.db" \
  "${CURRENT_FOLDER}"

# ── Report ──────────────────────────────────────────────────────────────────
SIZE=$(du -h "$OUTFILE" | cut -f1)
FILECOUNT=$(tar -tzf "$OUTFILE" | wc -l)

echo "✅ Backup complete."
echo ""
echo "   File:  $OUTFILE"
echo "   Size:  $SIZE"
echo "   Files: $FILECOUNT"
echo ""
echo "   Last 5 backups in $BACKUP_DIR:"
ls -lht "$BACKUP_DIR"/*.tar.gz 2>/dev/null | head -5 | awk '{printf "   %s  %s  %s\n", $5, $6" "$7" "$8, $9}'
echo ""
