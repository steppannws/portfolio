import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Marquee } from './Marquee';

describe('Marquee', () => {
  it('renders the skill list twice for the seamless loop', () => {
    render(<Marquee />);
    expect(screen.getAllByText(/React Native/)).toHaveLength(2);
  });
});
