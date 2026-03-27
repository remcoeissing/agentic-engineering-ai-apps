# Tasks: Session List Ordering and Contained Scrolling

**Input**: Design documents from `/specs/003-short-name-session/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Baseline Verification)

**Purpose**: Verify existing tests pass before making changes

- [x] T001 Run existing backend tests (`cd backend && pytest tests/test_sessions.py -v`) and frontend tests (`cd frontend && npx vitest run`) to confirm green baseline

**Checkpoint**: All existing tests pass — safe to begin implementation

---

## Phase 2: User Story 1 - Most Recent Session Visible First (Priority: P1) 🎯 MVP

**Goal**: Sessions in the Today's Summary panel display in reverse chronological order (newest first), matching FR-001, FR-002, FR-007.

**Independent Test**: Complete 3+ sessions at different times, verify the most recent always appears at the top.

### Implementation for User Story 1

- [x] T002 [P] [US1] Change `ORDER BY start_at ASC` to `ORDER BY start_at DESC` in the `get_today()` function in backend/src/services/session_service.py
- [x] T003 [P] [US1] Add defensive reverse of the sessions array (`[...sessions].reverse()`) before rendering in the `TodaySummary` component in frontend/src/components/TodaySummary.tsx
- [x] T004 [P] [US1] Add test asserting today's sessions are returned in descending `start_at` order in backend/tests/test_sessions.py
- [x] T005 [P] [US1] Add test verifying sessions render newest-first (given 3 sessions with different times, the first rendered row matches the latest `start_at`) in frontend/src/components/__tests__/TodaySummary.test.tsx

**Checkpoint**: User Story 1 complete — sessions display newest-first in the UI. Run all tests to verify.

---

## Phase 3: User Story 2 - Contained Session List with Internal Scrolling (Priority: P2)

**Goal**: Session list stays within a bounded panel with internal scrolling when many sessions exist, matching FR-003, FR-004, FR-005, FR-006, FR-008. Scroll container is keyboard-accessible per Constitution Principle V.

**Independent Test**: Create 7+ sessions (exceeding 18rem visible area), verify scroll bar appears inside the panel without growing the page.

### Implementation for User Story 2

- [x] T006 [P] [US2] Add `max-height: 18rem; overflow-y: auto;` to the `.session-list` rule in frontend/src/index.css
- [x] T007 [US2] Add a `useRef<HTMLUListElement>` for the session list `<ul>` element and set `tabindex="0"` on it for keyboard-accessible scrolling in frontend/src/components/TodaySummary.tsx
- [x] T008 [US2] Add a `useEffect` that calls `listRef.current?.scrollTo({ top: 0 })` when `sessions.length` changes, to auto-scroll to the newest session (FR-008) in frontend/src/components/TodaySummary.tsx
- [x] T009 [P] [US2] Add test verifying the session list element has `tabindex="0"` for keyboard accessibility in frontend/src/components/__tests__/TodaySummary.test.tsx

**Checkpoint**: User Story 2 complete — panel scrolls internally with keyboard accessibility. Run all tests to verify.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across both user stories

- [x] T010 Run full test suite (backend: `cd backend && pytest -v` and frontend: `cd frontend && npx vitest run`) and fix any regressions
- [ ] T011 Verify quickstart.md scenarios manually: create 6+ sessions, confirm newest-first order, scroll bar appears, auto-scroll works on new session, page layout is stable

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **US1 (Phase 2)**: Depends on Phase 1 baseline passing
- **US2 (Phase 3)**: Depends on Phase 1 baseline passing; independent of US1 but best done after US1 since auto-scroll complements the new sort order
- **Polish (Phase 4)**: Depends on all user story phases complete

### Within Each User Story

- **US1**: All 4 tasks (T002–T005) can run in parallel — they touch 4 different files
- **US2**: T006 (CSS) is independent; T007 must precede T008 (ref needed for scroll effect); T009 (test) can run parallel with T006

### Parallel Opportunities

```text
# US1 — all 4 tasks in parallel (4 different files):
T002: backend/src/services/session_service.py
T003: frontend/src/components/TodaySummary.tsx
T004: backend/tests/test_sessions.py
T005: frontend/src/components/__tests__/TodaySummary.test.tsx

# US2 — 2 parallel groups:
Group A: T006 (index.css) + T009 (test file)
Group B: T007 → T008 (both TodaySummary.tsx, sequential)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Verify green baseline
2. Complete Phase 2: US1 — reverse sort order (4 parallel tasks)
3. **STOP and VALIDATE**: Test US1 independently — newest session appears first
4. Deploy/demo if ready — this alone delivers the primary user value

### Incremental Delivery

1. Baseline verification → Confirmed green
2. Add US1 (sort order) → Test independently → **MVP delivered**
3. Add US2 (scroll containment + auto-scroll) → Test independently → Full feature delivered
4. Polish phase → Final validation → Feature complete
