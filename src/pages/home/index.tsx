import React, { useMemo, useState } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import dayjs from 'dayjs'
import SectionHeader from '@/components/SectionHeader'
import EventCard from '@/components/EventCard'
import { mockRoutePoints, mockGridWorker } from '@/data/statistics'
import { getEventTypeLabel, getEventStatusLabel, getUrgencyLabel } from '@/data/events'
import { useAppStore } from '@/store'
import type { Event, EventStatus } from '@/types'
import styles from './index.module.scss'

const HomePage: React.FC = () => {
  const todayStr = dayjs().format('YYYY年MM月DD日 dddd')

  const tasks = useAppStore((s) => s.tasks)
  const events = useAppStore((s) => s.events)
  const notifications = useAppStore((s) => s.notifications)
  const markNotificationRead = useAppStore((s) => s.markNotificationRead)
  const updateEventStatus = useAppStore((s) => s.updateEventStatus)
  const addEventHandlePhoto = useAppStore((s) => s.addEventHandlePhoto)
  const removeEventHandlePhoto = useAppStore((s) => s.removeEventHandlePhoto)
  const resetAllData = useAppStore((s) => s.resetAllData)

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [handleResultText, setHandleResultText] = useState('')

  const pendingEvents = useMemo(() => {
    return events.filter((e) => e.status === 'pending' || e.status === 'processing').slice(0, 5)
  }, [events])

  const todayTasks = useMemo(() => {
    return tasks.filter((t) => t.grid === '第一网格').length
  }, [tasks])

  const completedTasks = useMemo(() => tasks.filter((t) => t.status === 'completed').length, [tasks])

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length
  }, [notifications])

  const selectedEvent = useMemo(() => {
    if (!selectedEventId) return null
    return events.find((e) => e.id === selectedEventId) || null
  }, [selectedEventId, events])

  React.useEffect(() => {
    if (selectedEvent?.handleResult !== undefined) {
      setHandleResultText(selectedEvent.handleResult || '')
    }
  }, [selectedEventId])

  const handleEventClick = (eventId: string) => {
    setSelectedEventId(eventId)
    setHandleResultText('')
  }

  const handleCloseEvent = () => {
    setSelectedEventId(null)
    setHandleResultText('')
  }

  const handleNoticeClick = (noticeId: string) => {
    const notice = notifications.find((n) => n.id === noticeId)
    if (notice) {
      if (!notice.read) markNotificationRead(noticeId)
      Taro.showModal({
        title: notice.title,
        content: notice.content,
        showCancel: false,
        confirmText: '知道了'
      })
    }
  }

  const handleRefresh = () => {
    setTimeout(() => {
      Taro.stopPullDownRefresh()
      Taro.showToast({ title: '刷新成功', icon: 'success' })
    }, 1000)
  }

  const handleMarkAllRead = () => {
    notifications.forEach((n) => {
      if (!n.read) markNotificationRead(n.id)
    })
    Taro.showToast({ title: '已全部标记为已读', icon: 'success' })
  }

  const handleResetData = () => {
    Taro.showModal({
      title: '确认重置',
      content: '所有签到、拍照、语音、上报等数据都将恢复为初始演示数据,确定继续吗?',
      success: (res) => {
        if (res.confirm) resetAllData()
      }
    })
  }

  const handleAddHandlePhoto = async () => {
    if (!selectedEvent) return
    try {
      Taro.showActionSheet({
        itemList: ['拍照', '从相册选择'],
        success: async (res) => {
          const sourceType = res.tapIndex === 0 ? ['camera'] : ['album']
          const remaining = 9 - (selectedEvent.handlePhotos?.length || 0)
          if (remaining <= 0) {
            Taro.showToast({ title: '最多上传9张', icon: 'none' })
            return
          }
          const chooseRes = await Taro.chooseImage({
            count: remaining,
            sizeType: ['compressed'],
            sourceType: sourceType as any
          })
          chooseRes.tempFilePaths.forEach((path) => {
            addEventHandlePhoto(selectedEvent.id, path)
          })
          Taro.showToast({ title: `已添加${chooseRes.tempFilePaths.length}张`, icon: 'success' })
        }
      })
    } catch (e) {
      addEventHandlePhoto(selectedEvent.id, `https://picsum.photos/200/200?random=${Date.now()}`)
      Taro.showToast({ title: '已添加照片(模拟)', icon: 'success' })
    }
  }

  const handleRemoveHandlePhoto = (index: number) => {
    if (!selectedEvent) return
    Taro.showModal({
      title: '提示',
      content: '确定删除这张处置照片吗?',
      success: (res) => {
        if (res.confirm) removeEventHandlePhoto(selectedEvent.id, index)
      }
    })
  }

  const handleChangeStatus = (status: EventStatus) => {
    if (!selectedEvent) return
    if (!handleResultText.trim() && status !== 'processing') {
      Taro.showToast({ title: '请填写处置结果', icon: 'none' })
      return
    }
    const statusText = status === 'processing' ? '处理中' : status === 'resolved' ? '已解决' : '待处理'
    Taro.showModal({
      title: '确认变更',
      content: `确定将事件状态变更为「${statusText}」吗?`,
      success: (res) => {
        if (res.confirm) {
          const handlePhotos = selectedEvent.handlePhotos && selectedEvent.handlePhotos.length > 0
            ? selectedEvent.handlePhotos
            : undefined
          updateEventStatus(
            selectedEvent.id,
            status,
            handleResultText.trim() || selectedEvent.handleResult,
            handlePhotos
          )
          Taro.showToast({ title: `已变更为${statusText}`, icon: 'success' })
        }
      }
    })
  }

  React.useEffect(() => {
    Taro.onPullDownRefresh(handleRefresh)
    return () => {
      Taro.stopPullDownRefresh()
    }
  }, [])

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.greetingRow}>
          <View className={styles.workerInfo}>
            <View className={styles.avatar}>
              <Text className={styles.avatarText}>{mockGridWorker.name.charAt(0)}</Text>
            </View>
            <View className={styles.textGroup}>
              <Text className={styles.name}>你好,{mockGridWorker.name}</Text>
              <Text className={styles.gridInfo}>{mockGridWorker.grid} · 网格员</Text>
            </View>
          </View>
          <View className={styles.resetBtn} onClick={handleResetData}>
            <Text className={styles.resetBtnText}>重置数据</Text>
          </View>
        </View>

        <View className={styles.dateRow}>
          <Text className={styles.dateText}>{todayStr}</Text>
        </View>

        <View className={styles.statGrid}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{todayTasks}</Text>
            <Text className={styles.statLabel}>今日任务</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{pendingEvents.length}</Text>
            <Text className={styles.statLabel}>待处理事件</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{completedTasks}</Text>
            <Text className={styles.statLabel}>已完成任务</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{unreadCount}</Text>
            <Text className={styles.statLabel}>未读通知</Text>
          </View>
        </View>
      </View>

      <ScrollView scrollY className={styles.content} refresherEnabled onRefresherRefresh={handleRefresh}>
        <View className={styles.section}>
          <SectionHeader title='今日路线' extra={`共${mockRoutePoints.length}个站点`} />
          <View className={styles.routeCard}>
            <View className={styles.routeList}>
              {mockRoutePoints.map((point) => (
                <View key={point.id} className={styles.routeItem}>
                  <View className={classnames(styles.routeDot, styles[point.status])} />
                  <View className={classnames(styles.routeLine, point.status === 'visited' && styles.visited)} />
                  <View className={styles.routeInfo}>
                    <Text className={classnames(styles.routeName, point.status === 'pending' && styles.pending)}>
                      {point.name}
                    </Text>
                    <Text className={styles.routeAddress}>{point.address}</Text>
                    {point.time && (
                      <Text className={classnames(styles.routeTime, point.status === 'current' && styles.current)}>
                        {point.status === 'current' ? '当前位置 · ' : ''}{point.time}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <SectionHeader title='待处理事件' extra={`${pendingEvents.length}条`} />
          <View className={styles.eventList}>
            {pendingEvents.length === 0 ? (
              <View className={styles.emptyTip}>
                <Text className={styles.emptyTipIcon}>🎉</Text>
                <Text className={styles.emptyTipText}>暂无待处理事件,干得漂亮!</Text>
              </View>
            ) : (
              pendingEvents.map((event) => (
                <EventCard key={event.id} event={event} onClick={() => handleEventClick(event.id)} />
              ))
            )}
          </View>
        </View>

        <View className={styles.section}>
          <SectionHeader title='通知消息' extra='全部已读' onExtraClick={handleMarkAllRead} />
          <View className={styles.noticeCard}>
            {notifications.slice(0, 5).map((notice) => (
              <View key={notice.id} className={styles.noticeItem} onClick={() => handleNoticeClick(notice.id)}>
                <View className={classnames(styles.noticeDot, notice.read ? styles.read : styles.unread)} />
                <View className={styles.noticeContent}>
                  <Text className={classnames(styles.noticeTitle, !notice.read && styles.unread)}>
                    {notice.title}
                  </Text>
                  <Text className={styles.noticeDesc}>{notice.content}</Text>
                </View>
                <Text className={styles.noticeTime}>{notice.time.split(' ')[1] || notice.time}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.pageFooter} />
      </ScrollView>

      {selectedEvent && (
        <View className={styles.modalMask} onClick={handleCloseEvent}>
          <View className={styles.eventSheet} onClick={(e) => e.stopPropagation()}>
            <View className={styles.sheetHandle} />
            <View className={styles.sheetHeader}>
              <Text className={styles.sheetTitle}>事件详情</Text>
              <View className={classnames(
                styles.eventStatusBadge,
                styles[`eventStatus_${selectedEvent.status}`]
              )}>
                <Text className={styles.eventStatusText}>{getEventStatusLabel(selectedEvent.status)}</Text>
              </View>
            </View>

            <ScrollView className={styles.sheetBody} scrollY enhanced>
              <View className={styles.eventInfoCard}>
                <Text className={styles.eventTitle}>{selectedEvent.title}</Text>
                <View className={styles.eventTagRow}>
                  <View className={classnames(styles.eventTag, styles.eventTag_type)}>
                    <Text className={styles.eventTagText}>{getEventTypeLabel(selectedEvent.type)}</Text>
                  </View>
                  <View className={classnames(styles.eventTag, styles[`urgency_${selectedEvent.urgency}`])}>
                    <Text className={styles.eventTagText}>{getUrgencyLabel(selectedEvent.urgency)}</Text>
                  </View>
                </View>
              </View>

              <View className={styles.eventSection}>
                <Text className={styles.eventSectionTitle}>📋 基本信息</Text>
                <View className={styles.infoGrid}>
                  <View className={styles.infoRow}>
                    <Text className={styles.infoLabel}>所属网格</Text>
                    <Text className={styles.infoValue}>{selectedEvent.grid}</Text>
                  </View>
                  <View className={styles.infoRow}>
                    <Text className={styles.infoLabel}>上报位置</Text>
                    <Text className={styles.infoValue}>{selectedEvent.address}</Text>
                  </View>
                  <View className={styles.infoRow}>
                    <Text className={styles.infoLabel}>上报人</Text>
                    <Text className={styles.infoValue}>{selectedEvent.reporter}</Text>
                  </View>
                  <View className={styles.infoRow}>
                    <Text className={styles.infoLabel}>上报时间</Text>
                    <Text className={styles.infoValue}>{selectedEvent.reportTime}</Text>
                  </View>
                  {selectedEvent.handler && (
                    <View className={styles.infoRow}>
                      <Text className={styles.infoLabel}>处置人</Text>
                      <Text className={styles.infoValue}>{selectedEvent.handler}</Text>
                    </View>
                  )}
                  {selectedEvent.handleTime && (
                    <View className={styles.infoRow}>
                      <Text className={styles.infoLabel}>最近处置</Text>
                      <Text className={styles.infoValue}>{selectedEvent.handleTime}</Text>
                    </View>
                  )}
                </View>
              </View>

              <View className={styles.eventSection}>
                <Text className={styles.eventSectionTitle}>📝 事件描述</Text>
                <Text className={styles.eventDesc}>{selectedEvent.description}</Text>
              </View>

              {selectedEvent.photos && selectedEvent.photos.length > 0 && (
                <View className={styles.eventSection}>
                  <Text className={styles.eventSectionTitle}>
                    📸 现场照片 ({selectedEvent.photos.length})
                  </Text>
                  <View className={styles.photoGrid}>
                    {selectedEvent.photos.map((photo, i) => (
                      <Image key={i} src={photo} className={styles.photoThumb} mode='aspectFill' />
                    ))}
                  </View>
                </View>
              )}

              <View className={styles.eventSection}>
                <View className={styles.eventSectionHeader}>
                  <Text className={styles.eventSectionTitle}>
                    ✍️ 处置结果
                  </Text>
                  {selectedEvent.handlePhotos && selectedEvent.handlePhotos.length > 0 && (
                    <Text className={styles.eventSectionCount}>
                      照片 {selectedEvent.handlePhotos.length}/9
                    </Text>
                  )}
                </View>
                <Textarea
                  className={styles.resultInput}
                  placeholder='请填写处置过程和结果,例如:已联系物业修复、已劝导当事人和解等...'
                  value={handleResultText}
                  onInput={(e) => setHandleResultText(e.detail.value)}
                  maxlength={500}
                />
                <Text className={styles.resultCount}>{handleResultText.length}/500</Text>

                {(selectedEvent.handlePhotos?.length || 0) > 0 && (
                  <View className={styles.photoGrid}>
                    {(selectedEvent.handlePhotos || []).map((photo, i) => (
                      <View key={i} className={styles.photoItemWithDel}>
                        <Image src={photo} className={styles.photoThumb} mode='aspectFill' />
                        <View className={styles.photoDelBtn} onClick={() => handleRemoveHandlePhoto(i)}>
                          <Text style={{ color: '#fff', fontSize: '28rpx', lineHeight: 1 }}>×</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {(selectedEvent.handlePhotos?.length || 0) < 9 && (
                  <View className={styles.photoAddBtn2} onClick={handleAddHandlePhoto}>
                    <Text className={styles.photoAddIcon2}>+</Text>
                    <Text className={styles.photoAddLabel}>添加处置照片</Text>
                  </View>
                )}
              </View>

              <View className={styles.sheetBottomSpace} />
            </ScrollView>

            <View className={styles.sheetFooter}>
              <View className={styles.footerBtn_ghost} onClick={handleCloseEvent}>
                <Text className={styles.footerBtn_ghostText}>关闭</Text>
              </View>
              {selectedEvent.status === 'pending' && (
                <View className={styles.footerBtn_warn} onClick={() => handleChangeStatus('processing')}>
                  <Text className={styles.footerBtn_primaryText}>开始处置</Text>
                </View>
              )}
              {(selectedEvent.status === 'pending' || selectedEvent.status === 'processing') && (
                <View className={styles.footerBtn_primary} onClick={() => handleChangeStatus('resolved')}>
                  <Text className={styles.footerBtn_primaryText}>标记解决</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default HomePage
