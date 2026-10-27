# Brew Asia 2026 attendee interpretation portal

Independent, mobile-first static portal for The ADORA, Ho Chi Minh City, 28–29 October 2026. Prepared on 27 October. No backend, authentication, framework, analytics, remotely loaded fonts, service worker, or runtime package dependencies. **Prepared for controlled phone testing. The owner has shown working Japanese captions on an iPhone; full real-phone acceptance in both halls is still pending.**

Live test site: https://skidbladnr.github.io/brew-asia-2026-attendee-portal/

Public repository: https://github.com/Skidbladnr/brew-asia-2026-attendee-portal

## Current hall configuration

The organizer-supplied pairs are in `public/config.json`:

| Visible hall | Official attendee link | Official iframe link |
| --- | --- | --- |
| Barth Haas Hall | https://attend.wordly.ai/join/UAFJ-4373 | https://attend.wordly.ai/frame/UAFJ-4373 |
| Joe White Maltings Hall | https://attend.wordly.ai/join/XVCS-9354 | https://attend.wordly.ai/frame/XVCS-9354 |

Hall spelling now follows the official conference programme, checked on 27 October 2026. Internal IDs `a` and `b` are only navigation keys; they do not assert an official Hall A/B signage mapping. Confirm physical signage and whether these interpretation sessions remain valid on both dates. No presenter links or settings are used.

## Event identity and programme (v1.4)

The design uses the official public Brew Asia 2026 event mark and hall logos, restrained event colors, medium-weight event headings, system body text and compact hall cards. Warm paper tones, subtle hall tints and a desktop brewing illustration retain the event identity. Promotional slogans have been removed; instructions describe what attendees need to do. Asset provenance is in `docs/BRAND-SOURCES.md`. All design assets load from the portal itself.

The hall cards show **Scheduled now** and **Next**, derived from `public/schedule.json` in `Asia/Ho_Chi_Minh` time (UTC+7). A two-day agenda includes speakers, workshop signup notes and shared activities. Short display titles are used. The official conference page is linked for full descriptions. This is a timetable, not broadcast detection; delays and cancellations must be supplied by the event team.

Schedule state is recomputed every 30 seconds and on return to the page without reloading the listening iframe. Timetable edits require changing `public/schedule.json`, rebuilding and deploying through the approved process. An already-open tab must reload to fetch changed timetable data; do that between sessions because it also stops listening. A failed timetable fetch leaves interpretation controls usable. See `docs/PROGRAMME-SOURCES.md` for the hall mapping and source decisions.

The outer attendee interface omits the service/vendor name. A direct-connection fallback is available inside the selected hall’s Help section. Repeated direct links have been removed from the hall cards at the owner’s request; underlying official URLs and iframe behavior are unchanged. The provider may still show its own name inside the frame or direct page. Native-language audio-start prompts are included for all five output languages; the rest of the shell and agenda remain English.

## Run and build

Use Node.js 22 or later, from this folder:

```sh
npm test
npm run build:release
npm run preview
```

Open `http://127.0.0.1:4173` on the development computer. The server is loopback-only. Do not run it on either production MacBook. `npm run dev` serves editable files from `public/`. Opening `index.html` as a `file:` URL is unsupported because configuration is fetched over HTTP.

There is no dependency installation required to build or serve. `build:release` validates configuration and copies the static files to `dist/`. It never uploads anything. `npm run build` permits blank/incomplete configuration for a local preview, with warnings. Use the release build for any handoff.

Browser tests use development-only packages:

```sh
npm ci --ignore-scripts
npx playwright install chromium
npm run build:release
npm run test:browser
```

