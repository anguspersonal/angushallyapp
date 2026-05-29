import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from '@/test/fixtures/testUtils';
import AnnouncementsPage from './page';
import { announcements } from '@/data/announcements';

/**
 * Smoke test for the /announcements stub.
 * Issue #63 explicitly requested at least a smoke test if announcements
 * becomes a route. This guards against the route silently breaking on
 * future refactors.
 */
describe('AnnouncementsPage (smoke)', () => {
  it('renders the masthead heading', () => {
    renderWithProviders(<AnnouncementsPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: /announcements/i }),
    ).toBeInTheDocument();
  });

  it('renders every announcement title from the data source', () => {
    renderWithProviders(<AnnouncementsPage />);
    for (const item of announcements) {
      expect(
        screen.getByRole('heading', { level: 2, name: item.title }),
      ).toBeInTheDocument();
    }
  });

  it('renders a machine-readable <time> element for each item', () => {
    const { container } = renderWithProviders(<AnnouncementsPage />);
    const timeEls = container.querySelectorAll('time[datetime]');
    expect(timeEls.length).toBe(announcements.length);
  });
});
