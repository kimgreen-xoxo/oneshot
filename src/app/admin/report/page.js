'use client'

import { useState } from 'react'
import styles from './page.module.css'

const mockReport = [
  {
    id: 1,
    client: '김철수',
    industry: '부동산',
    channel: 'Instagram',
    reach: '12,400',
    ctr: '2.3%',
    db: '18건',
    cpa: '12,000원',
    roas: '320%',
    period: '2026-04',
  },
  {
    id: 2,
    client: '이영희',
    industry: '병원',
    channel: '네이버 블로그',
    reach: '8,200',
    ctr: '1.8%',
    db: '11건',
    cpa: '18,000원',
    roas: '210%',
    period: '2026-04',
  },
  {
    id: 3,
    client: '박민수',
    industry: '학원',
    channel: 'YouTube',
    reach: '22,000',
    ctr: '3.1%',
    db: '32건',
    cpa: '8,500원',
    roas: '450%',
    period: '2026-04',
  },
]

const stats = [
  { label: '총 노출수', value: '42,600' },
  { label: '평균 CTR', value: '2.4%' },
  { label: '총 DB', value: '61건' },
  { label: '평균 ROAS', value: '327%' },
]

export default function ReportPage() {
  const [period, setPeriod] = useState('2026-04')

  return (
    <div className={styles.container}>
      <div className={styles.topRow}>
        <h2 className={styles.title}>리포트</h2>
        <input
          type="month"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className={styles.monthPicker}
        />
      </div>

      {/* 요약 카드 */}
      <div className={styles.statsGrid}>
        {stats.map((stat) => (
          <div key={stat.label} className={styles.statCard}>
            <p className={styles.statLabel}>{stat.label}</p>
            <p className={styles.statValue}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* 테이블 */}
      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>고객명</th>
              <th>업종</th>
              <th>채널</th>
              <th>노출수</th>
              <th>CTR</th>
              <th>DB</th>
              <th>CPA</th>
              <th>ROAS</th>
            </tr>
          </thead>
          <tbody>
            {mockReport.map((item) => (
              <tr key={item.id}>
                <td>{item.client}</td>
                <td>{item.industry}</td>
                <td>{item.channel}</td>
                <td>{item.reach}</td>
                <td>{item.ctr}</td>
                <td>{item.db}</td>
                <td>{item.cpa}</td>
                <td>
                  <span className={`${styles.roas} ${
                    parseInt(item.roas) >= 300
                      ? styles.roasGood
                      : styles.roasBad
                  }`}>
                    {item.roas}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}