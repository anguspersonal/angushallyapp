import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from '@/test/fixtures/testUtils';
import ProjectSnippet from '@/components/ProjectSnippet';

const baseProject = {
  name: 'Test project',
  desc: 'A demo project for testing.',
  route: '/projects/test',
  tags: [] as string[],
};

describe('ProjectSnippet status chip', () => {
  it('renders "In progress" for status in-progress', () => {
    renderWithProviders(
      <ProjectSnippet project={{ ...baseProject, status: 'in-progress' }} />,
    );
    expect(screen.getByText('In progress')).toBeInTheDocument();
  });

  it('renders "Done" for status done', () => {
    renderWithProviders(
      <ProjectSnippet project={{ ...baseProject, status: 'done' }} />,
    );
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('renders "Archived" for status archived', () => {
    renderWithProviders(
      <ProjectSnippet project={{ ...baseProject, status: 'archived' }} />,
    );
    expect(screen.getByText('Archived')).toBeInTheDocument();
  });

  it('never renders the old "Deprecated" label', () => {
    renderWithProviders(
      <ProjectSnippet project={{ ...baseProject, status: 'archived' }} />,
    );
    expect(screen.queryByText('Deprecated')).not.toBeInTheDocument();
  });

  it('shows a sign-in chip when gated', () => {
    renderWithProviders(
      <ProjectSnippet
        project={{ ...baseProject, status: 'in-progress', gated: true }}
      />,
    );
    expect(screen.getByText('Sign-in')).toBeInTheDocument();
  });
});
