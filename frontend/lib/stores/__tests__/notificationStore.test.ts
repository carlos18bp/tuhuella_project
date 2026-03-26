import { describe, it, expect, beforeEach } from '@jest/globals'
import { act } from '@testing-library/react'

import { useNotificationStore } from '../notificationStore'
import { api } from '../../services/http'

jest.mock('../../services/http', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  },
}))

const mockApi = api as jest.Mocked<typeof api>

const NOTIFICATION_FIXTURE = {
  id: 1,
  event_key: 'adoption_approved',
  channel: 'in_app',
  status: 'sent',
  metadata: { animal_name: 'Luna' },
  is_read: false,
  sent_at: '2026-03-26T10:00:00Z',
  created_at: '2026-03-26T09:59:00Z',
}

const PREFERENCE_FIXTURE = {
  id: 1,
  event_key: 'adoption_approved',
  channel: 'in_app',
  enabled: true,
}

describe('notificationStore', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useNotificationStore.setState({
      unreadCount: 0,
      notifications: [],
      preferences: [],
      loading: false,
    })
  })

  // ---------------------------------------------------------------------------
  // fetchUnreadCount
  // ---------------------------------------------------------------------------

  describe('fetchUnreadCount', () => {
    it('fetches unread count and stores it in state', async () => {
      mockApi.get.mockResolvedValueOnce({ data: { unread_count: 5 } })

      await act(async () => {
        await useNotificationStore.getState().fetchUnreadCount()
      })

      expect(useNotificationStore.getState().unreadCount).toBe(5)
    })

    it('does not crash when fetchUnreadCount API call fails', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Network error'))

      await act(async () => {
        await useNotificationStore.getState().fetchUnreadCount()
      })

      expect(useNotificationStore.getState().unreadCount).toBe(0)
    })
  })

  // ---------------------------------------------------------------------------
  // fetchNotifications
  // ---------------------------------------------------------------------------

  describe('fetchNotifications', () => {
    it('fetches notifications without channel param and stores results', async () => {
      mockApi.get.mockResolvedValueOnce({
        data: { results: [NOTIFICATION_FIXTURE] },
      })

      await act(async () => {
        await useNotificationStore.getState().fetchNotifications()
      })

      const state = useNotificationStore.getState()
      expect(state.notifications).toHaveLength(1)
      expect(state.notifications[0].event_key).toBe('adoption_approved')
      expect(state.loading).toBe(false)
    })

    it('fetches notifications with channel param and passes it to API', async () => {
      mockApi.get.mockResolvedValueOnce({
        data: { results: [NOTIFICATION_FIXTURE] },
      })

      await act(async () => {
        await useNotificationStore.getState().fetchNotifications('in_app')
      })

      expect(mockApi.get).toHaveBeenCalledWith(
        expect.any(String),
        { params: { channel: 'in_app' } },
      )
      expect(useNotificationStore.getState().notifications).toHaveLength(1)
    })

    it('does not include channel param when called without argument', async () => {
      mockApi.get.mockResolvedValueOnce({ data: { results: [] } })

      await act(async () => {
        await useNotificationStore.getState().fetchNotifications()
      })

      expect(mockApi.get).toHaveBeenCalledWith(
        expect.any(String),
        { params: {} },
      )
    })

    it('sets loading to false after successful fetch', async () => {
      mockApi.get.mockResolvedValueOnce({ data: { results: [] } })

      await act(async () => {
        await useNotificationStore.getState().fetchNotifications()
      })

      expect(useNotificationStore.getState().loading).toBe(false)
    })

    it('sets loading to false even when fetchNotifications API call fails', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Network error'))

      await act(async () => {
        await useNotificationStore.getState().fetchNotifications()
      })

      expect(useNotificationStore.getState().loading).toBe(false)
    })

    it('does not crash when fetchNotifications API call fails', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Network error'))

      await act(async () => {
        await useNotificationStore.getState().fetchNotifications('email')
      })

      expect(useNotificationStore.getState().notifications).toEqual([])
    })
  })

  // ---------------------------------------------------------------------------
  // fetchPreferences
  // ---------------------------------------------------------------------------

  describe('fetchPreferences', () => {
    it('fetches preferences and stores them in state', async () => {
      mockApi.get.mockResolvedValueOnce({ data: [PREFERENCE_FIXTURE] })

      await act(async () => {
        await useNotificationStore.getState().fetchPreferences()
      })

      const state = useNotificationStore.getState()
      expect(state.preferences).toHaveLength(1)
      expect(state.preferences[0].event_key).toBe('adoption_approved')
    })

    it('does not crash when fetchPreferences API call fails', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Network error'))

      await act(async () => {
        await useNotificationStore.getState().fetchPreferences()
      })

      expect(useNotificationStore.getState().preferences).toEqual([])
    })
  })

  // ---------------------------------------------------------------------------
  // initPreferences
  // ---------------------------------------------------------------------------

  describe('initPreferences', () => {
    it('initialises preferences via POST and stores returned preferences', async () => {
      mockApi.post.mockResolvedValueOnce({
        data: { preferences: [PREFERENCE_FIXTURE] },
      })

      await act(async () => {
        await useNotificationStore.getState().initPreferences()
      })

      const state = useNotificationStore.getState()
      expect(state.preferences).toHaveLength(1)
      expect(state.preferences[0].channel).toBe('in_app')
    })

    it('does not crash when initPreferences API call fails', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('Network error'))

      await act(async () => {
        await useNotificationStore.getState().initPreferences()
      })

      expect(useNotificationStore.getState().preferences).toEqual([])
    })
  })

  // ---------------------------------------------------------------------------
  // updatePreference
  // ---------------------------------------------------------------------------

  describe('updatePreference', () => {
    it('sends PATCH with id and enabled flag and stores updated preferences', async () => {
      const updatedPreference = { ...PREFERENCE_FIXTURE, enabled: false }
      mockApi.patch.mockResolvedValueOnce({
        data: { preferences: [updatedPreference] },
      })

      await act(async () => {
        await useNotificationStore.getState().updatePreference(1, false)
      })

      expect(mockApi.patch).toHaveBeenCalledWith(
        expect.any(String),
        [{ id: 1, enabled: false }],
      )
      const state = useNotificationStore.getState()
      expect(state.preferences[0].enabled).toBe(false)
    })

    it('does not crash when updatePreference API call fails', async () => {
      mockApi.patch.mockRejectedValueOnce(new Error('Network error'))

      await act(async () => {
        await useNotificationStore.getState().updatePreference(1, false)
      })

      expect(useNotificationStore.getState().preferences).toEqual([])
    })
  })

  // ---------------------------------------------------------------------------
  // markAsRead
  // ---------------------------------------------------------------------------

  describe('markAsRead', () => {
    it('marks the matching notification as read and decrements unreadCount', async () => {
      useNotificationStore.setState({
        notifications: [
          { ...NOTIFICATION_FIXTURE, id: 1, is_read: false },
          { ...NOTIFICATION_FIXTURE, id: 2, is_read: false },
        ],
        unreadCount: 2,
      })
      mockApi.patch.mockResolvedValueOnce({})

      await act(async () => {
        await useNotificationStore.getState().markAsRead(1)
      })

      const state = useNotificationStore.getState()
      expect(state.notifications[0].is_read).toBe(true)
      expect(state.notifications[1].is_read).toBe(false)
      expect(state.unreadCount).toBe(1)
    })

    it('does not decrement unreadCount below zero', async () => {
      useNotificationStore.setState({
        notifications: [{ ...NOTIFICATION_FIXTURE, id: 1, is_read: false }],
        unreadCount: 0,
      })
      mockApi.patch.mockResolvedValueOnce({})

      await act(async () => {
        await useNotificationStore.getState().markAsRead(1)
      })

      expect(useNotificationStore.getState().unreadCount).toBe(0)
    })

    it('does not crash when markAsRead API call fails', async () => {
      useNotificationStore.setState({
        notifications: [{ ...NOTIFICATION_FIXTURE, id: 1, is_read: false }],
        unreadCount: 1,
      })
      mockApi.patch.mockRejectedValueOnce(new Error('Network error'))

      await act(async () => {
        await useNotificationStore.getState().markAsRead(1)
      })

      const state = useNotificationStore.getState()
      expect(state.notifications[0].is_read).toBe(false)
      expect(state.unreadCount).toBe(1)
    })
  })

  // ---------------------------------------------------------------------------
  // markAllAsRead
  // ---------------------------------------------------------------------------

  describe('markAllAsRead', () => {
    it('marks all notifications as read and resets unreadCount to zero', async () => {
      useNotificationStore.setState({
        notifications: [
          { ...NOTIFICATION_FIXTURE, id: 1, is_read: false },
          { ...NOTIFICATION_FIXTURE, id: 2, is_read: false },
          { ...NOTIFICATION_FIXTURE, id: 3, is_read: true },
        ],
        unreadCount: 2,
      })
      mockApi.post.mockResolvedValueOnce({})

      await act(async () => {
        await useNotificationStore.getState().markAllAsRead()
      })

      const state = useNotificationStore.getState()
      expect(state.notifications.every((n) => n.is_read)).toBe(true)
      expect(state.unreadCount).toBe(0)
    })

    it('does not crash when markAllAsRead API call fails', async () => {
      useNotificationStore.setState({
        notifications: [{ ...NOTIFICATION_FIXTURE, id: 1, is_read: false }],
        unreadCount: 1,
      })
      mockApi.post.mockRejectedValueOnce(new Error('Network error'))

      await act(async () => {
        await useNotificationStore.getState().markAllAsRead()
      })

      const state = useNotificationStore.getState()
      expect(state.notifications[0].is_read).toBe(false)
      expect(state.unreadCount).toBe(1)
    })
  })
})
