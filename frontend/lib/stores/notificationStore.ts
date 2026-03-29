import { create } from 'zustand';
import { api } from '@/lib/services/http';
import { API_ENDPOINTS } from '@/lib/constants';

type NotificationLog = {
  id: number;
  event_key: string;
  channel: string;
  status: string;
  metadata: Record<string, string>;
  is_read: boolean;
  sent_at: string | null;
  created_at: string;
};

type NotificationPreference = {
  id: number;
  event_key: string;
  channel: string;
  enabled: boolean;
};

type NotificationState = {
  unreadCount: number;
  notifications: NotificationLog[];
  preferences: NotificationPreference[];
  loading: boolean;

  fetchUnreadCount: () => Promise<void>;
  fetchNotifications: (channel?: string) => Promise<void>;
  fetchPreferences: () => Promise<void>;
  initPreferences: () => Promise<void>;
  updatePreference: (id: number, enabled: boolean) => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  unreadCount: 0,
  notifications: [],
  preferences: [],
  loading: false,

  fetchUnreadCount: async () => {
    try {
      const res = await api.get(API_ENDPOINTS.NOTIFICATION_UNREAD_COUNT);
      set({ unreadCount: res.data.unread_count });
    } catch {
      // ignore
    }
  },

  fetchNotifications: async (channel?: string) => {
    set({ loading: true });
    try {
      const params: Record<string, string> = {};
      if (channel) params.channel = channel;
      const res = await api.get(API_ENDPOINTS.NOTIFICATION_LOGS, { params });
      set({ notifications: res.data.results });
    } catch {
      // ignore
    } finally {
      set({ loading: false });
    }
  },

  fetchPreferences: async () => {
    try {
      const res = await api.get(API_ENDPOINTS.NOTIFICATION_PREFERENCES);
      set({ preferences: res.data });
    } catch {
      // ignore
    }
  },

  initPreferences: async () => {
    try {
      const res = await api.post(API_ENDPOINTS.NOTIFICATION_PREFERENCES_INIT);
      set({ preferences: res.data.preferences });
    } catch {
      // ignore
    }
  },

  updatePreference: async (id: number, enabled: boolean) => {
    try {
      const res = await api.patch(API_ENDPOINTS.NOTIFICATION_PREFERENCES_UPDATE, [
        { id, enabled },
      ]);
      set({ preferences: res.data.preferences });
    } catch {
      // ignore
    }
  },

  markAsRead: async (id: number) => {
    try {
      await api.patch(API_ENDPOINTS.NOTIFICATION_LOG_READ(id));
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, is_read: true } : n,
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch {
      // ignore
    }
  },

  markAllAsRead: async () => {
    try {
      await api.post(API_ENDPOINTS.NOTIFICATION_MARK_ALL_READ);
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
        unreadCount: 0,
      }));
    } catch {
      // ignore
    }
  },
}));
