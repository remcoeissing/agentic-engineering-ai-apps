# Feature Specification: Session List Ordering and Contained Scrolling

**Feature Branch**: `003-short-name-session`
**Created**: 2026-03-27
**Status**: Draft
**Input**: User description: "As a user reviewing today's sessions, the most recent session should appear at the top of the list so I can see what I just finished without scrolling. If I have many sessions, the list must stay within the panel with an internal scroll bar rather than growing the page."

## Clarifications

### Session 2026-03-27

- Q: When a new session appears while the user has scrolled down in the list, should the list auto-scroll to the top? → A: Yes, auto-scroll to top — the list always jumps to show the newest session whenever one is added.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Most Recent Session Visible First (Priority: P1)

As a user who just completed a focus session, I want to see my most recent session at the top of today's session list so I can immediately review what I just finished without scrolling.

**Why this priority**: This is the primary user need — quick access to the latest session. Currently sessions appear oldest-first, forcing users to scroll to the bottom to find their most recent work. This directly undermines the purpose of the session summary panel.

**Independent Test**: Can be fully tested by completing multiple sessions throughout a day and verifying the most recently completed session always appears at the top of the list.

**Acceptance Scenarios**:

1. **Given** a user has completed 3 sessions today at 9:00 AM, 11:00 AM, and 2:00 PM, **When** the user views the session list, **Then** the 2:00 PM session appears first, followed by 11:00 AM, then 9:00 AM.
2. **Given** a user has a running session and 2 completed sessions, **When** the user views the session list, **Then** the running session appears at the top (as the most recent), followed by completed sessions in reverse chronological order.
3. **Given** a user completes a new session, **When** the session list refreshes, **Then** the newly completed session appears at the top of the list without requiring a page reload.

---

### User Story 2 - Contained Session List with Internal Scrolling (Priority: P2)

As a user with many sessions in a day, I want the session list to stay within its panel boundaries with a scroll bar inside the panel, so that the overall page layout remains stable and I can scroll through sessions without the page growing endlessly.

**Why this priority**: This ensures the page layout remains usable as session counts grow. Without containment, the session panel pushes other page content downward, degrading the overall user experience.

**Independent Test**: Can be fully tested by creating more sessions than the panel can visibly contain and verifying a scroll bar appears within the panel while the page itself does not grow.

**Acceptance Scenarios**:

1. **Given** a user has more sessions than can fit within the visible panel area, **When** the user views the session list, **Then** a vertical scroll bar appears inside the session list panel.
2. **Given** the session list has an internal scroll bar, **When** the user scrolls the session list, **Then** only the session list content scrolls — the rest of the page remains stationary.
3. **Given** a user has only 1–2 sessions that fit within the panel, **When** the user views the session list, **Then** no scroll bar is visible and the panel displays at its natural height.

---

### Edge Cases

- What happens when the user has zero sessions today? The panel should display an empty state message — no scroll bar should appear.
- What happens when a session is actively running and new sessions keep being added? The list should continue to respect reverse chronological order, the scroll container should accommodate new entries, and the list should auto-scroll to the top to show the newest entry.
- What happens when session data is loading? The panel should retain its bounded dimensions and show an appropriate loading state.
- How does the scroll behavior work on touch devices? Scrolling within the panel should work via touch gestures without accidentally scrolling the outer page.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The session list MUST display sessions in reverse chronological order, with the most recently started session at the top.
- **FR-002**: The session list MUST maintain reverse chronological order when new sessions are added or existing sessions change status (e.g., running to completed).
- **FR-003**: The session list panel MUST have a fixed maximum visible height that prevents it from growing the overall page layout.
- **FR-004**: When sessions exceed the visible area of the panel, a vertical scroll bar MUST appear within the session list panel.
- **FR-005**: Scrolling the session list MUST NOT cause the outer page to scroll — the scroll interaction must be contained within the panel.
- **FR-006**: When all sessions fit within the visible area, the panel MUST NOT display a scroll bar and should size naturally to its content.
- **FR-007**: The sort order MUST apply consistently across all session statuses (running, paused, completed, stopped early).
- **FR-008**: When the session list is scrollable and a new session is added, the list MUST auto-scroll to the top to ensure the newest session is immediately visible.

### Key Entities

- **Session**: A time-bounded focus period with a start time, optional end time, status, and duration. Sessions belong to a specific calendar date and are the primary items displayed in the session list.
- **Session List Panel**: A bounded visual container within the daily summary view that holds the list of sessions for the current day.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can identify their most recent session within 1 second of viewing the session list, without any scrolling.
- **SC-002**: The session list panel never exceeds its designated maximum height, regardless of how many sessions exist.
- **SC-003**: 100% of sessions in the list are displayed in reverse chronological order (newest first) at all times.
- **SC-004**: Users with 20+ sessions can scroll through the full list using an in-panel scroll bar without the outer page layout shifting.
- **SC-005**: The session list correctly transitions between no-scroll (few sessions) and scrollable (many sessions) states without visual glitches.

## Assumptions

- The existing session summary panel ("Today's Summary") is the target for these changes — no new panels or views are introduced.
- Session timestamps (start time) are the sole sort key for ordering; no secondary sort key is needed.
- The maximum visible height of the session list panel should accommodate approximately 4–6 session entries before scrolling activates, consistent with standard panel sizing conventions.
- This feature applies only to the daily session list view; historical or multi-day views are out of scope.
- The session data already includes reliable timestamps for ordering; no changes to the data model are required.
