// LIVE_LESSONS patch — adds L11.25, L11.26, L11.27 lesson IDs
// Run with: node L11-live-lessons-patch.js
// Idempotent: safe to run multiple times.

const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'app/lib/academy-helpers.ts');
let src = fs.readFileSync(filePath, 'utf8');

const ids = ['cipher-trading-discipline', 'cipher-asset-class-adaptation', 'cipher-operator'];
const missing = ids.filter(id => !src.includes(`'${id}'`));

if (missing.length === 0) {
  console.log('All three lesson IDs already in LIVE_LESSONS. Nothing to do.');
  process.exit(0);
}

// Anchor on the last L11 lesson currently in the set: 'cipher-war-room-integration'
const anchor = "'cipher-candles', 'cipher-war-room-integration',";

if (!src.includes(anchor)) {
  console.error('Could not find anchor "cipher-war-room-integration" in LIVE_LESSONS.');
  console.error('LIVE_LESSONS structure may have changed.');
  process.exit(1);
}

const replacement = `'cipher-candles', 'cipher-war-room-integration',\n  'cipher-trading-discipline', 'cipher-asset-class-adaptation', 'cipher-operator',`;

// Only add the IDs that are missing, in correct order
const newLine = `\n  ${ids.filter(id => missing.includes(id)).map(id => `'${id}'`).join(', ')},`;

src = src.replace(anchor, anchor + newLine);
fs.writeFileSync(filePath, src);

console.log(`Added ${missing.length} lesson ID(s) to LIVE_LESSONS:`);
missing.forEach(id => console.log(`  - ${id}`));
