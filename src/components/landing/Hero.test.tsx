import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Hero } from './Hero';

describe('Hero', () => {
  it('renders the name, portrait and the meta strip', () => {
    render(<Hero />);
    expect(screen.getByRole('heading', { name: /Stepan\s+Nikulenko/ })).toBeInTheDocument();
    expect(screen.getByAltText('Stepan Nikulenko')).toBeInTheDocument();
    expect(screen.getByText('Technical Lead')).toBeInTheDocument();
    expect(screen.getByText('Open to work')).toBeInTheDocument();
  });
});
