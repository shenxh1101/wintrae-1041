import React, { useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import classnames from 'classnames'
import dayjs from 'dayjs'
import { mockStatistics, mockGridStatistics } from '@/data/statistics'
import { mockTasks } from '@/data/tasks'
import styles from './index.module.scss'

const StatisticsPage: React.FC = () => {
  const currentMonth = dayjs().format('YYYY年MM月')

  const overdueTasks = useMemo(() => {
    return mockTasks.filter(t => t.status === 'overdue')
  }, [])

  const visitRate = Math.round((mockStatistics.completedVisits / mockStatistics.totalVisits) * 100)
  const eventRate = Math.round((mockStatistics.resolvedEvents / mockStatistics.totalEvents) * 100)

  const sortedGridStats = useMemo(() => {
    return [...mockGridStatistics].sort((a, b) => b.performanceScore - a.performanceScore)
  }, [])

  return (
    <View className={styles.page}>
      {/* 顶部头 */}
      <View className={styles.header}>
        <Text className={styles.headerTitle}>数据统计</Text>
        <Text className={styles.headerSubtitle}>{currentMonth} · 个人绩效</Text>

        {/* 绩效总览卡片 */}
        <View className={styles.performanceCard}>
          <View className={styles.scoreSection}>
            <Text className={styles.scoreValue}>{mockStatistics.performanceScore}</Text>
            <Text className={styles.scoreLabel}>绩效得分</Text>
          </View>
          <View className={styles.rankSection}>
            <View className={styles.rankRow}>
              <Text className={styles.rankLabel}>网格排名</Text>
              <Text className={styles.rankValue}>第 {mockStatistics.ranking} 名</Text>
            </View>
            <View className={styles.rankRow}>
              <Text className={styles.rankLabel}>所属网格</Text>
              <Text className={styles.rankValue}>{mockStatistics.gridName}</Text>
            </View>
          </View>
        </View>

        {/* 数据概览 */}
        <View className={styles.statGrid}>
          <View className={classnames(styles.statCard, styles.primary)}>
            <Text className={styles.statTitle}>本月走访</Text>
            <View style={{ display: 'flex', alignItems: 'baseline' }}>
              <Text className={styles.statValue}>{mockStatistics.completedVisits}</Text>
              <Text className={styles.statUnit}>/ {mockStatistics.totalVisits} 次</Text>
            </View>
            <Text className={styles.statSubtext}>完成率 {visitRate}%</Text>
          </View>

          <View className={classnames(styles.statCard, styles.success)}>
            <Text className={styles.statTitle}>事件处置</Text>
            <View style={{ display: 'flex', alignItems: 'baseline' }}>
              <Text className={styles.statValue}>{mockStatistics.resolvedEvents}</Text>
              <Text className={styles.statUnit}>/ {mockStatistics.totalEvents} 件</Text>
            </View>
            <Text className={styles.statSubtext}>解决率 {eventRate}%</Text>
          </View>

          <View className={classnames(styles.statCard, styles.warning)}>
            <Text className={styles.statTitle}>进行中任务</Text>
            <Text className={styles.statValue}>{mockTasks.filter(t => t.status === 'in_progress').length}</Text>
            <Text className={styles.statSubtext}>需及时处理</Text>
          </View>

          <View className={classnames(styles.statCard, styles.error)}>
            <Text className={styles.statTitle}>超时任务</Text>
            <Text className={styles.statValue}>{mockStatistics.overdueTasks}</Text>
            <Text className={styles.statSubtext}>请尽快跟进</Text>
          </View>
        </View>
      </View>

      {/* 内容区 */}
      <ScrollView scrollY className={styles.content}>
        {/* 完成进度 */}
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>完成进度</Text>
          </View>

          <View className={styles.progressCard}>
            <View className={styles.progressItem}>
              <View className={styles.progressHeader}>
                <Text className={styles.progressLabel}>走访任务完成率</Text>
                <Text className={styles.progressPercent}>{visitRate}%</Text>
              </View>
              <View className={styles.progressBar}>
                <View
                  className={classnames(styles.progressFill, styles.primary)}
                  style={{ width: `${visitRate}%` }}
                />
              </View>
            </View>

            <View className={styles.progressItem}>
              <View className={styles.progressHeader}>
                <Text className={styles.progressLabel}>事件处置完成率</Text>
                <Text className={styles.progressPercent}>{eventRate}%</Text>
              </View>
              <View className={styles.progressBar}>
                <View
                  className={classnames(styles.progressFill, styles.success)}
                  style={{ width: `${eventRate}%` }}
                />
              </View>
            </View>

            <View className={styles.progressItem}>
              <View className={styles.progressHeader}>
                <Text className={styles.progressLabel}>按时完成率</Text>
                <Text className={styles.progressPercent}>
                  {Math.round(((mockStatistics.totalVisits - mockStatistics.overdueTasks) / mockStatistics.totalVisits) * 100)}%
                </Text>
              </View>
              <View className={styles.progressBar}>
                <View
                  className={classnames(styles.progressFill, styles.warning)}
                  style={{
                    width: `${Math.round(((mockStatistics.totalVisits - mockStatistics.overdueTasks) / mockStatistics.totalVisits) * 100)}%`
                  }}
                />
              </View>
            </View>
          </View>
        </View>

        {/* 网格排名 */}
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>网格排名</Text>
            <Text className={styles.sectionExtra}>共 {sortedGridStats.length} 个网格</Text>
          </View>

          <View className={styles.rankList}>
            {sortedGridStats.map((grid, index) => (
              <View
                key={grid.gridName}
                className={classnames(
                  styles.rankItem,
                  grid.gridName === mockStatistics.gridName && styles.current
                )}
              >
                <View
                  className={classnames(
                    styles.rankNumber,
                    index === 0 && styles.rank1,
                    index === 1 && styles.rank2,
                    index === 2 && styles.rank3
                  )}
                >
                  <Text>{index + 1}</Text>
                </View>
                <View className={styles.rankInfo}>
                  <Text className={styles.rankName}>{grid.gridName}</Text>
                  <Text className={styles.rankDetail}>
                    走访 {grid.completedVisits} 次 · 事件 {grid.resolvedEvents} 件
                  </Text>
                </View>
                <Text className={styles.rankScore}>{grid.performanceScore}分</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 超时任务 */}
        {overdueTasks.length > 0 && (
          <View className={styles.section}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>超时任务</Text>
              <Text className={styles.sectionExtra}>{overdueTasks.length} 项待处理</Text>
            </View>

            <View className={styles.overdueCard}>
              {overdueTasks.map((task) => (
                <View key={task.id} className={styles.overdueItem}>
                  <View className={styles.overdueIcon}>
                    <Text>⚠️</Text>
                  </View>
                  <View className={styles.overdueInfo}>
                    <Text className={styles.overdueTitle}>{task.title}</Text>
                    <Text className={styles.overdueTime}>截止时间：{task.deadline}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

export default StatisticsPage
