import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WorkSection } from './WorkSection';

const FLAGSHIPS = ['Goalsetter', 'Goalsetter Classroom', 'Tydee', 'Ace Hardware Rewards'];

const ARCHIVE = [
  'Club Premier',
  'Aeromexico',
  'Humber',
  'Guía Arqui Buenos Aires',
  'Carrera Aérea · Disney',
  'Personal Taxi Dakar',
];

describe('WorkSection', () => {
  it('renders four flagships and the six archive rows', () => {
    render(<WorkSection />);
    [...FLAGSHIPS, ...ARCHIVE].forEach((title) => {
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    });
  });

  it('numbers the archive rows after the flagships', () => {
    render(<WorkSection />);
    expect(screen.getByText('05')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('links the Tydee flagship out to the product', () => {
    render(<WorkSection />);
    expect(screen.getByRole('link', { name: /tydee\.io/ })).toHaveAttribute(
      'href',
      'https://www.tydee.io/'
    );
  });
});
