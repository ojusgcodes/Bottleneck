# Bottleneck — Setup

Two servers: FastAPI backend on port 8000, Next.js frontend on port 3000. You need two terminal windows open at once — one per server, both left running.

These commands assume the project is at `D:\Resonance 1.0\bottleneck-app` (adjust if you moved it). **Open a fresh PowerShell window for each block below** — don't assume your terminal is already in the right folder; every `cd` here uses the full path so it works no matter where the terminal opened.

## Backend (terminal window 1)

```powershell
cd "D:\Resonance 1.0\bottleneck-app\backend"
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**If `.\venv\Scripts\Activate.ps1` fails** with a red error mentioning "running scripts is disabled" — that's PowerShell's default security policy blocking it, not a wrong path. Fix it once with:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

then re-run the `Activate.ps1` line above. This only affects the current window and resets when you close it.

**If you'd rather skip the virtual environment entirely** (fine for a hackathon, one less thing to debug):

```powershell
cd "D:\Resonance 1.0\bottleneck-app\backend"
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Verify: open http://127.0.0.1:8000/ in a browser — should show `{"status":"ok","service":"bottleneck-api"}`. Leave this window running.

**Interactive API docs (Swagger)** are built into FastAPI automatically — once the server is running, open http://127.0.0.1:8000/docs to see and try every endpoint from the browser, no separate setup needed. The raw schema is at http://127.0.0.1:8000/openapi.json.

Run the tests any time you change something — there are two suites, testing two different layers:

```powershell
cd "D:\Resonance 1.0\bottleneck-app\backend"
python tests/test_engine.py
python tests/test_api.py
```

`test_engine.py` (6 tests) calls the calculation functions directly — run this after changing anything under `engine/`, `seed.py`, or the guardrail. `test_api.py` (12 tests) goes through the actual HTTP routes with a temporary database, so it catches request/response bugs the engine tests can't see — run this after changing `main.py` or `storage.py`. Both print their own numbers as they go, so you can eyeball whether a change moved things the direction you expected.

## Persistence — every run is saved automatically

Every call to `/simulate`, `/strategies`, `/stress-test`, and `/adapt` gets saved to a small database (`backend/bottleneck.db`, created automatically on first run) — nobody has to remember to hit "save." Two new endpoints let you look back:

- `GET /scenarios` — list every saved run (id, label, cycle time, bottleneck, timestamp)
- `GET /scenarios/{id}` — full detail for one saved run, including the exact config that produced it
- `DELETE /scenarios/{id}` — remove one

`/ripple` deliberately does **not** auto-save — it fires on every slider drag, and logging every intermediate position while someone drags would flood the history with noise rather than useful runs.

If the database file can't be created (this can happen on certain synced/cloud folders that block SQLite's file locking), the backend automatically falls back to an in-memory store for that session instead of crashing — you'll see a `[storage]` message in the terminal if this happens. Everything still works; it just won't remember past runs after a restart. If you see that message and want real persistence, try running the project from a plain local folder instead of one synced by OneDrive/Dropbox/etc.

## Two demo scenarios — proving the engine isn't domain-specific

`GET /seed/scenarios` lists the ready-made datasets; `GET /seed?scenario=<name>` loads one:

- `software` (default) — the 6-stage software team, Review is the bottleneck. Baseline 5.29 days.
- `expansion` — a Delhi-based business shipping nationally, where Regional Transport (everything funnels through one hub) is the bottleneck at exactly 96% utilized. Baseline 3.34 days; opening a second hub (hiring into Regional Transport) cuts it to 1.22 days; moving one person from the badly-underused Order Intake stage instead gets you to 1.23 days, for free.

The frontend has two buttons in the header that switch between them live — same UI, same engine, completely different business problem. This is the concrete demo for "we built a general decision simulator, not a hiring calculator": don't just say it, click the other button in front of the judges.

## Frontend (terminal window 2 — separate window, keep the backend one running)

```powershell
cd "D:\Resonance 1.0\bottleneck-app\frontend"
npm install
copy .env.local.example .env.local
npm run dev
```

