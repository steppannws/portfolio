import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WorkSection } from './WorkSection';

describe('WorkSection', () => {
  it('renders all eight project cards', () => {
    render(<WorkSection />);
    const titles = [
      'Goalsetter',
      'Goalsetter Classroom',
      'Tydee',
      'Ace Hardware Rewards',
      'Club Premier',
      'Aeromexico',
      'Guía Arqui Buenos Aires',
      'Humber',
    ];
    titles.forEach((title) => {
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    });
  });
});
