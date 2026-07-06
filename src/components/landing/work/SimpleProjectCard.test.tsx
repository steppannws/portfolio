import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SimpleProjectCard } from './SimpleProjectCard';
import { COMPACT_PROJECTS } from '../../../data/compactProjects';

describe('SimpleProjectCard', () => {
  it('renders each compact project title', () => {
    COMPACT_PROJECTS.forEach((project) => {
      const { unmount } = render(<SimpleProjectCard {...project} />);
      expect(screen.getByRole('heading', { name: project.title })).toBeInTheDocument();
      unmount();
    });
  });
});
