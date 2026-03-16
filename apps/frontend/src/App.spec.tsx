import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText('Storybook')).toBeInTheDocument();
  });

  it('shows landing page with theme cards', () => {
    render(<App />);
    expect(screen.getByText('Create a Magical Storybook')).toBeInTheDocument();
    expect(screen.getByText('The Tooth Fairy Adventure')).toBeInTheDocument();
    expect(screen.getByText('Dinosaur Discovery')).toBeInTheDocument();
    expect(screen.getByText('The Moon Princess')).toBeInTheDocument();
  });
});
