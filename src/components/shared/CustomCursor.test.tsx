import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { CustomCursor } from './CustomCursor';

describe('CustomCursor', () => {
  it('renders the ball and its orbiting rings', () => {
    const { container } = render(<CustomCursor />);
    const [ballWrap, rings] = Array.from(container.children);
    expect(ballWrap.children).toHaveLength(1); // the ball
    expect(rings.children[0].children).toHaveLength(3); // three Saturn rings
  });
});
