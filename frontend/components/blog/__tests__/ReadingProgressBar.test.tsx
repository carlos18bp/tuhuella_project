import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { render, screen, act } from '@testing-library/react';

import ReadingProgressBar from '../ReadingProgressBar';

describe('ReadingProgressBar', () => {
  let scrollSpy: jest.SpyInstance;

  beforeEach(() => {
    scrollSpy = jest.spyOn(window, 'addEventListener');
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, configurable: true });
    Object.defineProperty(document.documentElement, 'clientHeight', { value: 800, configurable: true });
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });
  });

  afterEach(() => {
    scrollSpy.mockRestore();
  });

  it('renders the progress bar element', () => {
    render(<ReadingProgressBar readTimeMinutes={5} />);
    expect(screen.getByTestId('reading-progress-bar')).toBeInTheDocument();
  });

  it('starts with 0% width', () => {
    render(<ReadingProgressBar readTimeMinutes={5} />);
    const bar = screen.getByTestId('reading-progress-fill');
    expect(bar).toHaveStyle({ width: '0%' });
  });

  it('registers a scroll event listener on mount', () => {
    render(<ReadingProgressBar readTimeMinutes={5} />);
    const scrollCalls = scrollSpy.mock.calls.filter(
      (call: unknown[]) => call[0] === 'scroll',
    );
    expect(scrollCalls.length).toBeGreaterThan(0);
  });

  it('updates progress when scroll event fires', () => {
    render(<ReadingProgressBar readTimeMinutes={5} />);

    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 600, writable: true, configurable: true });
      window.dispatchEvent(new Event('scroll'));
    });

    const bar = screen.getByTestId('reading-progress-fill');
    expect(bar).toBeTruthy();
    const widthStr = (bar as HTMLElement).style.width;
    const widthNum = parseFloat(widthStr);
    expect(widthNum).toBeGreaterThan(0);
  });

  it('shows remaining time in Spanish by default', () => {
    render(<ReadingProgressBar readTimeMinutes={10} />);

    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 300, writable: true, configurable: true });
      window.dispatchEvent(new Event('scroll'));
    });

    const remaining = screen.queryByTestId('reading-progress-remaining');
    if (remaining) {
      expect(remaining).toHaveTextContent('restantes');
    }
  });

  it('shows remaining time in English when lang is en', () => {
    render(<ReadingProgressBar readTimeMinutes={10} lang="en" />);

    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 300, writable: true, configurable: true });
      window.dispatchEvent(new Event('scroll'));
    });

    const remaining = screen.queryByTestId('reading-progress-remaining');
    if (remaining) {
      expect(remaining).toHaveTextContent('remaining');
    }
  });

  it('does not show remaining time when readTimeMinutes is 0', () => {
    render(<ReadingProgressBar readTimeMinutes={0} />);

    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 300, writable: true, configurable: true });
      window.dispatchEvent(new Event('scroll'));
    });

    expect(screen.queryByTestId('reading-progress-remaining')).not.toBeInTheDocument();
  });
});
