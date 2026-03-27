# Quickstart: Session List Ordering and Contained Scrolling

**Feature**: 003-short-name-session
**Date**: 2026-03-27

## Prerequisites

- Node.js (for frontend)
- Python 3.11+ (for backend)
- Git (on feature branch `003-short-name-session`)

## Setup

```bash
# Clone and switch to feature branch
git checkout 003-short-name-session

# Backend
cd backend
pip install -r requirements.txt
cd ..

# Frontend
cd frontend
npm install
cd ..
```

## Run

```bash
# Terminal 1: Backend
cd backend
uvicorn src.main:app --host 127.0.0.1 --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev
```

## Test

```bash
# Backend tests
cd backend
pytest tests/test_sessions.py -v

# Frontend tests
cd frontend
npm test
```

## Files Changed

| File | Change |
|------|--------|
| `backend/src/services/session_service.py` | `ORDER BY start_at DESC` |
| `frontend/src/components/TodaySummary.tsx` | Reverse array, add scroll ref + auto-scroll |
| `frontend/src/index.css` | `max-height: 18rem; overflow-y: auto` on `.session-list` |
| `backend/tests/test_sessions.py` | Assert descending order |
| `frontend/src/components/__tests__/TodaySummary.test.tsx` | Sort order + overflow tests |

## Verification

1. Start backend + frontend
2. Create 6+ sessions via the timer
3. Verify newest session appears at top
4. Verify scroll bar appears when sessions exceed panel height
5. Verify completing a new session auto-scrolls list to top
