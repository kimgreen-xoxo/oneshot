'use client'

import { useState, useEffect } from 'react'
import styles from './page.module.css'

const channels = ['Instagram', 'YouTube', 'TikTok', '네이버 블로그', '카카오 채널']
const contentTypes = ['이미지', '영상', '카드뉴스']

export default function NewContentPage() {
  const [clients, setClients] = useState([])
  const [form, setForm] = useState({
    client: '',
    channel: '',
    type: '',
    keyword: '',
  })
  const [status, setStatus] = useState('idle')
  const [result, setResult] = useState(null)
  const [imageBase64, setImageBase64] = useState(null)

  // 구글시트에서 고객 목록 불러오기
  useEffect(() => {
    fetch('/api/clients')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setClients(data.data.map((c) => c.clientName).filter(Boolean))
        }
      })
      .catch((err) => console.error('고객 목록 오류:', err))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleGenerate = async () => {
    if (!form.client || !form.channel || !form.type || !form.keyword) {
      alert('모든 항목을 입력해주세요.')
      return
    }
    setStatus('loading')
    setResult(null)
    setImageBase64(null)

    try {
      // 텍스트는 콘텐츠 유형과 무관하게 항상 생성
      const textResponse = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: form.client,
          keyword: form.keyword,
          channelSettings: { [form.channel]: {} },
        }),
      })
      const textData = await textResponse.json()
      if (!textData.success) {
        alert('텍스트 생성 실패: ' + textData.error)
        setStatus('idle')
        return
      }
      setResult(textData.data)

      // 선택한 유형(이미지/영상/카드뉴스)을 추가로 생성
      if (form.type === '이미지' || form.type === '카드뉴스') {
        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientName: form.client,
            keyword: form.keyword,
            channel: form.channel,
          }),
        })
        const data = await response.json()
        if (data.success) {
          setImageBase64(`data:${data.image.mimeType};base64,${data.image.base64}`)
          setStatus('done')
        } else {
          alert('생성 실패: ' + data.error)
          setStatus('idle')
        }
      } else {
        // 영상은 아직 미구현
        setTimeout(() => setStatus('done'), 2000)
      }
    } catch (error) {
      alert('오류 발생: ' + error.message)
      setStatus('idle')
    }
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
                  {t === '이미지' ? '🖼️' : t === '영상' ? '🎬' : '🗞️'} {t}
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
            {status === 'loading' ? '⏳ 생성 중...' : '✨ AI 생성 시작'}
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
                {/* 텍스트는 콘텐츠 유형과 무관하게 항상 표시 */}
                {result && (
                  <p className={styles.resultText}>{result}</p>
                )}
                {(form.type === '이미지' || form.type === '카드뉴스') && imageBase64 && (
                  <img
                    src={imageBase64}
                    alt={`AI 생성 ${form.type}`}
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
                  onClick={handleGenerate}
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