Open http://localhost:3000. It calls the backend at `NEXT_PUBLIC_API_URL` (from `.env.local`, defaults to `http://127.0.0.1:8000`) — the backend window must already be running and showing no errors, or the page will load with a red "could not reach the backend" message instead of data.

## If `pip install` fails trying to compile `pydantic-core` (mentions `maturin`, `cargo`, `rustc`)

This means your Python is new enough that pip can't find a prebuilt wheel for the pinned dependency versions, so it tries to compile the Rust extension from source — and fails, because you don't have Rust installed (nor should you need it). Fix:

```powershell
python.exe -m pip install --upgrade pip
pip install -r requirements.txt --upgrade
```

`requirements.txt` uses `>=` version constraints (not pinned exact versions) specifically so pip can pick whichever version already ships a prebuilt wheel for your Python — this was already fixed in the copy in your project folder. If you edited a pasted-in version of requirements.txt with `==` pins, re-copy it from the project instead.

If it still fails after that, run `python --version` — anything from 3.10 to 3.12 is safest for a hackathon; if you have a very new (3.13+) or very old Python and multiple versions installed, switch to 3.11 or 3.12 with `py -3.11 -m venv venv` instead of `python -m venv venv`.

## If `python`, `pip`, `npm`, or `node` aren't recognized

That means they're not installed or not on PATH. Check with:

```powershell
python --version
npm --version
```

If either errors, install from python.org (check "Add to PATH" during install) or nodejs.org, then close and reopen PowerShell before retrying.

## What's actually implemented

Every route the architecture called for is live and was tested end-to-end over real HTTP before this was handed off:

- `GET /seed` — the demo company config
- `POST /simulate` — baseline calculator
- `POST /strategies` — Future Generator (Do nothing / Hire / Reallocate / Hire 2)
- `POST /ripple` — Decision Ripple (change one stage's headcount, see before/after)
- `POST /tradeoffs` — Hidden Trade-offs (diminishing returns + mislocated bottleneck detection)
- `POST /stress-test` — Red Team (demand +30%, headcount −15%)
- `POST /adapt` — searches nearby configs for one that survives stress better
- `POST /explain` — AI prose, guardrail-checked; falls back to a template if no API key is set, so a wifi drop never breaks the demo

## The seed numbers — READ THIS BEFORE YOU PRESENT

The pitch deck and PDF say baseline = 11.8 days, hire → 5.2, reallocate → 8.3, "53% of hiring's benefit."

**The actual engine, running for real, produces different numbers**, because those were early planning estimates, not derived from this exact code. Once I built the real queueing engine and calibrated it against a 6-stage company, here's what it genuinely computes:

- Baseline: **5.29 days**, Review at ~95.7% utilized (the bottleneck)
- Hire 1 into Review: **2.88 days**
- Move 1 person from Design into Review (free): **2.93 days**
- That reallocation captures **~98% of hiring's benefit, for zero cost** — because Design had real slack to give (50% utilized), so donating a person barely hurt Design while Review was right at the cliff.

This is arguably a *stronger* demo point than the original 53% — nearly free parity with hiring is more dramatic — but **you must update slide 5 and the pitch script PDF to say these numbers instead**, or a judge who watches the live demo and then checks the slide will catch the mismatch. Pick one:

1. Update slide 5 and the pitch script to 5.29 / 2.88 / 2.93 / ~98% (recommended — these are real, and "98% for free" is a great line), or
2. Adjust `backend/app/seed.py`'s stage headcounts/service times and re-run `python backend/scripts/calibrate.py` to find parameters that land closer to your original figures, then re-verify with `test_engine.py`.

Either way — **never present a number on a slide that the live app won't reproduce if a judge asks you to show it.** That's the entire premise of the guardrail; it has to hold for your own claims too.

## If the LLM explanation isn't configured

`/explain` looks for `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` as environment variables. Without one, it silently uses a template-based explanation built directly from the engine's numbers — this is intentional (see `backend/app/explain.py`), not a bug, and it means the guardrail badge still works correctly in the demo even offline.
