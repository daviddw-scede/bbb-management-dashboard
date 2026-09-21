# Data files

Five JSON files. The page reads all of them on load. The daily skill rewrites them. Nothing else reads or writes them.

| File | What it holds | Who fills it |
|---|---|---|
| `meta.json` | Who the dashboard is for, the as-of date, the quarter, the 5 headline numbers, the sources used | Skill, every run |
| `today.json` | Top three focus items and today's meetings with prep notes | Skill, from the calendar and recent transcripts |
| `actions.json` | The to-do list, with owner, due date, priority, status and where each action came from | Skill: carries open items forward, adds new ones from transcripts, marks done ones |
| `team.json` | Quarter hires vs target, weekly screens for the chart, one row per recruiter | Skill, from the ATS export |
| `roles.json` | One row per open role with stage counts, health and next step | Skill, from the ATS export plus transcripts |

## Rules the skill follows

- **Keep ids stable.** `a-101`, `r-201` never change meaning between runs. New items get the next number.
- **Never invent a number.** If a value is not in a source, leave it as it was and say so in the run summary.
- **No candidate personal data.** Counts only. Never a candidate name, email or CV detail (GDPR).
- **Dates are ISO** (`2026-09-29`), times are `HH:MM`, `generated_at` is RFC 3339 with offset.
- **Enums:** meeting `type` is one of `team | hiring_manager | one_to_one | leadership | debrief | external`; action `priority` is `high | medium | low`; action `status` is `open | waiting | done`; role `health` is `on_track | watch | at_risk`.
- `owner: "me"` means the dashboard owner. Anyone else is a display name.
- Done actions stay in the file for 7 days, then drop.

## Shapes

### meta.json
```json
{
  "company": "string", "owner_first_name": "string", "owner_role": "string",
  "as_of_date": "YYYY-MM-DD", "generated_at": "RFC 3339", "generated_by": "string",
  "quarter": { "label": "Q3 2026", "start": "YYYY-MM-DD", "end": "YYYY-MM-DD" },
  "sources": ["string"],
  "kpis": [ { "id": "string", "label": "string", "value": 0, "unit": "", "target": 0, "delta": 0, "note": "string" } ]
}
```
`target` and `delta` are optional. Exactly 5 kpis; keep the ids `open_roles`, `hires_q`, `offers_out`, `interviews_wk`, `tth`.

### today.json
```json
{
  "focus": ["string", "string", "string"],
  "meetings": [ { "time": "HH:MM", "duration_min": 30, "title": "string", "type": "enum", "attendees": ["string"], "prep": ["string"] } ]
}
```

### actions.json
```json
{ "items": [ { "id": "a-101", "title": "string", "owner": "me | name", "due": "YYYY-MM-DD", "priority": "enum", "status": "enum", "source": "string" } ] }
```

### team.json
```json
{
  "quarter_target": 0, "quarter_hires": 0,
  "weekly_screens_labels": ["w/c 10 Aug", "..."], "weekly_screens_team": [0],
  "recruiters": [ { "name": "string", "focus": "string", "open_roles": 0,
    "this_week": { "screens": 0, "interviews": 0, "offers": 0 },
    "quarter": { "hires": 0, "target": 0 }, "note": "optional string" } ]
}
```
Both weekly arrays have the same length (8 is the default). The last entry is the current week so far.

### roles.json
```json
{ "roles": [ { "id": "r-201", "title": "string", "team": "string", "hiring_manager": "string", "recruiter": "string",
  "opened": "YYYY-MM-DD", "days_open": 0, "stages": { "screened": 0, "interviewing": 0, "offer": 0 },
  "health": "enum", "health_reason": "string", "next_step": "string" } ] }
```
