import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import { getEventTypeLabel, getEventStatusLabel } from '@/data/events'
import { getUrgencyLabel } from '@/data/tasks'
import type { Event } from '@/types'
import styles from './index.module.scss'

interface EventCardProps {
  event: Event
  onClick?: () => void
  className?: string
}

const EventCard: React.FC<EventCardProps> = ({ event, onClick, className }) => {
  return (
    <View
      className={classnames(styles.eventCard, className)}
      onClick={onClick}
    >
      <View className={styles.cardHeader}>
        <View className={styles.titleRow}>
          <Text className={styles.title}>{event.title}</Text>
          <View className={classnames(styles.urgencyTag, styles[event.urgency])}>
            <Text className={styles.urgencyText}>{getUrgencyLabel(event.urgency)}</Text>
          </View>
        </View>
        <View className={styles.typeRow}>
          <Text className={styles.typeTag}>{getEventTypeLabel(event.type)}</Text>
        </View>
      </View>

      <View className={styles.cardBody}>
        <Text className={styles.description}>{event.description}</Text>
      </View>

      <View className={styles.cardFooter}>
        <View className={classnames(styles.statusBadge, styles[event.status])}>
          <Text className={styles.statusText}>{getEventStatusLabel(event.status)}</Text>
        </View>
        <View className={styles.metaRow}>
          <Text className={styles.metaText}>{event.grid}</Text>
          <Text className={styles.dot}>·</Text>
          <Text className={styles.metaText}>{event.reportTime}</Text>
        </View>
      </View>
    </View>
  )
}

export default EventCard
