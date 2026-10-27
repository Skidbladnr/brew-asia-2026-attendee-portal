# Verification record — 27 October 2026

## Exercised

- Node 22 unit tests: **14 passed**. Checks include provided URL pairs, distinct sessions, language parameters/passcode preservation, hostile or presenter URL rejection, mismatched embeds, empty sample configuration and language defaults.
- Release configuration/build: **passed**. Static files copied to `dist/`; the tested release was subsequently deployed through the manual GitHub Pages workflow.
- Playwright Chromium 141 headless shell with mobile emulation: **17 browser tests passed, exit code 0 (4.9 seconds)**. Wordly traffic was intercepted locally; no real event session was contacted by the suite.
- Covered no automatic joining, one iframe through switching/reload, all five language options, offline disconnect/manual resume, links-only mode, missing/failed configuration, blocked frames, QR query handling, same-tab direct navigation and no wrapper persistence.
- Widths 320, 390, 768 and 1440 CSS pixels checked before/after frame creation: no document horizontal overflow.
- Automated axe WCAG 2 A/AA and 2.1 AA scan of the portal shell: **no violations found**. The simulated cross-origin iframe was excluded. Keyboard skip-link and hall-selection checks passed.
- A GitHub Pages-style `/brew-asia-test/` project path loaded the local logos, programme and selected session successfully. This is a local simulation, not a deployed GitHub Pages test.
- Loopback preview returned HTTP 200. A screenshot of the mobile landing page was visually reviewed. `mobile-preview.png` shows the real portal shell with no mocked live captions.

An initial run against the machine’s newer installed Chrome passed all assertions but stalled during test-runner shutdown and was interrupted. The matching Playwright browser resolved the tooling issue; the complete suite then exited successfully. Prefer the matching downloaded browser for reproducible tests.

## Not exercised / release risks

- Real iOS Safari, real Android Chrome, VoiceOver/TalkBack, Bluetooth headphones, screen locking and mobile autoplay behavior.
- Real Wordly rendering, frame/permission policy compatibility, passcode handling, TTS audio output and caption readability inside the provider’s frame.
- Whether supplied sessions are running, available for both dates, properly entitled or configured for the requested languages. No claim of live status is made.
- Both halls simultaneously, sustained cellular bandwidth, congestion, cross-hall audio isolation at the provider and operator level, translation quality or latency.
- Hosting-specific mobile caching behavior, actual printed QR/camera scans and organizer acceptance.

Programme tests cover Vietnam time, exact start/end boundaries, gaps, shared activities, the overnight transition, completed conference state, schedule-fetch failure, date/hall filters and keeping the same iframe during a timetable transition. A native-language instruction appears for each selected output language.

The browser’s online hint cannot detect every outage. Cross-origin iframe failures may not emit useful error events; the selected hall’s Help section keeps the direct fallback available. A fresh offline page load cannot work without internet. The portal removes its own iframe on switching but cannot silence a separate browser tab or another device.

No presenter MacBook, cellular router, production feed, official QR code or Wordly account setting was modified. A new independent GitHub Pages deployment was created with the owner’s authorization. Research used public Wordly documentation, official event/programme/branding pages and GitHub documentation; no private event account was accessed. URLs supplied by the user were validated locally.

The official public programme supplies the schedule; live delays, cancellations and final organizer changes remain unverified. `schedule-preview.png` uses a simulated 28 October 11:10 clock and is not a live-event screenshot.

The page uses event and hall logos from the official public Brew Asia website, with sources recorded in `BRAND-SOURCES.md`. The new mobile landing and simulated programme screenshots were visually reviewed. Branding/spelling/signage approval remains part of handoff. Test passes are not event acceptance; use `GO-NO-GO.md` and record the real-device results.

The manual GitHub Actions workflow completed successfully in the public repository. The desktop design was also visually reviewed. Final hosted audio/frame behavior on real phones remains untested.

Revision 1.2.1: promotional copy, the condensed display font, oversized headings and decorative blocks were removed. Mobile and desktop captures were refreshed. Existing layout, accessibility and session-regression checks passed again; no session configuration or programme data changed.

Revision 1.2.2: restored lighter event typography, reduced the introduction and condensed audio guidance. All 17 browser checks passed again. At 390 × 844 CSS pixels, the hall choice buttons occupy y=345–413 and y=582–650, so both fit in the first viewport. The local medium font loaded successfully. `phone-preview.jpg` shows that viewport at CSS scale; full-page previews now also use CSS scale. These measurements are browser emulation, not real-device acceptance.

Revision 1.3: warmer event styling restored without slogans; unit tests (14) and browser tests (17) passed. Public source review found no credential signatures or real passcodes in configuration. These checks do not guarantee absence of every possible sensitive value. Production presenter devices and router configurations remain untouched.

## Hosted release and QR verification

- Public visibility and controlled hosting were authorized by the owner. GitHub Pages deployment 40545063071 succeeded from commit `3664b9fd247fc1abf973f962b8d9439e57aeab9f`.
- https://skidbladnr.github.io/brew-asia-2026-attendee-portal/ loaded the event identity, both hall cards and schedule. Hall selection and all five language options were visible; selection alone left zero iframes. Both direct links matched the supplied attendee URLs. No real listening session was started.
- The final QR PNG and all four QR codes in the rendered A4 PDF decoded to that exact HTTPS address. The PDF was visually reviewed. Software decoding does not prove camera scanning of the printed sheet.
- An initial local QR decode failed because the sandbox could not initialize the native image decoder; the permitted local decoder run succeeded. PDF rendering succeeded with a local font cache.
- The site source is public. A scan found no known credential signatures or presenter passcodes in the release; event programme and attendee session URLs are intentionally public.


## Revision 1.4 — focused listening view, 28 October

The owner reported working interpretation and supplied iPhone screenshots showing Japanese captions in Barth Haas. This is real-device evidence for that caption path on the earlier release; audio, Joe White, simultaneous halls and the revised layout remain to be accepted.

The hall chooser no longer repeats direct links. Selection replaces the chooser with language setup. Starting hides setup and places the frame immediately beneath the hall name and audio hint. Change hall tears down the frame and restores the chooser. Reload, stop and direct recovery are under Help; the selected programme is collapsed below the frame. The unconditional 12-second warning has been removed because elapsed time cannot indicate provider failure.

Validation: 14 unit tests and 18 browser tests, including focused-view layout, frame teardown, fallback recovery, no unsolicited timeout warning and frame bounds for both hall names at 320/390 widths. The shell accessibility and wider layout tests remain included. Provider responses in browser tests are simulated. A screenshot of the active test layout is labelled as a simulated provider response.

Initial local test attempts required loopback permission and the already downloaded matching Chromium path; an outdated test locator for hidden hall controls was corrected before the final suite. These were tooling/test issues, not a live-provider test.
