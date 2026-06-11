import { create } from 'zustand'
import Taro from '@tarojs/taro'
import type { Task, Event, Notification, Resident, EventStatus } from '@/types'
import { mockTasks } from '@/data/tasks'
import { mockEvents } from '@/data/events'
import { mockNotifications, mockGridWorker } from '@/data/statistics'
import { mockResidents } from '@/data/residents'

const STORAGE_KEY = 'grid_app_state_v1'

interface PersistState {
  tasks: Task[]
  events: Event[]
  notifications: Notification[]
  residents: Resident[]
}

const loadFromStorage = (): PersistState | null => {
  try {
    const raw = Taro.getStorageSync(STORAGE_KEY)
    if (raw && typeof raw === 'object') {
      return raw as PersistState
    }
    if (raw && typeof raw === 'string') {
      return JSON.parse(raw)
    }
    return null
  } catch (e) {
    console.warn('[Store] 读取本地存储失败:', e)
    return null
  }
}

const saveToStorage = (state: PersistState) => {
  try {
    Taro.setStorageSync(STORAGE_KEY, state)
  } catch (e) {
    console.warn('[Store] 写入本地存储失败:', e)
  }
}

const initState = (() => {
  const cached = loadFromStorage()
  if (cached) {
    console.log('[Store] 从本地缓存恢复数据')
    return cached
  }
  console.log('[Store] 使用初始 Mock 数据')
  return {
    tasks: [...mockTasks],
    events: [...mockEvents],
    notifications: [...mockNotifications],
    residents: [...mockResidents]
  }
})()

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
  updateEventStatus: (eventId: string, status: EventStatus, handleResult?: string, handlePhotos?: string[]) => void
  addEventHandlePhoto: (eventId: string, photo: string) => void
  removeEventHandlePhoto: (eventId: string, index: number) => void

  markNotificationRead: (id: string) => void
  resetAllData: () => void
}

const persistMiddleware = (fn: any) => (set: any, get: any, ...args: any[]) => {
  const result = fn(set, get, ...args)
  const state = get()
  saveToStorage({
    tasks: state.tasks,
    events: state.events,
    notifications: state.notifications,
    residents: state.residents
  })
  return result
}

