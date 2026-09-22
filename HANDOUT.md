# Built Before Brunch: the dashboard that has no database

**Session 2 of 3 · Upper intermediate · David Dogan-Webb, Scede**

## What we are building

A one-page management dashboard, live on the web, that updates itself every morning. Today's meetings with prep, your to-do list pulled from meeting notes, and what your team and open roles are doing.

The trick that keeps it simple: **there is no database.** The data is five small text files that live inside the website's code. An AI skill rewrites those files each morning and pushes them to GitHub. Vercel notices the push and republishes the page. That is the whole system.

```
 Calendar ─┐
 Notes ────┼─▶  AI skill (07:00)  ─▶  data/*.json  ─▶  GitHub  ─▶  Vercel  ─▶  your browser
 ATS ──────┘      reads, writes         5 files        push       redeploys
```

## You need

1. **GitHub account** (github.com, free): where the code lives.
2. **Vercel account** (vercel.com, sign in with GitHub, free): turns the code into a website.
3. **An AI tool that can write code.** Claude or ChatGPT is the smooth path: if it can connect to GitHub, the skill pushes for you; if it cannot, it hands you the files and you paste them. Gemini: build the page in Gemini Canvas, export the code and upload it; the morning skill is a Gem that hands you the files (Antigravity or an IDE if you want it to push). Copilot: join Shay's session today and do this one at home with Copilot Studio.

## The five steps

| Step | You say | You get |
|---|---|---|
| 1 | "Build me a one-page dashboard as a static site that reads JSON files from /data" | index.html, styles.css, app.js, data/ |
| 2 | "Push it to a new GitHub repo" (or upload the files at github.com/new) | A repository |
| 3 | Vercel: Add New Project, import, Deploy | A live URL |
| 4 | "Write a skill that rewrites the data files from my calendar, notes and ATS export, then commits and pushes" | SKILL.md (or Custom GPT instructions) |
| 5 | "Run it for today" then Scheduled tasks, weekdays 07:00 | It runs without you |

Full prompts: `skill/PROMPTS.md` in the example repository.

## Rules worth stealing

- **Never invent a number.** If the source is missing, keep the old value and say so.
- **No candidate names in the files, ever.** Counts only. Your ATS is the system of record for people.
- **Keep ids stable** so actions and roles can be tracked day to day.
- **The skill only touches `data/`.** The page code changes only when you ask for it.

## If your laptop is locked down

- Can't connect the AI to GitHub? Ask it for the files, paste them into GitHub's web editor. Same result, two more clicks.
- Can't connect to the ATS? Export a report each morning and attach it when you run the skill. Later, automate the export.
- Can't create a GitHub account at all? This session is not for you today. Shay's session needs no external accounts.

## Take it further

Add a "stuck candidates" section · Move the data into Supabase when more than one person needs to write · Put the page behind SSO · Connect the ATS directly through a connector

**Example repository:** github.com/daviddw-scede/bbb-management-dashboard
**Live example:** bbb-management-dashboard-daviddw-6234s-projects.vercel.app
**Show and tell:** 14:00. Bring your URL, not your slides.
