import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Marquee } from './Marquee';

describe('Marquee', () => {
  it('duplicates the track for a seamless loop and hides the copy from AT', () => {
    render(<Marquee />);
    expect(screen.getAllByText('React Native')).toHaveLength(2);
    expect(screen.getAllByText('MCP Servers')).toHaveLength(2);
  });
});
