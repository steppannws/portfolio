import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AboutSection } from './AboutSection';

describe('AboutSection', () => {
  it('renders the heading and the three stats', () => {
    render(<AboutSection />);
    expect(
      screen.getByRole('heading', { name: /Hands-on, from code to team/ })
    ).toBeInTheDocument();
    expect(screen.getByText('15+')).toBeInTheDocument();
    expect(screen.getByText('20+')).toBeInTheDocument();
  });
});
