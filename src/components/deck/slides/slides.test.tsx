import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SLIDES } from './index';

describe('deck slides', () => {
  it('has 16 slides in the expected order', () => {
    expect(SLIDES).toHaveLength(16);
    render(SLIDES[15]);
    expect(screen.getByRole('heading', { name: /Let's build/ })).toBeInTheDocument();
  });

  it('every slide renders without crashing', () => {
    SLIDES.forEach((slide) => {
      const { unmount } = render(slide);
      unmount();
    });
  });

  it('cover slide shows the name', () => {
    render(SLIDES[0]);
    expect(screen.getByRole('heading', { name: /Stepan Nikulenko/ })).toBeInTheDocument();
  });
});
