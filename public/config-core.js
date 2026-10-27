// Wordly contracts checked 2026-10-27. See docs/WORDLY.md.
export const LANGUAGES = Object.freeze([
  { code: 'vi', name: 'Tiếng Việt', english: 'Vietnamese' },
  { code: 'th', name: 'ไทย', english: 'Thai' },
  { code: 'zh-CN', name: '简体中文', english: 'Simplified Chinese' },
  { code: 'ko', name: '한국어', english: 'Korean' },
  { code: 'ja', name: '日本語', english: 'Japanese' },
]);
const parameters = new Set(['key', 'lang', 'fgcolor', 'bgcolor', 'fgsize', 'tags', 'speakerLanguage', 'enableTTS', 'finalOnly', 'showScrollbar', 'hide', 'show']);
const sessionPattern = /^[A-Z0-9]+-[A-Z0-9]+$/i;

function parseUrl(value, kind) {
  if (!value) return null;
  const url = new URL(value.trim());
  if (url.origin !== 'https://attend.wordly.ai' || url.username || url.password || url.hash)
    throw new Error('Use an official HTTPS Wordly attendee URL.');
  const parts = url.pathname.split('/').filter(Boolean);
  // Fail closed on presenter URLs, arbitrary paths and unverified formats.
  if (parts.length !== 2 || parts[0] !== kind || !sessionPattern.test(parts[1]))
    throw new Error(`Expected a copied Wordly /${kind}/ session URL.`);
  if (kind === 'frame' && [...url.searchParams.keys()].some(key => !parameters.has(key)))
    throw new Error('The iframe URL contains an undocumented parameter.');
  return { href: url.href, session: parts[1].toUpperCase() };
}

export function normalizeConfig(raw) {
  if (!raw || !['embed', 'links'].includes(raw.mode) || !Array.isArray(raw.halls) || raw.halls.length !== 2)
    throw new Error('Configure exactly two halls and an embed or links mode.');
  const halls = raw.halls.map((hall, index) => {
    if (hall.id !== ['a', 'b'][index] || typeof hall.name !== 'string' || !hall.name.trim() || hall.name.length > 70)
      throw new Error('Hall names and IDs must be configured.');
    let attendee = null, embed = null;
    const issues = [];
    try { attendee = parseUrl(hall.attendeeUrl, 'join'); } catch (error) { issues.push(error.message); }
    try { embed = parseUrl(hall.embedUrl, 'frame'); } catch (error) { issues.push(error.message); }
    if (!attendee) issues.push('An official attendee link is required.');
    if (embed && attendee && embed.session !== attendee.session) {
      issues.push('Attendee and iframe session IDs do not match.');
      embed = null;
    }
    // An iframe must always have a safe matching direct exit.
    if (!attendee) embed = null;
    return { id: hall.id, name: hall.name.trim(), attendeeUrl: attendee?.href ?? '',
      embedUrl: embed?.href ?? '', session: attendee?.session ?? '', issues };
  });
  if (halls[0].session && halls[0].session === halls[1].session)
    throw new Error('The two halls must use different Wordly sessions.');
  return { mode: raw.mode, halls };
}

export function initialLanguage(browserLanguages = []) {
  for (const language of browserLanguages) {
    const prefix = language.toLowerCase().split('-')[0];
    const match = LANGUAGES.find(item => item.code.toLowerCase().split('-')[0] === prefix);
    if (match) return match.code;
  }
  return 'vi';
}

export function embedSource(hall, language) {
  if (!LANGUAGES.some(item => item.code === language)) throw new Error('Unsupported language.');
  const parsed = parseUrl(hall.embedUrl, 'frame');
  if (!parsed) throw new Error('No iframe configured.');
  const url = new URL(parsed.href);
  // Only documented display parameters. No postMessage or private API calls.
  url.searchParams.delete('hide');
  url.searchParams.set('show', LANGUAGES.map(item => item.code).join(','));
  url.searchParams.set('lang', language);
  url.searchParams.set('enableTTS', 'true');
  url.searchParams.set('fgcolor', '#142f2a');
  url.searchParams.set('bgcolor', '#ffffff');
  url.searchParams.set('fgsize', '22px');
  url.searchParams.set('showScrollbar', 'true');
  return url.href;
}
