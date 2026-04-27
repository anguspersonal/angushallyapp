import { afterEach, describe, expect, it } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import { GradientRoot } from './GradientRoot';

describe('GradientRoot', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-mantine-color-scheme');
  });

  it('renders the ambient glow when the document scheme is dark', async () => {
    document.documentElement.setAttribute('data-mantine-color-scheme', 'dark');

    await act(async () => {
      render(<GradientRoot />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('ambient-glow-layer')).toBeInTheDocument();
    });
  });

  it('keeps the ambient glow layer mounted when the document scheme is light', async () => {
    document.documentElement.setAttribute('data-mantine-color-scheme', 'light');

    await act(async () => {
      render(<GradientRoot />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('ambient-glow-layer')).toBeInTheDocument();
    });
  });
});
