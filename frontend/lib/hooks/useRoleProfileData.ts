'use client';

import { useEffect, useState } from 'react';

import { api } from '@/lib/services/http';
import { API_ENDPOINTS } from '@/lib/constants';
import { useAuthStore } from '@/lib/stores/authStore';
import type { AdminStats, ShelterStats, ShelterSummary } from '@/lib/types';

export type RoleProfileData = {
  shelter: ShelterSummary | null;
  shelterStats: ShelterStats | null;
  adminStats: AdminStats | null;
  loading: boolean;
};

const INITIAL: RoleProfileData = {
  shelter: null,
  shelterStats: null,
  adminStats: null,
  loading: false,
};

export function useRoleProfileData(): RoleProfileData {
  const role = useAuthStore((s) => s.user?.role);
  const [data, setData] = useState<RoleProfileData>(INITIAL);

  useEffect(() => {
    if (!role || role === 'adopter') {
      setData(INITIAL);
      return;
    }

    let cancelled = false;
    setData((prev) => ({ ...prev, loading: true }));

    api
      .get(API_ENDPOINTS.UPDATE_PROFILE)
      .then((r) => {
        if (cancelled) return;
        setData({
          shelter: r.data?.shelter ?? null,
          shelterStats: r.data?.shelter_stats ?? null,
          adminStats: r.data?.admin_stats ?? null,
          loading: false,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setData({ ...INITIAL, loading: false });
      });

    return () => {
      cancelled = true;
    };
  }, [role]);

  return data;
}
