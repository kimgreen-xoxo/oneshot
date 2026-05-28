'use client'

import { useState } from 'react'
import styles from './ChannelModal.module.css'

const contentTypes = ['이미지', '영상', '텍스트']

export default function ChannelModal({ channel, initialData, onSave, onClose }) {
  const [data, setData] = useState({
    accountId: initialData?.accountId || '',
    accessToken: initialData?.accessToken || '',
    contentTypes: initialData?.contentTypes || [],
  })

  const toggleType = (type) => {
    setData((prev) => ({
      ...prev,
      contentTypes: prev.contentTypes.includes(type)
        ? prev.contentTypes.filter((t) => t !== type)
        : [...prev.contentTypes, type],
    }))
  }

  const handleSave = () => {
    if (data.contentTypes.length === 0) {
      alert('제작 유형을 선택해주세요.')
      return
    }
    onSave({ channel, ...data })
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        <div className={styles.header}>
          <h3 className={styles.title}>{channel} 설정</h3>
          <button onClick={onClose} className={styles.closeBtn}>✕</button>
        </div>

        <div className={styles.body}>

          <div className={styles.field}>
            <label className={styles.label}>계정 ID</label>
            <input
              value={data.accountId}
              onChange={(e) => setData((prev) => ({ ...prev, accountId: e.target.value }))}
              placeholder={`예: @${channel.toLowerCase().replace(/\s/g, '')}_account`}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Access Token / API Key</label>
            <input
              value={data.accessToken}
              onChange={(e) => setData((prev) => ({ ...prev, accessToken: e.target.value }))}
              placeholder="API 키 또는 Access Token 입력"
              className={styles.input}
              type="password"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>제작 유형 (복수 선택)</label>
            <div className={styles.typeGroup}>
              {contentTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={`${styles.typeBtn} ${data.contentTypes.includes(type) ? styles.typeBtnActive : ''}`}
                >
                  {type === '이미지' ? '🖼️' : type === '영상' ? '🎬' : '📝'} {type}
                </button>
              ))}
            </div>
          </div>

        </div>

        <div className={styles.footer}>
          <button onClick={onClose} className={styles.cancelBtn}>취소</button>
          <button onClick={handleSave} className={styles.saveBtn}>저장</button>
        </div>

      </div>
    </div>
  )
}
