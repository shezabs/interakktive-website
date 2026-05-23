// Level 11 Complete badge patch
// Run with: node L11-complete-badge-patch.js
// Adds a special "Level 11 Complete" celebration banner to the academy index
// when a user has completed all 27 lessons of Level 11.
// Idempotent: safe to run multiple times.

const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'app/academy/page.tsx');
let src = fs.readFileSync(filePath, 'utf8');

const marker = 'L11_COMPLETE_BADGE_INSERTED';

if (src.includes(marker)) {
  console.log('Level 11 Complete badge already inserted. Nothing to do.');
  process.exit(0);
}

// Find the course header button and inject the Level 11 special banner immediately after it.
// We add a conditional render that fires only when course.id === 'level-11-cipher-pro-mastery'
// AND levelComplete is true.

const oldChunk = `              <button
                onClick={() => toggle(course.id)}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/[0.02] transition-all text-left group"
              >`;

const newChunk = `              {/* L11_COMPLETE_BADGE_INSERTED — special celebration banner for Level 11 terminal completion */}
              {course.id === 'level-11-cipher-pro-mastery' && levelComplete && (
                <div className="mb-3 p-4 rounded-2xl text-center" style={{
                  background: 'linear-gradient(135deg, rgba(38,166,154,0.12), rgba(255,179,0,0.12), rgba(14,165,233,0.08))',
                  border: '1px solid rgba(255,179,0,0.4)',
                }}>
                  <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-amber-400 mb-1">&#9733; LEVEL 11 COMPLETE &#9733;</p>
                  <p className="text-sm font-bold text-white">CIPHER PRO MASTERY &middot; ALL 27 LESSONS</p>
                  <p className="text-xs text-gray-400 mt-1 italic">The framework holds for as long as the practice holds.</p>
                </div>
              )}
              <button
                onClick={() => toggle(course.id)}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/[0.02] transition-all text-left group"
              >`;

if (!src.includes(oldChunk)) {
  console.error('Could not find anchor chunk in academy/page.tsx. Aborting.');
  console.error('This may indicate the file has been modified beyond expected structure.');
  process.exit(1);
}

src = src.replace(oldChunk, newChunk);
fs.writeFileSync(filePath, src);
console.log('Level 11 Complete badge inserted in app/academy/page.tsx.');
console.log('Banner will appear automatically for users who complete all 27 L11 lessons.');
