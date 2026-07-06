import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContactSection } from './ContactSection';

describe('ContactSection', () => {
  it('renders email CTA and social links', () => {
    render(<ContactSection />);
    expect(screen.getByRole('link', { name: 'stepan.nikulenko@gmail.com' })).toHaveAttribute(
      'href',
      'mailto:stepan.nikulenko@gmail.com'
    );
    expect(screen.getByRole('link', { name: 'GitHub ↗' })).toBeInTheDocument();
  });
});
