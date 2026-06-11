import React, { useState } from 'react'
import { View, Text, Textarea, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import { grids, eventTypes, urgencyLevels } from '@/data/statistics'
import type { EventType, UrgencyLevel } from '@/types'
import styles from './index.module.scss'

const typeIcons: Record<string, string> = {
  security: '🛡️',
  environment: '🌿',
  facility: '🔧',
  conflict: '💬',
  other: '📝'
}

const ReportPage: React.FC = () => {
  const [eventType, setEventType] = useState<EventType | ''>('')
  const [urgency, setUrgency] = useState<UrgencyLevel | ''>('')
  const [selectedGrid, setSelectedGrid] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [showSuccess, setShowSuccess] = useState(false)
  const [showGridPicker, setShowGridPicker] = useState(false)

  const handleTypeSelect = (type: EventType) => {
    console.log('[Report] 选择事件类型:', type)
    setEventType(type)
  }

  const handleUrgencySelect = (level: UrgencyLevel) => {
    console.log('[Report] 选择紧急程度:', level)
    setUrgency(level)
  }

  const handleGridSelect = (grid: string) => {
    console.log('[Report] 选择网格:', grid)
    setSelectedGrid(grid)
    setShowGridPicker(false)
  }

  const handleGetLocation = () => {
    console.log('[Report] 获取位置')
    Taro.showLoading({ title: '定位中...' })
    setTimeout(() => {
      Taro.hideLoading()
      setLocation('幸福小区3栋附近（精度：约10米）')
      Taro.showToast({ title: '定位成功', icon: 'success' })
    }, 1500)
  }

  const handleAddPhoto = () => {
    console.log('[Report] 添加照片')
    if (photos.length >= 9) {
      Taro.showToast({ title: '最多上传9张照片', icon: 'none' })
      return
    }
    Taro.showToast({ title: '拍照功能演示', icon: 'none' })
  }

  const handleRemovePhoto = (index: number) => {
    console.log('[Report] 删除照片:', index)
    const newPhotos = [...photos]
    newPhotos.splice(index, 1)
    setPhotos(newPhotos)
  }

  const canSubmit = eventType && urgency && selectedGrid && description.trim()

  const handleSubmit = () => {
    console.log('[Report] 提交上报', { eventType, urgency, selectedGrid, description })
    if (!canSubmit) {
      Taro.showToast({ title: '请完善事件信息', icon: 'none' })
      return
    }

    Taro.showModal({
      title: '确认提交',
      content: '确认提交该事件上报吗？',
      success: (res) => {
        if (res.confirm) {
          setShowSuccess(true)
          setTimeout(() => {
            setShowSuccess(false)
            setEventType('')
            setUrgency('')
            setSelectedGrid('')
            setDescription('')
            setPhotos([])
            Taro.showToast({ title: '上报成功', icon: 'success' })
          }, 1500)
        }
      }
    })
  }

  return (
    <View className={styles.page}>
      {/* 事件类型 */}
      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>事件类型</Text>
        <View className={styles.typeGrid}>
          {eventTypes.map((type) => (
            <View
              key={type.value}
              className={classnames(styles.typeItem, eventType === type.value && styles.active)}
              onClick={() => handleTypeSelect(type.value as EventType)}
            >
              <View className={styles.typeIcon}>
                <Text>{typeIcons[type.value] || '📋'}</Text>
              </View>
              <Text className={styles.typeLabel}>{type.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 紧急程度 */}
      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>紧急程度</Text>
        <View className={styles.urgencyRow}>
          {urgencyLevels.map((level) => (
            <View
              key={level.value}
              className={classnames(
                styles.urgencyItem,
                styles[level.value],
                urgency === level.value && styles.active
              )}
              onClick={() => handleUrgencySelect(level.value as UrgencyLevel)}
            >
              <View className={styles.urgencyDot} />
              <Text className={styles.urgencyLabel}>{level.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 所属网格 */}
      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>所属网格</Text>
        <View
          className={styles.gridSelect}
          onClick={() => setShowGridPicker(true)}
        >
          <Text className={styles.gridValue}>{selectedGrid || '请选择网格'}</Text>
          <Text className={styles.gridArrow}>›</Text>
        </View>

        {showGridPicker && (
          <View
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'flex-end'
            }}
            onClick={() => setShowGridPicker(false)}
          >
            <View
              style={{
                background: '#fff',
                width: '100%',
                borderRadius: '20rpx 20rpx 0 0',
                padding: '32rpx'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Text style={{ fontSize: '32rpx', fontWeight: '600', marginBottom: '24rpx', display: 'block' }}>
                选择网格
              </Text>
              {grids.map((grid) => (
                <View
                  key={grid}
                  style={{
                    padding: '24rpx 0',
                    borderBottom: '1rpx solid #f2f3f5',
                    fontSize: '28rpx',
                    color: selectedGrid === grid ? '#165dff' : '#1d2129'
                  }}
                  onClick={() => handleGridSelect(grid)}
                >
                  <Text>{grid}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* 位置信息 */}
      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>位置信息</Text>
        <View className={styles.locationRow}>
          <View className={styles.locationIcon}>
            <Text>📍</Text>
          </View>
          <Text className={styles.locationText}>
            {location || '点击右侧按钮获取当前位置'}
          </Text>
          <Text className={styles.locationBtn} onClick={handleGetLocation}>
            获取位置
          </Text>
        </View>
      </View>

      {/* 事件描述 */}
      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>事件描述</Text>
        <Textarea
          className={styles.descTextarea}
          placeholder="请详细描述事件情况，包括时间、地点、涉及人员等信息..."
          value={description}
          onInput={(e) => setDescription(e.detail.value)}
          maxlength={500}
          autoHeight
        />
        <Text style={{ fontSize: '24rpx', color: '#86909c', marginTop: '16rpx', display: 'block', textAlign: 'right' }}>
          {description.length}/500
        </Text>
      </View>

      {/* 照片上传 */}
      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>现场照片</Text>
        <View className={styles.photoGrid}>
          {photos.map((photo, index) => (
            <View key={index} className={styles.photoItem}>
              <View className={styles.photoRemove} onClick={() => handleRemovePhoto(index)}>
                <Text>×</Text>
              </View>
            </View>
          ))}
          {photos.length < 9 && (
            <View className={styles.photoAdd} onClick={handleAddPhoto}>
              <Text className={styles.photoAddIcon}>+</Text>
              <Text className={styles.photoAddText}>添加照片</Text>
            </View>
          )}
        </View>
        <Text style={{ fontSize: '24rpx', color: '#86909c', marginTop: '16rpx', display: 'block' }}>
          最多可上传9张照片，支持拍照或从相册选择
        </Text>
      </View>

      {/* 底部提交按钮 */}
      <View className={styles.bottomBar}>
        <Button
          className={styles.submitBtn}
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          提交上报
        </Button>
      </View>

      {/* 提交成功提示 */}
      {showSuccess && (
        <View className={styles.successToast}>
          <View className={styles.successIcon}>
            <Text>✓</Text>
          </View>
          <Text className={styles.successText}>上报成功</Text>
        </View>
      )}
    </View>
  )
}

export default ReportPage
