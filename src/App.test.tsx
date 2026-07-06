import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from './App';

vi.mock('./components/landing/Hero', () => ({
  Hero: () => <section id="top" />,
}));

describe('App', () => {
  it('renders all landing sections', () => {
    render(<App />);
    expect(screen.getByRole('link', { name: 'Work' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Work.' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /I lead as well as build/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /great together/ })).toBeInTheDocument();
    expect(screen.getByText('© 2026 STEPAN NIKULENKO')).toBeInTheDocument();
  });
});
