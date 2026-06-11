import type { Resident } from '@/types'

export const mockResidents: Resident[] = [
  {
    id: '1',
    name: '王桂英',
    gender: 'female',
    age: 78,
    idCard: '51010***********1234',
    phone: '138****1234',
    grid: '第一网格',
    address: '幸福小区3栋2单元501',
    householdType: 'local',
    tags: ['elderly', 'special_care'],
    specialCare: true,
    contactRecords: [
      {
        id: 'r1-1',
        time: '2024-01-15 09:15',
        type: 'visit',
        content: '上门走访，了解生活状况，检查用电用气安全。老人身体状况良好，子女每周探望一次。',
        operator: '李网格员'
      },
      {
        id: 'r1-2',
        time: '2024-01-08 14:30',
        type: 'phone',
        content: '电话回访，确认年货准备情况，提醒注意保暖。',
        operator: '李网格员'
      },
      {
        id: 'r1-3',
        time: '2024-01-02 10:00',
        type: 'event',
        content: '协助办理高龄津贴认证手续。',
        operator: '李网格员'
      }
    ]
  },
  {
    id: '2',
    name: '李明华',
    gender: 'male',
    age: 62,
    idCard: '51010***********5678',
    phone: '137****9012',
    grid: '第一网格',
    address: '利民小区1栋1单元101',
    householdType: 'local',
    tags: ['low_income', 'disabled', 'special_care'],
    specialCare: true,
    contactRecords: [
      {
        id: 'r2-1',
        time: '2024-01-15 08:45',
        type: 'visit',
        content: '走访低保户家庭，确认低保金发放情况，了解生活困难。',
        operator: '李网格员'
      },
      {
        id: 'r2-2',
        time: '2024-01-05 11:20',
        type: 'visit',
        content: '送温暖活动，发放米油等生活物资。',
        operator: '李网格员'
      }
    ]
  },
  {
    id: '3',
    name: '陈建国',
    gender: 'male',
    age: 68,
    idCard: '51010***********9012',
    phone: '136****3456',
    grid: '第一网格',
    address: '建设小区5栋3单元202',
    householdType: 'local',
    tags: ['elderly', 'party_member'],
    specialCare: false,
    contactRecords: [
      {
        id: 'r3-1',
        time: '2024-01-14 16:20',
        type: 'visit',
        content: '核实党员组织关系，确认党员信息。',
        operator: '李网格员'
      }
    ]
  },
  {
    id: '4',
    name: '张三',
    gender: 'male',
    age: 32,
    idCard: '42010***********3456',
    phone: '139****5678',
    grid: '第一网格',
    address: '和平街156号出租屋',
    householdType: 'migrant',
    tags: ['left_behind'],
    specialCare: false,
    contactRecords: [
      {
        id: 'r4-1',
        time: '2024-01-10 09:00',
        type: 'visit',
        content: '流动人口信息登记。',
        operator: '李网格员'
      }
    ]
  },
  {
    id: '5',
    name: '赵晓燕',
    gender: 'female',
    age: 45,
    idCard: '51010***********7890',
    phone: '135****7890',
    grid: '第二网格',
    address: '友爱巷23号',
    householdType: 'local',
    tags: ['disabled', 'special_care'],
    specialCare: true,
    contactRecords: []
  },
  {
    id: '6',
    name: '刘洋',
    gender: 'male',
    age: 30,
    idCard: '51010***********2345',
    phone: '134****2345',
    grid: '第二网格',
    address: '阳光花园2栋4单元601',
    householdType: 'local',
    tags: [],
    specialCare: false,
    contactRecords: []
  },
  {
    id: '7',
    name: '刘秀兰',
    gender: 'female',
    age: 72,
    idCard: '51010***********4567',
    phone: '133****6789',
    grid: '第一网格',
    address: '幸福小区1栋3单元402',
    householdType: 'local',
    tags: ['elderly', 'special_care'],
    specialCare: true,
    contactRecords: []
  },
  {
    id: '8',
    name: '王大伟',
    gender: 'male',
    age: 35,
    idCard: '51010***********8901',
    phone: '132****0123',
    grid: '第一网格',
    address: '利民小区2栋2单元301',
    householdType: 'local',
    tags: ['party_member'],
    specialCare: false,
    contactRecords: []
  },
  {
    id: '9',
    name: '李小明',
    gender: 'male',
    age: 12,
    idCard: '51010***********0123',
    phone: '无',
    grid: '第一网格',
    address: '建设小区3栋1单元101',
    householdType: 'local',
    tags: ['left_behind'],
    specialCare: false,
    contactRecords: []
  },
  {
    id: '10',
    name: '张婆婆',
    gender: 'female',
    age: 85,
    idCard: '51010***********6789',
    phone: '131****4567',
    grid: '第一网格',
    address: '和平街128号',
    householdType: 'local',
    tags: ['elderly', 'special_care'],
    specialCare: true,
    contactRecords: []
  }
]

export const getResidentTagLabel = (tag: string): string => {
  const map: Record<string, string> = {
    elderly: '老年人',
    disabled: '残疾人',
    low_income: '低保户',
    left_behind: '留守人员',
    special_care: '特殊关怀',
    party_member: '党员'
  }
  return map[tag] || tag
}

export const getHouseholdTypeLabel = (type: string): string => {
  return type === 'local' ? '本地户籍' : '流动人口'
}

export const getContactTypeLabel = (type: string): string => {
  const map: Record<string, string> = {
    visit: '上门走访',
    phone: '电话联系',
    event: '事项办理'
  }
  return map[type] || type
}