Alternatively, use an installed Chrome executable without downloading Chromium (version mismatch can affect the test runner; the matching Playwright browser is recommended):

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' npm run test:browser
```

The automated suite intercepts **all Wordly requests** with local test responses, including direct links. It does not join either real event session. Synthetic session IDs occur only in unit-test fixtures. See `docs/TEST-RESULTS.md` for the actual verification boundary.

## Configuration and safe fallback

Edit `public/config.json`, then rebuild. `config.example.json` is an empty, portable sample. Never put presenter credentials, API tokens, or other secrets in this public configuration. An attendee passcode included in a URL is visible to visitors; include one only if it is intended to be shared with attendees.

- `mode: "embed"` provides the attendee iframe after a tap on Start listening.
- `mode: "links"` disables all iframe creation and displays the branded hall chooser with direct Wordly links. Use this if real-device embed tests fail.
- Each hall needs its official `/join/…` URL. Embed mode additionally needs a matching official `/frame/…` URL.
- Invalid iframe URLs degrade to a valid direct attendee link at runtime. A release build rejects missing or mismatched embed configuration; switch to links mode deliberately or correct it.
- Duplicate hall session IDs fail closed. Unknown origins, presenter paths and undocumented iframe parameters are rejected. If Wordly supplies a new URL format, verify its official documentation before adjusting the validator.
- Direct attendee URLs are preserved. Language/display parameters are applied only to iframe URLs; attendees select their language inside Wordly when using a direct link.

Selecting a hall opens a focused setup view. Starting hides the outer language setup, leaving the hall name, Change hall, a short audio instruction and the captions frame. Use the provider’s internal language control while listening. Programme details and recovery controls sit below the frame. Help contains Reload captions, Stop listening and Try the direct connection. Reload uses the original setup language; an in-frame language change cannot be read by the wrapper.

Only one iframe exists at a time. Change hall, Stop listening, going offline, or navigating away removes the old iframe. Starting/reloading requires a tap. Stop listening returns to setup, where a different starting language can be chosen. Audio still requires Wordly’s own user gesture. Separate browser tabs and other devices cannot be controlled by this portal.

The page stores no selection or transcript in local storage, cookies, or a backend. Wordly operates its own cross-origin session and storage. The portal cannot inspect captions, confirm a broadcast, or guarantee provider-side session isolation. Visible messages describe browser actions, not invented live status.

## Deployment after approval

1. Obtain the organizer’s explicit approval for the proposed hosting address and a controlled phone-test rollout. Use a development machine independent of the two production MacBooks and their rented cellular routers.
2. Confirm hall names, URL pairs, date/session validity and any attendee passcode. Complete the release build and retain a dated copy of the configuration and prior approved release.
3. For GitHub Pages, use the supplied manual workflow and `docs/GITHUB-PAGES.md`. For other hosts, upload **only the contents of `dist/`** to a static HTTPS host approved by the organizer. No server, environment variables, account sign-in, or SPA rewrite is needed. Relative asset URLs support a directory path when its URL ends in `/`.
4. `_headers` contains no-cache, security and playback-permission headers understood by hosts with that convention, such as Cloudflare Pages/Netlify. GitHub Pages does not apply this `_headers` file or provide these custom header settings; the portal therefore also uses HTML CSP/referrer policy and the iframe’s autoplay permission. These are not equivalent to every header listed. Verify actual HTTPS behavior and MIME types on the chosen host. The HTML also contains a CSP fallback; `frame-ancestors` must be an HTTP header. Do not add a blanket policy that blocks Wordly frames or audio.
5. Test the final HTTPS address in real iOS Safari and Android Chrome in **both halls simultaneously**, using the checklist. No automatic testing modifies or starts the presenter feeds. Coordinate listening tests with the existing operators.
6. Only after successful acceptance and explicit organizer authorization, distribute the single portal QR as an approved option. Do not remove or replace existing official Wordly QR codes without separate explicit approval.

Keep the previous static release for rollback. If the wrapper fails, use `mode: "links"`, rebuild and redeploy only under the same authorization. If the portal host or network fails entirely, use the unchanged official hall QR codes. A static portal cannot provide live interpretation offline.

## Single-QR destination

The prepared QR encodes **https://skidbladnr.github.io/brew-asia-2026-attendee-portal/**, with no hall selected. A PNG, SVG and four-label A4 PDF accompany the delivery package. The PNG and all four codes in a rendered PDF were software-decoded against the exact address. Print at 100% / actual size; each label is 90 × 125 mm. Real camera/printed-label acceptance and organizer approval are still required before distribution or covering existing codes. Retain the original direct hall codes. Site updates at this same address do not require a new QR.

Optional test deep links on that same root are `?hall=a&lang=vi` and `?hall=b&lang=ko`. They preselect only a known hall and language; they never auto-join. Accepted `lang` values are `vi`, `th`, `zh-CN`, `ko`, `ja`. Other query values cannot inject a session URL. Default landing behavior offers both named halls. Test printed size, camera scanning, trailing slash/subdirectory hosting and cellular access; a loopback address is never a phone QR destination.

## Review and acceptance

- `docs/GITHUB-PAGES.md`: manual GitHub Pages setup and day-of operation.
- `docs/BRAND-SOURCES.md`: public branding asset sources.
- `docs/GO-NO-GO.md`: concise release gate and required details.
- `docs/DEVICE-ACCEPTANCE.md`: real-phone test steps and result table.
- `docs/WORDLY.md`: documented integration contract and limitations.
- `docs/TEST-RESULTS.md`: completed evidence and untested risks.
- `docs/phone-preview.jpg`: first mobile viewport at 390 × 844 CSS pixels.
- `docs/desktop-preview.jpg`: desktop hall chooser.
- `docs/listening-preview.png`: active mobile layout with a visibly simulated provider response; not a live-feed capture.
- `docs/mobile-preview.png`: captured portal landing page on preparation day.
- `docs/schedule-preview.png`: a **simulated 28 October, 11:10** timetable view for design review; not evidence of a live broadcast.

The referenced conversation exposed no downloadable `Brew_Asia_2026_Trip_Agent_Handoff.md`. This build follows the explicit confirmed brief: two MacBooks, two independent router/feed setups, individually tested rooms, and simultaneous testing still pending for the morning.
