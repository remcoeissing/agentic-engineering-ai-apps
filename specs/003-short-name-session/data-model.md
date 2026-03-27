# Data Model: Session List Ordering and Contained Scrolling

**Feature**: 003-short-name-session
**Date**: 2026-03-27

## Overview

This feature requires **no changes to the data model**. The existing `sessions` table and `SessionSummaryResponse` type already contain all fields needed for reverse chronological ordering.

## Existing Entities (unchanged)

### Session (backend — SQLite table: `sessions`)

| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER (PK) | Auto-incrementing session identifier |
| start_at | TEXT (ISO 8601) | When the session started — **used as sort key** |
| end_at | TEXT (ISO 8601, nullable) | When the session ended (null if active) |
| status | TEXT | One of: `running`, `paused`, `completed`, `stopped_early` |
| focused_seconds | INTEGER (nullable) | Total focused time (null if active) |
| note | TEXT (nullable) | Optional user note (max 500 chars) |
| date_key | TEXT (YYYY-MM-DD) | Partition key for daily queries |

### SessionSummaryResponse (frontend — TypeScript interface)

| Field | Type | Description |
|-------|------|-------------|
| id | number | Session identifier |
| start_at | string | ISO 8601 timestamp — **sort key** |
| end_at | string \| null | End timestamp |
| status | 'running' \| 'paused' \| 'completed' \| 'stopped_early' | Session state |
| focused_seconds | number \| null | Focus duration in seconds |
| note | string \| null | Optional note |

## Query Change

The only data-layer change is the sort direction in the `get_today()` query:

- **Before**: `ORDER BY start_at ASC` (oldest first)
- **After**: `ORDER BY start_at DESC` (newest first)

No indexes, columns, migrations, or schema changes are required. The `start_at` column is already used as the query's sort key.

## State Transitions (unchanged)

```
idle → running → paused → running → completed
                                  → stopped_early
         running → completed
         running → stopped_early
```

No changes to lifecycle or state machine.
