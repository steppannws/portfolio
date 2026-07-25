import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from './App';

describe('App', () => {
  it('renders all landing sections', () => {
    render(<App />);
    expect(screen.getByRole('link', { name: 'Work' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Ten projects, fifteen years/ })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Hands-on from code to team/ })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /build something great together/ })
    ).toBeInTheDocument();
    expect(screen.getByText('© 2026 Stepan Nikulenko')).toBeInTheDocument();
  });
});
