// Talent HQ — reads the JSON files in /data and renders the page.
// There is no database: the daily skill rewrites the files and pushes to GitHub, Vercel redeploys.

const files = ["meta", "today", "actions", "team", "roles"];

async function load() {
  const out = {};
  for (const f of files) {
    const res = await fetch(`data/${f}.json?v=${Date.now()}`);
    if (!res.ok) throw new Error(`Could not load data/${f}.json (${res.status})`);
    out[f] = await res.json();
  }
  return out;
}

const $ = (sel) => document.querySelector(sel);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const fmtDate = (iso, opts = { weekday: "long", day: "numeric", month: "long" }) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-GB", opts);
const fmtShort = (iso) => fmtDate(iso, { weekday: "short", day: "numeric", month: "short" });
const fmtTime = (iso) => new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

function greeting(hour) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function renderHero(meta, today) {
  const asOf = meta.as_of_date;
  const hour = new Date().getHours();
  $("#hero-date").textContent = fmtDate(asOf);
  $("#hero-title").textContent = `${greeting(hour)}, ${meta.owner_first_name}`;
  const open = meta.kpis.find((k) => k.id === "open_roles")?.value;
  const meetings = today.meetings.length;
  $("#hero-sub").textContent = `${meetings} meetings, ${open} open roles, ${meta.quarter.label} closes ${fmtShort(meta.quarter.end)}.`;
  $("#focus-list").innerHTML = today.focus.map((f) => `<li>${esc(f)}</li>`).join("");
  $("#stamp").innerHTML = `<span class="dot" aria-hidden="true"></span> Updated ${fmtShort(meta.generated_at.slice(0, 10))} at ${fmtTime(meta.generated_at)} by ${esc(meta.generated_by)}`;
}

function renderKpis(meta) {
  $("#kpis").innerHTML = meta.kpis
    .map((k) => {
      const unit = k.unit ? `<small>${esc(k.unit)}</small>` : "";
      const target = k.target != null ? `<small>of ${k.target}</small>` : "";
      const delta = k.delta != null ? `<span class="delta">${k.delta > 0 ? "+" : ""}${k.delta} ${esc(k.unit)}</span>` : "";
      const meter = k.target != null ? `<div class="meter" role="meter" aria-valuemin="0" aria-valuemax="${k.target}" aria-valuenow="${k.value}"><i style="width:${Math.min(100, Math.round((k.value / k.target) * 100))}%"></i></div>` : "";
      return `<div class="kpi">
        <div class="lab">${esc(k.label)}</div>
        <div class="big">${k.value}${unit}${target}</div>
        ${meter}
        <div class="sub">${delta ? delta + " · " : ""}${esc(k.note ?? "")}</div>
      </div>`;
    })
    .join("");
}

const typeLabel = { team: "Team", hiring_manager: "Hiring manager", one_to_one: "1:1", leadership: "Leadership", debrief: "Debrief", external: "External" };

