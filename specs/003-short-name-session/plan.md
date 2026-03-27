# Implementation Plan: Session List Ordering and Contained Scrolling

**Branch**: `003-short-name-session` | **Date**: 2026-03-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-short-name-session/spec.md`

## Summary

The Today's Summary panel currently displays sessions oldest-first with no height constraint, causing the panel to grow unbounded. This plan addresses two changes: (1) reverse the session list to show newest-first (both backend query and frontend rendering), and (2) add a maximum height with internal scrolling to the session list container. An auto-scroll-to-top behavior is also required when new sessions appear.

## Technical Context

**Language/Version**: TypeScript 5.5 (frontend), Python 3.11+ (backend)
**Primary Dependencies**: React 18.3, Vite 5.4, Zustand 4.5 (frontend); FastAPI 0.110+, aiosqlite 0.20+ (backend)
**Storage**: SQLite via aiosqlite
**Testing**: Vitest 2.0 + React Testing Library 16.0 (frontend); pytest 8.1 + pytest-asyncio 0.23 (backend)
**Target Platform**: Web browser (localhost-only backend)
**Project Type**: Web application (SPA frontend + REST API backend)
**Performance Goals**: Interactive within 2 seconds; timer drift < 1 second over 25 minutes (existing)
**Constraints**: Backend binds to 127.0.0.1 only; TypeScript strict mode; WCAG 2.1 AA compliance
**Scale/Scope**: Single-user local app; session list typically 1–20 entries per day

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Focus-First Design | ✅ Pass | No new animations or distracting elements. Sort order change is invisible to UX beyond improved usability. |
| II. Predictable & Deterministic | ✅ Pass | Sort by `start_at DESC` is deterministic. Auto-scroll behavior is consistent and predictable. |
| III. Honest Reporting | ✅ Pass | No changes to session data, calculations, or status labels. |
| IV. Privacy by Default | ✅ Pass | No external network calls; data stays local. |
| V. Accessibility First | ⚠️ Requires attention | Scrollable container must be keyboard-accessible with proper ARIA attributes (`role="list"`, `tabindex` for scroll, `aria-label`). Existing `aria-label="Today's sessions"` is present; need to verify scroll container keyboard operability. |
| VI. Readable Over Clever | ✅ Pass | Simple array reverse + CSS property additions. No clever abstractions. |
| VII. Small Components | ✅ Pass | Changes are within existing `TodaySummary` component (~62 lines). No new components needed. |
| VIII. Typed Boundaries | ✅ Pass | No new types or API contract changes. Session response model unchanged. |
| IX. Single Source of Truth | ✅ Pass | No changes to timer state management. Sort is a presentation concern. |

**Gate result**: PASS — Principle V requires scroll container accessibility (addressed in implementation tasks).

## Project Structure

### Documentation (this feature)

```text
specs/003-short-name-session/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
backend/
├── src/
│   └── services/
│       └── session_service.py    # Change: ORDER BY start_at DESC
└── tests/
    └── test_sessions.py          # Change: Add sort-order assertion

frontend/
├── src/
│   ├── index.css                 # Change: Add max-height + overflow-y to .session-list
│   ├── components/
│   │   └── TodaySummary.tsx      # Change: Reverse session array, add scroll ref + auto-scroll
│   └── components/__tests__/
│       └── TodaySummary.test.tsx  # Change: Add sort-order and overflow tests
└── package.json                   # No changes needed
```

**Structure Decision**: Existing web application layout (backend/ + frontend/) is used. All changes are within existing files — no new files or directories required in source code.

## Complexity Tracking

No constitution violations requiring justification. All changes are minimal and within existing component boundaries.
