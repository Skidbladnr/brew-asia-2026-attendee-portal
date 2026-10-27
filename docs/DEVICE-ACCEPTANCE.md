# Real-device acceptance — owner sign-off required

Do this on independent attendee phones, using the final organizer-approved HTTPS test address. Do not install or change software, audio routing, networking or settings on either presenter MacBook/router. The two rooms have been tested individually according to the brief; simultaneous testing is still required.

Programme checks: compare the correct hall/session to the final organizer timetable; verify Vietnam time even on a phone set to another time zone. Test a session boundary while listening: the schedule card may change but sound must not restart. Test each date tab, signup note and the link to the official programme. Have a fluent reader check the five short translated audio-start prompts.

Minimum coverage: one real iPhone with Safari and one real Android phone with Chrome, each exercised in both halls. Ideally have four phones/operators so both phone families can be checked in both halls concurrently. Record OS/browser versions, network, headphones, time, hall and outcome. Browser emulation is not a substitute.

1. **QR / arrival.** Scan the single portal QR with the system camera. Confirm HTTPS, correct branding, both named halls and visible direct links. No session or sound should start merely on arrival. Check ordinary cellular access independent of production routers. Check an in-app browser if attendees are likely to use one; recommend opening Safari/Chrome if embedded browser playback fails.
2. **Room identity and activation.** Open a test phone before the session starts, then have the operator start the normal feed. Confirm the waiting view becomes usable; document whether Start listening must be tapped again.  Coordinate short distinct spoken identifiers with each hall operator while both existing feeds run. Select the matching hall, then Start listening. Confirm captions and sound contain only that hall’s identifier. Do not infer correctness from the session ID alone.
3. **Audio gesture.** Connect headphones, select a language, tap Start listening, then tap the audio control inside Wordly. Confirm intelligible sound. Test initial mute/unmute, device volume, a locked screen/unlock, app switch/return and headphones disconnected/reconnected. No surprise speaker playback should occur in the room. Document any additional tap needed.
4. **All five languages.** Exercise Vietnamese, Thai, Simplified Chinese, Korean and Japanese. Check native-script rendering, captions, available TTS controls and actual spoken output. Check that the five-language menu filtering is respected. Translation quality and TTS quality remain provider-dependent; confirm the event’s practical needs.
5. **Switch rooms.** While listening to the first hall, select the other hall. Old audio must stop immediately. Start listening in the second hall, enable its audio and confirm the second identifier. Repeat A→B→A quickly at least three times. Test Leave and Reload. The portal must never retain two frames. Close any separate Wordly tabs before judging overlapping sound.
6. **Language changes.** Change the outer language selector while listening. The current frame should close. Tap Start listening again and enable audio; the selected language should appear. Test Wordly’s internal language control separately. Confirm the attendee can tell when reconnection is required.
7. **Fallback.** Open each hall’s “Open listening page” link from a playing session. It should navigate in the same tab, with no old iframe audio continuing. Select a language and enable sound directly in Wordly. Use Back; confirm no stale audio automatically resumes. Repeat in `mode: "links"` if embedding is unsuitable.
8. **Connection failure.** Turn off network access on the test phone (not on a production router). Check offline guidance, stopped iframe and disabled Start listening. Reconnect; Start listening must require a new tap. Separately simulate poor connectivity and a silent/unavailable session; the direct fallback must remain accessible. Reload while offline: a browser error is expected because there is no offline cache. Existing printed official QRs are the recovery path once connectivity returns.
9. **Layout and captions.** Check a narrow phone, portrait/landscape, Safari toolbar expansion, large system text and browser zoom. Read enough captions to scroll history. Buttons and the direct fallback must remain reachable without horizontal clipping. Parent page cannot repair Wordly’s internal layout; use direct fallback if needed.
10. **Accessibility.** With VoiceOver/TalkBack, locate the hall buttons, their selected state, language label, Start listening, named iframe, Leave and direct fallback. Test focus entry/exit through Wordly’s controls and confirm there is no trap. Keyboard-only desktop check complements this but does not replace phone screen-reader testing. Check contrast and text scaling inside the real Wordly frame.
11. **Isolation / privacy.** Open a fresh tab and confirm it starts without an automatically joined room. Check switching never routes the wrong session. The wrapper does not persist a transcript or selection; provider cookies/storage are outside its control. Public attendee links/passcodes must be intended for the event audience.
12. **Final distribution.** Scan the printed-size QR from realistic distances/lighting on both camera apps. Confirm it points to the final approved root address, not localhost, a test hostname or a preselected wrong hall. Obtain organizer sign-off before attendee distribution or any change to existing official codes.

## Record (unfilled means untested)

| Date/time (HCMC) | Phone / OS / browser | Hall | Network / headphones | Captions & five languages | Audio / switch isolation | Fallback / offline | Accessibility / layout | Result / tester |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| | iPhone / Safari | Barth Haas | | | | | | |
| | iPhone / Safari | Joe White | | | | | | |
| | Android / Chrome | Barth Haas | | | | | | |
| | Android / Chrome | Joe White | | | | | | |

Simultaneous-feed test time: __________

Organizer sign-off and approved distribution scope: __________

Fallback selected if embeds fail: existing official QR / accepted links-only portal (circle one).
