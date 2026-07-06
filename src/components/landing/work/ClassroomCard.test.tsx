import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ClassroomCard } from './ClassroomCard';

describe('ClassroomCard', () => {
  it('renders the project title and LMS rows', () => {
    render(<ClassroomCard />);
    expect(screen.getByRole('heading', { name: 'Goalsetter Classroom' })).toBeInTheDocument();
    expect(screen.getByText('Canvas')).toBeInTheDocument();
  });
});
