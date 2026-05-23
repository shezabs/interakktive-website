// Combined L11.26 + L11.27 academy-data.ts patch
// Run with: node L11-final-academy-data-patch.js
// This script inserts L11.26 and L11.27 entries after cipher-trading-discipline.
// Idempotent: safe to run multiple times.

const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'app/lib/academy-data.ts');
let src = fs.readFileSync(filePath, 'utf8');

const l1126Entry = `      { id: 'cipher-asset-class-adaptation', courseId: 'level-11-cipher-pro-mastery', title: 'Cipher Asset-Class Adaptation', subtitle: 'Same Framework. Four Asset Characters. One Per Session.', description: 'Lesson 26 of Level 11. The Groundbreaking Concept — The Framework Is Universal, The Calibration Is Local — separates what CIPHER self-routes per asset class (signal engine width, PX pipeline gates, TS thresholds, macro context references) from what the operator still calibrates manually (position size baseline, news-window discipline, session timing, preset fit). Four asset characters: FX as the patient asset; Indices as the session-bound asset; Crypto as the reactive asset; Gold as the macro asset. Single-asset-per-session rule. Cross-asset correlation discipline. Per-class position sizing baselines (FX 1.0×, Gold 0.7×, Indices 0.6×, Crypto 0.5×). Class-onboarding sequence FX → Gold → Indices → Crypto. 30-session per-class audit. Six characteristic failure modes. Interactive cross-asset correlation widget and drag-to-scrub 90-session-by-class equity curve. Earns the Asset-Class Operator certificate.', estimatedMinutes: 60, isFree: false, totalSections: 17, quizPassThreshold: 66 },`;

const l1127Entry = `      { id: 'cipher-operator', courseId: 'level-11-cipher-pro-mastery', title: 'Cipher Operator', subtitle: 'After All The Rules, The Operator Is The Risk.', description: 'Lesson 27 of Level 11 — the final capstone. The Groundbreaking Concept — The Operator Is The Risk — addresses the sixth risk layer that remains after engine, calibration, asset-class, news, and drawdown risks have been structurally defended. Three compounding curves operate over multi-quarter horizons: skill (logarithmic rise), drift (exponential rise), audit cadence (sawtooth corrections). Identity-tier failure modes covered: the operator identity trap, the post-winning-quarter cycle, the post-losing-quarter cycle, micro-override compounding, accumulated authority, pattern confidence trap. Four maintenance protocols: 90-session multi-class audit (interactive widget), annual self-calibration, replacement operator test, the 30-day CIPHER break. Six mastery-tier mistakes catalogued. Connects the full curriculum via five coherence clusters. Earns the Cipher Operator certificate — the terminal cert of Level 11.', estimatedMinutes: 60, isFree: false, totalSections: 17, quizPassThreshold: 66 },`;

// Check if entries already exist
const has1126 = src.includes("'cipher-asset-class-adaptation'");
const has1127 = src.includes("'cipher-operator',");

if (has1126 && has1127) {
  console.log('Both L11.26 and L11.27 entries already present. Nothing to do.');
  process.exit(0);
}

const lines = src.split('\n');

// Find cipher-trading-discipline line to use as anchor
let anchorIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("'cipher-trading-discipline'") && lines[i].includes("courseId: 'level-11-cipher-pro-mastery'")) {
    anchorIdx = i;
    break;
  }
}

if (anchorIdx === -1) {
  console.error('Could not locate cipher-trading-discipline entry. Aborting.');
  process.exit(1);
}

// Find current position after L11.25 (and any existing L11.26 between)
let insertIdx = anchorIdx + 1;
if (has1126) {
  // L11.26 exists; find it and insert L11.27 after
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("'cipher-asset-class-adaptation'") && lines[i].includes("courseId: 'level-11-cipher-pro-mastery'")) {
      insertIdx = i + 1;
      break;
    }
  }
}

// Build insertions in reverse order so indices remain valid
const toInsert = [];
if (!has1126) toInsert.push(l1126Entry);
if (!has1127) toInsert.push(l1127Entry);

// Insert in order: L11.26 first, then L11.27
lines.splice(insertIdx, 0, ...toInsert);

fs.writeFileSync(filePath, lines.join('\n'));
console.log(`Inserted ${toInsert.length} lesson entries:`);
if (!has1126) console.log(' - L11.26 cipher-asset-class-adaptation');
if (!has1127) console.log(' - L11.27 cipher-operator');
