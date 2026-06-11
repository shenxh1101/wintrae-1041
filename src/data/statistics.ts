import type { StatisticsData, RoutePoint, Notification, GridWorker } from '@/types'

export const mockStatistics: StatisticsData = {
  gridName: '第一网格',
  totalVisits: 128,
  completedVisits: 112,
  totalEvents: 45,
  resolvedEvents: 38,
  overdueTasks: 2,
  performanceScore: 92,
  ranking: 3
}

export const mockGridStatistics: StatisticsData[] = [
  {
    gridName: '第一网格',
    totalVisits: 128,
    completedVisits: 112,
    totalEvents: 45,
    resolvedEvents: 38,
    overdueTasks: 2,
    performanceScore: 92,
    ranking: 3
  },
  {
    gridName: '第二网格',
    totalVisits: 142,
    completedVisits: 130,
    totalEvents: 52,
    resolvedEvents: 46,
    overdueTasks: 1,
    performanceScore: 95,
    ranking: 1
  },
  {
    gridName: '第三网格',
    totalVisits: 115,
    completedVisits: 98,
    totalEvents: 38,
    resolvedEvents: 30,
    overdueTasks: 4,
    performanceScore: 85,
    ranking: 5
  },
  {
    gridName: '第四网格',
    totalVisits: 136,
    completedVisits: 125,
    totalEvents: 48,
    resolvedEvents: 42,
    overdueTasks: 1,
    performanceScore: 94,
    ranking: 2
  },
  {
    gridName: '第五网格',
    totalVisits: 108,
    completedVisits: 95,
    totalEvents: 35,
    resolvedEvents: 28,
    overdueTasks: 3,
    performanceScore: 87,
    ranking: 4
  }
]

export const mockRoutePoints: RoutePoint[] = [
  {
    id: '1',
    name: '李明华家',
    address: '利民小区1栋1单元101',
    status: 'visited',
    time: '08:45'
  },
  {
    id: '2',
    name: '王桂英家',
    address: '幸福小区3栋2单元501',
    status: 'current',
    time: '09:15'
  },
  {
    id: '3',
    name: '和平街出租屋',
    address: '和平街156号出租屋',
    status: 'pending'
  },
  {
    id: '4',
    name: '社区广场宣传点',
    address: '社区文化广场',
    status: 'pending'
  },
  {
    id: '5',
    name: '刘秀兰家',
    address: '幸福小区1栋3单元402',
    status: 'pending'
  }
]

export const mockNotifications: Notification[] = [
  {
    id: '1',
    title: '新任务分配',
    content: '您有1条新的走访任务：走访独居老人王桂英，请及时处理。',
    time: '2024-01-15 08:30',
    type: 'task',
    read: false
  },
  {
    id: '2',
    title: '紧急事件上报',
    content: '利民小区1栋2单元楼道杂物堆积，存在消防隐患，请尽快处理。',
    time: '2024-01-15 07:30',
    type: 'event',
    read: false
  },
  {
    id: '3',
    title: '系统通知',
    content: '本月绩效考核已发布，请登录查看个人绩效详情。',
    time: '2024-01-14 18:00',
    type: 'system',
    read: true
  },
  {
    id: '4',
    title: '任务超时提醒',
    content: '您有1条任务即将超时：走访残疾人家庭，请尽快处理。',
    time: '2024-01-14 16:00',
    type: 'task',
    read: true
  },
  {
    id: '5',
    title: '天气预警',
    content: '预计今日有大风降温天气，请注意出行安全，做好防寒保暖。',
    time: '2024-01-15 06:00',
    type: 'system',
    read: true
  }
]

export const mockGridWorker: GridWorker = {
  id: '1',
  name: '李明',
  grid: '第一网格',
  gridCode: 'W001',
  phone: '138****8888'
}

export const grids = ['第一网格', '第二网格', '第三网格', '第四网格', '第五网格']

export const eventTypes = [
  { value: 'security', label: '治安事件' },
  { value: 'environment', label: '环境问题' },
  { value: 'facility', label: '设施故障' },
  { value: 'conflict', label: '矛盾纠纷' },
  { value: 'other', label: '其他事件' }
]

export const urgencyLevels = [
  { value: 'high', label: '紧急', color: '#f53f3f' },
  { value: 'medium', label: '一般', color: '#ff7d00' },
  { value: 'low', label: '低', color: '#00b42a' }
]
