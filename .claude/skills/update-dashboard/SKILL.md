---
name: update-dashboard
description: Refresh the Talent HQ dashboard for today. Reads the calendar, recent meeting transcripts and the latest ATS export, rewrites the JSON files in /data, then commits and pushes so Vercel redeploys. Use when asked to update, refresh or run the dashboard, or on the morning schedule.
---

# Update the Talent HQ dashboard

You are updating a static website whose only "database" is five JSON files in the `data/` folder of the GitHub repository. The page (`index.html` + `app.js`) never changes in this run. Only files under `data/` do.

Read `data/SCHEMA.md` first. It is the contract: field names, enums, and the rules (stable ids, no invented numbers, no candidate personal data).

## Inputs, in this order

1. **Calendar:** every event for the as-of date (today unless told otherwise). Title, start time, duration, attendees.
2. **Transcripts / notes:** meetings from the last 24 hours (or since the last run). Pull out decisions, commitments, and anything the owner promised or is waiting on.
3. **ATS data:** the most recent export the owner has shared (a CSV or a spreadsheet) or, if a connector is available, the live ATS. Open roles, stage counts, hires this quarter, offers out, interviews booked this week, screens per week.
4. **The current `data/*.json` files.** Read them before writing. They carry state forward (open actions, ids, weekly history).

If an input is missing, do not stop. Use what you have, keep the old values for the rest, and say clearly in the summary what was not refreshed.

## What to write

- `data/today.json`: the meetings for the day with 1 to 3 prep bullets each. Prep is specific: what to ask, what to bring, what is overdue. Pick the three most consequential things for `focus`.
- `data/actions.json`: keep every open item, add new commitments from the transcripts (with `source` naming the meeting and date), mark items done when a transcript or the owner says so, drop done items older than 7 days. Next id = highest existing + 1.
- `data/team.json` and `data/roles.json`: from the ATS data. Append this week's screens count to the weekly arrays and keep the 8 most recent. Recompute `days_open`. Set `health` with a one-line `health_reason` that a manager could act on.
- `data/meta.json`: recompute the 5 kpis from the files you just wrote, set `as_of_date`, `generated_at` (now), `generated_by`, and list the actual `sources` used this run.

## Publish

1. Validate every file is well-formed JSON and matches the shapes in `SCHEMA.md`.
2. Commit only the `data/` files with the message `chore(data): daily update YYYY-MM-DD`.
3. Push to `main`. Vercel deploys automatically within about a minute.
4. If you cannot push (no GitHub connection), output each changed file in full as a code block, in the order meta, today, actions, team, roles, so the owner can paste them into GitHub's web editor.

## Reply format

Five lines maximum:
- Data as of, and which sources were used or missing
- Meetings today and how many have prep
- Actions: added / completed / carried
- Roles needing attention and why
- Deployed (URL) or "pasted files, please commit"

Never include candidate names in any file or in the reply.
