import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WorkSection } from './WorkSection';

describe('WorkSection', () => {
  it('renders all ten project cards', () => {
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
      'Carrera Aérea · Disney',
      'Personal Taxi Dakar',
    ];
    titles.forEach((title) => {
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    });
  });
});
