'use client';

import { create } from 'zustand';

import { api } from '@/lib/services/http';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '@/lib/services/tokens';
import { API_ENDPOINTS } from '@/lib/constants';

import type { UserRole } from '@/lib/types';

type User = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  city: string;
  role: UserRole;
  is_staff: boolean;
};

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  signIn: (args: { email: string; password: string; captcha_token?: string }) => Promise<void>;
  signUp: (args: { email: string; password: string; first_name?: string; last_name?: string; captcha_token?: string }) => Promise<void>;
  googleLogin: (args: { credential?: string; email?: string; given_name?: string; family_name?: string; picture?: string }) => Promise<void>;
  signOut: () => void;
  syncFromCookies: () => void;
  fetchMe: () => Promise<void>;
  sendPasswordResetCode: (email: string) => Promise<void>;
  resetPassword: (args: { email: string; code: string; new_password: string }) => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  isAuthReady: false,

  syncFromCookies: () => {
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();
    set({ accessToken, refreshToken, isAuthenticated: Boolean(accessToken), isAuthReady: true });
    if (accessToken && !get().user) {
      get().fetchMe();
    }
  },

  fetchMe: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.VALIDATE_TOKEN);
      if (response.data?.user) {
        set({ user: response.data.user });
      }
    } catch {
      get().signOut();
    }
  },
  
  signIn: async ({ email, password, captcha_token }) => {
    const response = await api.post(API_ENDPOINTS.SIGN_IN, { email, password, captcha_token });
    const access = response.data?.access;
    const refresh = response.data?.refresh;
    const user = response.data?.user;
    
    if (!access || !refresh) {
      throw new Error('Invalid token response');
    }
    
    setTokens({ access, refresh });
    set({ user, isAuthenticated: true });
    get().syncFromCookies();
  },
  
  signUp: async ({ email, password, first_name, last_name, captcha_token }) => {
    const response = await api.post(API_ENDPOINTS.SIGN_UP, {
      email,
      password,
      first_name,
      last_name,
      captcha_token,
    });
    
    const access = response.data?.access;
    const refresh = response.data?.refresh;
    const user = response.data?.user;
    
    if (!access || !refresh) {
      throw new Error('Invalid token response');
    }
    
    setTokens({ access, refresh });
    set({ user, isAuthenticated: true });
    get().syncFromCookies();
  },
  
  googleLogin: async ({ credential, email, given_name, family_name, picture }) => {
    const response = await api.post(API_ENDPOINTS.GOOGLE_LOGIN, {
      credential,
      email,
      given_name,
      family_name,
      picture,
    });
    
    const access = response.data?.access;
    const refresh = response.data?.refresh;
    const user = response.data?.user;
    
    if (!access || !refresh) {
      throw new Error('Invalid token response');
    }
    
    setTokens({ access, refresh });
    set({ user, isAuthenticated: true });
    get().syncFromCookies();
  },
  
  signOut: () => {
    clearTokens();
    set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false });
  },
  
  sendPasswordResetCode: async (email: string) => {
    await api.post(API_ENDPOINTS.SEND_PASSCODE, { email });
  },
  
  resetPassword: async ({ email, code, new_password }) => {
    await api.post(API_ENDPOINTS.RESET_PASSWORD, {
      email,
      code,
      new_password
    });
  },
}));
