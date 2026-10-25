import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Hero, isOnFace } from './Hero';

describe('Hero', () => {
  it('renders the name, portrait and the meta strip', () => {
    render(<Hero />);
    expect(screen.getByRole('heading', { name: /Stepan\s+Nikulenko/ })).toBeInTheDocument();
    expect(screen.getByAltText('Stepan Nikulenko')).toBeInTheDocument();
    expect(screen.getByText('Technical Lead')).toBeInTheDocument();
    expect(screen.getByText('Open to work')).toBeInTheDocument();
  });

  it('lifts the boot loader once the portrait and fonts are ready', async () => {
    const loader = document.createElement('div');
    loader.id = 'boot-loader';
    document.body.append(loader);
    render(<Hero />);
    await waitFor(() => expect(loader).toHaveClass('done'));
    loader.remove();
  });

  it('hits the face only where it sits in the cropped portrait', () => {
    // a 640×300 box: cover scales 1280×720 by 0.5, so the bottom-anchored image overflows 60px up
    const img = {
      naturalWidth: 1280,
      naturalHeight: 720,
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 640, height: 300 }),
    } as HTMLImageElement;
    expect(isOnFace(img, 145, 20)).toBe(true); // nose: source (290, 160)
    expect(isOnFace(img, 500, 20)).toBe(false); // empty right side
    expect(isOnFace(img, 145, 250)).toBe(false); // crossed arms
  });
});
