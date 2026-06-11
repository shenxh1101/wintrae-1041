import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView, Button, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import ResidentCard from '@/components/ResidentCard'
import { mockResidents, getResidentTagLabel, getContactTypeLabel, getHouseholdTypeLabel } from '@/data/residents'
import type { Resident, ResidentTag } from '@/types'
import styles from './index.module.scss'

const tagFilters: { value: ResidentTag | 'all' | 'special_care'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'special_care', label: '特殊关怀' },
  { value: 'elderly', label: '老年人' },
  { value: 'disabled', label: '残疾人' },
  { value: 'low_income', label: '低保户' },
  { value: 'left_behind', label: '留守人员' },
  { value: 'party_member', label: '党员' }
]

const ResidentsPage: React.FC = () => {
  const [searchText, setSearchText] = useState('')
  const [activeTag, setActiveTag] = useState<ResidentTag | 'all' | 'special_care'>('all')
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  const filteredResidents = useMemo(() => {
    return mockResidents.filter((resident) => {
      const matchSearch = !searchText || resident.name.includes(searchText) || resident.address.includes(searchText)
      const matchTag = activeTag === 'all'
        ? true
        : activeTag === 'special_care'
          ? resident.specialCare
          : resident.tags.includes(activeTag as ResidentTag)
      return matchSearch && matchTag
    })
  }, [searchText, activeTag])

  const handleResidentClick = (resident: Resident) => {
    console.log('[Residents] 点击居民:', resident.id)
    setSelectedResident(resident)
    setShowDetail(true)
  }

  const handleTagChange = (tag: ResidentTag | 'all' | 'special_care') => {
    console.log('[Residents] 切换标签:', tag)
    setActiveTag(tag)
  }

  const handleCallResident = () => {
    if (!selectedResident) return
    console.log('[Residents] 联系居民:', selectedResident.phone)
    Taro.showToast({ title: '拨打电话功能演示', icon: 'none' })
  }

  const handleAddVisit = () => {
    console.log('[Residents] 新增走访')
    Taro.showToast({ title: '新增走访功能演示', icon: 'none' })
  }

  const handleCloseDetail = () => {
    setShowDetail(false)
    setSelectedResident(null)
  }

  return (
    <View className={styles.page}>
      {/* 搜索栏 */}
      <View className={styles.searchBar}>
        <View className={styles.searchInput}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            placeholder="搜索居民姓名、地址"
            value={searchText}
            onInput={(e) => setSearchText(e.detail.value)}
            style={{ flex: 1, fontSize: '28rpx' }}
          />
        </View>
      </View>

      {/* 标签筛选 */}
      <ScrollView scrollX className={styles.tagTabs}>
        {tagFilters.map((tag) => (
          <View
            key={tag.value}
            className={classnames(styles.tagTab, activeTag === tag.value && styles.active)}
            onClick={() => handleTagChange(tag.value)}
          >
            <Text>{tag.label}</Text>
          </View>
        ))}
      </ScrollView>

      {/* 居民列表 */}
      <ScrollView scrollY className={styles.residentList}>
        {filteredResidents.length > 0 ? (
          filteredResidents.map((resident) => (
            <ResidentCard
              key={resident.id}
              resident={resident}
              onClick={() => handleResidentClick(resident)}
            />
          ))
        ) : (
          <View className={styles.emptyState}>
            <View className={styles.emptyIcon}>
              <Text>👥</Text>
            </View>
            <Text className={styles.emptyText}>暂无匹配的居民</Text>
          </View>
        )}
      </ScrollView>

      {/* 居民详情弹窗 */}
      {showDetail && selectedResident && (
        <View className={styles.detailModal} onClick={handleCloseDetail}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalHeader}>
            <Text className={styles.modalTitle}>居民详情</Text>
            <View className={styles.closeBtn} onClick={handleCloseDetail}>
              <Text>×</Text>
            </View>
          </View>

          <ScrollView scrollY className={styles.modalBody}>
            {/* 居民头部信息 */}
            <View className={styles.residentHeader}>
              <View className={styles.residentAvatar}>
                <Text className={styles.avatarText}>{selectedResident.name.charAt(0)}</Text>
              </View>
              <View className={styles.residentInfo}>
                <Text className={styles.residentName}>{selectedResident.name}</Text>
                <Text className={styles.residentMeta}>
                  {selectedResident.gender === 'male' ? '男' : '女'} · {selectedResident.age}岁 · {getHouseholdTypeLabel(selectedResident.householdType)}
                </Text>
                <View className={styles.residentTags}>
                  {selectedResident.tags.map((tag) => (
                    <Text key={tag} className={styles.residentTag}>
                      {getResidentTagLabel(tag)}
                    </Text>
                  ))}
                </View>
              </View>
            </View>

            {/* 基本信息 */}
            <View className={styles.infoSection}>
              <Text className={styles.sectionTitle}>基本信息</Text>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>身份证号</Text>
                <Text className={styles.infoValue}>{selectedResident.idCard}</Text>
              </View>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>联系电话</Text>
                <Text className={styles.infoValue}>{selectedResident.phone}</Text>
              </View>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>所属网格</Text>
                <Text className={styles.infoValue}>{selectedResident.grid}</Text>
              </View>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>详细地址</Text>
                <Text className={styles.infoValue}>{selectedResident.address}</Text>
              </View>
            </View>

            {/* 户籍信息 */}
            <View className={styles.infoSection}>
              <Text className={styles.sectionTitle}>户籍信息</Text>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>户籍类型</Text>
                <Text className={styles.infoValue}>{getHouseholdTypeLabel(selectedResident.householdType)}</Text>
              </View>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>特殊关怀</Text>
                <Text className={styles.infoValue}>{selectedResident.specialCare ? '是' : '否'}</Text>
              </View>
            </View>

            {/* 联系记录 */}
            <View className={styles.infoSection}>
              <Text className={styles.sectionTitle}>联系记录</Text>
              {selectedResident.contactRecords.length > 0 ? (
                <View className={styles.contactList}>
                  {selectedResident.contactRecords.map((record) => (
                    <View key={record.id} className={styles.contactItem}>
                      <View className={styles.contactHeader}>
                        <Text className={styles.contactType}>{getContactTypeLabel(record.type)}</Text>
                        <Text className={styles.contactTime}>{record.time}</Text>
                      </View>
                      <Text className={styles.contactContent}>{record.content}</Text>
                      <Text className={styles.contactOperator}>操作人：{record.operator}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={{ fontSize: '28rpx', color: '#86909c' }}>暂无联系记录</Text>
              )}
            </View>
          </ScrollView>

          <View className={styles.modalFooter}>
            <Button
              className={classnames(styles.modalBtn, styles.outline)}
              onClick={handleCallResident}
            >
              电话联系
            </Button>
            <Button
              className={classnames(styles.modalBtn, styles.primary)}
              onClick={handleAddVisit}
            >
              新增走访
            </Button>
          </View>
        </View>
      </View>
    )}
  </View>
  )
}

export default ResidentsPage
