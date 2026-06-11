import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import { getResidentTagLabel, getHouseholdTypeLabel } from '@/data/residents'
import type { Resident } from '@/types'
import styles from './index.module.scss'

interface ResidentCardProps {
  resident: Resident
  onClick?: () => void
  className?: string
}

const ResidentCard: React.FC<ResidentCardProps> = ({ resident, onClick, className }) => {
  return (
    <View
      className={classnames(styles.residentCard, className)}
      onClick={onClick}
    >
      <View className={styles.avatar}>
        <Text className={styles.avatarText}>{resident.name.charAt(0)}</Text>
      </View>

      <View className={styles.info}>
        <View className={styles.nameRow}>
          <Text className={styles.name}>{resident.name}</Text>
          <Text className={styles.genderAge}>
            {resident.gender === 'male' ? '男' : '女'} · {resident.age}岁
          </Text>
          {resident.specialCare && (
            <View className={styles.specialBadge}>
              <Text className={styles.specialText}>重点关怀</Text>
            </View>
          )}
        </View>

        <Text className={styles.address}>{resident.address}</Text>

        <View className={styles.tagRow}>
          {resident.tags.slice(0, 3).map((tag) => (
            <Text key={tag} className={classnames(styles.tag, styles[tag])}>
              {getResidentTagLabel(tag)}
            </Text>
          ))}
          <Text className={styles.householdTag}>{getHouseholdTypeLabel(resident.householdType)}</Text>
        </View>
      </View>
    </View>
  )
}

export default ResidentCard
