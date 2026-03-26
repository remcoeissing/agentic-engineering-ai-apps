# Bug 02: Today's Total Is Inconsistent with Per-Session Display

## Description

The "Today: X min focused" header total and the per-session "X min" value in each row use
different rounding strategies. The total converts raw seconds to minutes and rounds up,
while each session row rounds down. This means a user can see a non-zero total (e.g.
"1 min") made up entirely of sessions that individually display "0 min" — a confusing and
contradictory UI state.

## Symptom

1. Stop two sessions early after ~30 seconds each.
2. Open the Today summary panel.
3. **Actual**: The header reads "Today: 1 min focused" but every session row shows "0 min"
   and a status of "Stopped early". The two per-row values (0 + 0) do not add up to the
   displayed total (1).
4. **Expected**: The total and the per-row values use the same rounding logic, so the
   displayed numbers are consistent. If each row shows "0 min", the total should also
   show "0 min" (or both should show seconds for sub-minute durations).

## Spec Reference

- **FR-018**: The today summary total MUST accurately reflect the sum of individual
  session focused times as displayed to the user.
- **contracts/sessions-api.md** `GET /sessions/today`: `focused_seconds` is the
  authoritative value per session; `total_focused_minutes` is derived from it.

## Root Cause

The backend's `get_today()` converts `focused_seconds` to minutes using integer division
(floor), which correctly gives "0 min" for a 37-second session. However, the
`total_focused_minutes` field is computed by summing all `focused_seconds` first and
*then* converting — so two 37-second sessions (74 s total) round up to 1 min in the
total, while each row individually rounds down to 0 min.

## Affected Files

- `backend/src/services/session_service.py` — `get_today()` function: ensure
  `total_focused_minutes` is the sum of the already-rounded per-session minute values,
  not a post-sum conversion.
- `frontend/src/components/TodaySummary.tsx` — verify the per-session minute display
  uses the same rounding as the backend total.

## Fix Hint

In `get_today()`, compute each session's contribution in whole minutes first
(`seconds // 60`), then sum those values — rather than summing raw seconds and dividing
at the end.

---

## Workshop Exercise

Work through the steps below in order. Each step tells you **what speckit command to run**,
**what to type**, and **what to do with the output**.

This bug fix uses the same full specification pipeline as a new feature:
`/speckit.specify` → `/speckit.clarify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement`
— speckit handles everything including writing tests, applying the fix, and running verification.

Speckit will automatically create the branch `workshop/bug-02-inflate-total` and
save spec artifacts to `specs/bug-02-inflate-total/` when you run the first command below.

---

### Step 1 — Reproduce the bug
Understand what is currently going on first by reproducing the bug.

1. Start the backend: `cd backend && uvicorn src.main:app --reload`
2. Start the frontend: `cd frontend && npm run dev`
3. Click **Start**, then immediately **Stop** — repeat twice, spending only ~30 seconds in
   each session.
4. **Observe**:
   - Each session row in the Today panel shows **"0 min"** and "Stopped early".
   - The header reads **"Today: 1 min focused"**.
   - The per-row values (0 + 0) do not add up to the total (1) — the display is
     contradictory.

You can also confirm the raw data via the API:
```bash
curl http://127.0.0.1:8000/sessions/today
```
The response will show each session has a non-zero `focused_seconds` (e.g. 37), and that
those seconds sum to ≥ 60 — which is why the total rounds up to 1 min.

---

### Step 2 — Write a mini-spec for the fix (`/speckit.specify`)

Use `/speckit.specify` to encode the corrected rounding rule as a precise user story with
testable acceptance criteria. This creates the spec file that `/speckit.clarify` will
interrogate in the next step.

**Run this command:**
```
/speckit.specify
```

**Describe the behaviour you want to enforce:**
> "As a user reviewing today's summary, the total focused minutes shown in the header should
> equal the sum of the individual session minute values shown in the list, so the numbers
> are never contradictory. If two sessions each show '0 min', the total must also show
> '0 min', not '1 min'."

**What to look for in the output:**
- An acceptance criterion such as: *"Given two `stopped_early` sessions of 37 seconds each,
  every row displays '0 min' and the header total displays '0 min'."*
- A second criterion: *"Given sessions of 37 s and 90 s, the 90 s row displays '1 min' and
  the total displays '1 min'."*
- A `spec.md` written to your spec directory — this is required before running clarify.

---

### Step 3 — Clarify the intended behaviour (`/speckit.clarify`)

Now that a spec exists, use `/speckit.clarify` to confirm how the spec expects minute
values to be rounded and resolve any remaining ambiguities before planning the implementation.

**Run this command:**
```
/speckit.clarify
```

**When prompted, describe the ambiguity:**
> "The Today summary shows '1 min focused' in the header, but every individual session row
> shows '0 min'. This happens when two sub-minute sessions together add up to ≥ 60 seconds.
> Should the header total and per-row values use the same rounding so they are consistent?
> And should a session that lasted less than one minute display as '0 min' or show seconds?"

**What to look for in the output:**
- Confirmation that the total and per-row values must be consistent — the sum of the
  per-row minute values should equal the displayed total.
- Clarification on the rounding rule: floor (round down) is the expected behaviour for
  both per-row and total values.

---

### Step 4 — Create the implementation plan (`/speckit.plan`)

Use `/speckit.plan` to translate the spec into a technical design before breaking it into tasks.

**Run this command:**
```
/speckit.plan
```

**What to look for in the output:**
- A `plan.md` written to your spec directory.
- Identification of the affected file: `session_service.py` (`get_today()` function).
- The fix strategy: sum the floor-divided per-session minute values rather than dividing
  the summed seconds — so the total is always the arithmetic sum of the displayed per-row
  values.

---

### Step 5 — Generate implementation tasks (`/speckit.tasks`)

Use `/speckit.tasks` to break the plan into ordered, concrete implementation steps.

**Run this command:**
```
/speckit.tasks
```

**What to look for in the output:**
- A numbered `tasks.md` covering: writing a failing test that asserts two sub-minute
  sessions produce a total of 0 min, then applying the rounding fix in `get_today()`.
- Tasks ordered so the test is written before the implementation change.

---

### Step 6 — Implement the fix (`/speckit.implement`)

Use `/speckit.implement` to execute every task in `tasks.md` automatically — writing the
failing test, applying the code change, and running all verification checks.

**Run this command:**
```
/speckit.implement
```

**What to look for in the output:**
- Test written first and confirmed failing, then the fix applied.
- `session_service.py` updated so `total_focused_minutes` is the sum of per-session
  floor-divided minute values.
- All checks green at the end: `pytest tests/ -v`, `ruff check src/ tests/`, `mypy src/`.

---

### Step 7 — Verify the results
**Verify manually:**
1. Reload the app in the browser.
2. Click **Start** then **Stop** twice, spending ~30 seconds each time.
3. Confirm every session row shows **"0 min"**.
4. Confirm the header total also shows **"0 min"** — no longer "1 min".
5. Run one longer session (> 60 seconds), stop it, and confirm that session's row and
   the total both increment by 1 min consistently.

All checks must be green before the exercise is complete.

