import React, { useState, useMemo, useEffect, useRef } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import TaskCard from '@/components/TaskCard'
import { getTaskTypeLabel, getTaskStatusLabel, getUrgencyLabel } from '@/data/tasks'
import { useAppStore } from '@/store'
import styles from './index.module.scss'

const TASK_TYPES: Array<{ key: string; label: string }> = [
  { key: 'all', label: '全部任务' },
  { key: 'visit', label: '走访' },
  { key: 'verify', label: '核查' },
  { key: 'propaganda', label: '宣传' },
]

const STATUS_TABS: Array<{ key: string; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待处理' },
  { key: 'in_progress', label: '进行中' },
  { key: 'completed', label: '已完成' },
  { key: 'overdue', label: '已超时' },
]

interface VoiceData {
  duration: number
  url: string
  time: number
}

export default function TasksPage() {
  const tasks = useAppStore((s) => s.tasks)
  const checkIn = useAppStore((s) => s.checkIn)
  const addTaskPhoto = useAppStore((s) => s.addTaskPhoto)
  const removeTaskPhoto = useAppStore((s) => s.removeTaskPhoto)
  const updateTaskVoice = useAppStore((s) => s.updateTaskVoice)
  const updateTaskRemark = useAppStore((s) => s.updateTaskRemark)
  const completeTask = useAppStore((s) => s.completeTask)

  const [activeType, setActiveType] = useState('all')
  const [activeStatus, setActiveStatus] = useState('all')
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [remarkText, setRemarkText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [recordTime, setRecordTime] = useState(0)
  const recordTimerRef = useRef<number | null>(null)
  const recorderManagerRef = useRef<any>(null)
  const audioCtxRef = useRef<any>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const selectedTask = useMemo(() => {
    return tasks.find((t) => t.id === selectedTaskId) || null
  }, [tasks, selectedTaskId])

  useEffect(() => {
    if (selectedTask && selectedTask.remark !== undefined) {
      setRemarkText(selectedTask.remark || '')
    }
  }, [selectedTaskId])

  useEffect(() => {
    try {
      const rm = Taro.getRecorderManager()
      recorderManagerRef.current = rm
      rm.onStart(() => {
        console.log('[Tasks] 录音开始')
        setIsRecording(true)
        setRecordTime(0)
        recordTimerRef.current = window.setInterval(() => {
          setRecordTime((t) => {
            if (t >= 60) {
              stopRecording()
              return 60
            }
            return t + 1
          })
        }, 1000) as unknown as number
      })
      rm.onStop((res: any) => {
        console.log('[Tasks] 录音结束,时长:', res.duration, '路径:', res.tempFilePath)
        if (recordTimerRef.current) {
          window.clearInterval(recordTimerRef.current)
          recordTimerRef.current = null
        }
        const duration = Math.max(1, Math.round((res.duration || recordTime * 1000) / 1000))
        if (selectedTaskId && duration > 0) {
          updateTaskVoice(selectedTaskId, duration, res.tempFilePath || `voice_${Date.now()}.aac`)
          Taro.showToast({ title: `已保存 ${duration} 秒语音`, icon: 'success' })
        }
        setIsRecording(false)
      })
      rm.onError((err: any) => {
        console.warn('[Tasks] 录音错误:', err)
        if (recordTimerRef.current) {
          window.clearInterval(recordTimerRef.current)
          recordTimerRef.current = null
        }
        Taro.showToast({ title: '录音失败,请检查权限', icon: 'none' })
        setIsRecording(false)
      })
    } catch (e) {
      console.warn('[Tasks] 环境不支持 getRecorderManager,将使用模拟录音')
    }
    return () => {
      if (recordTimerRef.current) {
        window.clearInterval(recordTimerRef.current)
        recordTimerRef.current = null
      }
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.destroy()
        } catch (e) {}
      }
    }
  }, [selectedTaskId, updateTaskVoice])

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (activeType !== 'all' && t.type !== activeType) return false
      if (activeStatus !== 'all' && t.status !== activeStatus) return false
      return true
    })
  }, [tasks, activeType, activeStatus])

  const pendingCount = useMemo(() => tasks.filter((t) => t.status === 'pending').length, [tasks])
  const inProgressCount = useMemo(() => tasks.filter((t) => t.status === 'in_progress').length, [tasks])

  const handleTaskClick = (taskId: string) => {
    stopPlayback()
    setSelectedTaskId(taskId)
    setRemarkText('')
    setIsRecording(false)
    setRecordTime(0)
  }

  const handleCloseDetail = () => {
    stopPlayback()
    stopRecording()
    setSelectedTaskId(null)
    setRemarkText('')
  }

  const handleCheckIn = async () => {
    if (!selectedTask) return
    Taro.showLoading({ title: '定位中...' })
    try {
      const location = await Taro.getLocation({ type: 'gcj02', isHighAccuracy: true })
      const address = `经度:${location.longitude.toFixed(4)},纬度:${location.latitude.toFixed(4)}`
      checkIn(selectedTask.id, address)
      Taro.hideLoading()
      Taro.showToast({ title: '签到成功', icon: 'success' })
    } catch (e) {
      console.log('[Tasks] 定位失败,使用模拟地址')
      const mockAddress = '浙江省杭州市西湖区文三路100号(签到位置)'
      checkIn(selectedTask.id, mockAddress)
      Taro.hideLoading()
      Taro.showToast({ title: '签到成功(模拟)', icon: 'success' })
    }
  }

  const handleTakePhoto = async () => {
    if (!selectedTask) return
    try {
      Taro.showActionSheet({
        itemList: ['拍照', '从相册选择'],
        success: async (res) => {
          const sourceType = res.tapIndex === 0 ? ['camera'] : ['album']
          const chooseRes = await Taro.chooseImage({
            count: 9,
            sizeType: ['compressed'],
            sourceType: sourceType as any
          })
          chooseRes.tempFilePaths.forEach((path) => {
            addTaskPhoto(selectedTask.id, path)
          })
          Taro.showToast({ title: `已添加${chooseRes.tempFilePaths.length}张`, icon: 'success' })
        }
      })
    } catch (e) {
      console.log('[Tasks] 拍照失败,H5环境使用模拟')
      addTaskPhoto(selectedTask.id, `https://picsum.photos/200/200?random=${Date.now()}`)
      Taro.showToast({ title: '已添加照片(模拟)', icon: 'success' })
    }
  }

  const handleRemovePhoto = (index: number) => {
    if (!selectedTask) return
    Taro.showModal({
      title: '提示',
      content: '确定删除这张照片吗?',
      success: (res) => {
        if (res.confirm) {
          removeTaskPhoto(selectedTask.id, index)
        }
      }
    })
  }

  const startRecording = () => {
    if (!selectedTask) return
    if (recorderManagerRef.current) {
      try {
        recorderManagerRef.current.start({
          duration: 60000,
          sampleRate: 44100,
          numberOfChannels: 1,
          encodeBitRate: 192000,
          format: 'aac'
        })
        return
      } catch (e) {
        console.warn('[Tasks] 原生录音失败,降级为模拟:', e)
      }
    }
    setIsRecording(true)
    setRecordTime(0)
    recordTimerRef.current = window.setInterval(() => {
      setRecordTime((t) => {
        if (t >= 60) {
          stopRecording()
          return 60
        }
        return t + 1
      })
    }, 1000) as unknown as number
    Taro.showToast({ title: '开始录音', icon: 'none' })
  }

  const stopRecording = () => {
    if (recorderManagerRef.current && isRecording) {
      try {
        recorderManagerRef.current.stop()
        return
      } catch (e) {
        console.warn('[Tasks] 停止录音失败:', e)
      }
    }
    if (recordTimerRef.current) {
      window.clearInterval(recordTimerRef.current)
      recordTimerRef.current = null
    }
    if (isRecording && selectedTask && recordTime > 0) {
      const url = `voice_${Date.now()}.aac`
      updateTaskVoice(selectedTask.id, recordTime, url)
      Taro.showToast({ title: `已保存语音 ${recordTime}秒`, icon: 'success' })
    }
    setIsRecording(false)
  }

  const handleRecordToggle = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const stopPlayback = () => {
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.stop()
        audioCtxRef.current.destroy()
      } catch (e) {}
      audioCtxRef.current = null
    }
    setIsPlaying(false)
  }

  const handlePlayVoice = () => {
    if (!selectedTask?.voiceNote) return
    const voice: VoiceData = JSON.parse(selectedTask.voiceNote)
    if (!voice.url || voice.url.startsWith('voice_')) {
      Taro.showToast({ title: `播放语音 ${voice.duration} 秒(模拟)`, icon: 'none', duration: 1500 })
      setIsPlaying(true)
      setTimeout(() => setIsPlaying(false), Math.min(voice.duration * 1000, 5000))
      return
    }
    if (isPlaying) {
      stopPlayback()
      return
    }
    try {
      const ctx = Taro.createInnerAudioContext()
      ctx.src = voice.url
      ctx.onPlay(() => {
        console.log('[Tasks] 语音开始播放')
        setIsPlaying(true)
      })
      ctx.onEnded(() => {
        console.log('[Tasks] 语音播放结束')
        setIsPlaying(false)
        try { ctx.destroy() } catch (e) {}
        audioCtxRef.current = null
      })
      ctx.onError((err) => {
        console.warn('[Tasks] 语音播放错误:', err)
        setIsPlaying(false)
        Taro.showToast({ title: '播放失败', icon: 'none' })
        try { ctx.destroy() } catch (e) {}
        audioCtxRef.current = null
      })
      ctx.play()
      audioCtxRef.current = ctx
    } catch (e) {
      console.warn('[Tasks] 不支持原生音频播放,使用模拟')
      Taro.showToast({ title: `播放语音 ${voice.duration} 秒`, icon: 'none', duration: 1500 })
      setIsPlaying(true)
      setTimeout(() => setIsPlaying(false), Math.min(voice.duration * 1000, 5000))
    }
  }

  const handleRemarkChange = (e: any) => {
    setRemarkText(e.detail.value)
  }

  const handleSaveRemark = () => {
    if (!selectedTask) return
    updateTaskRemark(selectedTask.id, remarkText)
    Taro.showToast({ title: '备注已保存', icon: 'success' })
  }

  const handleCompleteTask = () => {
    if (!selectedTask) return
    if (!selectedTask.checkInTime) {
      Taro.showToast({ title: '请先签到', icon: 'none' })
      return
    }
    if (remarkText.trim() && remarkText !== selectedTask.remark) {
      updateTaskRemark(selectedTask.id, remarkText.trim())
    }
    Taro.showModal({
      title: '确认完成',
      content: '确定标记该任务为已完成吗?',
      success: (res) => {
        if (res.confirm) {
          stopPlayback()
          completeTask(selectedTask.id)
          setSelectedTaskId(null)
          Taro.showToast({ title: '任务已完成', icon: 'success' })
        }
      }
    })
  }

  const parseVoiceNote = (note?: string): VoiceData | null => {
    if (!note) return null
    try {
      return JSON.parse(note)
    } catch {
      return null
    }
  }

  const voiceData = selectedTask ? parseVoiceNote(selectedTask.voiceNote) : null

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>任务中心</Text>
        <View className={styles.headerStats}>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{pendingCount}</Text>
            <Text className={styles.statLabel}>待处理</Text>
          </View>
          <View className={styles.statDivider} />
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{inProgressCount}</Text>
            <Text className={styles.statLabel}>进行中</Text>
          </View>
        </View>
      </View>

      <ScrollView scrollX className={styles.typeScroll} enhanced showScrollbar={false}>
        <View className={styles.typeList}>
          {TASK_TYPES.map((t) => (
            <View
              key={t.key}
              className={classnames(styles.typeChip, { [styles.typeChipActive]: activeType === t.key })}
              onClick={() => setActiveType(t.key)}
            >
              <Text className={classnames(styles.typeChipText, { [styles.typeChipTextActive]: activeType === t.key })}>
                {t.label}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View className={styles.statusTabs}>
        {STATUS_TABS.map((tab) => (
          <View
            key={tab.key}
            className={classnames(styles.statusTab, { [styles.statusTabActive]: activeStatus === tab.key })}
            onClick={() => setActiveStatus(tab.key)}
          >
            <Text className={classnames(styles.statusTabText, { [styles.statusTabTextActive]: activeStatus === tab.key })}>
              {tab.label}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView className={styles.listContainer} scrollY enhanced>
        <View className={styles.taskList}>
          {filteredTasks.length === 0 ? (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>📋</Text>
              <Text className={styles.emptyText}>暂无任务</Text>
            </View>
          ) : (
            filteredTasks.map((task) => (
              <View key={task.id} onClick={() => handleTaskClick(task.id)}>
                <TaskCard task={task} />
              </View>
            ))
          )}
        </View>
        <View className={styles.listBottom} />
      </ScrollView>

      {selectedTask && (
        <View className={styles.modalMask} onClick={handleCloseDetail}>
          <View className={styles.detailSheet} onClick={(e) => e.stopPropagation()}>
            <View className={styles.detailHandle} />
            <View className={styles.detailHeader}>
              <View className={styles.detailTitleWrap}>
                <Text className={styles.detailTitle}>{selectedTask.title}</Text>
                <View className={classnames(
                  styles.statusBadge,
                  styles[`statusBadge_${selectedTask.status}`]
                )}>
                  <Text className={styles.statusBadgeText}>{getTaskStatusLabel(selectedTask.status)}</Text>
                </View>
              </View>
              <View className={styles.detailMeta}>
                <View className={classnames(styles.metaChip, styles.metaChipType)}>
                  <Text className={styles.metaChipText}>{getTaskTypeLabel(selectedTask.type)}</Text>
                </View>
                <View className={classnames(styles.metaChip, styles[`urgency_${selectedTask.urgency}`])}>
                  <Text className={styles.metaChipText}>{getUrgencyLabel(selectedTask.urgency)}</Text>
                </View>
              </View>
            </View>

            <ScrollView className={styles.detailBody} scrollY enhanced>
              <View className={styles.infoSection}>
                <View className={styles.infoRow}>
                  <Text className={styles.infoLabel}>📍 所属网格</Text>
                  <Text className={styles.infoValue}>{selectedTask.grid}</Text>
                </View>
                <View className={styles.infoRow}>
                  <Text className={styles.infoLabel}>🏠 任务地址</Text>
                  <Text className={styles.infoValue}>{selectedTask.address}</Text>
                </View>
                <View className={styles.infoRow}>
                  <Text className={styles.infoLabel}>📅 截止时间</Text>
                  <Text className={classnames(styles.infoValue, { [styles.overdue]: selectedTask.status === 'overdue' })}>
                    {selectedTask.deadline}
                  </Text>
                </View>
                <View className={styles.infoRow}>
                  <Text className={styles.infoLabel}>⏰ 派发时间</Text>
                  <Text className={styles.infoValue}>{selectedTask.assignTime}</Text>
                </View>
                {selectedTask.residentName && (
                  <View className={styles.infoRow}>
                    <Text className={styles.infoLabel}>👤 联系人</Text>
                    <Text className={styles.infoValue}>
                      {selectedTask.residentName} {selectedTask.residentPhone || ''}
                    </Text>
                  </View>
                )}
              </View>

              <View className={styles.descSection}>
                <Text className={styles.sectionSubTitle}>📝 任务说明</Text>
                <Text className={styles.descText}>{selectedTask.description}</Text>
              </View>

              <View className={styles.checkInSection}>
                <Text className={styles.sectionSubTitle}>📍 定位签到</Text>
                {selectedTask.checkInTime ? (
                  <View className={styles.checkedInCard}>
                    <View className={styles.checkInIcon}>✅</View>
                    <View className={styles.checkInInfo}>
                      <Text className={styles.checkInTitle}>已完成签到</Text>
                      <Text className={styles.checkInTime}>签到时间:{selectedTask.checkInTime}</Text>
                      <Text className={styles.checkInAddr}>签到地址:{selectedTask.checkInAddress || selectedTask.address}</Text>
                    </View>
                  </View>
                ) : (
                  <View className={styles.checkInCard} onClick={handleCheckIn}>
                    <View className={styles.checkInIcon}>📍</View>
                    <View className={styles.checkInInfo}>
                      <Text className={styles.checkInTitle}>点击定位签到</Text>
                      <Text className={styles.checkInDesc}>签到后任务进入"进行中"状态</Text>
                    </View>
                    <Text className={styles.checkInBtn}>签到</Text>
                  </View>
                )}
              </View>

              <View className={styles.photoSection}>
                <View className={styles.sectionHeader}>
                  <Text className={styles.sectionSubTitle}>📷 拍照留痕</Text>
                  <Text className={styles.sectionCount}>{selectedTask.photos?.length || 0}/9</Text>
                </View>
                <View className={styles.photoGrid}>
                  {(selectedTask.photos || []).map((photo, index) => (
                    <View key={index} className={styles.photoItem}>
                      <Image src={photo} className={styles.photoImg} mode='aspectFill' />
                      <View className={styles.photoDelete} onClick={() => handleRemovePhoto(index)}>
                        <Text className={styles.photoDeleteText}>×</Text>
                      </View>
                    </View>
                  ))}
                  {(selectedTask.photos?.length || 0) < 9 && (
                    <View className={styles.photoAddBtn} onClick={handleTakePhoto}>
                      <Text className={styles.photoAddIcon}>+</Text>
                      <Text className={styles.photoAddText}>添加照片</Text>
                    </View>
                  )}
                </View>
              </View>

              <View className={styles.voiceSection}>
                <Text className={styles.sectionSubTitle}>🎙️ 语音备注</Text>
                {voiceData ? (
                  <View className={classnames(styles.voiceRecorded, { [styles.voicePlaying]: isPlaying })}>
                    <View className={styles.voicePlayBtn} onClick={handlePlayVoice}>
                      <Text className={styles.voiceIcon}>{isPlaying ? '⏸' : '▶'}</Text>
                    </View>
                    <View className={styles.voiceInfo}>
                      <Text className={styles.voiceLabel}>
                        {isPlaying ? '播放中...' : '语音备注'}
                      </Text>
                      <Text className={styles.voiceMeta}>时长 {voiceData.duration} 秒 · 已保存</Text>
                    </View>
                    <View
                      className={styles.voiceReRecord}
                      onClick={() => {
                        if (selectedTask) updateTaskVoice(selectedTask.id, 0, '')
                      }}
                    >
                      <Text className={styles.voiceReRecordText}>重新录制</Text>
                    </View>
                  </View>
                ) : (
                  <View
                    className={classnames(styles.voiceRecordBtn, { [styles.voiceRecording]: isRecording })}
                    onClick={handleRecordToggle}
                  >
                    <View className={classnames(styles.voiceCircle, { [styles.voiceCircleActive]: isRecording })} />
                    {isRecording ? (
                      <>
                        <Text className={styles.voiceTimeText}>录制中 {recordTime}s</Text>
                        <Text className={styles.voiceHintText}>点击停止保存</Text>
                      </>
                    ) : (
                      <>
                        <Text className={styles.voiceRecordText}>点击录制语音备注</Text>
                        <Text className={styles.voiceHintText}>最长支持60秒,录完自动保存</Text>
                      </>
                    )}
                  </View>
                )}
              </View>

              <View className={styles.remarkSection}>
                <Text className={styles.sectionSubTitle}>✍️ 文字备注</Text>
                <Textarea
                  className={styles.remarkInput}
                  placeholder='请输入任务备注,记录走访情况...'
                  value={remarkText}
                  onInput={handleRemarkChange}
                  maxlength={500}
                />
                <View className={styles.remarkFooter}>
                  <Text className={styles.remarkCount}>{remarkText.length}/500</Text>
                  <View className={styles.remarkSaveBtn} onClick={handleSaveRemark}>
                    <Text className={styles.remarkSaveText}>保存备注</Text>
                  </View>
                </View>
              </View>

              <View className={styles.detailBottomSpace} />
            </ScrollView>

            <View className={styles.detailFooter}>
              <View className={styles.footerBtnCancel} onClick={handleCloseDetail}>
                <Text className={styles.footerBtnCancelText}>关闭</Text>
              </View>
              <View
                className={classnames(styles.footerBtnPrimary, {
                  [styles.footerBtnDisabled]:
                    !selectedTask.checkInTime || selectedTask.status === 'completed'
                })}
                onClick={handleCompleteTask}
              >
                <Text className={styles.footerBtnPrimaryText}>
                  {selectedTask.status === 'completed' ? '已完成' : '完成任务'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
