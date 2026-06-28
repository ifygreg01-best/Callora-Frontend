// @vitest-environment jsdom

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CallHistoryRow } from './CallHistoryRow';
import type { CallRecord } from './CallHistoryRow';

const formatTimestamp = (d: Date) => d.toISOString();
const formatTime = (ms: number) => `${ms}ms`;

const baseCall: CallRecord = {
  id: 'test-1',
  timestamp: new Date('2024-01-15T10:00:00Z'),
  endpoint: '/api/v1/user/profile',
  status: 'success',
  responseTime: 120,
  cost: 0.001,
  request: { key: 'value' },
  response: { ok: true },
};

function renderRow(overrides: Partial<CallRecord> = {}) {
  const call = { ...baseCall, ...overrides };
  return render(
    <CallHistoryRow call={call} formatTimestamp={formatTimestamp} formatTime={formatTime} />,
  );
}

describe('CallHistoryRow', () => {
  // ── Status rendering ─────────────────────────────────────────────────────

  it('renders the endpoint and response time', () => {
    renderRow();
    expect(screen.getByText('/api/v1/user/profile')).toBeTruthy();
    expect(screen.getByText('120ms')).toBeTruthy();
  });

  it('shows "success" label for a successful call', () => {
    renderRow({ status: 'success' });
    expect(screen.getByText('success')).toBeTruthy();
  });

  it('shows "error" label for a failed call', () => {
    renderRow({ status: 'error' });
    expect(screen.getByText('error')).toBeTruthy();
  });

  // ── Theme tokens, not hardcoded colours ──────────────────────────────────

  it('applies --icon-success token (not a hardcoded hex) for success status', () => {
    renderRow({ status: 'success' });
    // aria-label contains "Status: success"
    const cell = screen.getByLabelText(/status: success/i);
    expect(cell.style.color).toBe('var(--icon-success)');
  });

  it('applies --icon-error token (not a hardcoded hex) for error status', () => {
    renderRow({ status: 'error' });
    const cell = screen.getByLabelText(/status: error/i);
    expect(cell.style.color).toBe('var(--icon-error)');
  });

  it('does not contain any hardcoded hex colour on the status cell', () => {
    const { container } = renderRow({ status: 'success' });
    const cell = container.querySelector('.status-cell') as HTMLElement;
    // style.color should be a CSS custom property reference, never a resolved hex/rgb
    expect(cell.style.color).not.toMatch(/^#|^rgb/);
  });

  // ── Accessibility ────────────────────────────────────────────────────────

  it('provides an accessible aria-label on the status cell', () => {
    renderRow({ status: 'success' });
    expect(screen.getByLabelText('Status: success')).toBeTruthy();
  });

  it('marks the icon as aria-hidden so screen readers use the text label', () => {
    const { container } = renderRow({ status: 'success' });
    const iconWrapper = container.querySelector('[aria-hidden="true"]');
    expect(iconWrapper).toBeTruthy();
  });

  it('sets aria-expanded=false on the View button initially', () => {
    renderRow();
    const btn = screen.getByRole('button', { name: 'View' });
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  // ── Expand / collapse ────────────────────────────────────────────────────

  it('toggles expanded details on View/Hide button click', () => {
    renderRow();
    const btn = screen.getByRole('button', { name: 'View' });

    // Not shown initially
    expect(screen.queryByRole('region')).toBeNull();

    fireEvent.click(btn);
    expect(screen.getByRole('region')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Hide' })).toBeTruthy();
    expect(btn.getAttribute('aria-expanded')).toBe('true');

    fireEvent.click(screen.getByRole('button', { name: 'Hide' }));
    expect(screen.queryByRole('region')).toBeNull();
  });

  it('renders request and response JSON in expanded view', () => {
    renderRow();
    fireEvent.click(screen.getByRole('button', { name: 'View' }));
    expect(screen.getByText(/key.*value/s)).toBeTruthy();
    expect(screen.getByText(/ok.*true/s)).toBeTruthy();
  });

  // ── Cost display ─────────────────────────────────────────────────────────

  it('displays cost with USDC suffix', () => {
    renderRow({ cost: 0.001 });
    expect(screen.getByText('0.001 USDC')).toBeTruthy();
  });
});
