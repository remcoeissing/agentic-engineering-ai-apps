# Feature 01: Break Timer

## Description

The `break_minutes` setting is already stored in the database and editable via the Settings
modal, but nothing in the app currently uses it. This feature implements the break countdown:
when a focus session completes, the UI automatically transitions to a **Break** state and
counts down from `break_minutes` so the user knows when their break is over.

## Current Behaviour

After a session completes the UI shows `IDLE` and the `break_minutes` value sits unused.

## Target Behaviour

1. A focus session completes (countdown reaches 0:00).
2. The UI immediately transitions to a **Break** state.
3. A countdown timer runs from `break_minutes` down to `0:00`, labelled "BREAK".
4. When the break countdown reaches 0 the UI returns to **IDLE** and a subtle notification
   is shown ("Break over — ready when you are").
5. The user can click **Skip Break** at any time to return to IDLE early.

## Spec Reference

- **FR-020 (post-MVP)**: Break tracking — after a completed focus session, display a
  countdown for the configured break duration.
- **Settings**: `break_minutes` stored in `settings` table; readable via `GET /settings`.
- The spec explicitly marks this as the first post-MVP feature to implement.

## Files to Change

| File | Change |
|------|--------|
| `frontend/src/hooks/useTimerService.ts` | Add `break` state; start break countdown after session completes |
| `frontend/src/components/TimerDisplay.tsx` | Render "BREAK" label and `data-status="break"` |
| `frontend/src/components/Controls.tsx` | Render **Skip Break** button during break state |
| `frontend/src/index.css` | Add colour token + styles for break state (e.g. `--teal`) |

No backend changes are needed — `break_minutes` is already persisted and returned by
`GET /settings`.

---

## Workshop Exercise

Work through the steps below in order. This is a **new feature** rather than a bug fix, so
the workflow uses the full specification pipeline: `/speckit.specify` → `/speckit.plan` →
`/speckit.tasks` before any code is written.

Speckit will automatically create the branch `workshop/feature-01-break-timer` and
save spec artifacts to `specs/feature-01-break-timer/` when you run the first command below.

---

### Step 1 — Write the user story (`/speckit.specify`)

Use `/speckit.specify` to encode the feature as a user story with testable acceptance criteria.

**Run this command:**
```
/speckit.specify
```

**Describe the feature:**
> "As a user, when my focus session completes I want the app to automatically start a
> break countdown using my configured break duration, so I know exactly how long to rest
> before the next session. I should be able to skip the break early if I want to start
> sooner."

**What to look for in the output:**
- A user story that references `break_minutes` from settings.
- At least two acceptance criteria:
  1. *"When a session completes, the timer transitions to BREAK state and counts down from
     `break_minutes`."*
  2. *"Clicking Skip Break returns the timer to IDLE before the countdown ends."*
- Save these criteria — you'll encode them as test assertions in Step 4.

---

### Step 2 — Create the implementation plan (`/speckit.plan`)

Use `/speckit.plan` to translate the spec into a technical design before breaking it into tasks.

**Run this command:**
```
/speckit.plan
```

**What to look for in the output:**
- A `plan.md` written to `specs/feature-01-break-timer/`.
- Identification of the affected components (`useTimerService`, `TimerDisplay`, `Controls`,
  `index.css`) and how they interact.
- Confirmation that no backend changes are required — `break_minutes` is already persisted
  and returned by `GET /settings`.

---

### Step 3 — Generate implementation tasks (`/speckit.tasks`)

Use `/speckit.tasks` to break the plan into ordered, concrete implementation steps.

**Run this command:**
```
/speckit.tasks
```

**What to look for in the output:**
- A numbered `tasks.md` covering: extending the timer state, starting and ticking the break
  countdown, adding the Skip Break button, updating `TimerDisplay`, adding CSS, and writing tests.
- Independent tasks marked `[P]` that are safe to work on in parallel.

---

### Step 4 — Write failing tests

Before changing any implementation code, write tests for the two acceptance criteria:

```tsx
// frontend/src/hooks/__tests__/useTimerService.test.ts

it('transitions to break state after session completes', async () => {
  // Mock GET /settings returning break_minutes: 5
  // Advance timer until remaining_seconds hits 0
  // Assert store status === 'break' and breakRemainingSeconds === 300
});

it('skip break returns to idle', async () => {
  // Put store in break state
  // Call store.skipBreak()
  // Assert store status === 'idle'
});
```

Run to confirm they **fail**:
```bash
cd frontend && npm test
```

---

### Step 5 — Implement the feature

Work through the tasks generated in Step 3, in order:

1. **Extend the store** — add `break` to the `TimerStatus` union type and add
   `breakRemainingSeconds: number` to the Zustand store slice.

2. **Start the break countdown** — in `useTimerService.ts`, when the focus countdown
   reaches 0, read `settings.break_minutes` and set `status = 'break'` with
   `breakRemainingSeconds = break_minutes * 60`.

3. **Tick the break countdown** — in the `useEffect` interval, if `status === 'break'`,
   decrement `breakRemainingSeconds` each second; when it reaches 0, set `status = 'idle'`.

4. **Add Skip Break** — expose a `skipBreak()` action in the store that sets
   `status = 'idle'`; wire it to a button in `Controls.tsx`.

5. **Update TimerDisplay** — pass `data-status="break"` and display `BREAK` label.

6. **Add CSS** — add a `--teal` token and colour the ring/label during break state:
   ```css
   [data-status='break'] .timer-countdown { color: var(--teal, #0d9488); }
   ```

---

### Step 6 — Verify

```bash
# All frontend tests must pass (including the two new ones)
cd frontend && npm test

# Type check & lint
npm run typecheck && npm run lint
```

All checks must be green before the exercise is complete.