export const useAppStore = create<AppState>((set, get) => ({
  tasks: initState.tasks,
  events: initState.events,
  notifications: initState.notifications,
  residents: initState.residents,

  checkIn: persistMiddleware((_set: any) => (taskId: string, address: string) => {
    console.log('[Store] checkIn:', taskId, address)
    const now = new Date()
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    set((state: AppState) => ({
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
  })(set, get),

  updateTaskPhotos: persistMiddleware((_set: any) => (taskId: string, photos: string[]) => {
    console.log('[Store] updateTaskPhotos:', taskId, photos.length)
    set((state: AppState) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, photos } : t
      )
    }))
  })(set, get),

  addTaskPhoto: persistMiddleware((_set: any) => (taskId: string, photo: string) => {
    console.log('[Store] addTaskPhoto:', taskId)
    const now = new Date()
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    set((state: AppState) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, photos: [...(t.photos || []), photo], photoTime: timeStr } : t
      )
    }))
  })(set, get),

  removeTaskPhoto: persistMiddleware((_set: any) => (taskId: string, index: number) => {
    console.log('[Store] removeTaskPhoto:', taskId, index)
    set((state: AppState) => ({
      tasks: state.tasks.map((t) => {
        if (t.id !== taskId) return t
        const photos = [...(t.photos || [])]
        photos.splice(index, 1)
        return { ...t, photos }
      })
    }))
  })(set, get),

  updateTaskVoice: persistMiddleware((_set: any) => (taskId: string, duration: number, url: string) => {
    console.log('[Store] updateTaskVoice:', taskId, duration)
    const now = new Date()
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    set((state: AppState) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, voiceNote: JSON.stringify({ duration, url, time: Date.now() }), voiceTime: timeStr }
          : t
      )
    }))
  })(set, get),

  updateTaskRemark: persistMiddleware((_set: any) => (taskId: string, remark: string) => {
    console.log('[Store] updateTaskRemark:', taskId)
    const now = new Date()
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    set((state: AppState) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, remark, remarkTime: timeStr } : t
      )
    }))
  })(set, get),

  completeTask: persistMiddleware((_set: any) => (taskId: string) => {
    console.log('[Store] completeTask:', taskId)
    const now = new Date()
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    set((state: AppState) => {
      const task = state.tasks.find((t) => t.id === taskId)
      const newNotice: Notification = {
        id: `notice_task_${Date.now()}`,
        title: '任务完成',
        content: `${task?.title || '任务'} 已完成`,
        time: timeStr,
        type: 'task',
        read: false
      }
      return {
        tasks: state.tasks.map((t) =>
          t.id === taskId ? { ...t, status: 'completed' as const, completeTime: timeStr } : t
        ),
        notifications: [newNotice, ...state.notifications]
      }
    })
  })(set, get),

  addEvent: persistMiddleware((_set: any) => (eventData: Omit<Event, 'id' | 'reportTime' | 'reporter' | 'status'>) => {
    console.log('[Store] addEvent:', eventData)
    const now = new Date()
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const newEvent: Event = {
      ...eventData,
      id: `evt_${Date.now()}`,
      status: 'pending',
      reporter: mockGridWorker.name,
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
    set((state: AppState) => ({
      events: [newEvent, ...state.events],
      notifications: [newNotice, ...state.notifications]
    }))
  })(set, get),

  updateEventStatus: persistMiddleware((_set: any) => (eventId: string, status: EventStatus, handleResult?: string, handlePhotos?: string[]) => {
    console.log('[Store] updateEventStatus:', eventId, status)
    const now = new Date()
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    set((state: AppState) => {
      const event = state.events.find((e) => e.id === eventId)
      const statusLabel = status === 'processing' ? '处理中' : status === 'resolved' ? '已解决' : status === 'closed' ? '已关闭' : '待处理'
      const newNotice: Notification = {
        id: `notice_evt_${Date.now()}`,
        title: `事件状态变更:${statusLabel}`,
        content: `${event?.title || '事件'}`,
        time: timeStr,
        type: 'event',
        read: false
      }
      return {
        events: state.events.map((e) => {
          if (e.id !== eventId) return e
          const updated: Event = {
            ...e,
            status,
            handler: mockGridWorker.name,
            handleTime: timeStr,
            handleResult: handleResult !== undefined ? handleResult : e.handleResult,
            handlePhotos: handlePhotos !== undefined ? handlePhotos : e.handlePhotos
          }
          if (status === 'processing' && !e.processTime) {
            updated.processTime = timeStr
          }
          if (status === 'resolved' || status === 'closed') {
            updated.resolvedTime = timeStr
          }
          return updated
        }),
        notifications: [newNotice, ...state.notifications]
      }
    })
  })(set, get),

  addEventHandlePhoto: persistMiddleware((_set: any) => (eventId: string, photo: string) => {
    console.log('[Store] addEventHandlePhoto:', eventId)
    set((state: AppState) => ({
      events: state.events.map((e) =>
        e.id === eventId ? { ...e, handlePhotos: [...(e.handlePhotos || []), photo] } : e
      )
    }))
  })(set, get),

  removeEventHandlePhoto: persistMiddleware((_set: any) => (eventId: string, index: number) => {
    console.log('[Store] removeEventHandlePhoto:', eventId, index)
    set((state: AppState) => ({
      events: state.events.map((e) => {
        if (e.id !== eventId) return e
        const photos = [...(e.handlePhotos || [])]
        photos.splice(index, 1)
        return { ...e, handlePhotos: photos }
      })
    }))
  })(set, get),

  markNotificationRead: persistMiddleware((_set: any) => (id: string) => {
    set((state: AppState) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    }))
  })(set, get),

  resetAllData: () => {
    console.log('[Store] resetAllData - 恢复初始数据')
    try {
      Taro.removeStorageSync(STORAGE_KEY)
    } catch (e) {
      console.warn(e)
    }
    set({
      tasks: [...mockTasks],
      events: [...mockEvents],
      notifications: [...mockNotifications],
      residents: [...mockResidents]
    })
    Taro.showToast({ title: '已恢复初始数据', icon: 'success' })
  }
}))
