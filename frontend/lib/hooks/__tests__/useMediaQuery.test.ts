import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';

import {
  useMediaQuery,
  useMinWidthSm,
  useMinWidthMd,
  TW_SM_MIN_WIDTH_PX,
  TW_MD_MIN_WIDTH_PX,
} from '../useMediaQuery';

type MQListener = () => void;

function makeMockMQ(matches: boolean) {
  const listeners: MQListener[] = [];
  return {
    matches,
    addEventListener: jest.fn((_: string, cb: MQListener) => listeners.push(cb)),
    removeEventListener: jest.fn((_: string, cb: MQListener) => {
      const idx = listeners.indexOf(cb);
      if (idx !== -1) listeners.splice(idx, 1);
    }),
    _trigger: () => listeners.forEach((cb) => cb()),
  };
}

describe('useMediaQuery', () => {
  let mq: ReturnType<typeof makeMockMQ>;

  beforeEach(() => {
    mq = makeMockMQ(false);
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn(() => mq),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns ssrMatches (false) as the initial value', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 640px)', false));
    expect(result.current).toBe(false);
  });

  it('returns true when window.matchMedia reports a match', () => {
    mq = makeMockMQ(true);
    (window.matchMedia as jest.Mock).mockReturnValue(mq);

    const { result } = renderHook(() => useMediaQuery('(min-width: 640px)', false));
    expect(result.current).toBe(true);
  });

  it('updates when the media query fires a change event', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 640px)', false));
    expect(result.current).toBe(false);

    mq.matches = true;
    act(() => mq._trigger());

    expect(result.current).toBe(true);
  });

  it('unsubscribes from media query on unmount', () => {
    const { unmount } = renderHook(() => useMediaQuery('(min-width: 640px)', false));
    unmount();
    expect(mq.removeEventListener).toHaveBeenCalledTimes(1);
  });
});

describe('useMinWidthSm', () => {
  it('calls useMediaQuery with the sm breakpoint query', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn(() => makeMockMQ(false)),
    });

    renderHook(() => useMinWidthSm());

    expect(window.matchMedia).toHaveBeenCalledWith(`(min-width: ${TW_SM_MIN_WIDTH_PX}px)`);
  });
});

describe('useMinWidthMd', () => {
  it('calls useMediaQuery with the md breakpoint query', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn(() => makeMockMQ(false)),
    });

    renderHook(() => useMinWidthMd());

    expect(window.matchMedia).toHaveBeenCalledWith(`(min-width: ${TW_MD_MIN_WIDTH_PX}px)`);
  });
});
