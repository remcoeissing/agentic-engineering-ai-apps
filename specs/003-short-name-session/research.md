# Research: Session List Ordering and Contained Scrolling

**Feature**: 003-short-name-session
**Date**: 2026-03-27

## Research Summary

This feature requires minimal research — the technical decisions are straightforward and well-supported by the existing codebase patterns. No NEEDS CLARIFICATION items were present in the Technical Context.

## Decision 1: Sort Order Implementation Layer

**Decision**: Apply sort at both backend (SQL query) and frontend (defensive reverse).

**Rationale**: Changing the backend `ORDER BY start_at ASC` to `ORDER BY start_at DESC` is the authoritative fix. The frontend should also defensively reverse the array (`[...sessions].reverse()`) to handle any future backend regression or caching issues. This dual-layer approach costs nothing in performance and provides resilience.

**Alternatives considered**:
- Backend-only: Simpler, but frontend would be fragile to backend changes.
- Frontend-only: Would leave the API returning a confusing order for other potential consumers.

## Decision 2: Scroll Container Strategy

**Decision**: Use CSS `max-height` + `overflow-y: auto` on the `.session-list` element.

**Rationale**: This is the standard CSS approach for contained scrolling. `overflow-y: auto` shows the scrollbar only when content overflows (satisfying FR-006). A `max-height` of `18rem` (~288px) accommodates approximately 5–6 session rows based on the current row height (~48px per row including gap), aligning with the spec assumption of 4–6 visible entries.

**Alternatives considered**:
- `overflow-y: scroll`: Would always show a scrollbar even with few sessions — rejected per FR-006.
- JavaScript-based virtual scrolling: Overkill for a list of typically <20 items.

## Decision 3: Auto-Scroll Implementation

**Decision**: Use a React `useRef` on the scroll container and call `scrollTo({ top: 0 })` when the session count changes.

**Rationale**: A `useEffect` watching `sessions.length` can trigger a scroll-to-top when new sessions are added. This is lightweight, doesn't interfere with user-initiated scrolling between updates, and aligns with the clarified requirement (FR-008).

**Alternatives considered**:
- `scrollIntoView` on the first element: Less predictable with sticky headers or padding.
- No auto-scroll: Rejected during clarification — user chose Option A.

## Decision 4: Accessibility for Scrollable Region

**Decision**: Add `tabindex="0"` to the scroll container so it can receive keyboard focus, and keep the existing `aria-label="Today's sessions"`.

**Rationale**: Constitution Principle V requires keyboard operability. A scrollable container needs `tabindex="0"` to be focusable via Tab key, allowing arrow key scrolling. The existing `aria-label` already provides screen reader context.

**Alternatives considered**:
- Adding `role="region"`: Not needed since `<ul>` with `aria-label` is already a landmark.
- Custom keyboard handler: Overkill — native browser scroll-on-focus handles arrow keys.
