import { cp, mkdir, readFile, rm } from 'node:fs/promises';
import { normalizeConfig } from '../public/config-core.js';
import { normalizeSchedule } from '../public/schedule-core.js';
const raw = JSON.parse(await readFile(new URL('../public/config.json', import.meta.url), 'utf8'));
const config = normalizeConfig(raw);
normalizeSchedule(JSON.parse(await readFile(new URL('../public/schedule.json', import.meta.url), 'utf8')));
const issues = config.halls.flatMap(h => h.issues.map(issue => `${h.name}: ${issue}`));
if (config.mode === 'embed') for (const hall of config.halls) {
  if (!hall.embedUrl) issues.push(`${hall.name}: No valid iframe URL. Use links mode or supply a matching iframe URL.`);
}
if (process.argv.includes('--release') && issues.length) throw new Error(`Release configuration rejected:\n${issues.join('\n')}`);
if (issues.length) console.warn('Preview only:', issues.join('\n'));
const target = new URL('../dist/', import.meta.url);
await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp(new URL('../public/', import.meta.url), target, { recursive: true });
console.log(`Built static files in dist/. Mode: ${config.mode}. No deployment performed.`);
