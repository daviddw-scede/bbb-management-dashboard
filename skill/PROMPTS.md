# The prompts, in order

Copy these into your AI tool one at a time. Read what comes back before sending the next one. Swap the bracketed parts for your own.

## 0. Before you start (5 minutes)

- A GitHub account: github.com, free.
- A Vercel account: vercel.com, sign in with GitHub, free.
- Your AI tool connected to GitHub if it can be (Claude: Settings, Connectors, GitHub. ChatGPT: Settings, Connectors or a Custom GPT action). If it cannot, you will copy and paste instead. It still works.

## 1. Build the page

> Build me a one-page personal dashboard as a static website: one `index.html`, one `styles.css`, one `app.js`, no framework, no build step, so it can be deployed on Vercel as-is.
>
> The page reads its data from JSON files in a `data/` folder using fetch, and renders: (1) a greeting with today's date, (2) five headline numbers, (3) today's meetings with prep notes under each, (4) an actions list with owner, due date and priority, (5) a table of my team with this week's activity, (6) a table of open roles with stage counts and a health flag.
>
> Create realistic example data for a talent team at a [200-person tech company]. Use the font Manrope from Google Fonts, a light background, white cards, one accent colour [#1AA56A]. Make it work on a phone. Write a `data/SCHEMA.md` that documents every field so a future automation can rewrite the files safely.

## 2. Put it on GitHub

If your tool is connected to GitHub:

> Create a new private GitHub repository called `[my-dashboard]`, add all the files, and push to the main branch. Tell me the repository URL.

If it is not: create the repository at github.com/new, click "uploading an existing file", drag the files in, commit.

## 3. Deploy it

Go to vercel.com, "Add New Project", import the repository, leave every setting as default, click Deploy. Ninety seconds later you have a URL. Every push to `main` from now on redeploys it.

## 4. Make the data update itself

> Write a skill called `update-dashboard` (a `SKILL.md` file in `.claude/skills/update-dashboard/`) that, when run, reads today's calendar, my meeting notes from the last 24 hours and the latest ATS export I give it, rewrites the five JSON files in `data/` following `data/SCHEMA.md`, validates them, commits only the data files with the message `chore(data): daily update YYYY-MM-DD` and pushes to main. It must keep ids stable, never invent a number, and never include a candidate's name. Reply in five lines.

For ChatGPT, ask for the same thing "as instructions for a Custom GPT" and paste the result into the Instructions box.

## 5. Run it once by hand

> Run the update-dashboard skill for today. Here is my ATS export: [paste or attach].

Watch it commit. Refresh the Vercel URL. That is the whole loop.

## 6. Schedule it

Claude: Scheduled tasks, new task, "Run the update-dashboard skill", every weekday at 07:00.
ChatGPT: Tasks, new task, same wording, same time.

## Take it further (after today)

- Add a "Waiting on hiring manager" section that counts candidates stuck more than 3 days.
- Move the data into a real database (Supabase has a free tier) once more than one person needs to write to it.
- Add a password (Vercel has "Deployment Protection" on paid plans; or put the page behind your company SSO).
- Point the skill at the ATS directly through a connector instead of an export.
