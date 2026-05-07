'use client'

import { useState } from 'react'
import styles from './page.module.css'

const clients = ['김철수', '이영희', '박민수', '최지원']
const channels = ['Instagram', 'YouTube', 'TikTok', '네이버 블로그', '카카오 채널']
const contentTypes = ['텍스트', '이미지', '영상']

export default function NewContentPage() {
  const [form, setForm] = useState({
    client: '',
    channel: '',
    type: '',
    keyword: '',
  })
  const [status, setStatus] = useState('idle') // idle / loading / done

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleGenerate = () => {
    if (!form.client || !form.channel || !form.type || !form.keyword) {
      alert('모든 항목을 입력해주세요.')
      return
    }
    setStatus('loading')
    setTimeout(() => {
      setStatus('done')
    }, 2000)
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>새 콘텐츠 생성</h2>

      <div className={styles.layout}>

        {/* 입력 패널 */}
        <div className={styles.inputPanel}>
          <h3 className={styles.panelTitle}>생성 설정</h3>

          <div className={styles.field}>
            <label className={styles.label}>고객 선택</label>
            <select name="client" value={form.client} onChange={handleChange} className={styles.select}>
              <option value="">선택하세요</option>
              {clients.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>채널</label>
            <select name="channel" value={form.channel} onChange={handleChange} className={styles.select}>
              <option value="">선택하세요</option>
              {channels.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>콘텐츠 유형</label>
            <div className={styles.typeGroup}>
              {contentTypes.map((t) => (
                <button
                  key={t}
                  onClick={() => setForm((prev) => ({ ...prev, type: t }))}
                  className={`${styles.typeBtn} ${form.type === t ? styles.typeBtnActive : ''}`}
                >
                  {t === '텍스트' ? '📝' : t === '이미지' ? '🖼️' : '🎬'} {t}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>키워드</label>
            <input
              name="keyword"
              value={form.keyword}
              onChange={handleChange}
              placeholder="예: 강남 코성형, 비용, 후기"
              className={styles.input}
            />
          </div>

          <button
            onClick={handleGenerate}
            className={styles.generateBtn}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? '생성 중...' : '✨ AI 생성 시작'}
          </button>
        </div>

        {/* 결과 패널 */}
        <div className={styles.resultPanel}>
          <h3 className={styles.panelTitle}>생성 결과</h3>

          {status === 'idle' && (
            <div className={styles.emptyState}>
              <p>생성 설정 후 AI 생성 시작 버튼을 누르세요.</p>
            </div>
          )}

          {status === 'loading' && (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <p>AI가 콘텐츠를 생성하고 있습니다...</p>
            </div>
          )}

          {status === 'done' && (
            <div className={styles.doneState}>
              <div className={styles.resultPreview}>
                {form.type === '텍스트' && (
                  <p className={styles.resultText}>
                    {form.keyword} 관련 AI 생성 텍스트 결과입니다.
                    강남에서 {form.keyword}을(를) 고민하고 계신가요?
                    저희는 10년 경력의 전문가가 직접 상담합니다.
                    지금 바로 문의해보세요.
                  </p>
                )}
                {form.type === '이미지' && (
                  <img
                    src={`https://placehold.co/600x400?text=${form.keyword}`}
                    alt="AI 생성 이미지"
                    className={styles.resultImage}
                  />
                )}
                {form.type === '영상' && (
                  <div className={styles.videoPlaceholder}>
                    🎬 AI 영상 생성 완료
                    <p>{form.keyword} 관련 영상</p>
                  </div>
                )}
              </div>

              <div className={styles.actions}>
                <button className={styles.btnApprove}>✅ 승인</button>
                <button className={styles.btnReject}>❌ 반려</button>
                <button
                  className={styles.btnRegenerate}
                  onClick={() => {
                    setStatus('loading')
                    setTimeout(() => setStatus('done'), 2000)
                  }}
                >
                  🔄 재생성
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}