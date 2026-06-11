import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'

interface StatCardProps {
  title: string
  value: string | number
  unit?: string
  trend?: 'up' | 'down'
  trendValue?: string
  color?: 'primary' | 'success' | 'warning' | 'error'
  className?: string
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit = '',
  trend,
  trendValue,
  color = 'primary',
  className
}) => {
  return (
    <View className={classnames(styles.statCard, styles[color], className)}>
      <Text className={styles.title}>{title}</Text>
      <View className={styles.valueRow}>
        <Text className={styles.value}>{value}</Text>
        {unit && <Text className={styles.unit}>{unit}</Text>}
      </View>
      {trend && trendValue && (
        <View className={classnames(styles.trend, styles[trend])}>
          <Text className={styles.trendText}>
            {trend === 'up' ? '↑' : '↓'} {trendValue}
          </Text>
        </View>
      )}
    </View>
  )
}

export default StatCard
