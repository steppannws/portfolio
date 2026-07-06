import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TydeeCard } from './TydeeCard';

describe('TydeeCard', () => {
  it('renders the project title and a link to tydee.io', () => {
    render(<TydeeCard />);
    expect(screen.getByRole('heading', { name: 'Tydee' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /tydee.io/ })).toHaveAttribute(
      'href',
      'https://www.tydee.io/'
    );
  });
});
