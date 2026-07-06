import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeckNav } from './DeckNav';

describe('DeckNav', () => {
  it('disables prev on the first slide and fires onNext', async () => {
    const onNext = vi.fn();
    render(<DeckNav index={0} count={13} onPrev={() => {}} onNext={onNext} onGoTo={() => {}} />);
    expect(screen.getByRole('button', { name: 'Previous slide' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(onNext).toHaveBeenCalledOnce();
    expect(screen.getByText('1 / 13')).toBeInTheDocument();
  });

  it('fires onGoTo with the dot index', async () => {
    const onGoTo = vi.fn();
    render(<DeckNav index={0} count={13} onPrev={() => {}} onNext={() => {}} onGoTo={onGoTo} />);
    await userEvent.click(screen.getByRole('button', { name: 'Go to slide 5' }));
    expect(onGoTo).toHaveBeenCalledWith(4);
  });
});
