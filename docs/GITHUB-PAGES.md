# GitHub Pages deployment and day-of use

Repository: https://github.com/Skidbladnr/brew-asia-2026-attendee-portal. Public visibility was authorized by the owner on 27 October 2026. The manual publishing workflow supports controlled phone testing; attendee QR distribution remains subject to acceptance. Use a separate development computer. Leave the two presenter MacBooks and routers running their established setup.

Live controlled-test address: https://skidbladnr.github.io/brew-asia-2026-attendee-portal/

Latest deployment: [40547506488](https://github.com/Skidbladnr/brew-asia-2026-attendee-portal/actions/runs/40547506488) succeeded on 28 October 2026 from revision 1.4 commit `911dfa2693bba1553a0974f99ac7276a850b2642`. The previous release was `3664b9fd247fc1abf973f962b8d9439e57aeab9f`; restoring that source and rerunning the manual workflow provides rollback. The owner supplied working iPhone caption evidence for the prior release. Real-device rechecking of the revised layout and simultaneous halls remains pending.

## Is this plug and play?

Once the final HTTPS address passes acceptance, yes: the portal already contains both official attendee/embed URL pairs. It needs no backend, API key, authentication service or connection to the presenter computers. Operators start the two existing sessions normally; attendees select a hall, select a language, tap Start listening and enable audio inside the listening panel.

Activation alone is not acceptance. Test from the actual hosted address on iOS Safari and Android Chrome with both halls active. Include a phone that opens the page before the session starts. Confirm both hall sessions have Open access, all five output languages and audio available, and enough minutes. The current screenshot proves Open access only for Joe White.

The one-hour setting is not an automatic cutoff. Ended sessions can be reopened using the same URLs for day two if the organizer reuses those sessions. See `WORDLY.md` for official references. If session IDs change, update `public/config.json`, rebuild and rerun the workflow. Programme labels are based on the published timetable, not detected broadcast activity.

## Publish an approved test release

1. Choose an organizer-approved GitHub repository and address. GitHub Pages eligibility depends on the account plan and repository visibility. Do not place private material in a public repository.
2. Put the **contents of this project folder** at the repository root, including `.github/workflows/pages.yml`, `package.json`, `public/`, `scripts/` and `tests/`. Do not commit `node_modules/`, local test output, presenter credentials, dashboard screenshots or secrets. The included `.gitignore` excludes generated/test folders.
3. In the repository, open **Settings → Pages → Build and deployment → Source → GitHub Actions**. Ensure Actions is enabled and any organization/environment restrictions permit the approved release.
4. Commit the prepared workflow to the repository’s default branch. It has only a manual trigger; pushing a change does not publish it.
5. After approval for the controlled test deployment, open **Actions → Publish attendee portal (manual) → Run workflow** on the intended branch. It runs unit/configuration checks, builds `dist/`, uploads that static artifact and deploys through the `github-pages` environment. It does not run the browser suite; that suite must pass locally before release.
6. Open the exact HTTPS URL reported by the deployment, including its project path and trailing slash. GitHub project sites ordinarily look like `https://OWNER.github.io/REPOSITORY/`; those names are placeholders, not the final QR destination. Confirm HTTPS in Pages settings.
7. Complete `DEVICE-ACCEPTANCE.md` and `GO-NO-GO.md`. Prepare the portal QR from that final address and test the actual printed sticker. Distribute it only after acceptance and explicit organizer authorization. Retain official direct hall QR codes for recovery.

All asset/configuration URLs are relative. No special Vite base, routing rewrite, API configuration or domain is needed. A local project-path simulation and the hosted Pages shell check passed. Real-device audio and frame acceptance remain pending. Deploying from the repository branch root without this workflow will not serve the intended built portal.

## Hosting differences and updates

GitHub Pages does not use the bundled `_headers` configuration. The HTML includes a content security policy and referrer policy, and the listening iframe delegates autoplay permission; browser gesture restrictions still apply. GitHub controls its own response headers and caching. Always check the final site after a release, including a previously opened phone tab. Do not assume new configuration or programme data instantly reaches every open tab.

Releasing an update requires rerunning the workflow. Ask attendees to reload between sessions if the timetable or URLs changed; a reload interrupts listening. Keep the prior approved commit/package for rollback. To restore it, restore its source in the approved branch and rerun the manual workflow. For embed problems, change `mode` to `links`, rebuild/test and release under the same approval. If the site itself fails, use the original official hall QR codes.

## Official hosting references

- [GitHub Pages overview](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
- [Custom GitHub Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [HTTPS for GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)
