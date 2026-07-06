import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GoalsetterCard } from './GoalsetterCard';

describe('GoalsetterCard', () => {
  it('renders the project title', () => {
    render(<GoalsetterCard />);
    expect(screen.getByRole('heading', { name: 'Goalsetter' })).toBeInTheDocument();
  });
});
