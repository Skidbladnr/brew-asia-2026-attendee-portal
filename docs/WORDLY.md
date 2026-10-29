# Verified Wordly contract

Embed parameters rechecked against official documentation on 29 October 2026:

- [iFrame Integration](https://help.wordly.ai/iframe-integration)
- [Language Codes](https://help.wordly.ai/about-languages-supported)

Wordly documents `https://attend.wordly.ai/frame/<session id>` for attendee embeds. Its dashboard provides this through Sessions → Get Links to Join → Embed Wordly → Copy iFrame Attend URL.

This portal sets these documented options:

| Parameter | Value/purpose |
| --- | --- |
| `show`, `hide` | Removed so the full provider language menu stays available |
| `lang` | Initial preset chosen in the portal; omitted for “Other languages…” so Wordly uses the browser default |
| `enableTTS` | `true`; exposes Wordly speech controls |
| `fgcolor`, `bgcolor` | Dark text, white caption background |
| `fgsize` | `22px` caption size |
| `showScrollbar` | `true`; retains transcript scrolling |
| `key` | Preserved if supplied; attendee passcode |

The language codes are Vietnamese `vi`, Thai `th`, Simplified Chinese `zh-CN`, Korean `ko`, and Japanese `ja`.

The validator also recognizes documented `tags`, `speakerLanguage`, `finalOnly` and `hide`. Five preset choices remain in the portal, plus “Other languages…” with guidance to choose from the menu inside the captions panel. Additional languages are provided by Wordly, not a copied language catalog. Their live captions and speech output have not been tested by this update.

These parameters configure the official frame. Parent CSS cannot restyle its controls. No private API, undocumented endpoint, or postMessage protocol is used. `enableTTS` does not guarantee automatic audio playback. Real-device testing must confirm behavior, captions and available speech output.

## Implementation decisions, not Wordly guarantees

The user supplied `/join/…` direct links; the portal does not construct or guess these links from IDs. They are preserved for the fallback. The validator accepts the two supplied official path shapes and rejects unverified alternatives.

The iframe receives browser `allow="autoplay"` permission, but the portal does not attempt to play sound. The browser may still require an interaction inside the frame. The top-level page requests no microphone or camera permissions.

A timeout offers help, not a claim that Wordly is down. Neither iframe load events nor `navigator.onLine` establish successful provider connectivity. Wordly controls loading, passcode entry, session availability, accessibility inside the frame, caption history and its own storage. Those require live acceptance.

## Day-of operation and the supplied dashboard screenshot

Official references: [Creating a Session](https://help.wordly.ai/creating-a-session) and [Ending Your Wordly Session](https://help.wordly.ai/ending-your-wordly-session), checked 27 October 2026.

- Sessions do not start automatically at their scheduled time; operators still start the existing presenter feeds normally.
- The configured duration is scheduling information. Reaching one hour does not automatically end a session.
- An ended session can be reopened using the same attendee links and QR codes. The organizer must confirm that these same two sessions will be reused on October 29.
- English (US) in the session Language setting describes the presenter/input language. It does not limit attendee output to English.
- The screenshot shows Open access for the selected Joe White Maltings session. Open access needs no attendee passcode. Confirm Barth Haas independently; its access settings are not visible in that screenshot.
- No passcode from the screenshot was copied into this project. No presenter settings were changed.

Starting a feed is not proof that an already-open phone frame will recover automatically. During acceptance, open the portal before a feed starts, then start the feed and check the waiting-to-active transition. If required, attendees can tap Start listening again or use the direct fallback. Browser audio still requires a user gesture.
