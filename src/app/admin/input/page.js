'use client'

import { useState } from 'react'
import styles from './page.module.css'

const industries = [
  '부동산', '병원/클리닉', '학원/교육', '법률/세무',
  '금융/보험', '음식점/카페', '쇼핑몰/이커머스',
  '뷰티/미용', '운동/필라테스', '컨설팅'
]

const channels = [
  'Instagram', 'YouTube', 'TikTok', '네이버 블로그',
  '카카오 채널', 'Facebook', 'Threads'
]

export default function InputPage() {
  const [form, setForm] = useState({
    clientName: '',
    industry: [],
    keyword: '',
    region: '',
    bannedWords: '',
    channels: [],
    hasAd: false,
    kpi: '',
  })

  const toggleItem = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }))
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = () => {
    console.log('제출 데이터:', form)
    alert('저장되었습니다.')
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>고객 입력</h2>

      <div className={styles.card}>
        {/* 고객명 */}
        <div className={styles.field}>
          <label className={styles.label}>고객명</label>
          <input
            name="clientName"
            value={form.clientName}
            onChange={handleChange}
            placeholder="고객명 입력"
            className={styles.input}
          />
        </div>

        {/* 업종 */}
        <div className={styles.field}>
          <label className={styles.label}>업종 (복수 선택)</label>
          <div className={styles.tagGroup}>
            {industries.map((item) => (
              <button
                key={item}
                onClick={() => toggleItem('industry', item)}
                className={`${styles.tag} ${form.industry.includes(item) ? styles.tagActive : ''}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* 키워드 */}
        <div className={styles.field}>
          <label className={styles.label}>대표 키워드</label>
          <input
            name="keyword"
            value={form.keyword}
            onChange={handleChange}
            placeholder="예: 강남 코성형, 비용, 후기"
            className={styles.input}
          />
        </div>

        {/* 지역 */}
        <div className={styles.field}>
          <label className={styles.label}>지역</label>
          <input
            name="region"
            value={form.region}
            onChange={handleChange}
            placeholder="예: 강남, 서초, 전국"
            className={styles.input}
          />
        </div>

        {/* 금지 표현 */}
        <div className={styles.field}>
          <label className={styles.label}>금지 표현</label>
          <input
            name="bannedWords"
            value={form.bannedWords}
            onChange={handleChange}
            placeholder="예: 100% 보장, 최고, 1등"
            className={styles.input}
          />
        </div>

        {/* 채널 */}
        <div className={styles.field}>
          <label className={styles.label}>채널 선택 (복수 선택)</label>
          <div className={styles.tagGroup}>
            {channels.map((item) => (
              <button
                key={item}
                onClick={() => toggleItem('channels', item)}
                className={`${styles.tag} ${form.channels.includes(item) ? styles.tagActive : ''}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* 광고 여부 */}
        <div className={styles.field}>
          <label className={styles.label}>광고 집행 여부</label>
          <div className={styles.checkboxRow}>
            <input
              type="checkbox"
              name="hasAd"
              checked={form.hasAd}
              onChange={handleChange}
              id="hasAd"
            />
            <label htmlFor="hasAd" className={styles.checkboxLabel}>
              광고 집행 예정
            </label>
          </div>
        </div>

        {/* KPI */}
        <div className={styles.field}>
          <label className={styles.label}>KPI 목표</label>
          <input
            name="kpi"
            value={form.kpi}
            onChange={handleChange}
            placeholder="예: DB 월 50건, ROAS 300%"
            className={styles.input}
          />
        </div>

        <button onClick={handleSubmit} className={styles.button}>
          저장하기
        </button>
      </div>
    </div>
  )
}