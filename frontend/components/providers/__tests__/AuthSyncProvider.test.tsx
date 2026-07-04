import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';

const useAuthSync = jest.fn();
jest.mock('@/lib/hooks/useAuthSync', () => ({ useAuthSync: () => useAuthSync() }));

import { AuthSyncProvider } from '../AuthSyncProvider';

describe('AuthSyncProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders its children', () => {
    render(
      <AuthSyncProvider>
        <span>Protected content</span>
      </AuthSyncProvider>,
    );
    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('runs the auth-sync hook once on mount', () => {
    render(
      <AuthSyncProvider>
        <span>child</span>
      </AuthSyncProvider>,
    );
    expect(useAuthSync).toHaveBeenCalledTimes(1);
  });
});
