import type { Task } from '@/types'

export const mockTasks: Task[] = [
  {
    id: '1',
    title: '走访独居老人王桂英',
    type: 'visit',
    status: 'in_progress',
    urgency: 'high',
    grid: '第一网格',
    address: '幸福小区3栋2单元501',
    description: '走访独居老人王桂英，了解生活状况，检查用电用气安全，登记最新健康情况。',
    assignTime: '2024-01-15 08:30',
    deadline: '2024-01-15 18:00',
    residentName: '王桂英',
    residentPhone: '138****1234',
    checkInTime: '2024-01-15 09:15',
    remark: ''
  },
  {
    id: '2',
    title: '核实流动人口信息',
    type: 'verify',
    status: 'pending',
    urgency: 'medium',
    grid: '第一网格',
    address: '和平街156号出租屋',
    description: '核实新登记流动人口张三的身份信息、居住情况和就业信息。',
    assignTime: '2024-01-15 09:00',
    deadline: '2024-01-16 18:00',
    residentName: '张三',
    residentPhone: '139****5678',
    remark: ''
  },
  {
    id: '3',
    title: '冬季消防安全宣传',
    type: 'propaganda',
    status: 'pending',
    urgency: 'low',
    grid: '第一网格',
    address: '辖区各小区',
    description: '开展冬季消防安全宣传，发放宣传资料，提醒居民注意用电用气安全。',
    assignTime: '2024-01-14 10:00',
    deadline: '2024-01-20 18:00',
    remark: '需发放宣传手册50份'
  },
  {
    id: '4',
    title: '走访低保户李明华',
    type: 'visit',
    status: 'completed',
    urgency: 'medium',
    grid: '第一网格',
    address: '利民小区1栋1单元101',
    description: '走访低保户李明华家庭，了解近期生活状况，确认低保金发放情况。',
    assignTime: '2024-01-15 08:00',
    deadline: '2024-01-15 12:00',
    residentName: '李明华',
    residentPhone: '137****9012',
    checkInTime: '2024-01-15 08:45',
    remark: '家庭情况正常，低保金已按时发放。'
  },
  {
    id: '5',
    title: '核实党员组织关系',
    type: 'verify',
    status: 'completed',
    urgency: 'low',
    grid: '第一网格',
    address: '建设小区5栋3单元202',
    description: '核实退休党员陈建国的组织关系转接情况，确认党员信息。',
    assignTime: '2024-01-14 14:00',
    deadline: '2024-01-15 18:00',
    residentName: '陈建国',
    residentPhone: '136****3456',
    checkInTime: '2024-01-14 16:20',
    remark: '党员信息已核实无误。'
  },
  {
    id: '6',
    title: '反诈宣传进社区',
    type: 'propaganda',
    status: 'completed',
    urgency: 'medium',
    grid: '第一网格',
    address: '社区广场',
    description: '开展反诈宣传活动，向居民普及反诈知识，提高防骗意识。',
    assignTime: '2024-01-13 09:00',
    deadline: '2024-01-14 18:00',
    checkInTime: '2024-01-13 09:30',
    remark: '现场参与居民约80人，发放宣传资料100余份。'
  },
  {
    id: '7',
    title: '走访残疾人家庭',
    type: 'visit',
    status: 'overdue',
    urgency: 'high',
    grid: '第二网格',
    address: '友爱巷23号',
    description: '走访残疾人赵晓燕家庭，了解康复情况和生活困难。',
    assignTime: '2024-01-13 08:00',
    deadline: '2024-01-14 18:00',
    residentName: '赵晓燕',
    residentPhone: '135****7890',
    remark: ''
  },
  {
    id: '8',
    title: '核实新生人口信息',
    type: 'verify',
    status: 'pending',
    urgency: 'low',
    grid: '第二网格',
    address: '阳光花园2栋4单元601',
    description: '核实新生婴儿信息，更新人口台账。',
    assignTime: '2024-01-15 10:00',
    deadline: '2024-01-17 18:00',
    residentName: '刘洋（婴儿父）',
    residentPhone: '134****2345',
    remark: ''
  }
]

export const getTaskTypeLabel = (type: string): string => {
  const map: Record<string, string> = {
    visit: '走访任务',
    verify: '核查任务',
    propaganda: '宣传任务'
  }
  return map[type] || type
}

export const getTaskStatusLabel = (status: string): string => {
  const map: Record<string, string> = {
    pending: '待处理',
    in_progress: '进行中',
    completed: '已完成',
    overdue: '已超时'
  }
  return map[status] || status
}

export const getUrgencyLabel = (urgency: string): string => {
  const map: Record<string, string> = {
    high: '紧急',
    medium: '一般',
    low: '低'
  }
  return map[urgency] || urgency
}
