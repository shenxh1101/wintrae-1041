import React, { useState } from 'react'
import { View, Text, Textarea, Button, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import { grids, eventTypes, urgencyLevels } from '@/data/statistics'
import { getEventTypeLabel } from '@/data/events'
import type { EventType, UrgencyLevel } from '@/types'
import { useAppStore } from '@/store'
import styles from './index.module.scss'

const typeIcons: Record<string, string> = {
  security: '🛡️',
  environment: '🌿',
  facility: '🔧',
  conflict: '💬',
  other: '📝'
}

const genEventTitle = (type: EventType, desc: string): string => {
  const typeLabel = getEventTypeLabel(type)
  const shortDesc = desc.slice(0, 10)
  return `${typeLabel}事件:${shortDesc}${desc.length > 10 ? '...' : ''}`
}

const ReportPage: React.FC = () => {
  const addEvent = useAppStore((s) => s.addEvent)

  const [eventType, setEventType] = useState<EventType | ''>('')
  const [urgency, setUrgency] = useState<UrgencyLevel | ''>('')
  const [selectedGrid, setSelectedGrid] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [showSuccess, setShowSuccess] = useState(false)
  const [showGridPicker, setShowGridPicker] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleTypeSelect = (type: EventType) => {
    setEventType(type)
  }

  const handleUrgencySelect = (level: UrgencyLevel) => {
    setUrgency(level)
  }

  const handleGridSelect = (grid: string) => {
    setSelectedGrid(grid)
    setShowGridPicker(false)
  }

  const handleGetLocation = async () => {
    Taro.showLoading({ title: '定位中...' })
    try {
      const loc = await Taro.getLocation({ type: 'gcj02', isHighAccuracy: true })
      const addr = `经度:${loc.longitude.toFixed(4)},纬度:${loc.latitude.toFixed(4)}`
      setLocation(addr)
      Taro.hideLoading()
      Taro.showToast({ title: '定位成功', icon: 'success' })
    } catch (e) {
      Taro.hideLoading()
      const mockAddr = '幸福小区3栋附近(精度:约10米)(模拟定位)'
      setLocation(mockAddr)
      Taro.showToast({ title: '定位成功(模拟)', icon: 'success' })
    }
  }

  const handleAddPhoto = async () => {
    if (photos.length >= 9) {
      Taro.showToast({ title: '最多上传9张照片', icon: 'none' })
      return
    }
    try {
      Taro.showActionSheet({
        itemList: ['拍照', '从相册选择'],
        success: async (res) => {
          const sourceType = res.tapIndex === 0 ? ['camera'] : ['album']
          const remaining = 9 - photos.length
          const chooseRes = await Taro.chooseImage({
            count: remaining,
            sizeType: ['compressed'],
            sourceType: sourceType as any
          })
          setPhotos([...photos, ...chooseRes.tempFilePaths])
          Taro.showToast({ title: `已添加${chooseRes.tempFilePaths.length}张`, icon: 'success' })
        }
      })
    } catch (e) {
      const mockUrl = `https://picsum.photos/200/200?random=${Date.now()}`
      setPhotos([...photos, mockUrl])
      Taro.showToast({ title: '已添加照片(模拟)', icon: 'success' })
    }
  }

  const handleRemovePhoto = (index: number) => {
    Taro.showModal({
      title: '提示',
      content: '确定删除这张照片吗?',
      success: (res) => {
        if (res.confirm) {
          const newPhotos = [...photos]
          newPhotos.splice(index, 1)
          setPhotos(newPhotos)
        }
      }
    })
  }

  const canSubmit = !submitting && eventType && urgency && selectedGrid && description.trim()

  const handleSubmit = () => {
    if (!canSubmit) {
      Taro.showToast({ title: '请完善事件信息', icon: 'none' })
      return
    }

    Taro.showModal({
      title: '确认提交',
      content: '确认提交该事件上报吗?',
      success: (res) => {
        if (res.confirm) {
          setSubmitting(true)
          const title = genEventTitle(eventType as EventType, description.trim())
          const address = location || selectedGrid

          addEvent({
            title,
            type: eventType as EventType,
            urgency: urgency as UrgencyLevel,
            grid: selectedGrid,
            address,
            description: description.trim(),
            photos: photos.length > 0 ? photos : undefined
          })

          setShowSuccess(true)
          setTimeout(() => {
            setShowSuccess(false)
            setEventType('')
            setUrgency('')
            setSelectedGrid('')
            setDescription('')
            setPhotos([])
            setLocation('')
            setSubmitting(false)
            Taro.showToast({ title: '上报成功,首页可查看', icon: 'success' })
          }, 1500)
        }
      }
    })
  }

  return (
    <View className={styles.page}>
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

      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>所属网格</Text>
        <View
          className={styles.gridSelect}
          onClick={() => setShowGridPicker(true)}
        >
          <Text className={classnames(styles.gridValue, !selectedGrid && styles.gridPlaceholder)}>
            {selectedGrid || '请选择网格'}
          </Text>
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
                padding: '32rpx',
                paddingBottom: 'calc(32rpx + env(safe-area-inset-bottom))'
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
                    color: selectedGrid === grid ? '#165dff' : '#1d2129',
                    fontWeight: selectedGrid === grid ? '600' : '400'
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

      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>位置信息</Text>
        <View className={styles.locationRow}>
          <View className={styles.locationIcon}>
            <Text>📍</Text>
          </View>
          <Text className={classnames(styles.locationText, !location && styles.locationPlaceholder)}>
            {location || '点击右侧按钮获取当前位置'}
          </Text>
          <Text className={styles.locationBtn} onClick={handleGetLocation}>
            获取位置
          </Text>
        </View>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>事件描述</Text>
        <Textarea
          className={styles.descTextarea}
          placeholder="请详细描述事件情况,包括时间、地点、涉及人员等信息..."
          value={description}
          onInput={(e) => setDescription(e.detail.value)}
          maxlength={500}
          autoHeight
        />
        <Text style={{ fontSize: '24rpx', color: '#86909c', marginTop: '16rpx', display: 'block', textAlign: 'right' }}>
          {description.length}/500
        </Text>
      </View>

      <View className={styles.formSection}>
        <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24rpx' }}>
          <Text className={styles.sectionTitle}>现场照片</Text>
          <Text style={{ fontSize: '24rpx', color: '#86909c' }}>{photos.length}/9</Text>
        </View>
        <View className={styles.photoGrid}>
          {photos.map((photo, index) => (
            <View key={index} className={styles.photoItem}>
              <Image src={photo} className={styles.photoImg} mode='aspectFill' />
              <View className={styles.photoRemove} onClick={() => handleRemovePhoto(index)}>
                <Text style={{ color: '#fff', fontSize: '32rpx', lineHeight: 1 }}>×</Text>
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
          最多可上传9张照片,支持拍照或从相册选择
        </Text>
      </View>

      <View className={styles.bottomBar}>
        <Button
          className={classnames(styles.submitBtn, submitting && styles.submitBtnDisabled)}
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          {submitting ? '提交中...' : '提交上报'}
        </Button>
      </View>

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
