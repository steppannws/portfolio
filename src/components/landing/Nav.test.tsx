import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Nav } from './Nav';

describe('Nav', () => {
  it('renders the logo and nav links', () => {
    render(<Nav theme="light" onToggleTheme={() => {}} />);
    expect(screen.getByRole('link', { name: 'Work' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Contact' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dark' })).toBeInTheDocument();
  });
});
