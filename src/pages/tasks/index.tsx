import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import TaskCard from '@/components/TaskCard'
import { mockTasks, getTaskTypeLabel, getTaskStatusLabel } from '@/data/tasks'
import type { Task, TaskType, TaskStatus } from '@/types'
import styles from './index.module.scss'

const typeTabs: { value: TaskType | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'visit', label: '走访任务' },
  { value: 'verify', label: '核查任务' },
  { value: 'propaganda', label: '宣传任务' }
]

const statusTabs: { value: TaskStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待处理' },
  { value: 'in_progress', label: '进行中' },
  { value: 'completed', label: '已完成' },
  { value: 'overdue', label: '已超时' }
]

const TasksPage: React.FC = () => {
  const [activeType, setActiveType] = useState<TaskType | 'all'>('all')
  const [activeStatus, setActiveStatus] = useState<TaskStatus | 'all'>('all')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  const filteredTasks = useMemo(() => {
    return mockTasks.filter(task => {
      const matchType = activeType === 'all' || task.type === activeType
      const matchStatus = activeStatus === 'all' || task.status === activeStatus
      const matchGrid = task.grid === '第一网格' || task.grid === '第二网格'
      return matchType && matchStatus && matchGrid
    })
  }, [activeType, activeStatus])

  const handleTaskClick = (task: Task) => {
    console.log('[Tasks] 点击任务:', task.id)
    setSelectedTask(task)
    setShowDetail(true)
  }

  const handleTypeChange = (type: TaskType | 'all') => {
    console.log('[Tasks] 切换任务类型:', type)
    setActiveType(type)
  }

  const handleStatusChange = (status: TaskStatus | 'all') => {
    console.log('[Tasks] 切换任务状态:', status)
    setActiveStatus(status)
  }

  const handleCheckIn = () => {
    console.log('[Tasks] 定位签到')
    Taro.showLoading({ title: '定位中...' })
    setTimeout(() => {
      Taro.hideLoading()
      Taro.showToast({ title: '签到成功', icon: 'success' })
    }, 1500)
  }

  const handleTakePhoto = () => {
    console.log('[Tasks] 拍照留痕')
    Taro.showToast({ title: '拍照功能演示', icon: 'none' })
  }

  const handleVoiceNote = () => {
    console.log('[Tasks] 语音备注')
    Taro.showToast({ title: '语音功能演示', icon: 'none' })
  }

  const handleComplete = () => {
    console.log('[Tasks] 完成任务')
    Taro.showModal({
      title: '确认完成',
      content: '确认该任务已完成并提交吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '提交成功', icon: 'success' })
          setShowDetail(false)
        }
      }
    })
  }

  const handleCloseDetail = () => {
    setShowDetail(false)
    setSelectedTask(null)
  }

  const handleRefresh = () => {
    console.log('[Tasks] 下拉刷新')
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
      {/* 任务类型标签 */}
      <ScrollView scrollX className={styles.typeTabs}>
        {typeTabs.map((tab) => (
          <View
            key={tab.value}
            className={classnames(styles.typeTab, activeType === tab.value && styles.active)}
            onClick={() => handleTypeChange(tab.value)}
          >
            <Text>{tab.label}</Text>
          </View>
        ))}
      </ScrollView>

      {/* 状态标签 */}
      <View className={styles.statusTabs}>
        {statusTabs.map((tab) => (
          <View
            key={tab.value}
            className={classnames(styles.statusTab, activeStatus === tab.value && styles.active)}
            onClick={() => handleStatusChange(tab.value)}
          >
            <Text>{tab.label}</Text>
          </View>
        ))}
      </View>

      {/* 任务列表 */}
      <ScrollView scrollY className={styles.taskList}>
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => handleTaskClick(task)}
            />
          ))
        ) : (
          <View className={styles.emptyState}>
            <View className={styles.emptyIcon}>
              <Text style={{ fontSize: '48rpx', color: '#c9cdd4' }}>📋</Text>
            </View>
            <Text className={styles.emptyText}>暂无相关任务</Text>
          </View>
        )}
      </ScrollView>

      {/* 底部操作栏 */}
      <View className={styles.bottomBar}>
        <Button
          className={classnames(styles.actionBtn, styles.secondary)}
          onClick={handleCheckIn}
        >
          定位签到
        </Button>
        <Button
          className={classnames(styles.actionBtn, styles.primary)}
          onClick={() => {
            const firstPending = filteredTasks.find(t => t.status === 'pending' || t.status === 'in_progress')
            if (firstPending) {
              handleTaskClick(firstPending)
            } else {
              Taro.showToast({ title: '暂无进行中任务', icon: 'none' })
            }
          }}
        >
          开始任务
        </Button>
      </View>

      {/* 任务详情弹窗 */}
      {showDetail && selectedTask && (
        <View className={styles.detailModal} onClick={handleCloseDetail}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>任务详情</Text>
              <View className={styles.closeBtn} onClick={handleCloseDetail}>
                <Text>×</Text>
              </View>
            </View>

            <ScrollView scrollY className={styles.modalBody}>
              <View className={styles.detailSection}>
                <Text className={styles.detailLabel}>任务标题</Text>
                <Text className={styles.detailValue}>{selectedTask.title}</Text>
              </View>

              <View className={styles.detailSection}>
                <Text className={styles.detailLabel}>任务类型</Text>
                <Text className={styles.detailValue}>{getTaskTypeLabel(selectedTask.type)}</Text>
              </View>

              <View className={styles.detailSection}>
                <Text className={styles.detailLabel}>任务状态</Text>
                <Text className={styles.detailValue}>{getTaskStatusLabel(selectedTask.status)}</Text>
              </View>

              <View className={styles.detailSection}>
                <Text className={styles.detailLabel}>所属网格</Text>
                <Text className={styles.detailValue}>{selectedTask.grid}</Text>
              </View>

              <View className={styles.detailSection}>
                <Text className={styles.detailLabel}>详细地址</Text>
                <Text className={styles.detailValue}>{selectedTask.address}</Text>
              </View>

              <View className={styles.detailSection}>
                <Text className={styles.detailLabel}>任务描述</Text>
                <Text className={styles.detailValue}>{selectedTask.description}</Text>
              </View>

              {selectedTask.residentName && (
                <View className={styles.detailSection}>
                  <Text className={styles.detailLabel}>联系人</Text>
                  <Text className={styles.detailValue}>
                    {selectedTask.residentName} {selectedTask.residentPhone}
                  </Text>
                </View>
              )}

              <View className={styles.detailSection}>
                <Text className={styles.detailLabel}>派单时间</Text>
                <Text className={styles.detailValue}>{selectedTask.assignTime}</Text>
              </View>

              <View className={styles.detailSection}>
                <Text className={styles.detailLabel}>截止时间</Text>
                <Text className={styles.detailValue}>{selectedTask.deadline}</Text>
              </View>

              {selectedTask.checkInTime && (
                <View className={styles.detailSection}>
                  <Text className={styles.detailLabel}>签到时间</Text>
                  <Text className={styles.detailValue}>{selectedTask.checkInTime}</Text>
                </View>
              )}

              <View className={styles.detailSection}>
                <Text className={styles.detailLabel}>拍照留痕</Text>
                <View className={styles.photoGrid}>
                  <View className={styles.photoAdd} onClick={handleTakePhoto}>
                    <Text>+</Text>
                  </View>
                </View>
              </View>

              <View className={styles.detailSection}>
                <Text className={styles.detailLabel}>语音备注</Text>
                <View className={styles.voiceItem} onClick={handleVoiceNote}>
                  <View className={styles.voicePlayBtn}>
                    <Text>▶</Text>
                  </View>
                  <View className={styles.voiceInfo}>
                    <View className={styles.voiceWave}>
                      {[...Array(10)].map((_, i) => (
                        <View
                          key={i}
                          className={styles.voiceWaveItem}
                          style={{ height: `${20 + Math.random() * 20}rpx` }}
                        />
                      ))}
                    </View>
                    <Text className={styles.voiceDuration}>点击录制语音备注</Text>
                  </View>
                </View>
              </View>

              {selectedTask.remark && (
                <View className={styles.detailSection}>
                  <Text className={styles.detailLabel}>任务备注</Text>
                  <Text className={styles.detailValue}>{selectedTask.remark}</Text>
                </View>
              )}
            </ScrollView>

            <View className={styles.modalFooter}>
              <Button
                className={classnames(styles.modalBtn, styles.outline)}
                onClick={handleCloseDetail}
              >
                取消
              </Button>
              <Button
                className={classnames(styles.modalBtn, styles.primary)}
                onClick={handleComplete}
              >
                完成任务
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default TasksPage
