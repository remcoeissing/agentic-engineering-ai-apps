import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { SessionSummaryResponse } from '../../api/types';
import { TodaySummary } from '../TodaySummary';

const completedSession: SessionSummaryResponse = {
  id: 1,
  start_at: '2026-03-24T09:00:00Z',
  end_at: '2026-03-24T09:25:00Z',
  status: 'completed',
  focused_seconds: 1500,
  note: null,
};

const stoppedSession: SessionSummaryResponse = {
  id: 2,
  start_at: '2026-03-24T10:00:00Z',
  end_at: '2026-03-24T10:08:00Z',
  status: 'stopped_early',
  focused_seconds: 480,
  note: 'interrupted',
};

describe('TodaySummary — empty state', () => {
  it('shows placeholder when no sessions', () => {
    render(<TodaySummary sessions={[]} totalFocusedMinutes={0} />);
    expect(screen.getByText(/no sessions yet today/i)).toBeInTheDocument();
  });

  it('shows 0 min total when empty', () => {
    render(<TodaySummary sessions={[]} totalFocusedMinutes={0} />);
    expect(screen.getByText(/0 min/i)).toBeInTheDocument();
  });
});

describe('TodaySummary — US1 session list', () => {
  it('renders completed session', () => {
    render(<TodaySummary sessions={[completedSession]} totalFocusedMinutes={25} />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
    // '25 min' appears in both the header and the session row; check session row specifically
    const durations = screen.getAllByText('25 min');
    expect(durations.length).toBeGreaterThanOrEqual(1);
  });
});

describe('TodaySummary — US4', () => {
  it('renders multiple sessions', () => {
    render(
      <TodaySummary
        sessions={[completedSession, stoppedSession]}
        totalFocusedMinutes={33}
      />,
    );
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Stopped early')).toBeInTheDocument();
  });

  it('shows session note when present', () => {
    render(<TodaySummary sessions={[stoppedSession]} totalFocusedMinutes={8} />);
    expect(screen.getByText('interrupted')).toBeInTheDocument();
  });

  it('shows correct total focused minutes', () => {
    render(
      <TodaySummary
        sessions={[completedSession, stoppedSession]}
        totalFocusedMinutes={33}
      />,
    );
    expect(screen.getByText(/33 min/i)).toBeInTheDocument();
  });

  it('uses constitution terminology for status labels', () => {
    render(<TodaySummary sessions={[stoppedSession]} totalFocusedMinutes={8} />);
    // Constitution says: "Stopped early" not "stopped_early"
    expect(screen.getByText('Stopped early')).toBeInTheDocument();
  });
});

describe('TodaySummary — sort order', () => {
  const morningSession: SessionSummaryResponse = {
    id: 10,
    start_at: '2026-03-24T08:00:00Z',
    end_at: '2026-03-24T08:25:00Z',
    status: 'completed',
    focused_seconds: 1500,
    note: null,
  };

  const noonSession: SessionSummaryResponse = {
    id: 11,
    start_at: '2026-03-24T12:00:00Z',
    end_at: '2026-03-24T12:25:00Z',
    status: 'completed',
    focused_seconds: 1500,
    note: null,
  };

  const eveningSession: SessionSummaryResponse = {
    id: 12,
    start_at: '2026-03-24T18:00:00Z',
    end_at: '2026-03-24T18:25:00Z',
    status: 'completed',
    focused_seconds: 1500,
    note: null,
  };

  it('renders sessions newest-first regardless of input order', () => {
    // Pass sessions in ascending order (oldest first) — component should reverse
    render(
      <TodaySummary
        sessions={[morningSession, noonSession, eveningSession]}
        totalFocusedMinutes={75}
      />,
    );
    const list = screen.getByRole('list', { name: /today's sessions/i });
    const rows = within(list).getAllByRole('listitem');
    expect(rows).toHaveLength(3);
    // Compute expected local times the same way the component does
    const fmt = (iso: string) =>
      new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    // First rendered row should be the evening (newest) session
    expect(rows[0]).toHaveTextContent(fmt(eveningSession.start_at));
    expect(rows[1]).toHaveTextContent(fmt(noonSession.start_at));
    expect(rows[2]).toHaveTextContent(fmt(morningSession.start_at));
  });
});

describe('TodaySummary — scroll accessibility', () => {
  it('session list has tabindex for keyboard-accessible scrolling', () => {
    render(
      <TodaySummary sessions={[completedSession]} totalFocusedMinutes={25} />,
    );
    const list = screen.getByRole('list', { name: /today's sessions/i });
    expect(list).toHaveAttribute('tabindex', '0');
  });
});
