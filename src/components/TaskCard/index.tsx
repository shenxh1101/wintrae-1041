import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import { getTaskTypeLabel, getTaskStatusLabel, getUrgencyLabel } from '@/data/tasks'
import type { Task } from '@/types'
import styles from './index.module.scss'

interface TaskCardProps {
  task: Task
  onClick?: () => void
  className?: string
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, className }) => {
  const statusClass = task.status === 'overdue' ? 'overdue' : task.status

  return (
    <View
      className={classnames(styles.taskCard, className)}
      onClick={onClick}
    >
      <View className={styles.cardHeader}>
        <View className={styles.titleRow}>
          <Text className={styles.title}>{task.title}</Text>
          <View className={classnames(styles.urgencyTag, styles[task.urgency])}>
            <Text className={styles.urgencyText}>{getUrgencyLabel(task.urgency)}</Text>
          </View>
        </View>
        <View className={styles.typeRow}>
          <Text className={styles.typeTag}>{getTaskTypeLabel(task.type)}</Text>
        </View>
      </View>

      <View className={styles.cardBody}>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>网格：</Text>
          <Text className={styles.infoText}>{task.grid}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>地址：</Text>
          <Text className={styles.infoText}>{task.address}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>截止：</Text>
          <Text className={styles.infoText}>{task.deadline}</Text>
        </View>
      </View>

      <View className={styles.cardFooter}>
        <View className={classnames(styles.statusBadge, styles[statusClass])}>
          <Text className={styles.statusText}>{getTaskStatusLabel(task.status)}</Text>
        </View>
        {task.residentName && (
          <Text className={styles.resident}>联系人：{task.residentName}</Text>
        )}
      </View>
    </View>
  )
}

export default TaskCard
