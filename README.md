# Talent HQ: a management dashboard with no database

Built for **Built Before Brunch, 29 September 2026** (Scede). A one-page dashboard for a talent leader that is updated every morning by an AI skill. The data lives in the codebase as JSON files. There is no database, no server, no framework and no build step.

**Live demo:** see the Vercel project linked to this repository.

> Demo data. Kestrel Health and everyone in it are fictional.

## The idea in one picture

```
 Google Calendar ─┐
 Meeting notes ───┼─▶  update-dashboard skill  ─▶  data/*.json  ─▶  git push  ─▶  Vercel  ─▶  browser
 ATS export ──────┘    (07:00 weekdays)              5 files          main        redeploys
```

1. A scheduled skill reads today's calendar, recent meeting transcripts and the latest ATS export.
2. It rewrites five JSON files in `data/` following `data/SCHEMA.md`.
3. It commits and pushes to `main`.
4. Vercel redeploys the static site automatically. The page fetches the JSON and renders.

Why this way: for someone new to vibe coding, "the data is a file in the repo" is one idea to hold instead of four (database, schema, API, auth). It is not the best architecture. It is the easiest one to get working in two hours and to understand completely. When more than one person needs to write, move to a database (see Take it further).

## What is in the box

| Path | What it is |
|---|---|
| `index.html`, `styles.css`, `app.js` | The page. Plain HTML, CSS and JavaScript. Scede brand (Manrope, green `#1AA56A`). |
| `data/*.json` | The "database": meta, today, actions, team, roles. |
| `data/SCHEMA.md` | The contract every writer follows. Field names, enums, rules. |
| `.claude/skills/update-dashboard/SKILL.md` | The skill for Claude. |
| `skill/custom-gpt-instructions.md` | The same skill as ChatGPT Custom GPT instructions. |
| `skill/PROMPTS.md` | The prompts used to build all of this, in order. |
| `HANDOUT.md` | The one-page handout for attendees. |
| `assets/` | Scede logo and favicon. |

## Run it locally

Fetching JSON does not work from a `file://` URL, so serve the folder:

```bash
npx serve .
```

or `python3 -m http.server 4325`, then open http://localhost:4325.

## Deploy

Import the repository into Vercel. Framework preset: Other. No build command. Output directory: leave blank. Every push to `main` redeploys.

## Update the data

Run the skill (`/update-dashboard` in Claude, or "update the dashboard" in your Custom GPT), or edit a file in `data/` by hand and push. The rules are in `data/SCHEMA.md`. The three that matter most:

- Never invent a number. Missing source, keep the old value, say so.
- No candidate personal data. Counts only.
- Keep ids stable.

## Take it further

- Add a "waiting on hiring manager" section that counts candidates stuck for more than 3 days.
- Move `data/` into Supabase (free tier) when more than one person needs to write.
- Put the page behind your SSO or Vercel Deployment Protection before real data goes in.
- Replace the ATS export with a connector so the skill reads the ATS directly.

## Licence

MIT. Copy it, change it, ship yours.
