import { describe, expect, it, beforeEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { Deck } from './Deck';

describe('Deck', () => {
  beforeEach(() => {
    window.location.hash = '';
  });

  it('renders the cover slide first and advances with ArrowRight', () => {
    render(<Deck />);
    expect(screen.getByRole('heading', { name: /Stepan Nikulenko/ })).toBeInTheDocument();
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    });
    expect(screen.getByRole('heading', { name: 'Me, in a nutshell.' })).toBeInTheDocument();
    expect(screen.getByText('2 / 16')).toBeInTheDocument();
  });
});
