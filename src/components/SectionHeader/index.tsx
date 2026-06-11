import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'

interface SectionHeaderProps {
  title: string
  extra?: string
  onExtraClick?: () => void
  className?: string
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  extra,
  onExtraClick,
  className
}) => {
  return (
    <View className={classnames(styles.sectionHeader, className)}>
      <View className={styles.titleWrapper}>
        <View className={styles.titleBar} />
        <Text className={styles.title}>{title}</Text>
      </View>
      {extra && (
        <Text className={styles.extra} onClick={onExtraClick}>
          {extra}
        </Text>
      )}
    </View>
  )
}

export default SectionHeader
