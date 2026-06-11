// 任务类型
export type TaskType = 'visit' | 'verify' | 'propaganda'

// 任务状态
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue'

// 紧急程度
export type UrgencyLevel = 'high' | 'medium' | 'low'

// 任务接口
export interface Task {
  id: string
  title: string
  type: TaskType
  status: TaskStatus
  urgency: UrgencyLevel
  grid: string
  address: string
  description: string
  assignTime: string
  deadline: string
  residentName?: string
  residentPhone?: string
  checkInTime?: string
  photos?: string[]
  voiceNote?: string
  remark?: string
}

// 事件类型
export type EventType = 'security' | 'environment' | 'facility' | 'conflict' | 'other'

// 事件状态
export type EventStatus = 'pending' | 'processing' | 'resolved' | 'closed'

// 事件接口
export interface Event {
  id: string
  title: string
  type: EventType
  status: EventStatus
  urgency: UrgencyLevel
  grid: string
  address: string
  description: string
  reporter: string
  reportTime: string
  handler?: string
  handleTime?: string
  photos?: string[]
}

// 居民标签
export type ResidentTag = 'elderly' | 'disabled' | 'low_income' | 'left_behind' | 'special_care' | 'party_member'

// 居民接口
export interface Resident {
  id: string
  name: string
  gender: 'male' | 'female'
  age: number
  idCard: string
  phone: string
  grid: string
  address: string
  householdType: 'local' | 'migrant'
  tags: ResidentTag[]
  specialCare: boolean
  avatar?: string
  contactRecords: ContactRecord[]
}

// 联系记录
export interface ContactRecord {
  id: string
  time: string
  type: 'visit' | 'phone' | 'event'
  content: string
  operator: string
}

// 通知接口
export interface Notification {
  id: string
  title: string
  content: string
  time: string
  type: 'system' | 'task' | 'event'
  read: boolean
}

// 路线站点
export interface RoutePoint {
  id: string
  name: string
  address: string
  status: 'visited' | 'current' | 'pending'
  time?: string
}

// 统计数据
export interface StatisticsData {
  gridName: string
  totalVisits: number
  completedVisits: number
  totalEvents: number
  resolvedEvents: number
  overdueTasks: number
  performanceScore: number
  ranking: number
}

// 网格员信息
export interface GridWorker {
  id: string
  name: string
  grid: string
  gridCode: string
  phone: string
  avatar?: string
}
