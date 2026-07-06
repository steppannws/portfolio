import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SLIDES } from './index';

describe('deck slides', () => {
  it('has 13 slides in the expected order', () => {
    expect(SLIDES).toHaveLength(13);
    expect(SLIDES[0].label).toBe('Cover');
    expect(SLIDES[12].label).toBe('Contact');
  });

  it('every slide renders without crashing', () => {
    SLIDES.forEach((slide) => {
      const { unmount } = render(slide.element);
      unmount();
    });
  });

  it('cover slide shows the name', () => {
    render(SLIDES[0].element);
    expect(screen.getByRole('heading', { name: /Stepan Nikulenko/ })).toBeInTheDocument();
  });
});
