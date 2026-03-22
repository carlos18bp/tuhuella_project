import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, act } from '@testing-library/react';
import React from 'react';

const mockRevert = jest.fn();
const mockFrom = jest.fn();
const mockContext = jest.fn().mockReturnValue({ revert: mockRevert });
const mockRegisterPlugin = jest.fn();
const mockScrollTrigger = { name: 'ScrollTrigger' };

jest.mock('gsap', () => ({
  gsap: {
    from: (...args: unknown[]) => mockFrom(...args),
    context: (...args: unknown[]) => mockContext(...args),
    registerPlugin: (...args: unknown[]) => mockRegisterPlugin(...args),
  },
}));

jest.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: mockScrollTrigger,
}));

import { useScrollReveal } from '../useScrollReveal';

function TestComponent({ stagger = 0 }: { stagger?: number }) {
  const ref = useScrollReveal<HTMLDivElement>(stagger);
  return <div ref={ref} data-testid="target"><span>child1</span><span>child2</span></div>;
}

function NullRefComponent() {
  useScrollReveal<HTMLDivElement>();
  return <span>no ref attached</span>;
}

const flush = () => act(() => new Promise((r) => setTimeout(r, 50)));

describe('useScrollReveal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers ScrollTrigger plugin when element is mounted', async () => {
    render(<TestComponent />);
    await flush();

    expect(mockRegisterPlugin).toHaveBeenCalledWith(mockScrollTrigger);
  });

  it('calls gsap.context with the mounted element', async () => {
    render(<TestComponent />);
    await flush();

    expect(mockContext).toHaveBeenCalledWith(expect.any(Function), expect.any(HTMLDivElement));
  });

  it('animates the container element when stagger is 0', async () => {
    mockContext.mockImplementationOnce((fn: () => void, el: HTMLElement) => {
      fn();
      return { revert: mockRevert };
    });

    render(<TestComponent stagger={0} />);
    await flush();

    expect(mockFrom).toHaveBeenCalledWith(
      expect.any(HTMLDivElement),
      expect.objectContaining({
        y: 40,
        opacity: 0,
        duration: 0.7,
        stagger: undefined,
      }),
    );
  });

  it('animates children with stagger when stagger > 0', async () => {
    mockContext.mockImplementationOnce((fn: () => void) => {
      fn();
      return { revert: mockRevert };
    });

    render(<TestComponent stagger={0.2} />);
    await flush();

    expect(mockFrom).toHaveBeenCalledWith(
      expect.any(HTMLCollection),
      expect.objectContaining({
        stagger: 0.2,
      }),
    );
  });

  it('reverts gsap context on unmount', async () => {
    const { unmount } = render(<TestComponent />);
    await flush();

    unmount();

    expect(mockRevert).toHaveBeenCalled();
  });

  it('does not call gsap when ref is not attached to an element', async () => {
    render(<NullRefComponent />);
    await flush();

    expect(mockContext).not.toHaveBeenCalled();
  });
});
