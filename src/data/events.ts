import type { Event } from '@/types'

export const mockEvents: Event[] = [
  {
    id: '1',
    title: '小区路灯损坏',
    type: 'facility',
    status: 'processing',
    urgency: 'medium',
    grid: '第一网格',
    address: '幸福小区南门东侧',
    description: '幸福小区南门东侧路灯不亮，夜间出行不便，存在安全隐患。',
    reporter: '张居民',
    reportTime: '2024-01-15 08:20',
    handler: '李网格员',
    handleTime: '2024-01-15 09:00'
  },
  {
    id: '2',
    title: '楼道杂物堆积',
    type: 'environment',
    status: 'pending',
    urgency: 'high',
    grid: '第一网格',
    address: '利民小区1栋2单元3楼',
    description: '楼道内堆积大量旧家具和杂物，影响通行，存在消防隐患。',
    reporter: '王居民',
    reportTime: '2024-01-15 07:30'
  },
  {
    id: '3',
    title: '邻里噪音纠纷',
    type: 'conflict',
    status: 'resolved',
    urgency: 'low',
    grid: '第一网格',
    address: '建设小区3栋4单元501',
    description: '楼上住户夜间噪音过大，影响楼下居民休息，双方产生矛盾。',
    reporter: '刘居民',
    reportTime: '2024-01-14 22:00',
    handler: '李网格员',
    handleTime: '2024-01-15 10:00'
  },
  {
    id: '4',
    title: '陌生人频繁出入',
    type: 'security',
    status: 'processing',
    urgency: 'high',
    grid: '第一网格',
    address: '和平街156号出租屋',
    description: '近期有多名陌生人频繁出入该出租屋，行迹可疑，居民反映有安全顾虑。',
    reporter: '匿名',
    reportTime: '2024-01-14 16:45',
    handler: '李网格员'
  },
  {
    id: '5',
    title: '下水道堵塞',
    type: 'facility',
    status: 'resolved',
    urgency: 'medium',
    grid: '第二网格',
    address: '友爱巷23号',
    description: '下水道堵塞，污水外溢，影响居民正常生活。',
    reporter: '赵居民',
    reportTime: '2024-01-13 10:00',
    handler: '王网格员',
    handleTime: '2024-01-13 15:30'
  },
  {
    id: '6',
    title: '垃圾分类宣传不到位',
    type: 'other',
    status: 'closed',
    urgency: 'low',
    grid: '第一网格',
    address: '阳光花园小区',
    description: '居民对垃圾分类标准不熟悉，建议加强宣传指导。',
    reporter: '陈居民',
    reportTime: '2024-01-12 09:00',
    handler: '李网格员',
    handleTime: '2024-01-13 16:00'
  }
]

export const getEventTypeLabel = (type: string): string => {
  const map: Record<string, string> = {
    security: '治安事件',
    environment: '环境问题',
    facility: '设施故障',
    conflict: '矛盾纠纷',
    other: '其他事件'
  }
  return map[type] || type
}

export const getEventStatusLabel = (status: string): string => {
  const map: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    resolved: '已解决',
    closed: '已关闭'
  }
  return map[status] || status
}
