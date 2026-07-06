import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { CustomCursor } from './CustomCursor';

describe('CustomCursor', () => {
  it('renders without crashing', () => {
    const { container } = render(<CustomCursor />);
    expect(container.querySelectorAll('div')).toHaveLength(2);
  });
});
