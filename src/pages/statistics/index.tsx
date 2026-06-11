import React, { useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import SectionHeader from '@/components/SectionHeader'
import StatCard from '@/components/StatCard'
import EventCard from '@/components/EventCard'
import { mockGridWorker, grids } from '@/data/statistics'
import { useAppStore } from '@/store'
import styles from './index.module.scss'

const StatisticsPage: React.FC = () => {
  const tasks = useAppStore((s) => s.tasks)
  const events = useAppStore((s) => s.events)
  const resetAllData = useAppStore((s) => s.resetAllData)

  const stats = useMemo(() => {
    const totalTasks = tasks.length
    const completedTasks = tasks.filter((t) => t.status === 'completed').length
    const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length
    const checkedInTasks = tasks.filter((t) => !!t.checkInTime).length
    const overdueTasks = tasks.filter((t) => t.status === 'overdue').length
    const pendingTasks = tasks.filter((t) => t.status === 'pending').length

    const totalEvents = events.length
    const resolvedEvents = events.filter((e) => e.status === 'resolved' || e.status === 'closed').length
    const processingEvents = events.filter((e) => e.status === 'processing').length
    const pendingEvents = events.filter((e) => e.status === 'pending').length

    const visitCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    const eventResolveRate = totalEvents > 0 ? Math.round((resolvedEvents / totalEvents) * 100) : 0
    const checkInRate = totalTasks > 0 ? Math.round((checkedInTasks / totalTasks) * 100) : 0

    const baseScore = 60
    const completedBonus = completedTasks * 3
    const resolvedBonus = resolvedEvents * 4
    const overduePenalty = overdueTasks * 5
    const performanceScore = Math.max(0, Math.min(100, baseScore + completedBonus + resolvedBonus - overduePenalty))

    const now = Date.now()
    const todayVisits = tasks.filter((t) => {
      if (!t.checkInTime) return false
      const d = new Date(t.checkInTime.replace(/-/g, '/'))
      const today = new Date()
      return d.getFullYear() === today.getFullYear()
        && d.getMonth() === today.getMonth()
        && d.getDate() === today.getDate()
    }).length

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      overdueTasks,
      checkedInTasks,
      totalEvents,
      resolvedEvents,
      processingEvents,
      pendingEvents,
      visitCompletionRate,
      eventResolveRate,
      checkInRate,
      performanceScore,
      todayVisits
    }
  }, [tasks, events])

  const gridRankings = useMemo(() => {
    const gridMap: Record<string, { visits: number; resolved: number; overdue: number }> = {}
    grids.forEach((g) => {
      gridMap[g] = { visits: 0, resolved: 0, overdue: 0 }
    })

    tasks.forEach((t) => {
      if (!gridMap[t.grid]) gridMap[t.grid] = { visits: 0, resolved: 0, overdue: 0 }
      if (t.status === 'completed' || t.checkInTime) {
        gridMap[t.grid].visits += 1
      }
      if (t.status === 'overdue') {
        gridMap[t.grid].overdue += 1
      }
    })

    events.forEach((e) => {
      if (!gridMap[e.grid]) gridMap[e.grid] = { visits: 0, resolved: 0, overdue: 0 }
      if (e.status === 'resolved' || e.status === 'closed') {
        gridMap[e.grid].resolved += 1
      }
    })

    return grids
      .map((g, idx) => {
        const data = gridMap[g] || { visits: 0, resolved: 0, overdue: 0 }
        const score = 60 + data.visits * 3 + data.resolved * 4 - data.overdue * 5
        const isCurrent = g === mockGridWorker.grid
        return {
          name: g,
          visits: data.visits,
          resolved: data.resolved,
          overdue: data.overdue,
          score: Math.max(0, Math.min(100, score)),
          ranking: 0,
          isCurrent,
          originalIndex: idx
        }
      })
      .sort((a, b) => b.score - a.score)
      .map((item, idx) => ({ ...item, ranking: idx + 1 }))
      .sort((a, b) => {
        if (a.isCurrent && !b.isCurrent) return -1
        if (!a.isCurrent && b.isCurrent) return 1
        return a.ranking - b.ranking
      })
  }, [tasks, events])

  const overdueEventList = useMemo(() => {
    return events.filter((e) => e.status === 'pending' || e.status === 'processing').slice(0, 3)
  }, [events])

  const handleResetData = () => {
    Taro.showModal({
      title: '确认重置',
      content: '所有统计数据将恢复为初始演示数据,确定继续吗?',
      success: (res) => {
        if (res.confirm) resetAllData()
      }
    })
  }

  const handleOverdueClick = (id: string) => {
    Taro.showToast({ title: `查看事件 ${id}`, icon: 'none' })
  }

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.headerRow}>
          <Text className={styles.headerTitle}>数据统计</Text>
          <View className={styles.resetBtn} onClick={handleResetData}>
            <Text className={styles.resetBtnText}>重置</Text>
          </View>
        </View>
        <View className={styles.scoreCard}>
          <View className={styles.scoreInfo}>
            <Text className={styles.scoreLabel}>个人绩效</Text>
            <View className={styles.scoreRow}>
              <Text className={styles.scoreValue}>{stats.performanceScore}</Text>
              <Text className={styles.scoreUnit}>分</Text>
            </View>
            <Text className={styles.scoreGrid}>{mockGridWorker.grid} · {mockGridWorker.name}</Text>
          </View>
          <View className={styles.rankInfo}>
            <Text className={styles.rankLabel}>网格排名</Text>
            <View className={styles.rankValueWrap}>
              <Text className={styles.rankValue}>
                {gridRankings.find((r) => r.isCurrent)?.ranking || '-'}
              </Text>
              <Text className={styles.rankTotal}>/ {grids.length}</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView scrollY className={styles.content} enhanced>
        <View className={styles.section}>
          <SectionHeader title='核心数据' />
          <View className={styles.statGrid}>
            <StatCard
              color='primary'
              title='本月走访'
              value={stats.completedTasks + stats.inProgressTasks}
              unit='次'
              trend={`已完成 ${stats.completedTasks}`}
            />
            <StatCard
              color='success'
              title='事件处置'
              value={stats.resolvedEvents}
              unit='件'
              trend={`处置中 ${stats.processingEvents}`}
            />
            <StatCard
              color='warning'
              title='进行中任务'
              value={stats.pendingTasks + stats.inProgressTasks}
              unit='项'
              trend={`已签到 ${stats.checkedInTasks}`}
            />
            <StatCard
              color='error'
              title='超时任务'
              value={stats.overdueTasks}
              unit='项'
              trend='需尽快处理'
            />
          </View>
        </View>

        <View className={styles.section}>
          <SectionHeader title='完成进度' />
          <View className={styles.progressCard}>
            <View className={styles.progressItem}>
              <View className={styles.progressHeader}>
                <Text className={styles.progressLabel}>走访完成率</Text>
                <Text className={styles.progressValue}>{stats.visitCompletionRate}%</Text>
              </View>
              <View className={styles.progressBar}>
                <View className={classnames(styles.progressFill, styles.progressFill_primary)}
                  style={{ width: `${stats.visitCompletionRate}%` }} />
              </View>
              <Text className={styles.progressSub}>
                已完成 {stats.completedTasks} / 共 {stats.totalTasks} 项
              </Text>
            </View>

            <View className={styles.progressItem}>
              <View className={styles.progressHeader}>
                <Text className={styles.progressLabel}>事件解决率</Text>
                <Text className={styles.progressValue}>{stats.eventResolveRate}%</Text>
              </View>
              <View className={styles.progressBar}>
                <View className={classnames(styles.progressFill, styles.progressFill_success)}
                  style={{ width: `${stats.eventResolveRate}%` }} />
              </View>
              <Text className={styles.progressSub}>
                已解决 {stats.resolvedEvents} / 共 {stats.totalEvents} 件
              </Text>
            </View>

            <View className={styles.progressItem}>
              <View className={styles.progressHeader}>
                <Text className={styles.progressLabel}>签到出勤率</Text>
                <Text className={styles.progressValue}>{stats.checkInRate}%</Text>
              </View>
              <View className={styles.progressBar}>
                <View className={classnames(styles.progressFill, styles.progressFill_warning)}
                  style={{ width: `${stats.checkInRate}%` }} />
              </View>
              <Text className={styles.progressSub}>
                已签到 {stats.checkedInTasks} / 共 {stats.totalTasks} 项
              </Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <SectionHeader title='网格排名' extra={`共 ${grids.length} 个网格`} />
          <View className={styles.rankCard}>
            {gridRankings.map((item) => (
              <View
                key={item.name}
                className={classnames(styles.rankRow, { [styles.rankRow_current]: item.isCurrent })}
              >
                <View className={classnames(
                  styles.rankBadge,
                  item.ranking === 1 && styles.rankBadge_gold,
                  item.ranking === 2 && styles.rankBadge_silver,
                  item.ranking === 3 && styles.rankBadge_bronze,
                  item.ranking > 3 && styles.rankBadge_normal
                )}>
                  <Text className={styles.rankBadgeText}>
                    {item.ranking === 1 ? '🥇' : item.ranking === 2 ? '🥈' : item.ranking === 3 ? '🥉' : item.ranking}
                  </Text>
                </View>
                <View className={styles.rankInfoCol}>
                  <View className={styles.rankNameRow}>
                    <Text className={classnames(styles.rankName, { [styles.rankName_current]: item.isCurrent })}>
                      {item.name}
                    </Text>
                    {item.isCurrent && (
                      <View className={styles.currentTag}>
                        <Text className={styles.currentTagText}>当前</Text>
                      </View>
                    )}
                  </View>
                  <Text className={styles.rankDetail}>
                    走访 {item.visits} · 解决 {item.resolved} · 超时 {item.overdue}
                  </Text>
                </View>
                <Text className={styles.rankScore}>{item.score}分</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <SectionHeader title='待处理/进行中事件' extra={`${overdueEventList.length}件`} />
          <View className={styles.eventList}>
            {overdueEventList.length === 0 ? (
              <View className={styles.emptyTip}>
                <Text className={styles.emptyIcon}>✨</Text>
                <Text className={styles.emptyText}>暂无待处理事件</Text>
              </View>
            ) : (
              overdueEventList.map((event) => (
                <EventCard key={event.id} event={event} onClick={() => handleOverdueClick(event.id)} />
              ))
            )}
          </View>
        </View>

        <View className={styles.pageBottom} />
      </ScrollView>
    </View>
  )
}

export default StatisticsPage
