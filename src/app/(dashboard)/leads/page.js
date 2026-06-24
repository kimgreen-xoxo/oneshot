'use client'

import { useState } from 'react'
import styles from './page.module.css'

const mockLeads = [
  {
    id: 1,
    name: '김철수',
    phone: '010-1234-5678',
    email: 'kim@example.com',
    industry: '부동산',
    channel: 'Instagram',
    status: '신규',
    createdAt: '2026-04-25',
  },
  {
    id: 2,
    name: '이영희',
    phone: '010-2345-6789',
    email: 'lee@example.com',
    industry: '병원',
    channel: '네이버 블로그',
    status: '상담완료',
    createdAt: '2026-04-24',
  },
  {
    id: 3,
    name: '박민수',
    phone: '010-3456-7890',
    email: 'park@example.com',
    industry: '학원',
    channel: 'YouTube',
    status: '계약완료',
    createdAt: '2026-04-23',
  },
  {
    id: 4,
    name: '최지원',
    phone: '010-4567-8901',
    email: 'choi@example.com',
    industry: '뷰티',
    channel: 'TikTok',
    status: '보류',
    createdAt: '2026-04-22',
  },
]

const statusColors = {
  '신규': styles.badgeNew,
  '상담완료': styles.badgeDone,
  '계약완료': styles.badgeContract,
  '보류': styles.badgeHold,
}

const filters = ['전체', '신규', '상담완료', '계약완료', '보류']

export default function LeadsPage() {
  const [filter, setFilter] = useState('전체')

  const filtered = filter === '전체'
    ? mockLeads
    : mockLeads.filter((l) => l.status === filter)

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>리드 관리</h2>

      {/* 필터 */}
      <div className={styles.filterRow}>
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* 테이블 */}
      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>이름</th>
              <th>연락처</th>
              <th>이메일</th>
              <th>업종</th>
              <th>유입채널</th>
              <th>상태</th>
              <th>등록일</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.phone}</td>
                <td>{item.email}</td>
                <td>{item.industry}</td>
                <td>{item.channel}</td>
                <td>
                  <span className={`${styles.badge} ${statusColors[item.status]}`}>
                    {item.status}
                  </span>
                </td>
                <td>{item.createdAt}</td>
                <td>
                  <button className={styles.actionBtn}>상세보기</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}