function renderMeetings(today) {
  const list = today.meetings;
  $("#meeting-count").textContent = `${list.length} today`;
  $("#meeting-list").innerHTML = list
    .map(
      (m) => `<li class="meeting">
        <div><span class="time">${esc(m.time)}</span><span class="dur">${m.duration_min} min</span></div>
        <div>
          <div class="title">${esc(m.title)} <span class="tag tag-${esc(m.type)}">${esc(typeLabel[m.type] ?? m.type)}</span></div>
          <div class="with">${m.attendees.map(esc).join(", ")}</div>
          ${m.prep?.length ? `<ul class="prep">${m.prep.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>` : ""}
        </div>
      </li>`
    )
    .join("");
}

function renderActions(actions, meta, filter = "open") {
  const asOf = meta.as_of_date;
  const items = actions.items.filter((a) => {
    if (filter === "open") return a.status !== "done";
    if (filter === "mine") return a.owner === "me" && a.status !== "done";
    return true;
  });
  const order = { high: 0, medium: 1, low: 2 };
  items.sort((a, b) => (a.status === "done") - (b.status === "done") || a.due.localeCompare(b.due) || order[a.priority] - order[b.priority]);
  $("#action-list").innerHTML = items.length
    ? items
        .map((a) => {
          const dueCls = a.status === "done" ? "" : a.due < asOf ? "due-over" : a.due === asOf ? "due-today" : "";
          const dueTxt = a.due === asOf ? "Today" : fmtShort(a.due);
          const owner = a.owner === "me" ? "You" : a.owner;
          return `<li class="action ${a.status === "done" ? "done" : ""}">
            <span class="box" aria-hidden="true">${a.status === "done" ? "✓" : ""}</span>
            <div>
              <div class="t">${esc(a.title)}</div>
              <div class="m"><b>${esc(owner)}</b> · <span class="${dueCls}">${a.status === "waiting" ? "Waiting · " : ""}${dueTxt}</span> · ${esc(a.source)}</div>
            </div>
            <span class="pri pri-${esc(a.priority)}">${esc(a.priority)}</span>
          </li>`;
        })
        .join("")
    : `<li class="action"><div class="m">Nothing here.</div></li>`;
}

function renderTeam(team) {
  const pct = Math.round((team.quarter_hires / team.quarter_target) * 100);
  $("#quarter-progress").textContent = `${team.quarter_hires} of ${team.quarter_target} hires this quarter (${pct}%)`;
  $("#team-table tbody").innerHTML = team.recruiters
    .map((r) => {
      const p = Math.min(100, Math.round((r.quarter.hires / r.quarter.target) * 100));
      return `<tr>
        <td><span class="who">${esc(r.name)}</span><span class="sub">${esc(r.focus)}${r.note ? " · " + esc(r.note) : ""}</span></td>
        <td class="num">${r.open_roles}</td>
        <td class="num">${r.this_week.screens}</td>
        <td class="num">${r.this_week.interviews}</td>
        <td class="num">${r.this_week.offers}</td>
        <td class="num"><span class="mini-meter"><span class="track" aria-hidden="true"><i style="width:${p}%"></i></span>${r.quarter.hires} / ${r.quarter.target}</span></td>
      </tr>`;
    })
    .join("");
  renderChart(team);
}

// Single-series column chart: thin bars, rounded tops, value on the last column only.
function renderChart(team) {
  const vals = team.weekly_screens_team;
  const labels = team.weekly_screens_labels;
  const W = 640, H = 170, padL = 8, padR = 8, padT = 22, padB = 30;
  const max = Math.max(...vals) * 1.1;
  const n = vals.length;
  const slot = (W - padL - padR) / n;
  const bw = Math.min(24, slot * 0.5);
  const y = (v) => padT + (H - padT - padB) * (1 - v / max);
  const base = H - padB;
  const gridVals = [0, Math.round(max / 2 / 5) * 5, Math.round(max / 5) * 5].filter((v, i, a) => a.indexOf(v) === i);
  const grid = gridVals
    .map((v) => `<line x1="${padL}" x2="${W - padR}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}" stroke="#ECEAE7" stroke-width="1"/><text x="${W - padR}" y="${(y(v) - 4).toFixed(1)}" text-anchor="end" font-size="10" fill="#8A9097">${v}</text>`)
    .join("");
  const bars = vals
    .map((v, i) => {
      const x = padL + slot * i + (slot - bw) / 2;
      const h = base - y(v);
      const last = i === n - 1;
      const r = Math.min(4, h);
      const path = `M${x},${base} v${-(h - r)} a${r},${r} 0 0 1 ${r},${-r} h${bw - 2 * r} a${r},${r} 0 0 1 ${r},${r} v${h - r} z`;
      const label = last ? `<text x="${x + bw / 2}" y="${(y(v) - 7).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="700" fill="#232323">${v}</text>` : "";
      const partial = last ? ` opacity="0.55"` : "";
      return `<g class="bar"><title>${esc(labels[i])}: ${v} screens</title><path d="${path}" fill="#1AA56A"${partial}/>${label}<text x="${x + bw / 2}" y="${H - 10}" text-anchor="middle" font-size="10.5" fill="#6F757C">${esc(labels[i].replace("w/c ", ""))}</text></g>`;
    })
    .join("");
  $("#chart-body").innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Screens per week for the last ${n} weeks. Latest week so far: ${vals[n - 1]}." font-family="Manrope, sans-serif">${grid}${bars}</svg>
  <p class="chart-title" style="margin:4px 0 0">Last column is the current week so far.</p>`;
}

const healthLabel = { on_track: "On track", watch: "Watch", at_risk: "At risk" };

function renderRoles(roles) {
  const list = [...roles.roles];
  const order = { at_risk: 0, watch: 1, on_track: 2 };
  list.sort((a, b) => order[a.health] - order[b.health] || b.days_open - a.days_open);
  const risky = list.filter((r) => r.health !== "on_track").length;
  $("#role-count").textContent = `${list.length} open · ${risky} need attention`;
  $("#roles-table tbody").innerHTML = list
    .map(
      (r) => `<tr>
        <td><span class="who">${esc(r.title)}</span><span class="sub">${esc(r.team)} · ${esc(r.recruiter)}</span></td>
        <td>${esc(r.hiring_manager)}</td>
        <td class="num">${r.days_open}</td>
        <td class="num">${r.stages.screened}</td>
        <td class="num">${r.stages.interviewing}</td>
        <td class="num">${r.stages.offer}</td>
        <td><span class="health health-${esc(r.health)}"><i aria-hidden="true"></i>${esc(healthLabel[r.health] ?? r.health)}</span><span class="why">${esc(r.health_reason)}</span></td>
        <td>${esc(r.next_step)}</td>
      </tr>`
    )
    .join("");
}

function renderFooter(meta) {
  $("#sources").textContent = `Sources for this run: ${meta.sources.join(" · ")}.`;
}

load()
  .then((d) => {
    renderHero(d.meta, d.today);
    renderKpis(d.meta);
    renderMeetings(d.today);
    renderActions(d.actions, d.meta);
    renderTeam(d.team);
    renderRoles(d.roles);
    renderFooter(d.meta);
    document.querySelectorAll(".toggle button").forEach((b) =>
      b.addEventListener("click", () => {
        document.querySelectorAll(".toggle button").forEach((x) => x.classList.remove("on"));
        b.classList.add("on");
        renderActions(d.actions, d.meta, b.dataset.filter);
      })
    );
  })
  .catch((e) => {
    document.querySelector("main").insertAdjacentHTML("afterbegin", `<div class="error">${esc(e.message)}. If you opened this file directly, serve it instead: run <code>npx serve</code> in the folder, or open the Vercel URL.</div>`);
    console.error(e);
  });
