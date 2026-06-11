import { create } from 'zustand'
import type { Task, Event, Notification, Resident } from '@/types'
import { mockTasks } from '@/data/tasks'
import { mockEvents } from '@/data/events'
import { mockNotifications } from '@/data/statistics'
import { mockResidents } from '@/data/residents'

interface AppState {
  tasks: Task[]
  events: Event[]
  notifications: Notification[]
  residents: Resident[]

  checkIn: (taskId: string, address: string) => void
  updateTaskPhotos: (taskId: string, photos: string[]) => void
  addTaskPhoto: (taskId: string, photo: string) => void
  removeTaskPhoto: (taskId: string, index: number) => void
  updateTaskVoice: (taskId: string, duration: number, url: string) => void
  updateTaskRemark: (taskId: string, remark: string) => void
  completeTask: (taskId: string) => void

  addEvent: (event: Omit<Event, 'id' | 'reportTime' | 'reporter' | 'status'>) => void

  markNotificationRead: (id: string) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  tasks: [...mockTasks],
  events: [...mockEvents],
  notifications: [...mockNotifications],
  residents: [...mockResidents],

  checkIn: (taskId: string, address: string) => {
    console.log('[Store] checkIn:', taskId, address)
    const now = new Date()
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: t.status === 'pending' ? 'in_progress' : t.status,
              checkInTime: timeStr,
              checkInAddress: address
            }
          : t
      )
    }))
  },

  updateTaskPhotos: (taskId: string, photos: string[]) => {
    console.log('[Store] updateTaskPhotos:', taskId, photos.length)
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, photos } : t
      )
    }))
  },

  addTaskPhoto: (taskId: string, photo: string) => {
    console.log('[Store] addTaskPhoto:', taskId)
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, photos: [...(t.photos || []), photo] } : t
      )
    }))
  },

  removeTaskPhoto: (taskId: string, index: number) => {
    console.log('[Store] removeTaskPhoto:', taskId, index)
    set((state) => ({
      tasks: state.tasks.map((t) => {
        if (t.id !== taskId) return t
        const photos = [...(t.photos || [])]
        photos.splice(index, 1)
        return { ...t, photos }
      })
    }))
  },

  updateTaskVoice: (taskId: string, duration: number, url: string) => {
    console.log('[Store] updateTaskVoice:', taskId, duration)
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, voiceNote: JSON.stringify({ duration, url, time: Date.now() }) }
          : t
      )
    }))
  },

  updateTaskRemark: (taskId: string, remark: string) => {
    console.log('[Store] updateTaskRemark:', taskId)
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, remark } : t
      )
    }))
  },

  completeTask: (taskId: string) => {
    console.log('[Store] completeTask:', taskId)
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, status: 'completed' } : t
      )
    }))
  },

  addEvent: (eventData) => {
    console.log('[Store] addEvent:', eventData)
    const now = new Date()
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const newEvent: Event = {
      ...eventData,
      id: `new_${Date.now()}`,
      status: 'pending',
      reporter: '李网格员',
      reportTime: timeStr
    }
    const newNotice: Notification = {
      id: `notice_${Date.now()}`,
      title: '事件上报成功',
      content: `${eventData.title} - 已进入待处理队列`,
      time: timeStr,
      type: 'event',
      read: false
    }
    set((state) => ({
      events: [newEvent, ...state.events],
      notifications: [newNotice, ...state.notifications]
    }))
  },

  markNotificationRead: (id: string) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    }))
  }
}))
