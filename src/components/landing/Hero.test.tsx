import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Hero } from './Hero';

describe('Hero', () => {
  it('renders the name, portrait and the meta strip', () => {
    render(<Hero />);
    expect(screen.getByRole('heading', { name: /Stepan\s+Nikulenko/ })).toBeInTheDocument();
    expect(screen.getByAltText('Stepan Nikulenko')).toBeInTheDocument();
    expect(screen.getByText('Technical Lead')).toBeInTheDocument();
    expect(screen.getByText('Open to work')).toBeInTheDocument();
  });

  it('lifts the boot loader once the portrait and fonts are ready', async () => {
    const loader = document.createElement('div');
    loader.id = 'boot-loader';
    document.body.append(loader);
    render(<Hero />);
    await waitFor(() => expect(loader).toHaveClass('done'));
    loader.remove();
  });
});
