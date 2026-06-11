import React, { useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import dayjs from 'dayjs'
import SectionHeader from '@/components/SectionHeader'
import EventCard from '@/components/EventCard'
import { mockRoutePoints, mockGridWorker, mockStatistics } from '@/data/statistics'
import { useAppStore } from '@/store'
import styles from './index.module.scss'

const HomePage: React.FC = () => {
  const todayStr = dayjs().format('YYYY年MM月DD日 dddd')

  const tasks = useAppStore((s) => s.tasks)
  const events = useAppStore((s) => s.events)
  const notifications = useAppStore((s) => s.notifications)
  const markNotificationRead = useAppStore((s) => s.markNotificationRead)

  const pendingEvents = useMemo(() => {
    return events.filter((e) => e.status === 'pending' || e.status === 'processing').slice(0, 5)
  }, [events])

  const todayTasks = useMemo(() => {
    return tasks.filter((t) => t.grid === '第一网格').length
  }, [tasks])

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length
  }, [notifications])

  const handleEventClick = (eventId: string) => {
    const event = events.find((e) => e.id === eventId)
    if (event) {
      Taro.showModal({
        title: event.title,
        content: `类型:${event.type}\n紧急程度:${event.urgency}\n网格:${event.grid}\n描述:${event.description}`,
        showCancel: false,
        confirmText: '关闭'
      })
    }
  }

  const handleNoticeClick = (noticeId: string) => {
    const notice = notifications.find((n) => n.id === noticeId)
    if (notice) {
      if (!notice.read) {
        markNotificationRead(noticeId)
      }
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
            <Text className={styles.statValue}>{mockStatistics.completedVisits}</Text>
            <Text className={styles.statLabel}>本月走访</Text>
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
    </View>
  )
}

export default HomePage
