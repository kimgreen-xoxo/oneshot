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
  const [versions, setVersions] = useState([])
  const [selectedVersion, setSelectedVersion] = useState(0)
  const [imageOptions, setImageOptions] = useState([])
  const [selectedImage, setSelectedImage] = useState(0)

  // "버전 1", "버전 2", "버전 3" 형태의 텍스트를 배열로 분리
  // 첫 "버전 N" 등장 이전의 서두 텍스트(인사말 등)는 버린다
  const parseVersions = (text) => {
    if (!text) return []
    const firstMarker = text.search(/\*{0,2}버전\s*\d+\*{0,2}/)
    const body = firstMarker >= 0 ? text.slice(firstMarker) : text
    const parts = body
      .split(/\*{0,2}버전\s*\d+\*{0,2}/g)
      .map((p) => p.replace(/^[-:\s]+/, '').trim())
      .filter(Boolean)
    return parts.length > 0 ? parts : [text.trim()]
  }

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
    setImageOptions([])
    setSelectedImage(0)

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
      setVersions(parseVersions(textData.data))
      setSelectedVersion(0)

      // 선택한 유형(이미지/카드뉴스)을 3장 병렬 생성
      if (form.type === '이미지' || form.type === '카드뉴스') {
        const requests = [1, 2, 3].map(() =>
          fetch('/api/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clientName: form.client,
              keyword: form.keyword,
              channel: form.channel,
            }),
          }).then((res) => res.json())
        )
        const results = await Promise.all(requests)
        const images = results
          .filter((r) => r.success)
          .map((r) => `data:${r.image.mimeType};base64,${r.image.base64}`)

        if (images.length === 0) {
          alert('이미지 생성 실패: ' + (results[0]?.error || '알 수 없는 오류'))
          setStatus('idle')
          return
        }
        setImageOptions(images)
        setStatus('done')
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
                {/* 텍스트는 버전별로 분리해서 선택 가능하게 표시 */}
                {versions.length > 0 && (
                  <div className={styles.versionSection}>
                    <p className={styles.versionGuide}>👇 아래 3가지 버전 중 하나를 선택하세요</p>
                    <div className={styles.versionList}>
                      {versions.map((v, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSelectedVersion(i)}
                          className={`${styles.versionCard} ${selectedVersion === i ? styles.versionCardActive : ''}`}
                        >
                          <div className={styles.versionHeader}>
                            <span className={styles.radioCircle}>
                              {selectedVersion === i && <span className={styles.radioDot} />}
                            </span>
                            <span className={styles.versionLabel}>버전 {i + 1}</span>
                            {selectedVersion === i && (
                              <span className={styles.versionCheck}>✓ 선택됨</span>
                            )}
                          </div>
                          <p className={styles.versionText}>{v}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {(form.type === '이미지' || form.type === '카드뉴스') && imageOptions.length > 0 && (
                  <div className={styles.versionSection}>
                    <p className={styles.versionGuide}>👇 아래 3가지 이미지 중 하나를 선택하세요</p>
                    <div className={styles.imageOptionGrid}>
                      {imageOptions.map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSelectedImage(i)}
                          className={`${styles.imageOptionCard} ${selectedImage === i ? styles.imageOptionCardActive : ''}`}
                        >
                          <img src={img} alt={`AI 생성 이미지 ${i + 1}`} className={styles.resultImage} />
                          <div className={styles.imageOptionFooter}>
                            <span className={styles.radioCircle}>
                              {selectedImage === i && <span className={styles.radioDot} />}
                            </span>
                            <span className={styles.versionLabel}>이미지 {i + 1}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
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