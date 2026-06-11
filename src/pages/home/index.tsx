import React, { useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import dayjs from 'dayjs'
import SectionHeader from '@/components/SectionHeader'
import EventCard from '@/components/EventCard'
import { mockRoutePoints, mockNotifications, mockGridWorker, mockStatistics } from '@/data/statistics'
import { mockEvents } from '@/data/events'
import { mockTasks } from '@/data/tasks'
import styles from './index.module.scss'

const HomePage: React.FC = () => {
  const todayStr = dayjs().format('YYYY年MM月DD日 dddd')

  const pendingEvents = useMemo(() => {
    return mockEvents.filter(e => e.status === 'pending' || e.status === 'processing').slice(0, 3)
  }, [])

  const todayTasks = useMemo(() => {
    return mockTasks.filter(t => t.grid === '第一网格').length
  }, [])

  const unreadCount = useMemo(() => {
    return mockNotifications.filter(n => !n.read).length
  }, [])

  const handleEventClick = (eventId: string) => {
    console.log('[Home] 点击事件:', eventId)
    Taro.showToast({ title: '查看事件详情', icon: 'none' })
  }

  const handleNoticeClick = (noticeId: string) => {
    console.log('[Home] 点击通知:', noticeId)
    Taro.showToast({ title: '查看通知详情', icon: 'none' })
  }

  const handleRefresh = () => {
    console.log('[Home] 下拉刷新')
    setTimeout(() => {
      Taro.stopPullDownRefresh()
    }, 1000)
  }

  React.useEffect(() => {
    Taro.onPullDownRefresh(handleRefresh)
    return () => {
      Taro.stopPullDownRefresh()
    }
  }, [])

  return (
    <View className={styles.page}>
      {/* 顶部头部 */}
      <View className={styles.header}>
        <View className={styles.greetingRow}>
          <View className={styles.workerInfo}>
            <View className={styles.avatar}>
              <Text className={styles.avatarText}>{mockGridWorker.name.charAt(0)}</Text>
            </View>
            <View className={styles.textGroup}>
              <Text className={styles.name}>你好，{mockGridWorker.name}</Text>
              <Text className={styles.gridInfo}>{mockGridWorker.grid} · 网格员</Text>
            </View>
          </View>
        </View>

        <View className={styles.dateRow}>
          <Text className={styles.dateText}>{todayStr}</Text>
        </View>

        {/* 数据概览 */}
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

      {/* 内容区 */}
      <ScrollView scrollY className={styles.content}>
        {/* 今日路线 */}
        <View className={styles.section}>
          <SectionHeader title="今日路线" extra={`共${mockRoutePoints.length}个站点`} />
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

        {/* 待处理事件 */}
        <View className={styles.section}>
          <SectionHeader title="待处理事件" extra="查看全部" />
          <View className={styles.eventList}>
            {pendingEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => handleEventClick(event.id)}
              />
            ))}
          </View>
        </View>

        {/* 通知消息 */}
        <View className={styles.section}>
          <SectionHeader title="通知消息" extra="全部已读" />
          <View className={styles.noticeCard}>
            {mockNotifications.slice(0, 4).map((notice) => (
              <View
                key={notice.id}
                className={styles.noticeItem}
                onClick={() => handleNoticeClick(notice.id)}
              >
                <View className={classnames(styles.noticeDot, notice.read ? styles.read : styles.unread)} />
                <View className={styles.noticeContent}>
                  <Text className={classnames(styles.noticeTitle, !notice.read && styles.unread)}>
                    {notice.title}
                  </Text>
                  <Text className={styles.noticeDesc}>{notice.content}</Text>
                </View>
                <Text className={styles.noticeTime}>{notice.time.split(' ')[1]}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

export default HomePage
