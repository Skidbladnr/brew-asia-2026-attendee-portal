# Programme provenance and update procedure

Checked 27 October 2026, Ho Chi Minh City time.

- [Official conference page](https://www.brew-asia.com/conference)
- [Full programme linked by “Download the Conference Programme”](https://www.brew-asia.com/_files/ugd/8cfdb8_b6f9de79fdba4271b60f6f3dc81e9f75.pdf)

The PDF was visually checked to disambiguate the two columns. The website’s individual session entries independently identify the keynote halls. A second, older-looking programme linked as “Conference Programme Day 1” has different workshop details; the main full-programme download is the working source. No newer organizer document was found in the limited connected Drive search. Organizer acceptance of this snapshot remains pending.

## Mapping decisions

- Internal `a`: Barth Haas Hall, retaining supplied session UAFJ-4373.
- Internal `b`: Joe White Maltings Hall, retaining supplied session XVCS-9354.
- 24 hall entries: 9 Barth Haas, 15 Joe White (including opening/keynote slots).
- 10 shared/activity entries: registration, breaks, lunch, networking, the Innovation Zone discussion and awards. These never create or redirect a listening session.
- The shared-width opening/keynote rows are assigned to Joe White using the explicit location and official session descriptions. Barth Haas starts its own sessions at 11:00 on both days; no simulcast is assumed.
- Innovation Zone activities are not interpreted as Joe White hall sessions despite appearing near that column in the timetable.
- The awards row does not establish a hall feed. The portal refers attendees to the event team for location and interpretation availability.
- Unlabelled gaps are left as gaps. There are no invented talks or “live” indicators. The programme says speakers/times may change.
- Display titles are shortened/paraphrased for phones. Speaker names, times and workshop restrictions are factual schedule fields; detailed descriptions remain on the official site.

## Updating

Edit `public/schedule.json`; timestamps must retain the explicit `+07:00` offset. Preserve unique IDs and the verified hall mapping. Run `npm test` and `npm run build:release` before authorized deployment. The build rejects overlapping hall slots, missing offsets, invalid durations and duplicate IDs.

A phone’s clock is the source of “Scheduled now”; a wrong device clock can give the wrong result. Timezone conversion is fixed to Vietnam, irrespective of the browser’s home timezone. The app does not know real start/stop times or delays. A designated organizer should relay any programme changes. This static MVP loads the schedule once per page load and recomputes its position every 30 seconds; after publishing corrections, refresh the page between sessions to retrieve them.

`docs/schedule-preview.png` demonstrates 28 October at 11:10 using an automated test clock. It is a design preview, not evidence that a session is running.
