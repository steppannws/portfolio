import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContactSection } from './ContactSection';

describe('ContactSection', () => {
  it('renders the email link and the social list', () => {
    render(<ContactSection />);
    expect(screen.getByRole('link', { name: 'stepan.nikulenko@gmail.com' })).toHaveAttribute(
      'href',
      'mailto:stepan.nikulenko@gmail.com'
    );
    expect(screen.getByRole('link', { name: 'GitHub ↗' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'LinkedIn ↗' })).toBeInTheDocument();
  });
});
