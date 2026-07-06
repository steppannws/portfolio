import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AceHardwareCard } from './AceHardwareCard';

describe('AceHardwareCard', () => {
  it('renders the project title', () => {
    render(<AceHardwareCard />);
    expect(screen.getByRole('heading', { name: 'Ace Hardware Rewards' })).toBeInTheDocument();
  });
});
